import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light/10 to-background">
      <Outlet />
    </div>
  );
};

export default AuthLayout;