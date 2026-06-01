import { memo, useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useDebounce } from '../../shared/hooks/useDebounce.js';

export const SearchBar = memo(({ value = '', onChange, placeholder = 'Поиск кроссовок' }) => {
  const [query, setQuery] = useState(value);
  const debounced = useDebounce(query, 500);

  useEffect(() => {
    onChange?.(debounced);
  }, [debounced, onChange]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  return (
    <label className="relative block w-full">
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
      <input
        className="input-field pl-10"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
});
