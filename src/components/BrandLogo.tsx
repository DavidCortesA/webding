type BrandLogoProps = {
  compact?: boolean
  className?: string
}

export function BrandLogo({ compact = false, className = '' }: BrandLogoProps) {
  if (compact) {
    return <img className={`brand-isotype ${className}`.trim()} src="/webding-isotype.png" alt="Webding" />
  }

  return (
    <span className={`brand-logo ${className}`.trim()}>
      <img className="brand-logo-mark" src="/webding-isotype.png" alt="" aria-hidden="true" />
      <span className="brand-logo-copy">
        <strong>WEBDING</strong>
        <small>Invitaciones que cobran vida</small>
      </span>
    </span>
  )
}
