import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.107.0'

type RequestPayload =
  | { type: 'guest_confirmation'; guestId: string }
  | { type: 'guest_confirmation_batch'; eventId: string }

type GuestWithEvent = {
  id: string
  wedding_page_id: string
  confirmation_id: string
  family_name: string
  max_guests: number
  email: string | null
  confirmation_url: string | null
  status: 'pending' | 'confirmed' | 'declined'
  wedding_pages: {
    user_id: string
    slug: string
    title: string
    custom_domain: string | null
    settings: {
      bride?: string
      groom?: string
      date?: string
      receptionCity?: string
      receptionDate?: string
      receptionVenue?: string
      venue?: string
      city?: string
    }
  }
}

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Origin': '*',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''
const mailFrom = Deno.env.get('MAIL_FROM') ?? 'Webding <invitaciones@webding.app>'
const appUrl = Deno.env.get('APP_URL') ?? 'https://webding.app'

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Metodo no permitido.' }, 405)
    }

    const authorization = request.headers.get('Authorization')
    if (!authorization) {
      return jsonResponse({ error: 'Sesion requerida.' }, 401)
    }

    const payload = await request.json() as RequestPayload
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
    })
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey)
    const { data: authData, error: authError } = await userClient.auth.getUser()

    if (authError || !authData.user) {
      return jsonResponse({ error: 'Sesion invalida.' }, 401)
    }

    if (!resendApiKey) {
      return jsonResponse({ error: 'Falta configurar RESEND_API_KEY en Supabase Edge Functions.' }, 500)
    }

    const guests = payload.type === 'guest_confirmation'
      ? await getSingleGuest(adminClient, payload.guestId)
      : await getEventGuests(adminClient, payload.eventId)

    const ownedGuests = guests.filter((guest) => guest.wedding_pages.user_id === authData.user.id)
    if (ownedGuests.length !== guests.length) {
      return jsonResponse({ error: 'No puedes enviar correos de este evento.' }, 403)
    }

    const result = { errors: [] as string[], sent: 0 }

    for (const guest of ownedGuests) {
      if (!guest.email) {
        result.errors.push(`${guest.family_name}: no tiene correo electronico.`)
        continue
      }

      const emailResult = await sendGuestConfirmationEmail(guest)
      if (emailResult.ok) {
        result.sent += 1
        await adminClient
          .from('wedding_guests')
          .update({ email_last_error: null, email_sent_at: new Date().toISOString() })
          .eq('id', guest.id)
      } else {
        result.errors.push(`${guest.family_name}: ${emailResult.error}`)
        await adminClient
          .from('wedding_guests')
          .update({ email_last_error: emailResult.error })
          .eq('id', guest.id)
      }
    }

    return jsonResponse(result)
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Error inesperado.' }, 500)
  }
})

async function getSingleGuest(adminClient: ReturnType<typeof createClient>, guestId: string) {
  const { data, error } = await adminClient
    .from('wedding_guests')
    .select('id,wedding_page_id,confirmation_id,family_name,max_guests,email,confirmation_url,status,wedding_pages(user_id,slug,title,custom_domain,settings)')
    .eq('id', guestId)
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Invitado no encontrado.')
  }

  return [data as unknown as GuestWithEvent]
}

async function getEventGuests(adminClient: ReturnType<typeof createClient>, eventId: string) {
  const { data, error } = await adminClient
    .from('wedding_guests')
    .select('id,wedding_page_id,confirmation_id,family_name,max_guests,email,confirmation_url,status,wedding_pages(user_id,slug,title,custom_domain,settings)')
    .eq('wedding_page_id', eventId)
    .eq('status', 'pending')
    .not('email', 'is', null)
    .order('family_name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as unknown as GuestWithEvent[]
}

async function sendGuestConfirmationEmail(guest: GuestWithEvent) {
  const settings = guest.wedding_pages.settings ?? {}
  const couple = [settings.bride, settings.groom].filter(Boolean).join(' & ') || guest.wedding_pages.title
  const confirmationUrl = guest.confirmation_url || buildConfirmationUrl(guest)
  const subject = `Confirma tu asistencia a ${couple}`
  const html = renderGuestConfirmationTemplate({
    allowedGuests: guest.max_guests,
    confirmationUrl,
    couple,
    date: settings.receptionDate ?? settings.date,
    familyName: guest.family_name,
    venue: [settings.receptionVenue ?? settings.venue, settings.receptionCity ?? settings.city].filter(Boolean).join(', '),
  })

  const response = await fetch('https://api.resend.com/emails', {
    body: JSON.stringify({
      from: mailFrom,
      html,
      subject,
      to: guest.email,
    }),
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!response.ok) {
    const errorBody = await response.text()
    return { error: errorBody || 'No se pudo enviar el correo.', ok: false }
  }

  return { ok: true }
}

function buildConfirmationUrl(guest: GuestWithEvent) {
  if (guest.wedding_pages.custom_domain) {
    return `https://${guest.wedding_pages.custom_domain}/confirmar/${guest.confirmation_id}`
  }
  return `${appUrl}/evento/${guest.wedding_pages.slug}/confirmar/${guest.confirmation_id}`
}

function renderGuestConfirmationTemplate({
  allowedGuests,
  confirmationUrl,
  couple,
  date,
  familyName,
  venue,
}: {
  allowedGuests: number
  confirmationUrl: string
  couple: string
  date?: string
  familyName: string
  venue?: string
}) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Confirma tu asistencia</title>
  </head>
  <body style="margin:0;background:#FAF7F2;color:#1E1E1E;font-family:Inter,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FAF7F2;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#FFFFFF;border:1px solid rgba(30,30,30,.1);border-radius:28px;overflow:hidden;">
            <tr>
              <td style="padding:34px 30px 10px;text-align:center;">
                <p style="margin:0 0 14px;color:#C89B5B;font-size:12px;font-weight:800;letter-spacing:4px;text-transform:uppercase;">Webding RSVP</p>
                <h1 style="margin:0;font-size:36px;line-height:1.05;">${escapeHtml(couple)}</h1>
                <p style="margin:18px 0 0;color:rgba(30,30,30,.68);font-size:16px;line-height:1.7;">Hola ${escapeHtml(familyName)}, queremos saber si nos acompañaran en este dia tan especial.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 30px;">
                <div style="background:#FAF7F2;border-radius:20px;padding:20px;text-align:center;">
                  <p style="margin:0;color:rgba(30,30,30,.62);font-size:13px;">Invitados permitidos</p>
                  <strong style="display:block;margin-top:6px;font-size:34px;">${allowedGuests}</strong>
                  ${date ? `<p style="margin:14px 0 0;color:rgba(30,30,30,.7);">${escapeHtml(date)}</p>` : ''}
                  ${venue ? `<p style="margin:6px 0 0;color:rgba(30,30,30,.7);">${escapeHtml(venue)}</p>` : ''}
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:10px 30px 36px;">
                <a href="${confirmationUrl}" style="display:inline-block;background:#1E1E1E;color:#FFFFFF;text-decoration:none;border-radius:999px;padding:15px 26px;font-weight:800;">Confirmar asistencia</a>
                <p style="margin:18px 0 0;color:rgba(30,30,30,.55);font-size:12px;line-height:1.6;">Si el boton no funciona, abre este enlace:<br /><span style="word-break:break-all;">${confirmationUrl}</span></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}
