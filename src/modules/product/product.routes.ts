import { Router } from 'express';
import { ModulesEnum } from '../../common/enums/modules.enum';
import { PermissionsEnum } from '../../common/enums/permissions.enum';
import { protect } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { ProductController } from './product.controller';

const productRouter = Router();

productRouter.get(
    '/',
    protect,
    authorize(ModulesEnum.PRODUCT, PermissionsEnum.READ),
    ProductController.read,
);

productRouter.post(
    '/',
    protect,
    authorize(ModulesEnum.PRODUCT, PermissionsEnum.CREATE),
    ProductController.create,
);

productRouter.put(
    '/',
    protect,
    authorize(ModulesEnum.PRODUCT, PermissionsEnum.UPDATE),
    ProductController.update,
);

productRouter.delete(
    '/',
    protect,
    authorize(ModulesEnum.PRODUCT, PermissionsEnum.DELETE),
    ProductController.delete,
);

export { productRouter };
