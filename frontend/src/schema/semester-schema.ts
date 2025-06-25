import { z } from "zod";

export const semesterSchema = z
  .object({
    tahun_ajaran_id: z.number().min(1, "Pilih tahun ajaran"),
    semester: z.string().min(1, "Semester harus diisi"),
    status: z.enum(["Aktif", "Tidak Aktif"]),
    startDate: z.string().min(1, "Tanggal mulai harus diisi"),
    endDate: z.string().min(1, "Tanggal selesai harus diisi"),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: "Tanggal mulai harus sebelum tanggal selesai",
    path: ["endDate"],
  });

export type SemesterForm = z.infer<typeof semesterSchema>;
