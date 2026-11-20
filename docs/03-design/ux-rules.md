# UX/UI y Motion — KindHop

**Principio:** mobile-first, mapa como protagonista y navegación comprensible con pulgar. UI sobria, minimalista, aireada, jerarquía tipográfica marcada, sombras sutiles, animaciones suaves y medidas; evitar ornamentación vacía.

- Usar React + HTML semántico + Tailwind; componentes pequeños y reutilizables cuando haya repetición real.
- Comportamiento responsivo: bottom navigation mobile; tablet/desktop navegación adecuada. El mapa debe conservar foco visual.
- Iconografía coherente, labels accesibles, controles táctiles, estados vacíos/loading/error explícitos.
- Transiciones con propósito (abrir bottom-sheet, activar capa, cambiar ciudad) y `prefers-reduced-motion`.
- Tokens de color/spacing en un solo lugar, no hardcodes replicados. Evitar glassmorphism que sacrifique contraste o legibilidad.
- Atributos de accesibilidad y teclado desde la primera entrega.
- Nunca usar un componente UI adicional sin comprobar licencia, mantenimiento y necesidad.
