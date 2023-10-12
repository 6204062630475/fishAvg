class EuclideanDistTracker {
  constructor() {
    this.center_points = {};
    this.id_count = 0;
  }

  update(objects_rect) {
    let objects_bbs_ids = [];

    for (const rect of objects_rect) {
      let [x, y, width, height] = rect;
      let cx = Math.floor((x + x + width) / 2);
      let cy = Math.floor((y + y + height) / 2);

      let same_object_detected = false;

      for (let id in this.center_points) {
        let pt = this.center_points[id];
        let dist = Math.hypot(cx - pt[0], cy - pt[1]);

        if (dist < 20) {
          this.center_points[id] = [cx, cy];
          objects_bbs_ids.push([x, y, width, height, id]);
          same_object_detected = true;
          break;
        }
      }

      if (!same_object_detected) {
        this.center_points[this.id_count] = [cx, cy];
        objects_bbs_ids.push([x, y, width, height, this.id_count]);
        this.id_count++;
      }
    }

    let new_center_points = {};

    for (let obj_bb_id of objects_bbs_ids) {
      let [, , , , object_id] = obj_bb_id;
      let center = this.center_points[object_id];
      new_center_points[object_id] = center;
    }

    this.center_points = { ...new_center_points };

    return objects_bbs_ids;
  }
}

module.exports = EuclideanDistTracker;
