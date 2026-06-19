import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import { addToCart } from '../../features/cart/cartSlice.js';
import { addFavorite, removeFavorite } from '../../features/favorites/favoritesSlice.js';
import { formatPrice } from '../../shared/utils/formatters.js';
import { useToast } from '../../app/providers/ToastProvider.jsx';

export const ProductCard = memo(({ sneaker }) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const isFavorite = useSelector((state) => state.favorites.favorites.some((item) => item.id === sneaker.id));

  const hasSizes = sneaker.sizes && sneaker.sizes.length > 0;

  const handleCart = () => {
    if (!hasSizes) return;
    const size = sneaker.sizes[0];
    dispatch(addToCart({ ...sneaker, selectedSize: size }));
    showToast(`Товар добавлен в корзину (${size})`);
  };

  const handleFavorite = () => {
    dispatch(isFavorite ? removeFavorite(sneaker.id) : addFavorite(sneaker));
    showToast(isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное');
  };

  return (
    <article className="group overflow-hidden rounded-md border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
      <Link to={`/product/${encodeURIComponent(sneaker.id)}`} className="block aspect-square bg-neutral-100 dark:bg-neutral-800">
        <img className="h-full w-full object-contain p-5 transition group-hover:scale-105" src={sneaker.image} alt={sneaker.name} loading="lazy" />
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-accent">{sneaker.brand}</p>
            <Link to={`/product/${encodeURIComponent(sneaker.id)}`} className="mt-1 line-clamp-2 block min-h-10 text-sm font-bold hover:text-accent">
              {sneaker.name}
            </Link>
          </div>
          <button className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border ${isFavorite ? 'border-accent bg-orange-50 text-accent dark:bg-orange-950/30' : 'border-neutral-200 dark:border-neutral-800'}`} type="button" aria-label="Избранное" onClick={handleFavorite}>
            <FiHeart />
          </button>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-black">{formatPrice(sneaker.retailPrice)}</p>
          </div>
          {hasSizes ? (
            <button className="btn-primary h-10 w-10 p-0" type="button" aria-label="В корзину" onClick={handleCart}>
              <FiShoppingBag />
            </button>
          ) : (
            <span className="grid h-10 rounded-md border border-neutral-200 bg-neutral-50 px-2 text-xs font-bold text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500">
              Нет в наличии
            </span>
          )}
        </div>
      </div>
    </article>
  );
});
