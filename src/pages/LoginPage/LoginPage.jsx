import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiMail } from 'react-icons/fi';
import { PageLayout } from '../layout/PageLayout.jsx';
import { loginUser, loginWithGoogle, resetPassword } from '../../shared/services/authSlice.js';
import { useToast } from '../../app/providers/ToastProvider.jsx';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { loading, error, user, authReady } = useSelector((state) => state.auth);

  if (authReady && user) return <Navigate to="/profile" replace />;

  const submit = async (event) => {
    event.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) navigate('/profile', { replace: true });
  };

  const recover = async () => {
    if (!form.email) return showToast('Введите email для восстановления');
    const result = await dispatch(resetPassword(form.email));
    if (!result.error) showToast('Письмо для восстановления отправлено');
  };

  return (
    <PageLayout>
      <section className="container-page grid min-h-[70vh] place-items-center py-10">
        <form className="w-full max-w-md rounded-md border border-neutral-200 p-6 dark:border-neutral-800" onSubmit={submit}>
          <p className="text-sm font-bold uppercase text-accent">Аккаунт</p>
          <h1 className="mt-1 text-3xl font-black">Вход</h1>
          {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
          <div className="mt-6 grid gap-4">
            <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            <input className="input-field" type="password" placeholder="Пароль" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            <button className="btn-primary" type="submit" disabled={loading}>Войти</button>
            <button
              className="btn-secondary"
              type="button"
              disabled={loading}
              onClick={async () => {
                const result = await dispatch(loginWithGoogle());
                if (loginWithGoogle.fulfilled.match(result)) navigate('/profile', { replace: true });
              }}
            >
              <FiMail /> Войти через Google
            </button>
          </div>
          <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm">
            <button className="font-semibold text-accent" type="button" onClick={recover}>Забыли пароль?</button>
            <Link className="font-semibold text-accent" to="/register">Создать аккаунт</Link>
          </div>
        </form>
      </section>
    </PageLayout>
  );
}
