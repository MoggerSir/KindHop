import { useCallback, useEffect, useState } from 'react';
import { normalizeState } from './budget.js';

// Estado del presupuesto, local-first: vive solo en este navegador (localStorage), sin cuenta ni servidor (OPEN-QUESTIONS #5).
// Si el almacenamiento está bloqueado (modo privado, sitio sin permiso), la pantalla sigue funcionando en memoria
// y `persistent` es false para avisar de que los datos se perderán al cerrar.
const STORAGE_KEY = 'kindhop.budget.v1';

function load() {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    return { state: normalizeState(text ? JSON.parse(text) : null), persistent: true };
  } catch {
    return { state: normalizeState(null), persistent: false };
  }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function useBudget() {
  const [{ state, persistent }, setStore] = useState(load);

  // Otra pestaña con KindHop abierto cambió el presupuesto: lo reflejamos aquí.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY || e.key === null) setStore(load());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Cada cambio se guarda al momento (escritura idempotente, segura aunque React repita el cálculo en modo estricto).
  // Un fallo al escribir (cuota llena, modo privado) no rompe la pantalla: solo activa el aviso de `persistent`.
  const update = useCallback(
    (fn) =>
      setStore((s) => {
        const next = fn(s.state);
        return { state: next, persistent: save(next) };
      }),
    [],
  );

  const setBudget = useCallback((budgetCents) => update((s) => ({ ...s, budgetCents })), [update]);
  const addExpense = useCallback((data) => {
    const expense = { ...data, id: newId() };
    update((s) => ({ ...s, expenses: [...s.expenses, expense] }));
  }, [update]);
  const updateExpense = useCallback((id, data) => update((s) => ({ ...s, expenses: s.expenses.map((e) => (e.id === id ? { ...data, id } : e)) })), [update]);
  const removeExpense = useCallback((id) => update((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) })), [update]);
  // Deshacer un borrado: vuelve el mismo gasto (mismo id), sin duplicarlo si ya estaba.
  const restoreExpense = useCallback((expense) => update((s) => (s.expenses.some((e) => e.id === expense.id) ? s : { ...s, expenses: [...s.expenses, expense] })), [update]);

  return { ...state, persistent, setBudget, addExpense, updateExpense, removeExpense, restoreExpense };
}
