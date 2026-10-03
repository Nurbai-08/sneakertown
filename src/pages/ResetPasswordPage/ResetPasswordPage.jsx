import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout } from '../layout/PageLayout.jsx';
import { authApi, getApiErrorMessage } from '../../shared/services/api.js';
import { useToast } from '../../app/providers/ToastContext.js';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const token = searchParams.get('token') || '';

  const submit = async (event) => {
    event.preventDefault();
    if (!token) return setError('Ссылка восстановления некорректна');
    if (password !== confirmation) return setError('Пароли не совпадают');
    try {
      setLoading(true);
      setError('');
      await authApi.resetPassword(token, password);
      showToast('Пароль успешно обновлён');
      navigate('/login', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <section className="container-page grid min-h-[70vh] place-items-center py-10">
        <form className="w-full max-w-md rounded-md border border-neutral-200 p-6 dark:border-neutral-800" onSubmit={submit}>
          <p className="text-sm font-bold uppercase text-accent">Аккаунт</p>
          <h1 className="mt-1 text-3xl font-black">Новый пароль</h1>
          {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
          <div className="mt-6 grid gap-4">
            <input className="input-field" type="password" placeholder="Новый пароль" minLength="8" maxLength="128" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <input className="input-field" type="password" placeholder="Повторите пароль" minLength="8" maxLength="128" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Сохраняем…' : 'Сохранить пароль'}</button>
          </div>
          <Link className="mt-5 inline-block text-sm font-semibold text-accent" to="/login">Вернуться ко входу</Link>
        </form>
      </section>
    </PageLayout>
  );
}
