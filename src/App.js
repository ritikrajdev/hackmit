// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import "./App.css";
import { nextFrame } from "@tensorflow/tfjs";
import { MuiChat, ChatController } from "chat-ui-react";
// 2. TODO - Import drawing utility here
// e.g. import { drawRect } from "./utilities";
import { drawRect } from "./utilities";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [chatCtl] = React.useState(new ChatController());

  let mes = [{ message: '', reply: '' }];
  let last_mes = JSON.parse(JSON.stringify(mes));

  // Main function
  const runCoco = async () => {
    // 3. TODO - Load network 
    // e.g. const net = await cocossd.load();
    // https://tensorflowjsrealtimemodel.s3.au-syd.cloud-object-storage.appdomain.cloud/model.json
    const net = await tf.loadGraphModel('https://tensorflowjsrealtimemodel.s3.au-syd.cloud-object-storage.appdomain.cloud/model.json')

    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 1000);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // 4. TODO - Make Detections
      const img = tf.browser.fromPixels(video)
      const resized = tf.image.resizeBilinear(img, [640, 480])
      const casted = resized.cast('int32')
      const expanded = casted.expandDims(0)
      const obj = await net.executeAsync(expanded)

      const boxes = await obj[1].array()
      const classes = await obj[2].array()
      const scores = await obj[4].array()

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");

      // 5. TODO - Update drawing utility
      // drawSomething(obj, ctx)
      requestAnimationFrame(() => { drawRect(boxes[0], classes[0], scores[0], 0.75, videoWidth, videoHeight, ctx, mes) });

      if (JSON.stringify(last_mes) !== JSON.stringify(mes)) {
        chatCtl.addMessage({
          type: 'text',
          content: mes[0].message,
          self: true,
        });

        chatCtl.addMessage({
          type: 'text',
          content: mes[0].reply,
          self: false,
        });

        last_mes = JSON.parse(JSON.stringify(mes));
      }


      tf.dispose(img)
      tf.dispose(resized)
      tf.dispose(casted)
      tf.dispose(expanded)
      tf.dispose(obj)
      console.log(mes)

    }
  };

  useEffect(() => { runCoco() }, []);

  React.useMemo(async () => {
    // Chat content is displayed using ChatController
    await chatCtl.addMessage({
      type: 'text',
      content: `Welcome to hushVoice.`,
      self: false,
    });
    await chatCtl.addMessage({
      type: 'text',
      content: `Use sign language to interact with our AI chat assistant.`,
      self: false,
    });
  }, [chatCtl]);



  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          muted={true}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            zindex: 9,
            width: window.innerWidth / 2,
            height: window.innerHeight,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            zindex: 8,
            width: (window.innerWidth / 2) - 20,
            height: window.innerHeight - 2,
          }}
        />
      </header>
      <div
        style={{
          display: 'inline-block',
          backgroundColor: 'red',
          width: (window.innerWidth / 2) - 20,
          height: window.innerHeight - 2,
          cssFloat: 'right',
        }}>
        <MuiChat chatController={chatCtl} />
      </div>
    </div>
  );
}

export default App;
