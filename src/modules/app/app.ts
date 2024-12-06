import express, { Request, Response } from 'express';
import { authRouter } from '../auth/auth.routes';
import { blogRouter } from '../blog/blog.routes';
import { productRouter } from '../product/product.routes';
import { insertDefaultRecords } from '../rbac/default-roles/role.init';
import roleRouter from '../role/rbac.routes';

export const app = express();

(async () => await insertDefaultRecords())();

app.use(express.json());
app.use('/auth', authRouter);
app.use('/blog', blogRouter);
app.use('/product', productRouter);
app.use('/role', roleRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('RBAC System is running!');
});
