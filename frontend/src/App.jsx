import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AppRouter from './routes/AppRouter';
import Toast from './components/common/Toast';
import { getMeThunk } from './features/auth/authSlice';

export default function App() {
  const dispatch = useDispatch();
  const token    = useSelector((s) => s.auth.token);

  useEffect(() => {
    if (token) {
      dispatch(getMeThunk());
    }
  }, [dispatch, token]);

  return (
    <BrowserRouter>
      <AppRouter />
      <Toast />
    </BrowserRouter>
  );
}
