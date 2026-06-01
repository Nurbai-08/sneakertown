import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const HomePage = lazy(() => import('../../pages/HomePage/HomePage.jsx'));
const CatalogPage = lazy(() => import('../../pages/CatalogPage/CatalogPage.jsx'));
const ProductPage = lazy(() => import('../../pages/ProductPage/ProductPage.jsx'));
const CartPage = lazy(() => import('../../pages/CartPage/CartPage.jsx'));
const FavoritesPage = lazy(() => import('../../pages/FavoritesPage/FavoritesPage.jsx'));
const ProfilePage = lazy(() => import('../../pages/ProfilePage/ProfilePage.jsx'));
const LoginPage = lazy(() => import('../../pages/LoginPage/LoginPage.jsx'));
const RegisterPage = lazy(() => import('../../pages/RegisterPage/RegisterPage.jsx'));
const NotFoundPage = lazy(() => import('../../pages/NotFoundPage/NotFoundPage.jsx'));

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/catalog" element={<CatalogPage />} />
    <Route path="/product/:id" element={<ProductPage />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/favorites" element={<FavoritesPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
