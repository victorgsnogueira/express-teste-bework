import "dotenv/config";
import express from "express";
import { authRouter } from "./auth/auth.routes";
import { errorHandler } from "./middlewares/error-handler";
import { linksRouter } from "./modules/links/links.routes";
import { linksStandaloneRouter } from "./modules/links/links.standalone.routes";
import { parametersRouter } from "./modules/parameters/parameters.routes";
import { projectsRouter } from "./modules/projects/projects.routes";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use("/api/auth", authRouter);

app.use(express.json());

app.use("/api/parameters", parametersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/projects/:projectId/links", linksRouter);
app.use("/api/links", linksStandaloneRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


