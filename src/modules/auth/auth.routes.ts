import { Router } from 'express';
import { ModulesEnum } from '../../common/enums/modules.enum';
import { PermissionsEnum } from '../../common/enums/permissions.enum';
import { protect } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { AuthController } from './auth.controller';

const authRouter: Router = Router();
const authController: AuthController = AuthController.getInstance();

// ? Authentication
authRouter.post('/register', authController.register.bind(authController));
authRouter.post('/login', authController.login.bind(authController));
authRouter.post('/refresh', authController.refreshAccessToken.bind(authController));
authRouter.post('/logout', protect, authController.logout.bind(authController));

// ? Authorization
authRouter.post(
    '/assign-role',
    protect,
    authorize(ModulesEnum.ROLE, PermissionsEnum.CREATE),
    authController.assignRole.bind(authController),
);
authRouter.post(
    '/add-permission',
    protect,
    authorize(ModulesEnum.ROLE, PermissionsEnum.CREATE),
    authController.addGroupToRole.bind(authController),
);
authRouter.post(
    '/remove-permission',
    protect,
    authorize(ModulesEnum.ROLE, PermissionsEnum.CREATE),
    authController.removeGroupFromRole.bind(authController),
);

// ? Groups
authRouter.post(
    '/permission-groups',
    protect,
    authorize(ModulesEnum.ROLE, PermissionsEnum.CREATE),
    authController.createPermissionGroup.bind(authController),
);
authRouter.get(
    '/permission-groups',
    protect,
    authorize(ModulesEnum.ROLE, PermissionsEnum.READ),
    authController.listPermissionGroups.bind(authController),
);

export { authRouter };
