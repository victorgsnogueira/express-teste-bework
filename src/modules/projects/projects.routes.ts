import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import { projectsController } from "./projects.controller";

export const projectsRouter = Router();

projectsRouter.use(requireAuth);

projectsRouter.post("/", projectsController.create);
projectsRouter.get("/", projectsController.findAll);
projectsRouter.get("/:id", projectsController.findOne);
projectsRouter.put("/:id", projectsController.update);
projectsRouter.delete("/:id", projectsController.remove);
