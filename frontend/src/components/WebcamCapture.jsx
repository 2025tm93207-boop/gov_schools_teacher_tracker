import { useRef, useState } from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    onCapture(imageSrc);
  };

  return (
    <div className="text-center">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full max-w-md mx-auto"
      />
      <button onClick={capture} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Capture</button>
      {image && <img src={image} alt="Captured" className="mt-4 w-full max-w-md mx-auto" />}
    </div>
  );
};

export default WebcamCapture;