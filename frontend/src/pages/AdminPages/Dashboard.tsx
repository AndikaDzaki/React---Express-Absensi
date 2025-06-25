import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CardDashboard from "@/components/card-dashoard";
import TablesDashboard from "@/components/tables-dashboard";

function useAuthUser() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const name = sessionStorage.getItem("userName");
    const role = sessionStorage.getItem("userRole");

    if (!isLoggedIn || role !== "admin") {
      navigate("/");
    } else {
      setUserName(name || "Admin");
    }
  }, [navigate]);

  return userName;
}

function Dashboard() {
  const userName = useAuthUser();

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
