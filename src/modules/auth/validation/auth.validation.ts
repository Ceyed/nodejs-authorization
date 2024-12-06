import { z } from 'zod';
import { RolesEnum } from '../../../common/enums/roles.enum';

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    role: z.nativeEnum(RolesEnum, {
        errorMap: () => ({ message: 'Role must be one of type "RolesEnum' }),
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
