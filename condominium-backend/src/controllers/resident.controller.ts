import { Request, Response, NextFunction } from "express";
import Resident from "../models/resident";
import residentRepository from "../repositories/resident.repository";

export async function getResident(req: Request, res: Response, next: NextFunction) {
    const wallet = req.params.wallet;
    const resident = await residentRepository.getResident(wallet);
    if (!resident) {
        return res.sendStatus(404);
    }
    return res.json(resident);
}

export async function postResident(req: Request, res: Response, next: NextFunction) {
    const resident = req.body as Resident;
    const result = await residentRepository.addResident(resident);
    return res.status(201).json(result);
}

export async function patchResident(req: Request, res: Response, next: NextFunction) {
    const wallet = req.params.wallet;
    const resident = req.body as Resident;
    const result = await residentRepository.updateResident(wallet, resident);
    if (result > 0) {
        return res.status(204)
            .json(`Updated ${result} document(s)`);
    } else {
        return res.status(404)
            .json(`Updated ${result} document(s)`);
    }
}

export async function deleteResident(req: Request, res: Response, next: NextFunction) {
    const wallet = req.params.wallet;    
    const result = await residentRepository.deleteResident(wallet);
    if (result > 0) {
        return res.status(204)
            .json(`Deleted ${result} document(s)`);

    } else {
        return res.status(404)
            .json(`Deleted ${result} document(s)`);
    }
}

export default { getResident, postResident, patchResident, deleteResident };