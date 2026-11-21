/** Valor seguro por defecto: no confiar en X-Forwarded-For (desarrollo y proceso directo). */
export function readTrustProxySetting(raw = process.env.TRUST_PROXY): boolean | number | string {
  const value = raw?.trim();
  if (!value || value === 'false' || value === '0') return false;
  if (value === 'true') return 1;
  const asNumber = Number(value);
  if (Number.isInteger(asNumber) && asNumber >= 0) return asNumber;
  return value;
}