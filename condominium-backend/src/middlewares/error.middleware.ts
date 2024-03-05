import { Request, Response, NextFunction } from "express";

const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(error.message);
    return res.status(500).send(error.message);
}

export default errorMiddleware;