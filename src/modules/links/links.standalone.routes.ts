import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import { validateBody, validateParams } from "../../middlewares/validate-request";
import { idParamSchema } from "../../shared/validation/common-schemas";
import { linksController } from "./links.controller";
import { updateLinkSchema } from "./links.schemas";

export const linksStandaloneRouter = Router();

linksStandaloneRouter.use(requireAuth);

linksStandaloneRouter.get(
  "/:id/generate",
  validateParams(idParamSchema),
  linksController.generate
);
linksStandaloneRouter.get(
  "/:id",
  validateParams(idParamSchema),
  linksController.findOne
);
linksStandaloneRouter.put(
  "/:id",
  validateParams(idParamSchema),
  validateBody(updateLinkSchema),
  linksController.update
);
linksStandaloneRouter.delete(
  "/:id",
  validateParams(idParamSchema),
  linksController.remove
);
