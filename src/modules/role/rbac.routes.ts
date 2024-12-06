import { Router } from 'express';
import { RoleController } from './role.controller';

const roleRouter: Router = Router();
const roleController: RoleController = RoleController.getInstance();

roleRouter.post('/', roleController.createRole.bind(roleController));

export default roleRouter;
