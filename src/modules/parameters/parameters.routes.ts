import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import { parametersController } from "./parameters.controller";

export const parametersRouter = Router();

parametersRouter.use(requireAuth);

parametersRouter.post("/", parametersController.create);
parametersRouter.get("/", parametersController.findAll);
parametersRouter.get("/:id", parametersController.findOne);
parametersRouter.put("/:id", parametersController.update);
parametersRouter.delete("/:id", parametersController.remove);
