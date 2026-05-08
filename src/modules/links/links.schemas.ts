import { z } from "zod";
import { requiredTextSchema } from "../../shared/validation/common-schemas";

const urlSchema = z.url();

const parameterIdsSchema = z
  .array(z.coerce.number().int().positive())
  .refine(
    (ids) => new Set(ids).size === ids.length,
    "Parameter ids must be unique"
  );

export const createLinkSchema = z
  .object({
    name: requiredTextSchema,
    baseUrl: urlSchema,
    redirectUrl: urlSchema.nullish(),
    parameterIds: parameterIdsSchema.optional(),
  })
  .strict();

export const updateLinkSchema = createLinkSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field must be provided"
);
