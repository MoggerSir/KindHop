import { Router } from 'express';
import { z } from 'zod';
import { requireCity } from '../cities/index.js';
import { AppError } from '../../shared/errors.js';
import type { User } from '../auth/users.db.js';
import { couponsFor } from './catalog.js';

const langSchema = z.enum(['es', 'en']).catch('es');

// Solo para usuarios Pro: el plan se lee de la sesión en el servidor, nunca de lo que diga el navegador.
export const couponsRouter = Router({ mergeParams: true });

couponsRouter.get('/', (req, res) => {
  const city = requireCity((req.params as { cityId?: string }).cityId);
  const user = res.locals.user as User | undefined;
  if (user?.plan.tier !== 'PRO') throw new AppError(403, 'PLAN_REQUIRED', 'Los cupones son parte de KinHop Pro');
  const lang = langSchema.parse(typeof req.query.lang === 'string' ? req.query.lang : undefined);
  res.json({ coupons: couponsFor(city.id, lang), plan: user.plan });
});
