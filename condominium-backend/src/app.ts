import express, { Request, Response, NextFunction, json } from "express";
import morgan from "morgan";
import helmet from "helmet";
import "express-async-errors";
import cors from "cors";
import errorMiddleware from "./middlewares/error.middleware";
import residentRouter from "./routers/resident.router";
import loginRouter from "./routers/login.router";


const app = express();
app.use(morgan("tiny"));
app.use(helmet());
app.use(cors({
    origin:process.env.CORS_ORIGIN
}));
app.use(express.json());

//app.post('/login/', loginRouter);
app.use('/login/', loginRouter);
app.use('/residents/', residentRouter);

app.use('/', (req: Request, res: Response, next: NextFunction) => {
    res.send(`Heath Check`);
});

app.use(errorMiddleware);

export default app;