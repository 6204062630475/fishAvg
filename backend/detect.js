const tfNode = require("@tensorflow/tfjs-node");
const fs = require('fs');
const gm = require('gm');
const EuclideanDistTracker = require("./tracker.js")
let countnumber;
let tracker = new EuclideanDistTracker();
const preprocess = (source, modelWidth, modelHeight) => {
  let xRatio, yRatio;

  const input = tfNode.tidy(() => {
    const img = source;

    const [h, w] = img.shape.slice(0, 2);
    const maxSize = Math.max(w, h);
    const imgPadded = img.pad([
      [0, maxSize - h],
      [0, maxSize - w],
      [0, 0],
    ]);
    xRatio = maxSize / w;
    yRatio = maxSize / h;

    return tfNode.image
      .resizeBilinear(imgPadded, [modelWidth, modelHeight])
      .div(255.0)
      .expandDims(0);
  });

  return [input, xRatio, yRatio];
};

const detectImage = async (imgSource, indexImage, model, classThreshold) => {
  const [modelWidth, modelHeight] = model.inputShape.slice(1, 3);
  tfNode.engine().startScope();
  const [input, xRatio, yRatio] = preprocess(
    imgSource,
    modelWidth,
    modelHeight
  );

  const res = await model.net.executeAsync(input);

  const [boxes, scores, classes, num] = res.slice();
  const class_data = classes.dataSync();
  const boxes_data = boxes.dataSync();
  const scores_data = scores.dataSync();
  const num_data = num.dataSync();

  const imagePath = `./Image/CaptureImage_${indexImage}.jpg`;
  const pic = gm(imagePath);

  let detectionspush = [];

  for (let i = 0; i < scores_data.length; ++i) {
    if (scores_data[i] > classThreshold) {
      // console.log("scores_data: ", scores_data[i]);
      let [xmin, ymin, xmax, ymax] = boxes_data.slice(i * 4, (i + 1) * 4);
      xmin *= 640 * xRatio;
      xmax *= 640 * xRatio;
      ymin *= 480 * yRatio;
      ymax *= 480 * yRatio;

      const boxWidth = xmax - xmin;
      const boxHeight = ymax - ymin;

      pic
        .stroke("#ff0000", 2)
        .fill("None")
        .drawRectangle(xmin, ymin, xmin + boxWidth, ymin + boxHeight);
      detectionspush.push([xmin, ymin, xmin + boxWidth, ymin + boxHeight]);
    }
  }
  console.log("Count: ", num_data[0]);
  countnumber = num_data[0];

  //object tracking
  const boxes_ids = tracker.update(detectionspush);
  for (let box_id of boxes_ids) {
    let [x1, y1, width, height, id] = box_id;
    pic
      .fill("#ff0000")
      .font('Arial', 27)
      .drawText(x1 + 15, y1 - 10, id);
    // console.log(id);
  }

  const outputImagePath = `./Image/CaptureImageWithBoxes_${indexImage}.jpg`;
  if (countnumber > 0) {
    pic.write(outputImagePath, (err) => {
      if (!err) console.log("draw successful");
      else console.log(err);
    });
  }



  return countnumber;
};

module.exports = detectImage;
