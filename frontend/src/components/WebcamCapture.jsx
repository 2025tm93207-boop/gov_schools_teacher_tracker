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
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-black">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full"
        />
      </div>
      <button onClick={capture} className="w-full rounded-lg bg-saffron-600 px-4 py-3 text-slate-900 font-semibold transition hover:bg-saffron-700">Capture Photo</button>
      {image && <img src={image} alt="Captured" className="rounded-xl border border-slate-200 w-full" />}
    </div>
  );
};

export default WebcamCapture;