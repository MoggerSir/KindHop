import { http } from '@/shared/lib/http.js';

// Contrato: GET /api/cities/:cityId/coupons?lang -> { coupons, plan } solo con plan Pro; si no, 403 PLAN_REQUIRED.
export function fetchCoupons({ cityId, lang, signal }) {
  return http(`/api/cities/${encodeURIComponent(cityId)}/coupons?${new URLSearchParams({ lang })}`, { signal });
}
