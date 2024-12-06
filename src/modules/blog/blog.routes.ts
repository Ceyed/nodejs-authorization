import { Router } from 'express';
import { ModulesEnum } from '../../common/enums/modules.enum';
import { PermissionsEnum } from '../../common/enums/permissions.enum';
import { protect } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { BlogController } from './blog.controller';

const blogRouter = Router();

blogRouter.get(
    '/',
    protect,
    authorize(ModulesEnum.BLOG, PermissionsEnum.READ),
    BlogController.read,
);

blogRouter.post(
    '/',
    protect,
    authorize(ModulesEnum.BLOG, PermissionsEnum.CREATE),
    BlogController.create,
);

blogRouter.put(
    '/',
    protect,
    authorize(ModulesEnum.BLOG, PermissionsEnum.UPDATE),
    BlogController.update,
);

blogRouter.delete(
    '/',
    protect,
    authorize(ModulesEnum.BLOG, PermissionsEnum.DELETE),
    BlogController.delete,
);

export { blogRouter };
