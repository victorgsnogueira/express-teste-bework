import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middlewares/validate-request";
import { idParamSchema } from "../../shared/validation/common-schemas";
import { parametersController } from "./parameters.controller";
import {
  createParameterSchema,
  listParametersQuerySchema,
  updateParameterSchema,
} from "./parameters.schemas";

export const parametersRouter = Router();

parametersRouter.use(requireAuth);

parametersRouter.post(
  "/",
  validateBody(createParameterSchema),
  parametersController.create
);
parametersRouter.get(
  "/",
  validateQuery(listParametersQuerySchema),
  parametersController.findAll
);
parametersRouter.get(
  "/:id",
  validateParams(idParamSchema),
  parametersController.findOne
);
parametersRouter.put(
  "/:id",
  validateParams(idParamSchema),
  validateBody(updateParameterSchema),
  parametersController.update
);
parametersRouter.delete(
  "/:id",
  validateParams(idParamSchema),
  parametersController.remove
);
