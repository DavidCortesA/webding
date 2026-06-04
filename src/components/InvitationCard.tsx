import { Copy, ExternalLink, Link, Share2, Trash2 } from 'lucide-react'
import { templates } from '../data/catalogs'
import type { WeddingPageRow } from '../types'
import { getCustomDomainLink, getPublicLink, getSocialPreviewLink } from '../utils/wedding'

export function InvitationCard({ onDelete, page, variant = 'default', onEdit }: { onDelete?: () => void; page: WeddingPageRow; variant?: 'default' | 'expired'; onEdit: () => void }) {
  const publicLink = getPublicLink(page.slug)
  const customLink = getCustomDomainLink(page.custom_domain ?? page.settings.customDomain)
  const socialPreviewLink = getSocialPreviewLink({ customDomain: page.custom_domain ?? page.settings.customDomain, slug: page.slug })
  const shortId = page.id.slice(0, 8)

  async function copyLink() {
    await navigator.clipboard.writeText(customLink || publicLink)
  }

  async function copySocialPreviewLink() {
    await navigator.clipboard.writeText(socialPreviewLink)
  }

  return (
    <article className="invitation-card">
      <img src={page.settings.photos[0]} alt={page.title} />
      <div className="invitation-card-body">
        <div className="status-row">
          <span className={`status-pill ${variant === 'expired' ? 'error' : page.status}`}>
            {variant === 'expired' ? 'Vencida' : page.status === 'published' ? 'Publicada' : 'Borrador'}
          </span>
          <code>ID {shortId}</code>
        </div>
        <h2>{page.title}</h2>
        <p>{templates.find((template) => template.key === page.template_key)?.name ?? page.template_key}</p>
        <div className="pretty-link">
          <Link size={15} />
          <span>{publicLink}</span>
        </div>
        {customLink && (
          <div className="pretty-link custom-domain-link">
            <ExternalLink size={15} />
            <span>{customLink}</span>
            <small>{page.domain_status ?? page.settings.domainStatus}</small>
          </div>
        )}
        <div className="card-actions">
          <button className="primary-button" type="button" onClick={onEdit}>
            Editar
          </button>
          <a className="secondary-button" href={publicLink} target="_blank" rel="noreferrer">
            <ExternalLink size={15} />
            Abrir
          </a>
          <button className="ghost-button icon-only" type="button" onClick={copyLink} aria-label="Copiar liga">
            <Copy size={16} />
          </button>
          <button className="ghost-button icon-only" type="button" onClick={copySocialPreviewLink} aria-label="Copiar liga con preview">
            <Share2 size={16} />
          </button>
          {onDelete && (
            <button className="ghost-button icon-only danger" type="button" onClick={onDelete} aria-label="Borrar invitacion">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
