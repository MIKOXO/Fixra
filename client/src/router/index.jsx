import { useEffect } from 'react';
import {
  createBrowserRouter,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { setOnAuthExpired } from '@services/api';
import Landing from '@pages/public/Landing';
import Login from '@pages/auth/Login';
import Register from '@pages/auth/Register';
import InviteRegister from '@pages/auth/InviteRegister';
import VerifyEmail from '@pages/auth/VerifyEmail';
import ForgotPassword from '@pages/auth/ForgotPassword';
import VerifyResetCode from '@pages/auth/VerifyResetCode';
import ResetPassword from '@pages/auth/ResetPassword';
import OAuthCallback from '@pages/auth/OAuthCallback';
import DashboardLayout from '@components/layout/DashboardLayout';
import LandlordHome from '@pages/dashboard/Landlord/Home';
import LandlordProperties from '@pages/dashboard/Landlord/Properties';
import LandlordTickets from '@pages/dashboard/Landlord/Tickets';
import LandlordContractors from '@pages/dashboard/Landlord/Contractors';
import LandlordAnalytics from '@pages/dashboard/Landlord/Analytics';
import LandlordSettings from '@pages/dashboard/Landlord/Settings';
import TenantHome from '@pages/dashboard/Tenant/Home';
import TenantSubmitTicket from '@pages/dashboard/Tenant/SubmitTicket';
import TenantTickets from '@pages/dashboard/Tenant/Tickets';
import TenantSettings from '@pages/dashboard/Tenant/Settings';
import TechnicianDashboard from '@pages/dashboard/Technician/Home';
import ContractorHome from '@pages/dashboard/Contractor/Home';
import ContractorJobs from '@pages/dashboard/Contractor/Jobs';
import ContractorTechnicians from '@pages/dashboard/Contractor/Technicians';
import ContractorProfile from '@pages/dashboard/Contractor/Profile';
import ContractorAnalytics from '@pages/dashboard/Contractor/Analytics';
import ContractorSettings from '@pages/dashboard/Contractor/Settings';
import SuperAdminDashboard from '@pages/dashboard/SuperAdmin/Home';
import { landlordNav, tenantNav, contractorNav } from '@constants/navItems';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';

const RootLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setOnAuthExpired(() => {
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    });
  }, [location.pathname, navigate]);

  return <Outlet />;
};

const NotFound = () => (
  <div className='flex min-h-screen items-center justify-center bg-surface-warm px-6 text-center'>
    <div className='max-w-lg'>
      <p className='font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500'>
        404
      </p>
      <h1 className='mt-4 font-heading text-4xl font-bold text-charcoal-950'>
        Page not found
      </h1>
      <p className='mt-3 text-charcoal-600'>
        The page you are looking for does not exist.
      </p>
      <Link
        to='/'
        className='mt-8 inline-flex items-center justify-center rounded-full bg-primary-500 px-6 py-3 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600'>
        Return home
      </Link>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Landing />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/register/invite',
        element: <InviteRegister />,
      },
      {
        path: '/auth/callback',
        element: <OAuthCallback />,
      },
      {
        path: '/verify-email',
        element: <VerifyEmail />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: '/verify-reset-code',
        element: <VerifyResetCode />,
      },
      {
        path: '/reset-password',
        element: <ResetPassword />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/landlord',
            element: (
              <RoleGuard requiredRole='LANDLORD'>
                <DashboardLayout navItems={landlordNav} role='Landlord' />
              </RoleGuard>
            ),
            children: [
              { index: true, element: <LandlordHome /> },
              { path: 'properties', element: <LandlordProperties /> },
              { path: 'tickets', element: <LandlordTickets /> },
              { path: 'contractors', element: <LandlordContractors /> },
              { path: 'analytics', element: <LandlordAnalytics /> },
              { path: 'settings', element: <LandlordSettings /> },
            ],
          },
          {
            path: '/tenant',
            element: (
              <RoleGuard requiredRole='TENANT'>
                <DashboardLayout navItems={tenantNav} role='Tenant' />
              </RoleGuard>
            ),
            children: [
              { index: true, element: <TenantHome /> },
              { path: 'submit-ticket', element: <TenantSubmitTicket /> },
              { path: 'tickets', element: <TenantTickets /> },
              { path: 'settings', element: <TenantSettings /> },
            ],
          },
          {
            path: '/technician',
            element: (
              <RoleGuard requiredRole='TECHNICIAN'>
                <TechnicianDashboard />
              </RoleGuard>
            ),
          },
          {
            path: '/contractor',
            element: (
              <RoleGuard requiredRole='CONTRACTOR'>
                <DashboardLayout navItems={contractorNav} role='Contractor' />
              </RoleGuard>
            ),
            children: [
              { index: true, element: <ContractorHome /> },
              { path: 'jobs', element: <ContractorJobs /> },
              { path: 'technicians', element: <ContractorTechnicians /> },
              { path: 'profile', element: <ContractorProfile /> },
              { path: 'analytics', element: <ContractorAnalytics /> },
              { path: 'settings', element: <ContractorSettings /> },
            ],
          },
          {
            path: '/admin',
            element: (
              <RoleGuard requiredRole='SUPER_ADMIN'>
                <SuperAdminDashboard />
              </RoleGuard>
            ),
          },
        ],
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export { router };
