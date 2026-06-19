import { Link } from 'react-router-dom';

export const HeroBanner = () => (
  <section className="relative overflow-hidden bg-neutral-950 text-white">
    <div className="absolute inset-0">
      <img
        className="h-full w-full object-cover opacity-55 animate-ken-burns"
        src="/img/hero-banner.jpg"
        alt="Кроссовки на городском фоне"
      />
    </div>
    <div className="container-page relative grid min-h-[560px] content-center py-16">
      <div className="max-w-2xl">
        <h1 className="animate-fade-in-up mt-4 text-5xl font-black leading-tight sm:text-6xl lg:text-7xl">SneakerTown</h1>
        <div className="animate-fade-in-up mt-8 flex flex-wrap gap-3" style={{ animationDelay: '0.2s' }}>
          <Link className="btn-primary" to="/catalog">В каталог</Link>
          <Link className="btn-secondary border-white/20 bg-white/10 text-white hover:border-white" to="/favorites">Избранное</Link>
        </div>
      </div>
    </div>
  </section>
);
