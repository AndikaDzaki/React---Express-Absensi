import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/AdminPages/Dashboard";
import Login from "./pages/Login";
import DataSiswa from "./pages/AdminPages/DataSiswa";
import DataGuru from "./pages/AdminPages/DataGuru";
import Absensi from "./pages/AdminPages/AbsensiAdmin";
import Rekap from "./pages/AdminPages/Rekap";
import AdminLayout from "./layout/AdminLayout";
import DataKelas from "./pages/AdminPages/DataKelas";
import DataJadwal from "./pages/AdminPages/DataJadwal";
import Pengaturan from "./pages/AdminPages/Pengaturan";
import Notifikasi from "./pages/AdminPages/Notifikasi";
import DashboardUser from "./pages/UsersPages/DashboardUser";
import UserLayout from "./layout/UserLayout";
import ProtectedRoute from "./ProtectedRoute";
import AbsensiUser from "./pages/UsersPages/AbsensiUser";
import JadwalUser from "./pages/UsersPages/JadwalUser";
import Profile from "./pages/UsersPages/Profile";
import RekapAbsensi from "./pages/UsersPages/RekapAbsensi";
import DataSemester from "./pages/AdminPages/DataSemester";
import DataAjaran from "./pages/AdminPages/DataAjaran";
import GenerateQr from "./pages/AdminPages/GenerateQrCode";
import HalamanAbsensi from "./pages/UsersPages/halamanAbsensi";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

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
          <Route path="datasemester" element={<DataSemester/>} />
          <Route path="datatahunajaran" element={<DataAjaran />} />
          <Route path="generateqrcode" element={<GenerateQr/>} />
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
          <Route path="/user/halamanabsensi/:kelasId" element={<HalamanAbsensi />} />
          <Route path="jadwaluser" element={<JadwalUser />} />
          <Route path="profile" element={<Profile />} />
          <Route path="rekapabsensi" element={<RekapAbsensi />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
