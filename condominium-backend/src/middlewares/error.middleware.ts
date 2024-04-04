import { Request, Response, NextFunction } from "express";

export default (error: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(error.message);
    return res.status(500).send(error.message);
}