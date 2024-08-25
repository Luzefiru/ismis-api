import { z } from 'zod';

export const LoginCredentialsSchema = z.object({
  username: z.string().length(8),
  password: z.string().min(1),
});

export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
