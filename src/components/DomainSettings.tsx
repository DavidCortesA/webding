import { CheckCircle2, Clock, Globe2, XCircle } from 'lucide-react'
import type { WeddingSettings } from '../types'
import { getDnsInstructions, isValidDomain, normalizeDomain, verifyDomainDns } from '../utils/domain'

const statusLabels = {
  pending: 'Pendiente',
  verified: 'Verificado',
  active: 'Activo',
  error: 'Error',
}

export function DomainSettings({
  settings,
  onChange,
}: {
  settings: WeddingSettings
  onChange: (partial: Partial<WeddingSettings>) => void
}) {
  const hasDomain = Boolean(settings.customDomain)
  const StatusIcon = settings.domainStatus === 'verified' || settings.domainStatus === 'active'
    ? CheckCircle2
    : settings.domainStatus === 'error'
      ? XCircle
      : Clock

  async function verifyDomain() {
    const result = await verifyDomainDns(settings.customDomain)
    onChange({
      domainStatus: result.status,
      domainError: result.message,
      dnsInstructions: getDnsInstructions(settings.customDomain),
    })
  }

  function updateDomain(value: string) {
    const customDomain = normalizeDomain(value)
    onChange({
      customDomain,
      domainStatus: customDomain ? 'pending' : 'pending',
      domainError: customDomain && !isValidDomain(customDomain) ? 'Escribe un dominio valido, por ejemplo boda-davidyanna.com.' : '',
      dnsInstructions: getDnsInstructions(customDomain),
    })
  }

  return (
    <fieldset className="domain-settings">
      <legend>Dominio personalizado</legend>
      <label>
        Dominio del evento
        <input
          placeholder="boda-davidyanna.com"
          value={settings.customDomain}
          onChange={(event) => updateDomain(event.target.value)}
        />
      </label>
      <div className={`domain-status domain-${settings.domainStatus}`}>
        <StatusIcon size={17} />
        <strong>{statusLabels[settings.domainStatus]}</strong>
        <span>{settings.domainError || (hasDomain ? 'Guarda y verifica cuando el DNS este configurado.' : 'Opcional para usar una URL propia.')}</span>
      </div>
      {hasDomain && (
        <div className="dns-card">
          <div className="dns-card-heading">
            <Globe2 size={17} />
            <strong>Instrucciones DNS</strong>
          </div>
          <div className="dns-table" role="table" aria-label="Registros DNS">
            <span>Tipo</span>
            <span>Host</span>
            <span>Value</span>
            {settings.dnsInstructions.records.map((record) => (
              <div className="dns-row" key={`${record.type}-${record.host}`}>
                <code>{record.type}</code>
                <code>{record.host}</code>
                <code>{record.value}</code>
              </div>
            ))}
          </div>
          {settings.dnsInstructions.notes.map((note) => (
            <p className="form-note" key={note}>{note}</p>
          ))}
          <button className="secondary-button full" type="button" onClick={verifyDomain}>
            Verificar dominio
          </button>
        </div>
      )}
    </fieldset>
  )
}
