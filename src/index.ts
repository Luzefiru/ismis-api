import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { tokenMiddleware } from './middleware/tokenMiddleware';

import { log } from './lib/utils/log';
import { HTTPException } from 'hono/http-exception';

import { getStudentInfo } from './services/getStudentInfo';
import { getStudyLoad } from './services/getStudyLoad';
import { generateICalendar } from './lib/calendar/generateICalendar';

const app = new Hono();

/**
 * Global middleware
 */
app.use('*', logger());
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://example.org'],
    allowHeaders: [
      'Content-Type',
      'X-Custom-Header',
      'Upgrade-Insecure-Requests',
    ],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    credentials: true,
    maxAge: 600,
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision', 'Set-Cookie'],
  })
);

/**
 * API Routes
 */
app.post('/api/login', tokenMiddleware, async (c) => {
  return c.json({
    message: 'Successfully started an ISMIS session',
    cookies: c.var.tokens,
  });
});

app.get('/api/profile', tokenMiddleware, async (c) => {
  const info = await getStudentInfo(c.var.tokens);
  return c.json(info);
});

app.get('/api/study-load', tokenMiddleware, async (c) => {
  const studyLoad = await getStudyLoad(c.var.tokens);
  return c.json(studyLoad);
});

app.get('/api/study-load/ics', tokenMiddleware, async (c) => {
  const studyLoad = await getStudyLoad(c.var.tokens);
  return c.text(generateICalendar(studyLoad));
});

/**
 * Exception Handlers
 */
app.notFound((c) => {
  return c.json({ message: 'The requested resource was not found' }, 404);
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  log.error('A global error occured', err);
  return c.json({ message: err.message }, 500);
});

export default {
  port: process.env.PORT || 8081,
  fetch: app.fetch,
};
