import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PageLayout } from '../layout/PageLayout.jsx';
import { ProductGrid } from '../../widgets/ProductGrid/ProductGrid.jsx';
import { FiltersSidebar } from '../../widgets/FiltersSidebar/FiltersSidebar.jsx';
import { SearchBar } from '../../features/search/SearchBar.jsx';
import { SortDropdown } from '../../features/filters/SortDropdown.jsx';
import { clearFilters, getSneakers, setFilters, setPage, setSearch, setSort } from '../../features/sneakers/sneakersSlice.js';

export default function CatalogPage() {
  const dispatch = useDispatch();
  const { sneakers, loading, error, search, filters, sort, page } = useSelector((state) => state.sneakers);

  useEffect(() => {
    dispatch(getSneakers());
  }, [dispatch, search, filters, sort, page]);

  const handleSearch = useCallback((query) => dispatch(setSearch(query)), [dispatch]);

  return (
    <PageLayout>
      <section className="container-page py-8">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-accent">Каталог</p>
            <h1 className="mt-1 text-4xl font-black">Все кроссовки</h1>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(220px,360px)_220px]">
            <SearchBar value={search} onChange={handleSearch} />
            <SortDropdown value={sort} onChange={(value) => dispatch(setSort(value))} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <FiltersSidebar
            filters={filters}
            onChange={(value) => dispatch(setFilters(value))}
            onClear={() => dispatch(clearFilters())}
          />
          <div>
            {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
            <ProductGrid items={sneakers} loading={loading} />
            <div className="mt-8 flex justify-center gap-2">
              <button className="btn-secondary" type="button" disabled={page <= 1} onClick={() => dispatch(setPage(page - 1))}>Назад</button>
              <span className="grid h-11 min-w-11 place-items-center rounded-md border border-neutral-200 px-4 text-sm font-bold dark:border-neutral-800">{page}</span>
              <button className="btn-secondary" type="button" disabled={sneakers.length < 24} onClick={() => dispatch(setPage(page + 1))}>Вперед</button>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
