
import { Request, Response, NextFunction } from "express";
import residentRepository from "../repositories/resident.repository";
import { LoginData } from "src/utils/utils";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";

const JWT_SECRET = `${process.env.JWT_SECRET}`;
const JWT_EXPIRES = parseInt(`${process.env.JWT_EXPIRES}`);

export async function doLogin(req: Request, res: Response, next: NextFunction) {
    const data = req.body as LoginData;
    const maxTimeTolerance = 30 * 1000;
    if (Date.now() - data.timestamp > maxTimeTolerance) {
        return res.status(401).send(`Timestamp too old.`);
    }
    /**
     * A 'message' deve ser a mesma que gera a 'secret' do lado do front-end
     */
    const message = `Authenticating... Timestamp: ${data.timestamp}`;
    const signer = ethers.verifyMessage(message, data.secret);
    if (signer.toUpperCase() === data.wallet.toUpperCase()) {

        const resident = await residentRepository.getResident(data.wallet);
        if (!resident) return res.status(401).send(`Resident not found.`);

        const token = jwt.sign({ ...data, profile: resident.profile }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        return res.json({ token });
    }
    return res.status(401).send(`Wallet and secret doesn't match.`);
}

export default { doLogin };