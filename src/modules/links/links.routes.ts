import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import { linksController } from "./links.controller";

export const linksRouter = Router({ mergeParams: true });

linksRouter.use(requireAuth);

linksRouter.post("/", linksController.create);
linksRouter.get("/", linksController.findAllByProject);
