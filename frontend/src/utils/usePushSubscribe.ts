import axios from "axios";

const PUBLIC_VAPID_KEY = 'BNQeXuC6dkY8wCEMvSs6-aNwE8HO0lrV0hGr11ufYUlZXNxT6LMqkuam8b5qohIItvXGkRxmwyVTroe-84lE4RM';
const API_URL = "http://localhost:8800/api/subscribe";

export async function subscribeToPush() {
  if (!("serviceWorker" in navigator)) {
    console.warn(" Browser tidak mendukung Service Worker.");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Cek apakah sudah subscribe sebelumnya
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log("ℹ Sudah ada subscription aktif:", existingSubscription.endpoint);
      return;
    }

    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
    });

    await axios.post(`${API_URL}/subscribe`, newSubscription, {
      withCredentials: true,
    });

    console.log(" Berhasil subscribe ke push notification!");
  } catch (err) {
    console.error(" Gagal subscribe:", err);
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
