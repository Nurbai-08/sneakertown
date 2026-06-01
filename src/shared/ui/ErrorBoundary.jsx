import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="container-page flex min-h-screen items-center justify-center">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">Ошибка</p>
            <h1 className="mt-3 text-3xl font-black">Что-то пошло не так</h1>
            <button className="btn-primary mt-6" type="button" onClick={() => window.location.reload()}>
              Перезагрузить
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
