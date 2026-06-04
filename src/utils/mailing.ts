import { supabase } from '../lib/supabase'

export type MailingResult = {
  sent: number
  errors: string[]
}

export async function sendGuestConfirmationEmail(guestId: string) {
  const { data, error } = await supabase.functions.invoke<MailingResult>('send-event-email', {
    body: { guestId, type: 'guest_confirmation' },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? { errors: [], sent: 0 }
}

export async function sendGuestConfirmationBatch(eventId: string) {
  const { data, error } = await supabase.functions.invoke<MailingResult>('send-event-email', {
    body: { eventId, type: 'guest_confirmation_batch' },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? { errors: [], sent: 0 }
}
