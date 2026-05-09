import { z } from "zod";
import { paginationQueryShape } from "../../shared/pagination";
import { requiredTextSchema } from "../../shared/validation/common-schemas";

export const createParameterSchema = z
  .object({
    key: requiredTextSchema,
    value: requiredTextSchema,
  })
  .strict();

export const updateParameterSchema = createParameterSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field must be provided"
);

export const listParametersQuerySchema = z
  .object({
    ...paginationQueryShape,
    search: requiredTextSchema.optional(),
    key: requiredTextSchema.optional(),
    value: requiredTextSchema.optional(),
  })
  .strict();
