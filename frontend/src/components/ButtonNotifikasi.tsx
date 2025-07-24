import { Button } from "@/components/ui/button";
import { subscribeToPush } from "@/utils/usePushSubscribe";
import { useEffect, useState } from "react";

export default function ButtonNotifikasi() {
  const [aktif, setAktif] = useState(false);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(async (registration) => {
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          setAktif(true);
        }
      });
    }
  }, []);

  const handleClick = async () => {
    setLoading(true);
    await subscribeToPush();
    setAktif(true);
    setLoading(false);
  };

  return (
    <Button onClick={handleClick} disabled={aktif || loading}>
      {loading
        ? "Mengaktifkan..."
        : aktif
        ? "Notifikasi Aktif ✅"
        : "Aktifkan Notifikasi 🔔"}
    </Button>
  );
}
