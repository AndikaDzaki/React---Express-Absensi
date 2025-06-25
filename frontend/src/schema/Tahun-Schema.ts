import {z} from "zod";

export const tahunSchema = z.object({
  tahun_ajaran: z
    .string()
    .regex(/^\d{4}\/\d{4}$/, "Format harus seperti 2024/2025"),
  status: z.enum(["Aktif", "Tidak Aktif"]),
});


export type tahunFormSchema = z.infer<typeof tahunSchema>;