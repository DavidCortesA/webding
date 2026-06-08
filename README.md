# Webding

Webding es una plataforma SaaS para crear invitaciones digitales premium para bodas y eventos. Incluye landing de marketing, autenticacion, editor visual, templates personalizables, RSVP por familia, lista de invitados, dominios personalizados, mailing transaccional y publicacion con SEO social.

## Estado del proyecto

Proyecto frontend construido con React + Vite + TypeScript, conectado a Supabase para autenticacion, base de datos, storage y edge functions.

La app ya permite crear una invitacion completa, publicarla, compartirla, confirmar asistencia y administrar respuestas desde un panel.

## Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Supabase Auth / Database / Storage / Edge Functions
- Framer Motion
- Lucide React
- XLSX para importacion de invitados por Excel/CSV

## Funcionalidades principales

- Landing page premium para conversion.
- Login, registro, recuperacion de password y confirmacion de cuenta.
- Dashboard de invitaciones dividido en publicadas, borradores y vencidas.
- Editor visual con preview en desktop, tablet y mobile.
- Panel del editor configurable a izquierda/derecha y con ancho ajustable.
- 8 templates de boda con estilos visuales distintos.
- 10 temas de color de 5 colores cada uno.
- Personalizacion de tipografia, nombres, colores, textos, fotos y orden de secciones.
- Ceremonia religiosa y recepcion independientes, con fechas, lugares, mapas e icono de ceremonia.
- Galeria bento con 10 fotos, captions editables y modal foto por foto.
- Contador regresivo con dias, horas, minutos y segundos.
- Spotify para cancion principal y playlist separada.
- Mesa de regalos o datos de sobre/deposito.
- Code dress independiente.
- RSVP por familia con `confirmationId` unico.
- Importacion masiva de invitados desde Excel o CSV.
- Envio de email RSVP a invitados con correo.
- Panel de confirmaciones con metricas, filtros y exportacion.
- Dominio personalizado por evento con instrucciones DNS.
- SEO dinamico para invitacion y Edge Function para previews de WhatsApp/Facebook.

## Estructura

```txt
src/
  components/         Componentes de UI y pantallas principales
  data/               Catalogos de templates, temas, defaults y opciones
  lib/                Clientes e integraciones base
  utils/              Helpers de dominio, invitados, mailing, SEO y wedding settings
  App.tsx             Router/app shell principal
  App.css             Estilos globales de la experiencia

supabase/
  functions/          Edge Functions para mailing y SEO social
  email-templates/    Templates HTML para Supabase Auth y previews

docs/
  invitation-seo.md   Notas de SEO social para invitaciones
  supabase-mailing.md Notas de mailing transaccional
```

## Requisitos

- Node.js 20+
- npm
- Proyecto Supabase
- Opcional: Supabase CLI para deploy de Edge Functions
- Opcional: Resend para correos transaccionales de invitados

## Configuracion local

Instala dependencias:

```bash
npm install
```

Crea `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

Variables esperadas:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_publishable_key
```

Ejecuta el proyecto:

```bash
npm run dev
```

URL local:

```txt
http://localhost:5173
```

## Scripts

```bash
npm run dev      # servidor local
npm run build    # TypeScript + build de produccion
npm run lint     # ESLint
npm run preview  # preview del build
```

## Supabase

El schema base esta en:

```txt
supabase-schema.sql
```

Incluye:

- `wedding_pages`
- `wedding_rsvps`
- `wedding_guests`
- Storage bucket `wedding-images`
- RLS para paginas, invitados, RSVP y storage
- Indices y constraints principales

Para inicializar, copia el contenido de `supabase-schema.sql` en el SQL Editor de Supabase.

## Auth y emails

El template de confirmacion de cuenta esta en:

```txt
supabase/email-templates/account-confirmation.html
```

En Supabase:

1. Ve a Authentication > Email Templates.
2. Abre `Confirm signup`.
3. Pega el HTML.
4. Guarda.

Para recuperacion de password, agrega como redirect permitido:

```txt
http://localhost:5173/auth/reset-password
https://tu-dominio.com/auth/reset-password
```

## Edge Functions

### Mailing RSVP

Funcion:

```txt
supabase/functions/send-event-email
```

Secrets necesarios:

```bash
supabase secrets set RESEND_API_KEY=...
supabase secrets set MAIL_FROM="Webding <invitaciones@tu-dominio.com>"
supabase secrets set APP_URL="https://tu-dominio.com"
```

Deploy:

```bash
supabase functions deploy send-event-email
```

### SEO social de invitaciones

Funcion:

```txt
supabase/functions/invitation-meta
```

Sirve para que WhatsApp/Facebook lean `og:title`, `og:description` y `og:image` desde HTML inicial.

Deploy:

```bash
supabase functions deploy invitation-meta
```

Ejemplo:

```txt
https://tu-proyecto.supabase.co/functions/v1/invitation-meta?slug=boda-ana-david
```

## Rutas relevantes

```txt
/                         Landing
/terminos                 Terminos
/privacidad               Privacidad
/auth/reset-password      Nuevo password
/evento/[slug]            Invitacion publica
/evento/[slug]/confirmar/[confirmationId]  RSVP por familia
/confirmar/[confirmationId]                RSVP con dominio personalizado
```

## Notas de produccion

- Para previews sociales confiables, comparte la liga generada por `invitation-meta`.
- Para dominios personalizados, configura CNAME `www` hacia el dominio principal de la plataforma.
- Las fotos se guardan en Supabase Storage dentro del bucket `wedding-images`.
- La app conserva fallback local en `localStorage` para probar el editor si Supabase aun no esta listo.
- El bundle puede mostrar warning de chunks grandes por el editor, XLSX y la experiencia completa; el build funciona correctamente.

## Licencia

Proyecto privado en desarrollo.
