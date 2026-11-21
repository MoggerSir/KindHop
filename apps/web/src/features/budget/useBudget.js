import { useCallback, useEffect, useState } from 'react';
import { createDemoState, EMPTY_STATE, normalizeState } from './budget.js';

// Estado del presupuesto, local-first: vive solo en este navegador (localStorage), sin cuenta ni servidor (OPEN-QUESTIONS #5).
// Si el almacenamiento está bloqueado (modo privado, sitio sin permiso), la pantalla sigue funcionando en memoria
// y `persistent` es false para avisar de que los datos se perderán al cerrar.
const STORAGE_KEY = 'kindhop.budget.v1';

// Caché de la sesión: la primera lectura puede esperar a un hueco, y al abrir la Billetera ya está en memoria.
let cache = null;

function load() {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    return { state: text === null ? createDemoState() : normalizeState(JSON.parse(text)), persistent: true };
  } catch {
    return { state: createDemoState(), persistent: false };
  }
}

function readStore() {
  if (!cache) cache = load();
  return cache;
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

// La escritura no va en el fotograma del toque: el gasto ya se ve, y localStorage espera a un hueco (o al salir).
function scheduleIdle(fn) {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(fn, { timeout: 1200 });
    return () => cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 1);
  return () => clearTimeout(id);
}

// La pantalla de la Billetera importa este módulo con la app. La lectura espera a un hueco:
// abrir la pestaña ya no para el fotograma en localStorage (si el hueco no llegó, readStore lee entonces).
if (typeof window !== 'undefined') scheduleIdle(() => { readStore(); });

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function useBudget() {
  const [{ state, persistent }, setStore] = useState(readStore);

  // Otra pestaña con KindHop abierto cambió el presupuesto: lo reflejamos aquí.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY || e.key === null) {
        cache = load();
        setStore(cache);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Al salir de la pestaña (o de la página) la memoria ya tiene el último estado: se vuelca aunque el hueco no haya llegado.
  useEffect(() => () => { if (cache) save(cache.state); }, []);

  useEffect(() => {
    let live = true;
    const cancel = scheduleIdle(() => {
      if (!live) return;
      const ok = save(state);
      setStore((s) => (s.persistent === ok ? s : { ...s, persistent: ok }));
    });
    return () => {
      live = false;
      cancel();
    };
  }, [state]);

  // El estado cambia al momento; localStorage queda fuera de este fotograma (el efecto de arriba).
  const update = useCallback((fn) => {
    setStore((s) => {
      const next = { state: fn(s.state), persistent: s.persistent };
      cache = next;
      return next;
    });
  }, []);

  const setBudget = useCallback((budgetCents) => update((s) => ({ ...s, budgetCents })), [update]);
  const addExpense = useCallback((data) => {
    const expense = { ...data, id: newId() };
    update((s) => ({ ...s, expenses: [...s.expenses, expense] }));
  }, [update]);
  const updateExpense = useCallback((id, data) => update((s) => ({ ...s, expenses: s.expenses.map((e) => (e.id === id ? { ...data, id } : e)) })), [update]);
  const removeExpense = useCallback((id) => update((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) })), [update]);
  // Deshacer un borrado: vuelve el mismo gasto (mismo id), sin duplicarlo si ya estaba.
  const restoreExpense = useCallback((expense) => update((s) => (s.expenses.some((e) => e.id === expense.id) ? s : { ...s, expenses: [...s.expenses, expense] })), [update]);
  const clearBudget = useCallback(() => update(() => ({ ...EMPTY_STATE, expenses: [] })), [update]);

  return { ...state, persistent, setBudget, addExpense, updateExpense, removeExpense, restoreExpense, clearBudget };
}
