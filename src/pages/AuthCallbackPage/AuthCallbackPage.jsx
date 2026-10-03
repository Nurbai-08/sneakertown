import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../layout/PageLayout.jsx';
import { PageLoader } from '../../shared/ui/PageLoader.jsx';
import { restoreSession, setAuthError } from '../../shared/services/authSlice.js';

export default function AuthCallbackPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      const result = await dispatch(restoreSession());
      if (restoreSession.fulfilled.match(result) && result.payload) {
        navigate('/profile', { replace: true });
      } else {
        dispatch(setAuthError('Не удалось завершить вход через Google'));
        navigate('/login', { replace: true });
      }
    })();
  }, [dispatch, navigate]);

  return <PageLayout><PageLoader /></PageLayout>;
}
