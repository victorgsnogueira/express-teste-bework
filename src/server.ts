import "dotenv/config";
import express from 'express';
import { authRouter } from './auth/auth.routes';
import { errorHandler } from './middlewares/error-handler';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use("/api/auth", authRouter);

app.use(express.json());

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

