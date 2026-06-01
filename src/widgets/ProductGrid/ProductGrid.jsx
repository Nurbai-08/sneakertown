import { ProductCard } from './ProductCard.jsx';
import { ProductSkeleton } from '../../shared/ui/Skeleton.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';

export const ProductGrid = ({ items, loading, emptyText = 'Попробуйте изменить поиск или фильтры.' }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!items?.length) {
    return <EmptyState title="Товары не найдены" text={emptyText} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((sneaker) => (
        <ProductCard key={sneaker.id} sneaker={sneaker} />
      ))}
    </div>
  );
};
