import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "sonner";

interface NativeQRScannerProps {
  onDetected: (data: string) => void;
  onClose: () => void;
}

const NativeQRScanner: React.FC<NativeQRScannerProps> = ({ onDetected, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isDetected, setIsDetected] = useState(false);

 useEffect(() => {
  setIsDetected(false);

  const containerId = "qr-scanner";

  const timeout = setTimeout(() => {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = "";

    scannerRef.current = new Html5QrcodeScanner(
      containerId,
      {
        fps: 10,
        qrbox: 250,
        rememberLastUsedCamera: true,
        aspectRatio: 1,
      },
      false
    );

    scannerRef.current.render(
      async (decodedText) => {
        if (isDetected) return;

        setIsDetected(true);
        let token = decodedText;

        if (decodedText.startsWith("http")) {
          try {
            const url = new URL(decodedText);
            const params = new URLSearchParams(url.search);
            const extractedToken = params.get("token");
            if (!extractedToken) {
              toast.error("Token tidak ditemukan dalam QR");
              return;
            }
            token = extractedToken;
          } catch (err) {
            console.log(err);
            toast.error("QR tidak valid");
            return;
          }
        }

        toast.success("QR Code terdeteksi");
        onDetected(token);

        setTimeout(() => {
          scannerRef.current?.clear().then(() => {
            onClose();
          }).catch((err) => {
            console.warn("Gagal clear scanner:", err);
            onClose();
          });
        }, 800);
      },
      (error) => {
        console.warn("QR Error:", error);
      }
    );
  }, 100); // ⏱️ Delay supaya div-nya ready

  // Cleanup
  return () => {
    clearTimeout(timeout);
    if (scannerRef.current) {
      scannerRef.current.clear().then(() => {
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = "";
      }).catch((err) => {
        console.warn("Error saat clear scanner:", err);
      });
      scannerRef.current = null;
    }
  };
}, [onDetected, onClose, isDetected]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-sm text-center animate-fade-in">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Arahkan Kamera ke QR Code</h2>
        <div
          id="qr-scanner"
          className="rounded-md overflow-hidden w-full max-w-xs mx-auto"
        />
        <button
          onClick={() => {
            scannerRef.current?.clear()
              .then(() => onClose())
              .catch(() => onClose());
          }}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition"
        >
          Tutup Scanner
        </button>
      </div>
    </div>
  );
};

export default NativeQRScanner;
