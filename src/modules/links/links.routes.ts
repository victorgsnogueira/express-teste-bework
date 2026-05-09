import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middlewares/validate-request";
import { projectIdParamSchema } from "../../shared/validation/common-schemas";
import { linksController } from "./links.controller";
import { createLinkSchema, listLinksQuerySchema } from "./links.schemas";

export const linksRouter = Router({ mergeParams: true });

linksRouter.use(requireAuth);

linksRouter.post(
  "/",
  validateParams(projectIdParamSchema),
  validateBody(createLinkSchema),
  linksController.create
);
linksRouter.get(
  "/",
  validateParams(projectIdParamSchema),
  validateQuery(listLinksQuerySchema),
  linksController.findAllByProject
);
