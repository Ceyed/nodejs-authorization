import { Router } from 'express';
import { RoleController } from './role.controller';

const roleRouter = Router();

roleRouter.post('/', RoleController.createRole);

export default roleRouter;
