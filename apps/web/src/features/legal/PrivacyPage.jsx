/* eslint-disable no-restricted-syntax -- aviso legal (KH-027): por requisito solo en español y con texto fijo; no pasa por i18n */
import { useEffect } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

// Aviso de privacidad público (KH-027). Se renderiza sin SessionProvider: no pide sesión ni llama a la API,
// así Google (y cualquiera) puede abrir https://<dominio>/privacidad directamente.
const CONTACT = 'addnovel474@gmail.com';

const SECTIONS = [
  {
    title: 'Qué es KinHop',
    body: (
      <p>
        KinHop es una demo creada para el hackatón Hack Maya 2026. Ayuda a quien visita una ciudad a descubrir y elegir negocios locales. No es un servicio
        comercial.
      </p>
    ),
  },
  {
    title: 'Qué datos usamos de Google',
    body: (
      <>
        <p>
          Si entras con Google, solo recibimos tu <strong className="font-semibold text-ink">nombre</strong>, tu{' '}
          <strong className="font-semibold text-ink">correo</strong> y tu <strong className="font-semibold text-ink">foto de perfil</strong> (permisos{' '}
          <code className="rounded-control bg-tint px-1 py-0.5 text-[0.8125rem]">openid</code>, <code className="rounded-control bg-tint px-1 py-0.5 text-[0.8125rem]">email</code> y{' '}
          <code className="rounded-control bg-tint px-1 py-0.5 text-[0.8125rem]">profile</code>).
        </p>
        <p>Los usamos únicamente para iniciar tu sesión y mostrar tu perfil dentro de la app. Nunca vemos tu contraseña de Google.</p>
      </>
    ),
  },
  {
    title: 'Con quién los compartimos',
    body: <p>Con nadie. KinHop no vende tus datos ni los comparte con terceros.</p>,
  },
  {
    title: 'Dónde se guardan',
    body: (
      <p>
        En el servidor del proyecto, en su base de datos. Para mantener tu sesión abierta usamos una cookie de sesión; no usamos cookies de publicidad ni de
        seguimiento.
      </p>
    ),
  },
  {
    title: 'Cómo pedir que los borremos',
    body: (
      <p>
        Escribe a{' '}
        <a href={`mailto:${CONTACT}?subject=${encodeURIComponent('Borrar mis datos de KinHop')}`} className="font-medium text-accent underline underline-offset-4">
          {CONTACT}
        </a>{' '}
        desde el correo con el que entraste y borraremos tu cuenta y tus datos.
      </p>
    ),
  },
];

export function PrivacyPage() {
  useEffect(() => {
    document.title = 'Aviso de privacidad · KinHop';
    document.documentElement.lang = 'es';
  }, []);

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <main className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-6 px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <a href="/" className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-medium text-ink-2 transition-colors duration-150 hover:text-ink">
          <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.75} />
          Volver a KinHop
        </a>

        <header className="flex flex-col gap-3">
          <p className="text-2xl font-bold tracking-tight">
            KinHop<span className="text-accent">.</span>
          </p>
          <h1 className="flex items-center gap-2.5 text-3xl font-bold tracking-tight text-balance break-words">
            <ShieldCheck aria-hidden="true" size={28} strokeWidth={1.75} className="shrink-0 text-success" />
            Aviso de privacidad
          </h1>
          <p className="text-sm text-ink-3">
            Última actualización: <time dateTime="2026-11-21">21 de noviembre de 2026</time>
          </p>
        </header>

        {SECTIONS.map(({ title, body }) => (
          <section key={title} className="flex flex-col gap-2 rounded-card border border-line bg-surface p-5">
            <h2 className="text-lg font-semibold text-balance break-words">{title}</h2>
            <div className="flex flex-col gap-2 text-[0.9375rem] leading-relaxed break-words text-ink-2">{body}</div>
          </section>
        ))}
      </main>
    </div>
  );
}
