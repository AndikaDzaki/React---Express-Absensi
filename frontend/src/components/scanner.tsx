import { useEffect, useState } from "react";
import { toast } from "sonner";
import QrScanner from "react-qr-barcode-scanner";

interface NativeQRScannerProps {
  onDetected: (data: string) => void;
  onClose: () => void;
}

const NativeQRScanner: React.FC<NativeQRScannerProps> = ({ onDetected, onClose }) => {
  const [isDetected, setIsDetected] = useState(false);

  const handleScan = (data: string) => {
    if (!isDetected) {
      setIsDetected(true);
      console.log("✅ QR Code Terbaca:", data);
      toast.success("QR Code terdeteksi");
      onDetected(data);
      setTimeout(() => onClose(), 800);
    }
  };

  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      if (err.message.includes("No MultiFormat Readers")) {
        toast.error("Kamera tidak tersedia atau tidak diizinkan");
        return;
      }
      console.error("QR Scan Error:", err.message);
      toast.error("Gagal memindai QR");
    } else {
      console.error("QR Scan Unknown Error:", err);
      toast.error("Terjadi kesalahan");
    }
  };

  useEffect(() => {
    if (isDetected) {
      const timeout = setTimeout(() => setIsDetected(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [isDetected]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-sm text-center animate-fade-in">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Arahkan Kamera ke QR Code</h2>

        <div className="relative w-full aspect-square rounded-lg overflow-hidden border-4 border-blue-600 shadow-md">
          <QrScanner
            onUpdate={(err, result) => {
              if (result) {
                const text = result.getText?.();
                if (typeof text === "string") {
                  handleScan(text);
                }
              }
              if (err) handleError(err);
            }}
            facingMode="environment"
          />

          <div className="absolute inset-0 border-[3px] border-dashed border-blue-500 animate-pulse pointer-events-none rounded-md" />
        </div>

        {!isDetected ? <p className="text-sm text-gray-500 mt-2">Memindai kode...</p> : <p className="text-sm text-green-600 mt-2 font-medium">QR terdeteksi</p>}

        <button onClick={onClose} className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition">
          Tutup Scanner
        </button>
      </div>
    </div>
  );
};

export default NativeQRScanner;
