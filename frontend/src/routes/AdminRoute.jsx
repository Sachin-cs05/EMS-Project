import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminRoute() {
  const role = useSelector((s) => s.auth.user?.role);
  if (role === 'admin') return <Outlet />;
  if (role === 'employee') return <Navigate to="/employee" replace />;
  return <Navigate to="/login" replace />;
}
