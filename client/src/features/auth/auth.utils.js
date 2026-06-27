const dashboardRouteMap = {
  LANDLORD: '/app/landlord',
  TENANT: '/app/tenant',
  TECHNICIAN: '/app/technician',
  CONTRACTOR: '/app/contractor',
  SUPER_ADMIN: '/app/admin',
};

const getDashboardPathForRole = (role) => dashboardRouteMap[role] || '/app';

const getRoleLabel = (role) => {
  if (!role) {
    return 'Member';
  }

  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export { getDashboardPathForRole, getRoleLabel };
