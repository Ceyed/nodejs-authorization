import { Router } from 'express';
import { ModulesEnum } from '../../common/enums/modules.enum';
import { PermissionsEnum } from '../../common/enums/permissions.enum';
import { protect } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import {
    addGroupToRole,
    assignRole,
    createPermissionGroup,
    listPermissionGroups,
    login,
    logout,
    refreshAccessToken,
    register,
    removeGroupFromRole,
} from './auth.controller';

// TODO Refactor file

const authRouter = Router();

// ? Authentication
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refreshAccessToken);
authRouter.post('/logout', protect, logout);

// ? Authorization
authRouter.post(
    '/assign-role',
    protect,
    authorize(ModulesEnum.ROLE, PermissionsEnum.CREATE),
    assignRole,
);
authRouter.post(
    '/add-permission',
    protect,
    authorize(ModulesEnum.ROLE, PermissionsEnum.CREATE),
    addGroupToRole,
);
authRouter.post(
    '/remove-permission',
    protect,
    authorize(ModulesEnum.ROLE, PermissionsEnum.CREATE),
    removeGroupFromRole,
);

// ? Groups
authRouter.post(
    '/permission-groups',
    protect,
    authorize(ModulesEnum.ROLE, PermissionsEnum.CREATE),
    createPermissionGroup,
);
authRouter.get(
    '/permission-groups',
    protect,
    authorize(ModulesEnum.ROLE, PermissionsEnum.READ),
    listPermissionGroups,
);

export { authRouter };
