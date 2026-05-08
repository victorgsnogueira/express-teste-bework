import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth";
import { linksController } from "./links.controller";

export const linksStandaloneRouter = Router();

linksStandaloneRouter.use(requireAuth);

linksStandaloneRouter.get("/:id/generate", linksController.generate);
linksStandaloneRouter.get("/:id", linksController.findOne);
linksStandaloneRouter.put("/:id", linksController.update);
linksStandaloneRouter.delete("/:id", linksController.remove);
