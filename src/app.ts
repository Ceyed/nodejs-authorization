import express, { Request, Response } from 'express';
import { authRouter } from './modules/auth/auth.routes';
import { initializeRoles } from './modules/rbac/role.init';

export const app = express();

(async () => await initializeRoles())();

app.use(express.json());
app.use('/auth', authRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('RBAC System is running!');
});
