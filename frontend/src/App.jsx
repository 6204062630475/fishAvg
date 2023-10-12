import { useState, useEffect, useRef } from "react";
import { Paper, Button } from "@mui/material";
import axios from "axios";
import "./App.css";
import Navbar from "./components/Navbar";
import DialogContact from "./components/DialogContact";
import DialogDetected from "./components/DialogDetected";
import dayjs from "dayjs";

function App() {
  const videoRef = useRef(null);
  const [countNumber, setCountNumber] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState(
    dayjs().format("YYYY-MM-DD HH:mm:ss")
  );
  const [loading, setLoading] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      console.log("started camera");
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };
  const captureFrame = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video?.videoWidth;
    canvas.height = video?.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64String = canvas
      .toDataURL("image/jpeg")
      .replace("data:image/jpeg;base64,", "");
    return base64String;
  };

  const uploadImages = async (images) => {
    try {
      const response = await axios.post("http://103.114.203.159:3001/upload", {
        images,
      });
      setCountNumber(response.data.average);
    } catch (error) {
      console.error("Error sending base64 to API:", error);
    }
  };

  async function captureFramesAndUpload() {
    setLoading(true);
    const numFrames = 5;
    const frameArray = [];
    for (let i = 0; i < numFrames; i++) {
      const base64String = captureFrame();
      frameArray.push(base64String);
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log(i);
    }
    try {
      await uploadImages(frameArray);
      console.log("captureFramesAndUpload done..");
    } catch (error) {
      console.error("Error accessing webcam:", error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    startCamera();
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      captureFramesAndUpload();
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  //นาฬิกา
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  return (
    <>
      <div className="navbar-container">
        <Navbar />
      </div>
      <div className="PaperWrapper">
        <Paper
          elevation={5}
          sx={{ overflow: "hidden", borderRadius: "20px" }}
          className="CenterPaperApp"
        >
          <h2
            style={{
              color: "black",
              display: "flex",
              justifyContent: "center",
              marginTop: "0px",
            }}
          >
            <box-icon
              name="calendar"
              type="solid"
              color="gray"
              style={{ marginRight: "8px" }}
            />
            <span style={{ color: "gray" }}>{currentDateTime}</span>
          </h2>
          <video ref={videoRef} autoPlay playsInline></video>
          {/* {loading && <div>Loading...</div>} */}
          {loading && <div class="spinner-box">
            <div class="pulse-container">
              <div class="pulse-bubble pulse-bubble-1"></div>
              <div class="pulse-bubble pulse-bubble-2"></div>
              <div class="pulse-bubble pulse-bubble-3"></div>
            </div>
          </div>}
          <div className="count-container">
            <h1 className="count-text">จำนวน: {countNumber} ตัว</h1>
          </div>
          {/* <Button onClick={captureFramesAndUpload}>startCapture</Button> */}
        </Paper>
      </div>
      <div style={{ position: "absolute", top: "86%", right: "1%" }}>
        <DialogDetected />
      </div>
      <div style={{ position: "absolute", top: "92%", right: "1%" }}>
        <DialogContact />
      </div>
    </>
  );
}

export default App;
