import { BRANDS } from '../../shared/constants/filters.js';

export const FiltersSidebar = ({ filters, onChange, onClear }) => (
  <aside className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-black">Фильтры</h2>
      <button className="text-sm font-semibold text-accent" type="button" onClick={onClear}>Сбросить</button>
    </div>

    <div className="mt-5 grid gap-4">
      <label className="grid gap-2 text-sm font-semibold">
        Бренд
        <select className="input-field" value={filters.brand} onChange={(event) => onChange({ brand: event.target.value })}>
          <option value="">Все бренды</option>
          {BRANDS.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-2 text-sm font-semibold">
          Цена от
          <input className="input-field" type="number" min="0" value={filters.minPrice} onChange={(event) => onChange({ minPrice: event.target.value })} />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Цена до
          <input className="input-field" type="number" min="0" value={filters.maxPrice} onChange={(event) => onChange({ maxPrice: event.target.value })} />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold">
        Размер
        <select className="input-field" value={filters.size} onChange={(event) => onChange({ size: event.target.value })}>
          <option value="">Все размеры</option>
          {Array.from({ length: 11 }, (_, i) => i + 36).map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </label>
    </div>
  </aside>
);
