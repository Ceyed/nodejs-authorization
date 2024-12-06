import express, { Request, Response } from 'express';
import { authRouter } from '../auth/auth.routes';
import { initializeRoles } from '../rbac/role.init';

export const app = express();

(async () => await initializeRoles())();

app.use(express.json());
app.use('/auth', authRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('RBAC System is running!');
});
