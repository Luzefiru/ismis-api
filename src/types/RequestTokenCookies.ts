import { z } from 'zod';

export const RequestTokenCookiesSchema = z.object({
  ['HASH_.AspNet.ApplicationCookie']: z.string().min(1).default(''),
  ['.AspNet.ApplicationCookie']: z.string().min(1).default(''),
  ['ASP.NET_SessionId']: z.string().min(1).default(''),
  ['HASH_ASP.NET_SessionId']: z.string().min(1).default(''),
  ['HASH___RequestVerificationToken']: z.string().min(1).default(''),
  ['__RequestVerificationToken']: z.string().min(1).default(''),
});

export type RequestTokenCookies = z.infer<typeof RequestTokenCookiesSchema>;
