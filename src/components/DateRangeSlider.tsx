/**
 * Dual-thumb date range slider.
 * Two overlaid <input type="range"> elements let the user select
 * a start and end date. Dates are stored as epoch-millisecond timestamps
 * and displayed as locale date strings.
 */

interface DateRangeSliderProps {
  dateMin: number
  dateMax: number
  dateStart: number
  dateEnd: number
  onStartChange: (value: number) => void
  onEndChange: (value: number) => void
}

export default function DateRangeSlider({
  dateMin,
  dateMax,
  dateStart,
  dateEnd,
  onStartChange,
  onEndChange,
}: DateRangeSliderProps) {
  // only show the slider when there is a meaningful range
  if (dateMin === dateMax) return null

  return (
    <div className="date-range">
      <span className="filter-label">Date</span>
      <span className="date-range-label">
        {new Date(dateStart).toLocaleDateString()}
      </span>

      <div className="date-range-track">
        {/* left thumb — controls the start of the range */}
        <input
          type="range"
          min={dateMin}
          max={dateMax}
          value={dateStart}
          onChange={e => onStartChange(Math.min(Number(e.target.value), dateEnd))}
          className="range-thumb"
          style={{ zIndex: 2 }}
        />
        {/* right thumb — controls the end of the range */}
        <input
          type="range"
          min={dateMin}
          max={dateMax}
          value={dateEnd}
          onChange={e => onEndChange(Math.max(Number(e.target.value), dateStart))}
          className="range-thumb"
          style={{ zIndex: 1 }}
        />
      </div>

      <span className="date-range-label">
        {new Date(dateEnd).toLocaleDateString()}
      </span>
    </div>
  )
}
