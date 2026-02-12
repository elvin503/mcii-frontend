import React, { useEffect, useRef, useState } from 'react';

function TakeIdPicture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isAligned, setIsAligned] = useState(false);
  const [greenStartTime, setGreenStartTime] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    const video = videoRef.current;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error('Error accessing camera:', err);
      });

    return () => {
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const checkAlignmentInterval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const boxWidth = canvas.width * 0.6;
      const boxHeight = canvas.height * 0.35;
      const startX = (canvas.width - boxWidth) / 2;
      const startY = (canvas.height - boxHeight) / 2;

      const imageData = ctx.getImageData(startX, startY, boxWidth, boxHeight);
      const pixels = imageData.data;

      let brightnessSum = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const brightness = (r + g + b) / 3;
        brightnessSum += brightness;
      }
      const avgBrightness = brightnessSum / (pixels.length / 4);

      const threshold = 100;
      const aligned = avgBrightness > threshold;

      if (aligned) {
        if (!greenStartTime) {
          setGreenStartTime(Date.now());
        } else if (Date.now() - greenStartTime >= 3000 && !capturedImage) {
          const image = canvas.toDataURL('image/png');
          setCapturedImage(image);
          onCapture(image); // Send image to parent
          const stream = videoRef.current?.srcObject;
          stream?.getTracks().forEach((track) => track.stop());
        }
        setIsAligned(true);
      } else {
        setGreenStartTime(null);
        setIsAligned(false);
      }
    }, 300);

    return () => clearInterval(checkAlignmentInterval);
  }, [greenStartTime, capturedImage]);

  return (
    <div className="camera-container">
      {!capturedImage ? (
        <>
          <video ref={videoRef} className="video-feed" autoPlay muted playsInline />
          <div className={`overlay-rectangle ${isAligned ? 'green' : ''}`} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      ) : (
        <img src={capturedImage} alt="Captured ID" className="captured-image" />
      )}
    </div>
  );
}

export default TakeIdPicture;
