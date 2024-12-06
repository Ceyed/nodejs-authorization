import { Router } from 'express';
import { ModulesEnum } from '../../common/enums/modules.enum';
import { PermissionsEnum } from '../../common/enums/permissions.enum';
import { protect } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { BlogController } from './blog.controller';

const blogRouter: Router = Router();
const blogController: BlogController = BlogController.getInstance();

blogRouter.get(
    '/',
    protect,
    authorize(ModulesEnum.BLOG, PermissionsEnum.READ),
    blogController.read.bind(blogController),
);

blogRouter.post(
    '/',
    protect,
    authorize(ModulesEnum.BLOG, PermissionsEnum.CREATE),
    blogController.create.bind(blogController),
);

blogRouter.put(
    '/',
    protect,
    authorize(ModulesEnum.BLOG, PermissionsEnum.UPDATE),
    blogController.update.bind(blogController),
);

blogRouter.delete(
    '/',
    protect,
    authorize(ModulesEnum.BLOG, PermissionsEnum.DELETE),
    blogController.delete.bind(blogController),
);

export { blogRouter };
