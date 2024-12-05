import express, { Request, Response } from 'express';
import { authRouter } from './modules/auth/auth.routes';

export const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('RBAC System is running!');
});
