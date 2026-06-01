import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { PageLayout } from '../layout/PageLayout.jsx';
import { clearCart, decreaseQuantity, increaseQuantity, removeFromCart } from '../../features/cart/cartSlice.js';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { formatPrice } from '../../shared/utils/formatters.js';

export default function CartPage() {
  const dispatch = useDispatch();
  const { items, totalItems, totalPrice } = useSelector((state) => state.cart);

  return (
    <PageLayout>
      <section className="container-page py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-accent">Корзина</p>
            <h1 className="mt-1 text-4xl font-black">{totalItems} товаров</h1>
          </div>
          {items.length > 0 && <button className="btn-secondary" type="button" onClick={() => dispatch(clearCart())}>Очистить</button>}
        </div>

        {!items.length ? (
          <EmptyState title="Корзина пустая" text="Добавьте пару из каталога, и она появится здесь." action={<Link className="btn-primary" to="/catalog">Перейти в каталог</Link>} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-3">
              {items.map((item) => (
                <article key={item.id} className="grid gap-4 rounded-md border border-neutral-200 p-4 dark:border-neutral-800 sm:grid-cols-[120px_1fr_auto]">
                  <img className="h-28 w-28 rounded-md bg-neutral-100 object-contain p-2 dark:bg-neutral-900" src={item.image} alt={item.name} />
                  <div>
                    <p className="text-xs font-bold uppercase text-accent">{item.brand}</p>
                    <Link className="mt-1 block font-bold hover:text-accent" to={`/product/${encodeURIComponent(item.id)}`}>{item.name}</Link>
                    <p className="mt-2 text-sm text-neutral-500">{formatPrice(item.retailPrice)}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:justify-between">
                    <button className="text-neutral-500 hover:text-red-600" type="button" aria-label="Удалить" onClick={() => dispatch(removeFromCart(item.id))}><FiTrash2 /></button>
                    <div className="flex items-center rounded-md border border-neutral-200 dark:border-neutral-800">
                      <button className="grid h-9 w-9 place-items-center" type="button" aria-label="Уменьшить" onClick={() => dispatch(decreaseQuantity(item.id))}><FiMinus /></button>
                      <span className="grid h-9 min-w-10 place-items-center text-sm font-bold">{item.quantity}</span>
                      <button className="grid h-9 w-9 place-items-center" type="button" aria-label="Увеличить" onClick={() => dispatch(increaseQuantity(item.id))}><FiPlus /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <aside className="h-fit rounded-md border border-neutral-200 p-5 dark:border-neutral-800">
              <h2 className="text-xl font-black">Итого</h2>
              <div className="mt-4 flex justify-between text-sm"><span>Товары</span><b>{totalItems}</b></div>
              <div className="mt-3 flex justify-between text-lg"><span>Сумма</span><b>{formatPrice(totalPrice)}</b></div>
              <button className="btn-primary mt-6 w-full" type="button">Оформить заказ</button>
            </aside>
          </div>
        )}
      </section>
    </PageLayout>
  );
}
