import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './app/store/store.js';
import { AppRouter } from './app/router/AppRouter.jsx';
import { AuthProvider } from './app/providers/AuthProvider.jsx';
import { ThemeProvider } from './app/providers/ThemeProvider.jsx';
import { ToastProvider } from './app/providers/ToastProvider.jsx';
import { ScrollToTop } from './shared/ui/ScrollToTop.jsx';
import { ErrorBoundary } from './shared/ui/ErrorBoundary.jsx';
import { PageLoader } from './shared/ui/PageLoader.jsx';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <ErrorBoundary>
              <AuthProvider>
                <ScrollToTop />
                <Suspense fallback={<PageLoader />}>
                  <AppRouter />
                </Suspense>
              </AuthProvider>
            </ErrorBoundary>
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
