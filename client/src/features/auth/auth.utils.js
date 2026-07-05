const dashboardRouteMap = {
  LANDLORD: '/landlord',
  TENANT: '/tenant',
  TECHNICIAN: '/technician',
  CONTRACTOR: '/contractor',
  SUPER_ADMIN: '/admin',
};

const getDashboardPathForRole = (role) => dashboardRouteMap[role] || '/';

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
