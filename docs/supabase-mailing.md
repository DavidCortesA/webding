# Mailing transaccional en Supabase

## Confirmacion de cuenta

Supabase Auth envia el correo de creacion/confirmacion de cuenta. Copia el HTML de:

`supabase/email-templates/account-confirmation.html`

En Supabase:

1. Authentication > Email Templates.
2. Template: Confirm signup.
3. Pega el HTML.
4. Guarda cambios.

El template usa la variable oficial `{{ .ConfirmationURL }}`.

## Confirmacion de invitado por email

La app incluye la Edge Function:

`supabase/functions/send-event-email/index.ts`

Sirve para enviar el link RSVP a invitados que tengan `email`.

Variables requeridas en Supabase Edge Functions:

```txt
RESEND_API_KEY=...
MAIL_FROM=Webding <invitaciones@tu-dominio.com>
APP_URL=https://webding.app
```

Deploy:

```bash
supabase functions deploy send-event-email
supabase secrets set RESEND_API_KEY=... MAIL_FROM="Webding <invitaciones@tu-dominio.com>" APP_URL="https://webding.app"
```

El schema agrega:

```sql
alter table public.wedding_guests
add column if not exists email_sent_at timestamptz,
add column if not exists email_last_error text;
```

Desde el panel de invitados puedes enviar un email por familia o enviar correos masivos a familias pendientes con email.
