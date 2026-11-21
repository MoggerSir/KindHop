import { useMemo, useState } from 'react';
import { PlanPreviewContext } from './PlanContext.js';

export function PlanProvider({ children }) {
  const [previewFree, setPreviewFree] = useState(false);
  const value = useMemo(() => ({ previewFree, setPreviewFree }), [previewFree]);
  return <PlanPreviewContext.Provider value={value}>{children}</PlanPreviewContext.Provider>;
}
