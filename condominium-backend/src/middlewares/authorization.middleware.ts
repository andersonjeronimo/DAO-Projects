import { Request, Response, NextFunction } from "express";
import { LoginData, Profile } from "../utils/utils";
import jwt from "jsonwebtoken";

export function onlyManager(error: Error, req: Request, res: Response, next: NextFunction) {
    if (!res.locals.token) return res.sendStatus(403);
    const loginData = res.locals.token as LoginData & { profile: Profile };
    if (loginData.profile === Profile.MANAGER) {
        return next();
    } else {
        return res.sendStatus(403);
    }
}

export function onlyCounselor(error: Error, req: Request, res: Response, next: NextFunction) {
    if (!res.locals.token) return res.sendStatus(403);
    const loginData = res.locals.token as LoginData & { profile: Profile };
    if (loginData.profile === Profile.MANAGER || loginData.profile === Profile.COUNSELOR) {
        return next();
    } else {
        return res.sendStatus(403);
    }

}

export default { onlyManager, onlyCounselor };