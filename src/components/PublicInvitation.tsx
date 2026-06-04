import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { defaultSettings } from '../data/catalogs'
import { supabase } from '../lib/supabase'
import type { WeddingSettings } from '../types'
import { normalizeDomain } from '../utils/domain'
import { applyInvitationSeo } from '../utils/seo'
import { normalizeSettings, readLocalPages } from '../utils/wedding'
import { WeddingPreview } from './WeddingPreview'

export function PublicInvitation({ slug, customDomain }: { slug?: string; customDomain?: string }) {
  const [settings, setSettings] = useState<WeddingSettings | null>(null)
  const [notFound, setNotFound] = useState(false)
  const publicShellStyle = settings
    ? ({
        '--public-bg': settings.backgroundColor,
      } as CSSProperties)
    : undefined

  useEffect(() => {
    async function load() {
      setNotFound(false)
      const domain = normalizeDomain(customDomain ?? '')
      const query = supabase.from('wedding_pages').select('*').eq('status', 'published')
      const { data } = domain
        ? await query.eq('custom_domain', domain).in('domain_status', ['verified', 'active']).maybeSingle()
        : await query.eq('slug', slug).maybeSingle()

      if (data?.settings) {
        setSettings(normalizeSettings({
          ...(data.settings as WeddingSettings),
          customDomain: data.custom_domain ?? (data.settings as WeddingSettings).customDomain,
          domainStatus: data.domain_status ?? (data.settings as WeddingSettings).domainStatus,
          dnsInstructions: data.dns_instructions ?? (data.settings as WeddingSettings).dnsInstructions,
        }))
        return
      }

      const local = readLocalPages().find((page) =>
        domain
          ? page.settings.customDomain === domain && ['verified', 'active'].includes(page.settings.domainStatus)
          : page.slug === slug,
      )

      if (!local && (domain || slug)) {
        setNotFound(true)
      }
      setSettings(normalizeSettings(local?.settings ?? defaultSettings))
    }
    load()
  }, [customDomain, slug])

  useEffect(() => {
    if (!settings || notFound) return
    applyInvitationSeo(settings, window.location.href)
  }, [notFound, settings])

  return (
    <main className="public-shell" style={publicShellStyle}>
      {notFound ? <p className="public-message">No encontramos una invitacion publicada para esta URL.</p> : null}
      {settings && !notFound ? <WeddingPreview settings={settings} /> : null}
      {!settings && !notFound ? <p className="public-message">Cargando invitacion...</p> : null}
    </main>
  )
}
