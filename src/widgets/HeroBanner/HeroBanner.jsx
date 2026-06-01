import { Link } from 'react-router-dom';

export const HeroBanner = () => (
  <section className="relative overflow-hidden bg-neutral-950 text-white">
    <div className="absolute inset-0">
      <img
        className="h-full w-full object-cover opacity-55"
        src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1800&q=85"
        alt="Кроссовки на городском фоне"
      />
    </div>
    <div className="container-page relative grid min-h-[560px] content-center py-16">
      <div className="max-w-2xl">
        <h1 className="mt-4 text-5xl font-black leading-tight sm:text-6xl lg:text-7xl">SneakerTown</h1>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="btn-primary" to="/catalog">В каталог</Link>
          <Link className="btn-secondary border-white/20 bg-white/10 text-white hover:border-white" to="/favorites">Избранное</Link>
        </div>
      </div>
    </div>
  </section>
);
