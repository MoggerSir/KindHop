import { createContext, useContext } from 'react';
import { useSession } from '@/features/auth';

export const PlanPreviewContext = createContext({ previewFree: false, setPreviewFree: () => {} });

// Plan efectivo en pantalla. El servidor decide el plan (y los cupones exigen Pro en la API); `previewFree` solo deja
// a la cuenta demo ver la app como usuario gratis durante el pitch (anuncios visibles). No da acceso a nada.
export function usePlan() {
  const { user } = useSession();
  const { previewFree, setPreviewFree } = useContext(PlanPreviewContext);
  const plan = user?.plan ?? { tier: 'FREE', until: null, simulated: false };
  return { plan, pro: plan.tier === 'PRO' && !previewFree, previewFree, setPreviewFree };
}
