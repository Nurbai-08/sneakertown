import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { PageLayout } from "../layout/PageLayout.jsx";
import { registerUser } from "../../shared/services/authSlice.js";

export default function RegisterPage() {
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user, authReady } = useSelector((state) => state.auth);

  if (authReady && user) return <Navigate to="/profile" replace />;

  const submit = async (event) => {
    event.preventDefault();
    try {
      await dispatch(registerUser(form)).unwrap();
      navigate("/profile", { replace: true });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <PageLayout>
      <section className="container-page grid min-h-[70vh] place-items-center py-10">
        <form
          className="w-full max-w-md rounded-md border border-neutral-200 p-6 dark:border-neutral-800"
          onSubmit={submit}
        >
          <p className="text-sm font-bold uppercase text-accent">
            Новый профиль
          </p>
          <h1 className="mt-1 text-3xl font-black">Регистрация</h1>
          {error && (
            <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </p>
          )}
          <div className="mt-6 grid gap-4 text-center">
            <input
              className="input-field"
              placeholder="Имя"
              value={form.displayName}
              onChange={(event) =>
                setForm({ ...form, displayName: event.target.value })
              }
              required
            />
            <input
              className="input-field"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              required
            />
            <input
              className="input-field"
              type="password"
              placeholder="Пароль"
              minLength="6"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              required
            />
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Создаём аккаунт…" : "Зарегистрироваться"}
            </button>
          </div>
          <p className="mt-5 text-sm text-neutral-500">
            Уже есть аккаунт?{" "}
            <Link className="font-semibold text-accent" to="/login">
              Войти
            </Link>
          </p>
        </form>
      </section>
    </PageLayout>
  );
}
