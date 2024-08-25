import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { getStudentInfo } from './services/getStudentInfo';
import { tokenMiddleware } from './middleware/tokenMiddleware';
import { log } from './lib/utils/log';
import { HTTPException } from 'hono/http-exception';

const app = new Hono();

/**
 * Global middleware
 */
app.use('*', logger());

app.get('/', (c) => {
  return c.text('ISMIS API');
});

/**
 * API Routes
 */
app.post('/api/login', tokenMiddleware, async (c) => {
  return c.json(c.var.tokens);
});

app.get('/api/profile', tokenMiddleware, async (c) => {
  const info = await getStudentInfo(c.var.tokens);
  return c.json(info);
});

/**
 * Exception Handlers
 */
app.notFound((c) => {
  return c.text('The requested resource was not found', 404);
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  log.error('A global error occured', err);
  return c.text(err.message, 500);
});

export default app;
