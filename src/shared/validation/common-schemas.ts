import { z } from "zod";

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const projectIdParamSchema = z.object({
  projectId: z.coerce.number().int().positive(),
});

export const requiredTextSchema = z.string().trim().min(1).max(191);
