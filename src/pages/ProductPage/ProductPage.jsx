import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import { PageLayout } from '../layout/PageLayout.jsx';
import { getSneakerById } from '../../features/sneakers/sneakersSlice.js';
import { addToCart } from '../../features/cart/cartSlice.js';
import { addFavorite, removeFavorite } from '../../features/favorites/favoritesSlice.js';
import { PageLoader } from '../../shared/ui/PageLoader.jsx';
import { formatDate, formatPrice } from '../../shared/utils/formatters.js';
import { useToast } from '../../app/providers/ToastProvider.jsx';

export default function ProductPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { selectedSneaker, loading, error } = useSelector((state) => state.sneakers);
  const isFavorite = useSelector((state) => state.favorites.favorites.some((item) => item.id === selectedSneaker?.id));

  useEffect(() => {
    dispatch(getSneakerById(id));
  }, [dispatch, id]);

  if (loading) return <PageLayout><PageLoader /></PageLayout>;

  if (error || !selectedSneaker) {
    return <PageLayout><section className="container-page py-12"><h1 className="text-3xl font-black">Товар не найден</h1></section></PageLayout>;
  }

  const sneaker = selectedSneaker;

  return (
    <PageLayout>
      <section className="container-page grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-md bg-neutral-100 p-6 dark:bg-neutral-900">
          <img className="mx-auto max-h-[640px] w-full object-contain" src={sneaker.image} alt={sneaker.name} />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-sm font-bold uppercase text-accent">{sneaker.brand}</p>
          <h1 className="mt-2 text-4xl font-black">{sneaker.name}</h1>
          <p className="mt-4 text-3xl font-black">{formatPrice(sneaker.retailPrice)}</p>
          <dl className="mt-6 grid gap-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-neutral-200 pb-3 dark:border-neutral-800"><dt className="text-neutral-500">Цвет</dt><dd className="font-semibold">{sneaker.colorway}</dd></div>
            <div className="flex justify-between gap-4 border-b border-neutral-200 pb-3 dark:border-neutral-800"><dt className="text-neutral-500">Дата релиза</dt><dd className="font-semibold">{formatDate(sneaker.releaseDate)}</dd></div>
            <div className="flex justify-between gap-4 border-b border-neutral-200 pb-3 dark:border-neutral-800"><dt className="text-neutral-500">SKU</dt><dd className="font-semibold">{sneaker.sku || 'N/A'}</dd></div>
          </dl>
          <p className="mt-6 text-neutral-600 dark:text-neutral-300">{sneaker.description}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button className="btn-primary" type="button" onClick={() => { dispatch(addToCart(sneaker)); showToast('Товар добавлен в корзину'); }}>
              <FiShoppingBag /> В корзину
            </button>
            <button className="btn-secondary" type="button" onClick={() => { dispatch(isFavorite ? removeFavorite(sneaker.id) : addFavorite(sneaker)); showToast(isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное'); }}>
              <FiHeart /> {isFavorite ? 'Убрать' : 'В избранное'}
            </button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
