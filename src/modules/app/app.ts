import express, { Request, Response } from 'express';
import { authRouter } from '../auth/auth.routes';
import { blogRouter } from '../blog/blog.routes';
import { productRouter } from '../product/product.routes';
import { initializeRoles } from '../rbac/default-roles/role.init';

export const app = express();

(async () => await initializeRoles())();

app.use(express.json());
app.use('/auth', authRouter);
app.use('/blog', blogRouter);
app.use('/product', productRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('RBAC System is running!');
});
