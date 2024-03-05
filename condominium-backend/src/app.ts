import express, { Request, Response, NextFunction, json } from "express";
import morgan from "morgan";
import helmet from "helmet";
import "express-async-errors";
import cors from "cors";
import errorMiddleware from "./middlewares/error.middleware";

const app = express();
app.use(morgan("tiny"));
app.use(helmet());
app.use(cors({
    origin:process.env.CORS_ORIGIN
}));
app.use(express.json());

app.use('/', (req: Request, res: Response, next: NextFunction) => {
    res.send(`Hello World`);
});

app.use(errorMiddleware);

export default app;