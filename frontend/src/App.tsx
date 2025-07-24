  import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
  import Login from "./pages/Login";
  import ProtectedRoute from "./ProtectedRoute";

  // Admin
  import AdminLayout from "./layout/AdminLayout";
  import Dashboard from "./pages/AdminPages/Dashboard";
  import DataSiswa from "./pages/AdminPages/DataSiswa";
  import DataGuru from "./pages/AdminPages/DataGuru";
  import DataKelas from "./pages/AdminPages/DataKelas";
  import DataJadwal from "./pages/AdminPages/DataJadwal";
  import DataSemester from "./pages/AdminPages/DataSemester";
  import DataAjaran from "./pages/AdminPages/DataAjaran";
  import Absensi from "./pages/AdminPages/AbsensiAdmin";
  import Rekap from "./pages/AdminPages/Rekap";
  import Pengaturan from "./pages/AdminPages/Pengaturan";
  import Notifikasi from "./pages/AdminPages/Notifikasi";
  import GenerateQr from "./pages/AdminPages/GenerateQrCode";

  // User
  import UserLayout from "./layout/UserLayout";
  import DashboardUser from "./pages/UsersPages/DashboardUser";
  import AbsensiUser from "./pages/UsersPages/AbsensiUser";
  import HalamanAbsensi from "./pages/UsersPages/halamanAbsensi";
  import JadwalUser from "./pages/UsersPages/JadwalUser";
  import Profile from "./pages/UsersPages/Profile";
  import RekapAbsensi from "./pages/UsersPages/RekapAbsensi";
  import NotFound from "./pages/NotFound";
  import NotifikasiUserr from "./pages/UsersPages/notifikasiUser";

  function App() {
    return (
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/" element={<Login />} />

          {/* Admin routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="datasiswa" element={<DataSiswa />} />
            <Route path="datakelas" element={<DataKelas />} />
            <Route path="datajadwal" element={<DataJadwal />} />
            <Route path="datasemester" element={<DataSemester />} />
            <Route path="datatahunajaran" element={<DataAjaran />} />
            <Route path="generateqrcode" element={<GenerateQr />} />
            <Route path="dataguru" element={<DataGuru />} />
            <Route path="absensi" element={<Absensi />} />
            <Route path="rekap" element={<Rekap />} />
            <Route path="pengaturan" element={<Pengaturan />} />
            <Route path="notifikasi" element={<Notifikasi />} />
          </Route>

          
          <Route
            path="/user"
            element={
              <ProtectedRoute role="user">
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DashboardUser />} />
            <Route path="absensiuser" element={<AbsensiUser />} />
            <Route path="halamanabsensi/:kelasId" element={<HalamanAbsensi />} />
            <Route path="jadwaluser" element={<JadwalUser />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifikasiuser" element={<NotifikasiUserr />} />
            <Route path="rekapabsensi" element={<RekapAbsensi />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    );
  }

  export default App;
