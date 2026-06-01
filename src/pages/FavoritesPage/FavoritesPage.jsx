import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PageLayout } from '../layout/PageLayout.jsx';
import { ProductGrid } from '../../widgets/ProductGrid/ProductGrid.jsx';
import { clearFavorites } from '../../features/favorites/favoritesSlice.js';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';

export default function FavoritesPage() {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.favorites);

  return (
    <PageLayout>
      <section className="container-page py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-accent">Избранное</p>
            <h1 className="mt-1 text-4xl font-black">Сохраненные пары</h1>
          </div>
          {favorites.length > 0 && <button className="btn-secondary" type="button" onClick={() => dispatch(clearFavorites())}>Очистить</button>}
        </div>
        {favorites.length ? (
          <ProductGrid items={favorites} loading={false} />
        ) : (
          <EmptyState title="Пока пусто" text="Нажимайте на сердце в карточке товара, чтобы собрать подборку." action={<Link className="btn-primary" to="/catalog">В каталог</Link>} />
        )}
      </section>
    </PageLayout>
  );
}
