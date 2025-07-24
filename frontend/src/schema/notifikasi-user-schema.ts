import { z } from "zod";

export const notifikasiUserSchema = z.object({
  id: z.number(),
  id_guru: z.number(),
  pesan: z.string(),
  tanggal: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "tanggal harus format ISO date string",
  }),
  dibaca: z.boolean(),
});

export type NotifikasiUser = z.infer<typeof notifikasiUserSchema>;