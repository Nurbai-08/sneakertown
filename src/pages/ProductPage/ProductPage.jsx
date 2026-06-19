import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import { PageLayout } from '../layout/PageLayout.jsx';
import { getSneakerById } from '../../features/sneakers/sneakersSlice.js';
import { addToCart } from '../../features/cart/cartSlice.js';
import { addFavorite, removeFavorite } from '../../features/favorites/favoritesSlice.js';
import { PageLoader } from '../../shared/ui/PageLoader.jsx';
import { formatPrice } from '../../shared/utils/formatters.js';
import { useToast } from '../../app/providers/ToastProvider.jsx';

export default function ProductPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { selectedSneaker, loading, error } = useSelector((state) => state.sneakers);
  const isFavorite = useSelector((state) => state.favorites.favorites.some((item) => item.id === selectedSneaker?.id));
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    dispatch(getSneakerById(id));
    setSelectedSize(null);
  }, [dispatch, id]);

  if (loading) return <PageLayout><PageLoader /></PageLayout>;

  if (error || !selectedSneaker) {
    return <PageLayout><section className="container-page py-12"><h1 className="text-3xl font-black">Товар не найден</h1></section></PageLayout>;
  }

  const sneaker = selectedSneaker;
  const hasSizes = sneaker.sizes && sneaker.sizes.length > 0;

  const handleAddToCart = () => {
    if (!hasSizes) return;
    const size = selectedSize || sneaker.sizes[0];
    dispatch(addToCart({ ...sneaker, selectedSize: size }));
    showToast(`Товар добавлен в корзину${size ? ` (${size})` : ''}`);
  };

  return (
    <PageLayout>
      <section className="container-page grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="animate-fade-in-left rounded-md bg-neutral-100 p-6 dark:bg-neutral-900">
          <img className="animate-scale-in mx-auto max-h-[640px] w-full object-contain" src={sneaker.image} alt={sneaker.name} />
        </div>
        <div className="animate-fade-in-right lg:sticky lg:top-24 lg:self-start" style={{ animationDelay: '0.15s' }}>
          <p className="text-sm font-bold uppercase text-accent">{sneaker.brand}</p>
          <h1 className="mt-2 text-4xl font-black">{sneaker.name}</h1>
          <p className="mt-4 text-3xl font-black">{formatPrice(sneaker.retailPrice)}</p>

          {hasSizes ? (
            <div className="animate-fade-in-up mt-6" style={{ animationDelay: '0.25s' }}>
              <p className="mb-3 text-sm font-semibold text-neutral-500">Выберите размер</p>
              <div className="flex flex-wrap gap-2">
                {sneaker.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`grid h-10 w-14 place-items-center rounded-md border text-sm font-bold transition
                      ${selectedSize === size
                        ? 'border-accent bg-accent text-white'
                        : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:border-neutral-500'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              Нет в наличии
            </div>
          )}

          <dl className="mt-6 grid gap-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-neutral-200 pb-3 dark:border-neutral-800"><dt className="text-neutral-500">Цвет</dt><dd className="font-semibold">{sneaker.colorway}</dd></div>
            <div className="flex justify-between gap-4 border-b border-neutral-200 pb-3 dark:border-neutral-800"><dt className="text-neutral-500">SKU</dt><dd className="font-semibold">{sneaker.sku || 'N/A'}</dd></div>
          </dl>
          <p className="mt-6 text-neutral-600 dark:text-neutral-300">{sneaker.description}</p>
          <div className="animate-fade-in-up mt-8 grid gap-3 sm:grid-cols-2" style={{ animationDelay: '0.35s' }}>
            <button
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              disabled={!hasSizes}
              onClick={handleAddToCart}
            >
              <FiShoppingBag /> {hasSizes ? 'В корзину' : 'Нет в наличии'}
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
