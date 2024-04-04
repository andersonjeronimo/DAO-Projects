import { Router } from "express";
import residentController from "../controllers/resident.controller";
import { onlyManager, onlyCounselor } from "../middlewares/authorization.middleware";

const router = Router();

router.get('/:wallet', residentController.getResident);

router.post('/', onlyCounselor, residentController.postResident);

router.patch('/:wallet', onlyManager, residentController.patchResident);

router.delete('/:wallet', onlyManager, residentController.deleteResident);

export default router;