import { useEffect, useRef, useState } from 'react';

export default function LocalMediaStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mediaStream: MediaStream | null = null;

    async function setupLocalStream() {
      // 1. Check if the browser supports media devices in the current context
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("MediaDevices API not available. Are you using HTTPS/localhost?");
        setError("Camera blocked: You must use HTTPS or localhost to access the camera.");
        return;
      }

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setError("Could not access camera or microphone. Please check permissions.");
      }
    }

    setupLocalStream();

    // Cleanup: Stop all tracks when component unmounts to release the camera/mic
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-zinc-900">
      {error ? (
        <p className="px-4 text-center text-sm font-medium text-red-500">{error}</p>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover transform scale-x-[-1]" 
        />
      )}
    </div>
  );
}