import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function EmployeeRoute() {
  const role = useSelector((state) => state.auth.user?.role);

  if (role === 'employee') return <Outlet />;
  if (role === 'admin') return <Navigate to="/admin" replace />;

  return <Navigate to="/login" replace />;
}
