# SEO y preview social de invitaciones

La invitacion publica actualiza dinamicamente:

- `title`
- `description`
- Open Graph
- Twitter Cards
- canonical
- JSON-LD tipo `Event`

Esto ayuda al navegador y a buscadores que ejecutan JavaScript.

## WhatsApp, Facebook y previews

WhatsApp y Facebook normalmente no ejecutan React. Por eso, una app Vite estatica no puede generar un preview distinto para cada `/evento/[slug]` solo desde el cliente.

Para resolverlo se agrego la Edge Function:

`supabase/functions/invitation-meta/index.ts`

Esta funcion devuelve HTML inicial con:

- `og:title` con nombres de los novios
- `og:description` con fecha/lugar
- `og:image` con la primera foto de la invitacion
- redirect a la invitacion real

Deploy:

```bash
supabase functions deploy invitation-meta
supabase secrets set APP_URL="https://webding.app"
```

La liga social se genera asi:

```txt
https://tu-proyecto.supabase.co/functions/v1/invitation-meta?slug=boda-david-y-ana
```

Si hay dominio personalizado:

```txt
https://tu-proyecto.supabase.co/functions/v1/invitation-meta?domain=boda-davidyanna.com
```

En el dashboard, el boton con icono de compartir copia esta liga optimizada para preview social.
