import { LayoutTemplate, Plus } from 'lucide-react'
import { useState } from 'react'
import type { WeddingPageRow } from '../types'
import { InvitationCard } from './InvitationCard'

export function ProfileDashboard({
  email,
  pages,
  onCreate,
  onDelete,
  onEdit,
}: {
  email: string
  pages: WeddingPageRow[]
  onCreate: (templateKey?: string) => void
  onDelete: (page: WeddingPageRow) => void
  onEdit: (page: WeddingPageRow) => void
}) {
  const [now] = useState(() => Date.now())
  const expired = pages.filter((page) => page.status === 'published' && new Date(page.settings.receptionDate || page.settings.date).getTime() < now)
  const published = pages.filter((page) => page.status === 'published' && !expired.some((expiredPage) => expiredPage.id === page.id))
  const drafts = pages.filter((page) => page.status === 'draft')
  const groups = [
    { key: 'published', title: 'Publicadas', pages: published },
    { key: 'drafts', title: 'Borradores', pages: drafts },
    { key: 'expired', title: 'Vencidas', pages: expired, variant: 'expired' as const },
  ]

  return (
    <section className="profile-shell">
      <div className="profile-hero">
        <div>
          <span className="eyebrow">Perfil</span>
          <h1>Tus invitaciones</h1>
          <p>{email}</p>
        </div>
        <button className="primary-button" type="button" onClick={() => onCreate()}>
          <Plus size={18} />
          Crear invitacion
        </button>
      </div>
      {pages.length === 0 ? (
        <section className="invitations-grid">
          <article className="empty-state">
            <LayoutTemplate size={28} />
            <h2>Aun no tienes invitaciones</h2>
            <p>Crea tu primera invitacion para empezar a personalizarla.</p>
          </article>
        </section>
      ) : (
        <div className="invitation-groups">
          {groups.map((group) => (
            <section className="invitation-group" key={group.key}>
              <div className="group-heading">
                <h2>{group.title}</h2>
                <span>{group.pages.length}</span>
              </div>
              {group.pages.length === 0 ? (
                <p className="form-note">No hay invitaciones en esta categoria.</p>
              ) : (
                <div className="invitations-grid">
                  {group.pages.map((page) => (
                    <InvitationCard
                      key={page.id}
                      page={page}
                      variant={group.variant}
                      onDelete={() => onDelete(page)}
                      onEdit={() => onEdit(page)}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </section>
  )
}
