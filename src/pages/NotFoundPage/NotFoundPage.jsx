import { Link } from 'react-router-dom';
import { PageLayout } from '../layout/PageLayout.jsx';

export default function NotFoundPage() {
  return (
    <PageLayout>
      <section className="container-page grid min-h-[70vh] place-items-center py-10 text-center">
        <div>
          <p className="text-sm font-bold uppercase text-accent">404</p>
          <h1 className="mt-2 text-5xl font-black">Страница не найдена</h1>
          <p className="mx-auto mt-4 max-w-md text-neutral-500 dark:text-neutral-400">Такого маршрута нет, но каталог всегда рядом.</p>
          <Link className="btn-primary mt-7" to="/catalog">Открыть каталог</Link>
        </div>
      </section>
    </PageLayout>
  );
}
