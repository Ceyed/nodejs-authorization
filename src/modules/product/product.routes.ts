import { Router } from 'express';
import { ModulesEnum } from '../../common/enums/modules.enum';
import { PermissionsEnum } from '../../common/enums/permissions.enum';
import { protect } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { ProductController } from './product.controller';

const productRouter: Router = Router();
const productController: ProductController = ProductController.getInstance();

productRouter.get(
    '/',
    protect,
    authorize(ModulesEnum.PRODUCT, PermissionsEnum.READ),
    productController.read.bind(productController),
);

productRouter.post(
    '/',
    protect,
    authorize(ModulesEnum.PRODUCT, PermissionsEnum.CREATE),
    productController.create.bind(productController),
);

productRouter.put(
    '/',
    protect,
    authorize(ModulesEnum.PRODUCT, PermissionsEnum.UPDATE),
    productController.update.bind(productController),
);

productRouter.delete(
    '/',
    protect,
    authorize(ModulesEnum.PRODUCT, PermissionsEnum.DELETE),
    productController.delete.bind(productController),
);

export { productRouter };
