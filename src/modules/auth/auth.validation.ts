import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    // TODO: Add role validation
    role: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
