import { z } from "zod";
import { requiredTextSchema } from "../../shared/validation/common-schemas";

const slugSchema = requiredTextSchema.regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  "Slug must contain only lowercase letters, numbers and hyphens"
);

export const createProjectSchema = z
  .object({
    name: requiredTextSchema,
    slug: slugSchema,
  })
  .strict();

export const updateProjectSchema = createProjectSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field must be provided"
);
