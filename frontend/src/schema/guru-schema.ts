import { z } from "zod";

export const guruSchema = z.object({
  id: z.number().optional(),
  namaGuru: z.string().min(1, "Nama guru harus diisi"),
  nik: z.string().min(10, "NUPTK minimal 10 karakter").max(20, "NUPTK maksimal 20 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type GuruForm = z.infer<typeof guruSchema>;
