import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiLogOut, FiUpload } from 'react-icons/fi';
import { updateProfile } from 'firebase/auth';
import { PageLayout } from '../layout/PageLayout.jsx';
import { PageLoader } from '../../shared/ui/PageLoader.jsx';
import { logoutUser, setUser } from '../../shared/services/authSlice.js';
import { auth } from '../../shared/services/firebase.js';
import { userDataService } from '../../shared/services/userDataService.js';
import { mapFirebaseUser } from '../../entities/user/model.js';
import { useToast } from '../../app/providers/ToastProvider.jsx';
import { formatDate } from '../../shared/utils/formatters.js';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { user, authReady } = useSelector((state) => state.auth);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName || '');
  }, [user?.displayName]);

  if (!authReady) {
    return (
      <PageLayout>
        <PageLoader />
      </PageLayout>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const saveName = async () => {
    if (!auth?.currentUser) return showToast('Firebase не настроен');
    try {
      // 1. Обновляем профиль в Firebase Auth
      await updateProfile(auth.currentUser, { displayName });
      await auth.currentUser.reload();
      await userDataService.upsertUser(auth.currentUser);
      dispatch(setUser(mapFirebaseUser(auth.currentUser)));
      showToast('Имя обновлено');
    } catch (error) {
      showToast('Ошибка при обновлении имени');
      console.error(error);
    }
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !auth?.currentUser) return;
    setUploading(true);
    try {
      const photoURL = await userDataService.uploadAvatar(user.uid, file);
      await updateProfile(auth.currentUser, { photoURL });
      await userDataService.upsertUser(auth.currentUser);
      dispatch(setUser(mapFirebaseUser(auth.currentUser)));
      showToast('Аватар обновлен');
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageLayout>
      <section className="container-page py-10">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase text-accent">Профиль</p>
          <h1 className="mt-1 text-4xl font-black">Личный кабинет</h1>
          {user.displayName ? (
            <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-300">
              Здравствуйте, <span className="font-bold text-neutral-950 dark:text-white">{user.displayName}</span>
            </p>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-md border border-neutral-200 p-6 text-center dark:border-neutral-800">
            <img
              className="mx-auto h-32 w-32 rounded-full bg-neutral-100 object-cover dark:bg-neutral-900"
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=f97316&color=fff`}
              alt={user.displayName || user.email}
            />
            <h2 className="mt-4 text-xl font-black">{user.displayName || 'Покупатель'}</h2>
            <p className="mt-1 text-sm text-neutral-500">{user.email}</p>
            <label className="btn-secondary mt-5 w-full cursor-pointer">
              <FiUpload /> {uploading ? 'Загрузка...' : 'Загрузить аватар'}
              <input className="sr-only" type="file" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
            </label>
          </aside>

          <div className="rounded-md border border-neutral-200 p-6 dark:border-neutral-800">
            <h2 className="text-xl font-black">Данные пользователя</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold">
                Имя
                <input className="input-field" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Email
                <input className="input-field" value={user.email || ''} disabled />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Дата регистрации
                <input className="input-field" value={formatDate(user.createdAt)} disabled />
              </label>
              <div className="flex flex-wrap gap-3">
                <button className="btn-primary" type="button" onClick={saveName}>Сохранить</button>
                <button className="btn-secondary" type="button" onClick={() => dispatch(logoutUser())}><FiLogOut /> Выйти</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
