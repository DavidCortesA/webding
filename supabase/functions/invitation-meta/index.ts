import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.107.0'

type WeddingPage = {
  slug: string
  title: string
  custom_domain: string | null
  settings: {
    bride?: string
    groom?: string
    city?: string
    date?: string
    photos?: string[]
    receptionCity?: string
    receptionDate?: string
    receptionVenue?: string
    venue?: string
    words?: string
  }
}

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Origin': '*',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const appUrl = Deno.env.get('APP_URL') ?? 'https://webding.app'
const fallbackImage = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85'

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(request.url)
  const slug = url.searchParams.get('slug')
  const domain = url.searchParams.get('domain')

  if (!slug && !domain) {
    return new Response('Falta slug o domain.', { headers: corsHeaders, status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const query = supabase.from('wedding_pages').select('slug,title,custom_domain,settings').eq('status', 'published')
  const { data, error } = domain
    ? await query.eq('custom_domain', domain).maybeSingle()
    : await query.eq('slug', slug).maybeSingle()

  if (error || !data) {
    return new Response('Invitacion no encontrada.', { headers: corsHeaders, status: 404 })
  }

  const page = data as unknown as WeddingPage
  const html = renderInvitationMeta(page)

  return new Response(html, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
})

function renderInvitationMeta(page: WeddingPage) {
  const settings = page.settings ?? {}
  const couple = [settings.bride, settings.groom].filter(Boolean).join(' & ') || page.title
  const title = `${couple} | Invitacion de boda`
  const eventDate = settings.receptionDate ?? settings.date
  const date = eventDate ? formatDate(eventDate) : ''
  const place = [settings.receptionVenue ?? settings.venue, settings.receptionCity ?? settings.city].filter(Boolean).join(', ')
  const description = `Acompananos a celebrar la boda de ${couple}${date ? ` el ${date}` : ''}${place ? ` en ${place}` : ''}. Confirma tu asistencia en nuestra invitacion digital.`
  const image = settings.photos?.find(Boolean) ?? fallbackImage
  const targetUrl = page.custom_domain ? `https://${page.custom_domain}` : `${appUrl}/evento/${page.slug}`

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${targetUrl}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
    <meta property="og:image:alt" content="${escapeHtml(title)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${image}" />
    <link rel="canonical" href="${targetUrl}" />
    <meta http-equiv="refresh" content="1; url=${targetUrl}" />
  </head>
  <body style="margin:0;background:#FAF7F2;color:#1E1E1E;font-family:Arial,sans-serif;display:grid;min-height:100vh;place-items:center;text-align:center;">
    <main style="max-width:620px;padding:32px;">
      <img src="${image}" alt="${escapeHtml(title)}" style="width:100%;max-height:340px;object-fit:cover;border-radius:24px;" />
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(description)}</p>
      <a href="${targetUrl}" style="display:inline-block;margin-top:12px;background:#1E1E1E;color:white;text-decoration:none;border-radius:999px;padding:14px 22px;font-weight:700;">Abrir invitacion</a>
    </main>
  </body>
</html>`
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

function escapeHtml(value = '') {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[character] ?? character))
}
