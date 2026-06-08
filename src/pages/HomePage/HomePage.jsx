import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PageLayout } from '../layout/PageLayout.jsx';
import { HeroBanner } from '../../widgets/HeroBanner/HeroBanner.jsx';
import { ProductGrid } from '../../widgets/ProductGrid/ProductGrid.jsx';
import { getSneakers } from '../../features/sneakers/sneakersSlice.js';

const brands = ['Nike', 'Adidas', 'Jordan', 'New Balance', 'On Cloud', 'Onitsuka', 'Golden Goose', 'The North Face', 'Timberland Boots', 'Birkenstock', 'Salomon', 'Zegna' ];

export default function HomePage() {
  const dispatch = useDispatch();
  const { sneakers, loading } = useSelector((state) => state.sneakers);
  const newest = useMemo(() => sneakers.slice(0, 4), [sneakers]);
  const popular = useMemo(() => sneakers.slice(4, 8), [sneakers]);

  useEffect(() => {
    if (!sneakers.length) dispatch(getSneakers());
  }, [dispatch, sneakers.length]);

  return (
    <PageLayout>
      <HeroBanner />
      <section className="container-page py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-bold uppercase text-accent">Популярные</p>
          </div>
          <Link className="text-sm font-bold text-accent" to="/catalog">Все товары</Link>
        </div>
        <ProductGrid items={popular} loading={loading} />
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50 py-12 dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="container-page">
          <p className="text-2xl font-bold uppercase text-accent">Бренды</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {brands.map((brand) => (
              <div key={brand} className="rounded-md border border-neutral-200 bg-white p-5 text-center text-lg font-black transition dark:border-neutral-800 dark:bg-neutral-950">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="mb-6">
          <p className="text-2xl font-bold uppercase text-accent">Новинки</p>
        </div>
        <ProductGrid items={newest} loading={loading} />
      </section>
    </PageLayout>
  );
}
