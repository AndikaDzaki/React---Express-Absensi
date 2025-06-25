export interface Kelas {
  id: number;
  nama_kelas: string;
  id_guru: number;
}

export interface Guru {
  id: number;
  namaGuru: string;
}

export interface SiswaItem {
  id: number;
  nama: string;
  id_kelas: number;
}

export interface KelasGabung {
  id: number;
  nama_kelas: string;
  wali_kelas: string;
  jumlah_siswa: number;
}

