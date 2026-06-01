import { useCallback, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiMenu, FiMoon, FiSearch, FiShoppingBag, FiSun, FiUser, FiX } from 'react-icons/fi';
import { SearchBar } from '../../features/search/SearchBar.jsx';
import { setSearch } from '../../features/sneakers/sneakersSlice.js';
import { useTheme } from '../../app/providers/ThemeProvider.jsx';

const navItems = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/favorites', label: 'Избранное' },
  { to: '/cart', label: 'Корзина' },
];

const linkClass = ({ isActive }) =>
  `text-sm font-semibold transition ${isActive ? 'text-accent' : 'text-neutral-600 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white'}`;

export const Header = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const totalItems = useSelector((state) => state.cart.totalItems);
  const favoritesCount = useSelector((state) => state.favorites.favorites.length);
  const user = useSelector((state) => state.auth.user);

  const handleSearch = useCallback(
    (query) => {
      dispatch(setSearch(query));
      if (query) navigate('/catalog');
    },
    [dispatch, navigate],
  );

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="container-page flex h-16 items-center gap-4">
        <NavLink to="/" className="text-xl font-black tracking-normal">
          Sneaker<span className="text-accent">Town</span>
        </NavLink>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden w-full max-w-sm md:block">
          <SearchBar onChange={handleSearch} placeholder="Найти модель или бренд" />
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button className="btn-secondary h-10 w-10 p-0" type="button" aria-label="Поиск" onClick={() => navigate('/catalog')}>
            <FiSearch />
          </button>
          <button className="btn-secondary h-10 w-10 p-0" type="button" aria-label="Тема" onClick={toggleTheme}>
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>
          <NavLink className="btn-secondary relative h-10 w-10 p-0" to="/favorites" aria-label="Избранное">
            <FiHeart />
            {favoritesCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-xs text-white">{favoritesCount}</span>}
          </NavLink>
          <NavLink className="btn-secondary relative h-10 w-10 p-0" to="/cart" aria-label="Корзина">
            <FiShoppingBag />
            {totalItems > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-xs text-white">{totalItems}</span>}
          </NavLink>
          <NavLink
            className={user?.displayName ? 'btn-secondary hidden h-10 max-w-[140px] items-center gap-2 px-3 sm:inline-flex' : 'btn-secondary h-10 w-10 p-0'}
            to={user ? '/profile' : '/login'}
            aria-label="Профиль"
          >
            <FiUser />
            {user?.displayName ? <span className="truncate text-sm font-semibold">{user.displayName}</span> : null}
          </NavLink>
          <button className="btn-secondary h-10 w-10 p-0 lg:hidden" type="button" aria-label="Меню" onClick={() => setOpen((value) => !value)}>
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 lg:hidden">
          <div className="container-page flex flex-col gap-4 px-0">
            <SearchBar onChange={handleSearch} />
            <nav className="grid gap-3">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setOpen(false)}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
