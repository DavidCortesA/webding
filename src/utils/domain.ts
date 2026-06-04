import type { DnsInstructions, DomainStatus } from '../types'

const domainPattern =
  /^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/i

function stripProtocol(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .split(':')[0]
    .toLowerCase()
}

export function normalizeDomain(value: string) {
  return stripProtocol(value)
}

export function isValidDomain(value: string) {
  const domain = normalizeDomain(value)
  return domainPattern.test(domain) && !domain.includes('..')
}

export function getPlatformDomain() {
  const configured = import.meta.env.VITE_PLATFORM_DOMAIN as string | undefined
  const runtimeHost = typeof window === 'undefined' ? '' : window.location.host
  return normalizeDomain(configured || runtimeHost || 'dominio-principal-de-la-plataforma.com')
}

export function getDnsInstructions(customDomain = ''): DnsInstructions {
  const platformDomain = getPlatformDomain()
  const domain = normalizeDomain(customDomain)
  return {
    platformDomain,
    records: [
      {
        type: 'CNAME',
        host: 'www',
        value: platformDomain,
        required: true,
      },
      {
        type: 'A',
        host: '@',
        value: 'Opcional: IP publica de la plataforma si usas dominio raiz',
        required: false,
      },
    ],
    notes: [
      `Configura www.${domain || 'tu-dominio.com'} como CNAME hacia ${platformDomain}.`,
      'El dominio raiz sin www puede redirigirse a www desde tu proveedor DNS.',
      'La propagacion puede tardar desde unos minutos hasta 24 horas.',
    ],
  }
}

async function resolveDns(name: string, type: 'CNAME' | 'A') {
  const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`)
  if (!response.ok) throw new Error('No pudimos consultar DNS en este momento.')
  const data = (await response.json()) as { Answer?: Array<{ data: string }> }
  return data.Answer?.map((answer) => answer.data.replace(/\.$/, '').toLowerCase()) ?? []
}

export async function verifyDomainDns(customDomain: string) {
  const domain = normalizeDomain(customDomain)
  if (!isValidDomain(domain)) {
    return {
      status: 'error' as DomainStatus,
      message: 'Escribe un dominio valido, por ejemplo boda-davidyanna.com.',
    }
  }

  const platformDomain = getPlatformDomain()
  try {
    const cnameAnswers = await resolveDns(`www.${domain}`, 'CNAME')
    const hasExpectedCname = cnameAnswers.some((answer) => normalizeDomain(answer) === platformDomain)

    if (!hasExpectedCname) {
      return {
        status: 'pending' as DomainStatus,
        message: `Aun no encontramos el CNAME de www hacia ${platformDomain}. Revisa el DNS y vuelve a intentar.`,
      }
    }

    return {
      status: 'verified' as DomainStatus,
      message: 'Dominio verificado. Ya apunta correctamente a la plataforma.',
    }
  } catch (error) {
    return {
      status: 'error' as DomainStatus,
      message: error instanceof Error ? error.message : 'No pudimos verificar el dominio.',
    }
  }
}
