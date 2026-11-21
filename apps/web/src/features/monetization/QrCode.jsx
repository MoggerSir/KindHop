import { useMemo } from 'react';
import qrcode from 'qrcode-generator';

// QR dibujado como SVG (un rect por módulo oscuro): nítido a cualquier tamaño y sin HTML inyectado.
// Siempre negro sobre blanco con margen: los lectores fallan con QR invertidos o sin zona de silencio.
export function QrCode({ value, label, size = 208 }) {
  const { count, cells } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(value);
    qr.make();
    const n = qr.getModuleCount();
    const dark = [];
    for (let r = 0; r < n; r += 1) for (let c = 0; c < n; c += 1) if (qr.isDark(r, c)) dark.push(`M${c} ${r}h1v1h-1z`);
    return { count: n, cells: dark.join('') };
  }, [value]);
  const quiet = 4;
  const box = count + quiet * 2;
  return (
    <svg role="img" aria-label={label} width={size} height={size} viewBox={`${-quiet} ${-quiet} ${box} ${box}`} shapeRendering="crispEdges" className="rounded-control">
      <rect x={-quiet} y={-quiet} width={box} height={box} fill="#fff" />
      <path d={cells} fill="#000" />
    </svg>
  );
}
