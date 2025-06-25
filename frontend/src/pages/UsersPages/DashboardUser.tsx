import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import CardUser from "@/components/card-user";
import TablesDashboard from "@/components/tables-dashboard";

function DashboardUser() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Guru");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDashboard = async () => {
      try {
        const response = await axios.get("http://localhost:8800/api/user/dashboard", {
          withCredentials: true,
        });

        const message = response.data.message;
        const role = response.data.role;

        if (role !== "user") {
          sessionStorage.clear();
          navigate("/login");
        }

        setUserName(message);
      } catch (error) {
        console.error("Token error atau belum login", error);
        sessionStorage.clear();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDashboard();
  }, [navigate]);

  if (loading) {
    return <p className="text-center mt-10">Memuat data dashboard...</p>;
  }

  return (
    <motion.div className="p-6 md:p-8 flex flex-col gap-5 max-w-screen-xl mx-auto" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
      <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
          👋 Hi, <span className="text-primary font-bold">{userName}</span>!
        </h1>
        <div className="flex justify-center ">
          <CardUser />
        </div>
      </motion.div>

      <motion.div className="bg-white rounded-lg shadow-sm p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
        <TablesDashboard />
      </motion.div>
    </motion.div>
  );
}

export default DashboardUser;
