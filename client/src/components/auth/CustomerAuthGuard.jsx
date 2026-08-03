import { Navigate, useLocation, Outlet } from 'react-router-dom';
import useCustomerAuthStore from '../../store/customerAuthStore';

const CustomerAuthGuard = ({ children }) => {
  const { isAuthenticated } = useCustomerAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default CustomerAuthGuard;
