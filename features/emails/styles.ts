export const emailStyles = {
  outer: {
    fontFamily: 'Arial, sans-serif',
    background: '#f1f5f9',
    padding: '40px 20px',
  },
  card: {
    maxWidth: '600px',
    margin: '0 auto',
    background: '#ffffff',
    borderRadius: '12px',
    padding: '40px',
    border: '1px solid #e2e8f0',
  },
  imageCenter: {
    textAlign: 'center' as const,
    marginBottom: '24px',
  },
  title: {
    color: '#1e3a8a',
    fontSize: '22px',
    fontWeight: '700',
    margin: '0 0 8px 0',
  },
  titleCenter: {
    color: '#1e3a8a',
    fontSize: '22px',
    fontWeight: '700',
    textAlign: 'center' as const,
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '14px',
    margin: '0 0 24px 0',
  },
  subtitleCenter: {
    color: '#64748b',
    fontSize: '14px',
    textAlign: 'center' as const,
    margin: '0 0 24px 0',
  },
  greeting: {
    color: '#0f172a',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0 0 16px 0',
  },
  body: {
    color: '#0f172a',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0 0 16px 0',
  },
  infoBox: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '12px',
    padding: '20px',
    margin: '24px 0',
  },
  infoBoxText: {
    margin: '0',
    color: '#1e40af',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  successBox: {
    background: '#dcfce7',
    border: '1px solid #86efac',
    borderRadius: '12px',
    padding: '20px',
    margin: '24px 0',
    textAlign: 'center' as const,
  },
  successBoxTitle: {
    margin: '0 0 16px 0',
    color: '#166534',
    fontSize: '14px',
    fontWeight: '600',
  },
  primaryButton: {
    display: 'inline-block',
    background: '#2563eb',
    color: '#ffffff',
    padding: '12px 32px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
  },
  qrContainer: {
    textAlign: 'center' as const,
    margin: '30px 0',
  },
  link: {
    color: '#2563eb',
    wordBreak: 'break-all' as const,
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e2e8f0',
    margin: '24px 0',
  },
  footer: {
    color: '#94a3b8',
    fontSize: '11px',
    textAlign: 'center' as const,
    margin: '0',
  },
  folioBox: {
    background: '#eff6ff',
    padding: '16px',
    borderRadius: '12px',
    margin: '24px 0',
  },
  contact: {
    color: '#64748b',
    fontSize: '13px',
    lineHeight: '1.6',
    margin: '0',
  },
  contactLink: {
    color: '#2563eb',
  },
  logo: {
    width: '64px',
    height: '64px',
    display: 'inline-block',
  },
} as const;

function styleToString(style: Record<string, string>): string {
  return Object.entries(style)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${value}`)
    .join('; ');
}

export function emailLayout(content: string): string {
  return `
    <div style="${styleToString(emailStyles.outer)}">
      <div style="${styleToString(emailStyles.card)}">
        ${content}
        <hr style="${styleToString(emailStyles.divider)}" />
        <p style="${styleToString(emailStyles.footer)}">
          Este es un mensaje automático generado por el Sistema de Gestión
          de Infracciones de la Secretaría de Seguridad Pública Municipal.
        </p>
      </div>
    </div>
  `;
}

export function inlineStyles(styles: Record<string, string>): string {
  return styleToString(styles);
}
