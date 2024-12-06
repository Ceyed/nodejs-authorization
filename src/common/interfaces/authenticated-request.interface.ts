import { Request } from 'express';
import { UserWithRoleInterface } from './role.interface';

export interface AuthenticatedRequestInterface extends Request {
    user?: UserWithRoleInterface;
}
