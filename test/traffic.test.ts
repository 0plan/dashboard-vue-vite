import { describe, expect, it } from 'vitest'
import { getTrafficReport } from '../src/data/traffic'
import { demoEmail, demoPassword, signInDemo, signOutDemo } from '../src/modules/demo-session'

describe('public traffic demo', () => {
  it.each([
    { days: 7 as const, start: '2026-09-24', mobile: 6192, desktop: 4297, total: 10489, average: 1498 },
    { days: 30 as const, start: '2026-09-01', mobile: 21532, desktop: 15107, total: 36639, average: 1221 },
  ])('summarizes the last $days fixture days', ({ days, start, ...metrics }) => {
    const report = getTrafficReport(days)
    expect(report).toMatchObject({ ...metrics, peak: { date: '2026-09-29', visits: 1790 } })
    expect(report.daily).toHaveLength(days)
    expect(report.daily[0].date).toBe(start)
    expect(report.daily.at(-1)?.date).toBe('2026-09-30')
  })

  it('only opens a demo session for the published credential pair', () => {
    const initialSize = sessionStorage.length
    expect(signInDemo(demoEmail, 'incorrect')).toBe(false)
    expect(signInDemo('other@example.com', demoPassword)).toBe(false)
    expect(sessionStorage.length).toBe(initialSize)
    expect(signInDemo(demoEmail, demoPassword)).toBe(true)
    expect(sessionStorage.length).toBe(initialSize + 1)
    signOutDemo()
    expect(sessionStorage.length).toBe(initialSize)
  })
})
