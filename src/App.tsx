import { useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { getGolfCourseForecast } from './lib/api'
import { formatDate, formatTime, todayIsoDate } from './lib/format'
import type { ForecastResult, PlayDecision } from './lib/types'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1800&q=80'

const decisionStyles: Record<
  PlayDecision,
  { label: string; tone: string; ring: string; bg: string }
> = {
  YES: {
    label: 'Yes',
    tone: 'text-yes',
    ring: 'border-yes/40',
    bg: 'bg-yes/10',
  },
  MAYBE: {
    label: 'Maybe',
    tone: 'text-maybe',
    ring: 'border-maybe/40',
    bg: 'bg-maybe/10',
  },
  NO: {
    label: 'No',
    tone: 'text-no',
    ring: 'border-no/40',
    bg: 'bg-no/10',
  },
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-muted">
      {children}
    </label>
  )
}

function ConditionRow({
  title,
  metric,
  advice,
}: {
  title: string
  metric: string
  advice: string
}) {
  return (
    <div className="border-t border-fog py-4 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-xl text-pine">{title}</h3>
        <p className="shrink-0 text-sm font-semibold text-ink">{metric}</p>
      </div>
      <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{advice}</p>
    </div>
  )
}

export default function App() {
  const courseId = useId()
  const dateId = useId()
  const timeId = useId()
  const resultsRef = useRef<HTMLElement>(null)

  const [courseQuery, setCourseQuery] = useState('Sleepy Ridge Golf Course')
  const [playDate, setPlayDate] = useState(todayIsoDate())
  const [teeTime, setTeeTime] = useState('08:00')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ForecastResult | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const forecast = await getGolfCourseForecast({
        courseQuery,
        playDate,
        teeTime,
      })
      setResult(forecast)
      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const decision = result ? decisionStyles[result.shouldPlay] : null
  const courseTitle = result?.course.display_name.split(',')[0] ?? null

  return (
    <div className="min-h-dvh bg-mist text-ink">
      <header className="relative isolate min-h-[100svh] overflow-hidden text-white">
        <img
          src={HERO_IMAGE}
          alt=""
          className="animate-soft-zoom absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-pine-deep/75 via-pine-deep/55 to-mist" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_20%,rgba(7,36,28,0.45)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-3xl flex-col justify-end px-5 pb-10 pt-16 sm:px-8 sm:pb-14">
          <div className="animate-rise">
            <p className="font-display text-[clamp(2.75rem,12vw,5.5rem)] leading-[0.9] tracking-tight">
              FairwayCast
            </p>
            <p className="mt-4 max-w-md text-lg leading-snug text-white/85 sm:text-xl">
              Course weather turned into one clear call: should you play?
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="animate-rise delay-1 mt-8 space-y-3 rounded-2xl bg-panel/95 p-4 text-ink shadow-[0_20px_50px_rgba(7,36,28,0.28)] backdrop-blur-sm sm:p-5"
          >
            <div>
              <FieldLabel htmlFor={courseId}>Golf course</FieldLabel>
              <input
                id={courseId}
                value={courseQuery}
                onChange={(e) => setCourseQuery(e.target.value)}
                className="w-full min-w-0 rounded-xl border border-fog bg-white px-3.5 py-3 outline-none transition focus:border-moss"
                placeholder="Course name"
                autoComplete="off"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <FieldLabel htmlFor={dateId}>Date</FieldLabel>
                <input
                  id={dateId}
                  type="date"
                  value={playDate}
                  onChange={(e) => setPlayDate(e.target.value)}
                  className="w-full min-w-0 max-w-full rounded-xl border border-fog bg-white px-3.5 py-3 outline-none transition focus:border-moss"
                  required
                />
              </div>
              <div className="min-w-0">
                <FieldLabel htmlFor={timeId}>Tee time</FieldLabel>
                <input
                  id={timeId}
                  type="time"
                  value={teeTime}
                  onChange={(e) => setTeeTime(e.target.value)}
                  className="w-full min-w-0 max-w-full rounded-xl border border-fog bg-white px-3.5 py-3 outline-none transition focus:border-moss"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-pine px-4 py-3.5 text-base font-semibold text-white transition hover:bg-pine-deep disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? 'Checking conditions…' : 'Get forecast'}
            </button>

            {error ? (
              <p className="rounded-xl bg-no/10 px-3 py-2 text-sm text-no" role="alert">
                {error}
              </p>
            ) : null}
          </form>
        </div>
      </header>

      <main className="relative z-10 -mt-4 rounded-t-[1.75rem] bg-mist px-5 pb-16 pt-10 sm:px-8">
        <div className="mx-auto max-w-3xl">
          {!result && !loading ? (
            <p className="animate-fade text-center text-muted">
              Enter a course, date, and tee time for a six-hour round window.
            </p>
          ) : null}

          {result && decision ? (
            <section ref={resultsRef} className="space-y-10 scroll-mt-6">
              <div className={`animate-rise rounded-2xl border ${decision.ring} ${decision.bg} p-5 sm:p-6`}>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
                  Should I play?
                </p>
                <p className={`mt-2 font-display text-5xl sm:text-6xl ${decision.tone}`}>
                  {decision.label}
                </p>
                <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink/85">
                  {result.decisionReason}
                </p>
              </div>

              <section className="animate-rise delay-1">
                <h2 className="font-display text-3xl text-pine sm:text-4xl">{courseTitle}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{result.course.display_name}</p>
                <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-panel px-4 py-3">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Date</dt>
                    <dd className="mt-1 font-medium">{formatDate(result.playDate)}</dd>
                  </div>
                  <div className="rounded-xl bg-panel px-4 py-3">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Tee time</dt>
                    <dd className="mt-1 font-medium">{formatTime(result.teeTime)}</dd>
                  </div>
                  <div className="rounded-xl bg-panel px-4 py-3">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Round window</dt>
                    <dd className="mt-1 font-medium">
                      {formatTime(result.golfHours[0].time.split('T')[1])}
                      {' – '}
                      {formatTime(result.golfHours[result.golfHours.length - 1].time.split('T')[1])}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="animate-rise delay-2 rounded-2xl bg-panel p-5 sm:p-6">
                <h2 className="font-display text-2xl text-pine">Round conditions</h2>
                <div className="mt-4">
                  <ConditionRow
                    title="Temperature"
                    metric={`${result.minTemp}–${result.maxTemp}°F`}
                    advice={result.tempAdvice}
                  />
                  <ConditionRow
                    title="Wind"
                    metric={`Max ${result.maxWind} mph`}
                    advice={result.windAdvice}
                  />
                  <ConditionRow
                    title="Rain"
                    metric={`Max ${result.maxRainChance}%`}
                    advice={result.rainAdvice}
                  />
                  <ConditionRow
                    title="UV"
                    metric={`Max ${result.maxUv}`}
                    advice={result.uvAdvice}
                  />
                </div>
              </section>

              <section className="animate-rise delay-3 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-panel p-5">
                  <h3 className="font-display text-xl text-pine">Why play</h3>
                  <ul className="mt-3 space-y-2 text-[15px] text-muted">
                    {(result.positives.length ? result.positives : ['No major positives found']).map(
                      (item) => (
                        <li key={item}>{item}</li>
                      ),
                    )}
                  </ul>
                </div>
                <div className="rounded-2xl bg-panel p-5">
                  <h3 className="font-display text-xl text-pine">Watch out</h3>
                  <ul className="mt-3 space-y-2 text-[15px] text-muted">
                    {(result.watchOuts.length ? result.watchOuts : ['No major concerns']).map(
                      (item) => (
                        <li key={item}>{item}</li>
                      ),
                    )}
                  </ul>
                </div>
                <div className="rounded-2xl bg-panel p-5">
                  <h3 className="font-display text-xl text-pine">Bring</h3>
                  <ul className="mt-3 space-y-2 text-[15px] text-muted">
                    {(result.itemsToBring.length ? result.itemsToBring : ['Normal golf gear']).map(
                      (item) => (
                        <li key={item}>{item}</li>
                      ),
                    )}
                  </ul>
                </div>
              </section>

              <section className="animate-rise delay-3">
                <h2 className="font-display text-2xl text-pine">Hourly round forecast</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {result.golfHours.map((hour) => (
                    <div key={hour.time} className="rounded-xl bg-panel px-3.5 py-3">
                      <p className="text-sm font-semibold text-pine">
                        {formatTime(hour.time.split('T')[1])}
                      </p>
                      <p className="mt-2 text-sm text-muted">{hour.temperature}°F</p>
                      <p className="text-sm text-muted">Wind {hour.wind} mph</p>
                      <p className="text-sm text-muted">Rain {hour.rainChance}%</p>
                      <p className="text-sm text-muted">UV {hour.uvIndex}</p>
                    </div>
                  ))}
                </div>
              </section>

              <details className="rounded-2xl bg-panel p-5 text-sm text-muted">
                <summary className="cursor-pointer font-semibold text-ink">Raw API data</summary>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-relaxed">
                  {JSON.stringify(result.raw, null, 2)}
                </pre>
              </details>
            </section>
          ) : null}
        </div>
      </main>

      <footer className="border-t border-fog px-5 py-8 text-center text-sm text-muted sm:px-8">
        FairwayCast · personal weather advisor for golfers
      </footer>
    </div>
  )
}
