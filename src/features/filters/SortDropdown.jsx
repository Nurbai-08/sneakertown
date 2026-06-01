import { SORT_OPTIONS } from '../../shared/constants/filters.js';

export const SortDropdown = ({ value, onChange }) => (
  <select className="input-field min-w-48" value={value} onChange={(event) => onChange(event.target.value)} aria-label="Сортировка">
    {SORT_OPTIONS.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);
