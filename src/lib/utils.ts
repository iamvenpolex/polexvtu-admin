export const fmt = (n: number | string | null | undefined) =>
  '₦' + Number(n || 0).toLocaleString('en-NG')

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

export const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

export const statusColor = (s: string) => {
  if (s === 'success') return 'badge-success'
  if (s === 'failed') return 'badge-danger'
  if (s === 'pending') return 'badge-warn'
  return 'badge-gray'
}
