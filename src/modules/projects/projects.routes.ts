import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middlewares/validate-request";
import { idParamSchema } from "../../shared/validation/common-schemas";
import { projectsController } from "./projects.controller";
import {
  createProjectSchema,
  listProjectsQuerySchema,
  updateProjectSchema,
} from "./projects.schemas";

export const projectsRouter = Router();

projectsRouter.use(requireAuth);

projectsRouter.post(
  "/",
  validateBody(createProjectSchema),
  projectsController.create
);
projectsRouter.get(
  "/",
  validateQuery(listProjectsQuerySchema),
  projectsController.findAll
);
projectsRouter.get(
  "/:id",
  validateParams(idParamSchema),
  projectsController.findOne
);
projectsRouter.put(
  "/:id",
  validateParams(idParamSchema),
  validateBody(updateProjectSchema),
  projectsController.update
);
projectsRouter.delete(
  "/:id",
  validateParams(idParamSchema),
  projectsController.remove
);
