/**
 * Reusable multi-select dropdown with checkboxes.
 * Used for Position, School, and Division filters on AthletesPage.
 * Shows a pill button with a count summary; clicking it reveals
 * a floating checkbox list with a "Select All" toggle.
 */

interface CheckboxDropdownProps {
  label: string
  allItems: string[]
  selectedItems: Set<string>
  onSelectionChange: (next: Set<string>) => void
  isOpen: boolean
  onToggle: () => void
  minWidth?: string
}

export default function CheckboxDropdown({
  label,
  allItems,
  selectedItems,
  onSelectionChange,
  isOpen,
  onToggle,
  minWidth,
}: CheckboxDropdownProps) {
  const allSelected = selectedItems.size === allItems.length

  /** Toggle a single item in the set */
  const toggleItem = (item: string) => {
    const next = new Set(selectedItems)
    if (next.has(item)) next.delete(item)
    else next.add(item)
    onSelectionChange(next)
  }

  /** Select all or deselect all */
  const toggleAll = () => {
    onSelectionChange(allSelected ? new Set() : new Set(allItems))
  }

  // summary text shown on the button
  const summary = allSelected
    ? 'All'
    : selectedItems.size === 0
      ? 'None'
      : `${selectedItems.size}`

  return (
    <div className="filter-group">
      <button className="filter-btn" onClick={onToggle}>
        <span className="filter-label">{label}</span>
        {summary}
        {isOpen ? ' ▲' : ' ▼'}
      </button>

      {isOpen && (
        <div className="filter-dropdown" style={minWidth ? { minWidth } : undefined}>
          <label className="select-all">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            {' '}Select All
          </label>
          <hr />
          {allItems.map(item => (
            <label key={item}>
              <input
                type="checkbox"
                checked={selectedItems.has(item)}
                onChange={() => toggleItem(item)}
              />
              {' '}{item}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
