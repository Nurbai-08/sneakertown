import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiLogOut, FiUpload } from "react-icons/fi";
import { PageLayout } from "../layout/PageLayout.jsx";
import { PageLoader } from "../../shared/ui/PageLoader.jsx";
import { logoutUser, setUser } from "../../shared/services/authSlice.js";
import { userDataService } from "../../shared/services/userDataService.js";
import { useToast } from "../../app/providers/ToastContext.js";
import { formatDate } from "../../shared/utils/formatters.js";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { user, authReady } = useSelector((state) => state.auth);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    setDisplayName(user?.displayName || "");
  }, [user?.displayName]);

  if (!authReady) {
    return (
      <PageLayout>
        <PageLoader />
      </PageLayout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const saveName = async () => {
    const nextName = displayName.trim();
    if (!nextName) {
      showToast("Введите имя");
      return;
    }

    try {
      setSavingName(true);
      const updatedUser = await userDataService.updateProfile(nextName);
      dispatch(setUser(updatedUser));
      setDisplayName(nextName);

      showToast("Имя обновлено");
    } catch (error) {
      showToast(error.message || "Ошибка при обновлении имени");
    } finally {
      setSavingName(false);
    }
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const updatedUser = await userDataService.uploadAvatar(user.uid, file);
      dispatch(setUser(updatedUser));
      showToast("Фото обновлено");
    } catch (error) {
      showToast(error.message || "Ошибка при загрузке фото");
    } finally {
      setUploadingAvatar(false);
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
              Здравствуйте,{" "}
              <span className="font-bold text-neutral-950 dark:text-white">
                {user.displayName}
              </span>
            </p>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-md border border-neutral-200 px-6 pb-6 pt-[5.25rem] text-center dark:border-neutral-800">
            {user.photoURL ? (
              <img className="mx-auto h-32 w-32 rounded-full bg-neutral-100 object-cover dark:bg-neutral-900" src={user.photoURL} alt={user.displayName || user.email} />
            ) : (
              <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-4xl font-black text-white">
                {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <h2 className="mt-4 text-xl font-black">
              {user.displayName || "Покупатель"}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">{user.email}</p>
            <input
              ref={avatarInputRef}
              className="hidden"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
              onChange={uploadAvatar}
            />
            <button
              className="btn-secondary mx-auto mt-4"
              type="button"
              disabled={uploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
            >
              <FiUpload /> {uploadingAvatar ? "Загружаем..." : "Обновить фото"}
            </button>
          </aside>

          <div className="rounded-md border border-neutral-200 p-6 dark:border-neutral-800">
            <h2 className="text-xl font-black">Данные пользователя</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold">
                Имя
                <input
                  className="input-field"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  maxLength={50}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Email
                <input
                  className="input-field"
                  value={user.email || ""}
                  disabled
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Дата регистрации
                <input
                  className="input-field"
                  value={formatDate(user.createdAt)}
                  disabled
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  className="btn-primary"
                  type="button"
                  disabled={savingName}
                  onClick={saveName}
                >
                  {savingName ? "Сохраняем..." : "Сохранить"}
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => dispatch(logoutUser())}
                >
                  <FiLogOut /> Выйти
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
