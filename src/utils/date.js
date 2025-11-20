// Syrian Gregorian date/time formatting helpers
// Locale: ar-SY, Time Zone: Asia/Damascus

export function formatSyrianDate(input) {
  try {
    const dt = new Date(input)
    if (isNaN(dt.getTime())) return ''
    return dt.toLocaleDateString('ar-SY', { timeZone: 'Asia/Damascus' })
  } catch {
    return ''
  }
}

export function formatSyrianTime(input) {
  try {
    const dt = new Date(input)
    if (isNaN(dt.getTime())) return ''
    return dt.toLocaleTimeString('ar-SY', {
      timeZone: 'Asia/Damascus',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return ''
  }
}
