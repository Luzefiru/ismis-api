import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { tokenMiddleware } from './middleware/tokenMiddleware';

import { log } from './lib/utils/log';
import { HTTPException } from 'hono/http-exception';

import { getStudentInfo } from './services/getStudentInfo';
import { getStudyLoad } from './services/getStudyLoad';

const app = new Hono();

/**
 * Global middleware
 */
app.use('*', logger());

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

export default app;
