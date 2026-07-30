export function formatTime(timeString: string): string {
  const [hourPart, minute = '00'] = timeString.split(':')
  const hour = Number.parseInt(hourPart, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minute} ${ampm}`
}

export function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T12:00:00`)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function todayIsoDate(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 10)
}
