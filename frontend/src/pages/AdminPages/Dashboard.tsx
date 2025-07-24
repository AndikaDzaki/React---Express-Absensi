import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getMeAdmin } from "@/lib/auth-api";
import CardDashboard from "@/components/card-dashoard";
import TablesDashboard from "@/components/tables-dashboard";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { toast } from "sonner";


function Dashboard() {
  const [userName, setUserName] = useState("Admin");
   const deferredPrompt = useInstallPrompt();

  useEffect(() => {
  if (deferredPrompt) {
    console.log("deferredPrompt detected");

    toast("Aplikasi tersedia untuk diinstal!", {
      action: {
        label: "Pasang",
        onClick: () => {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === "accepted") {
              toast.success("Instalasi berhasil dimulai!");
            } else {
              toast.warning("Instalasi dibatalkan.");
            }
          });
        },
      },
    });
  }
}, [deferredPrompt]);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getMeAdmin();
        setUserName(res.data.name?.trim() || "Admin");
      } catch (err) {
        console.error("Gagal mengambil nama user:", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <motion.div className="p-6 md:p-8 flex flex-col gap-6 max-w-screen-xl mx-auto" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
      <Section animationDelay={0.2}>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          👋 Hi, <span className="text-primary font-bold">{userName}</span>!
        </h1>
        
      </Section>

      <Section animationDelay={0.3}>
        <CardDashboard />
      </Section>

      <Section animationDelay={0.5} className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Data Hari Ini</h2>
        <TablesDashboard />
      </Section>
    </motion.div>
  );
}

function Section({ children, className = "", animationDelay = 0 }: { children: React.ReactNode; className?: string; animationDelay?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: animationDelay, duration: 0.6 }}>
      {children}
    </motion.div>
  );
}

export default Dashboard;
