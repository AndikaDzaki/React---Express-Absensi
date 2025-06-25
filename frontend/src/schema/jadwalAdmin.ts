import { z } from "zod";

export const jadwalSchema = z.object({
  id_guru: z.number().min(1, "Pilih guru"),
  id_kelas: z.number().min(1, "Pilih kelas"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  jam_mulai: z.string().min(1, "Jam mulai wajib diisi"),
  jam_selesai: z.string().min(1, "Jam selesai wajib diisi"),
});

export type JadwalForm = z.infer<typeof jadwalSchema>;
