
// in future updaten this according to loaction
export function timeAgo(date: string | Date) {
   const utcDate = new Date(date)

  // IST = UTC + 5:30
  const istOffset = 5.5 * 60 * 60 * 1000
  const istDate = new Date(utcDate.getTime() + istOffset)

  const now = new Date()
  const seconds = Math.floor((now.getTime() - istDate.getTime()) / 1000)
  const days = Math.floor(seconds / 86400)

  if (seconds < 5) return "just now"
  if (days === 1) return "yesterday"

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`
    }
  }

  return "just now"
}
