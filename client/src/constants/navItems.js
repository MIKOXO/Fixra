import {
  MdDashboard,
  MdApartment,
  MdConfirmationNumber,
  MdEngineering,
  MdBarChart,
  MdSettings,
  MdPostAdd,
  MdHomeWork,
  MdPayment,
  MdChat,
  MdPerson,
  MdBuild,
  MdAssignment,
  MdSchedule,
  MdAdminPanelSettings,
  MdPeople,
  MdSupervisorAccount,
  MdInsights,
  MdSecurity,
} from 'react-icons/md';

export const landlordNav = [
  { label: 'Dashboard', path: '/landlord', icon: MdDashboard },
  { label: 'Properties', path: '/landlord/properties', icon: MdApartment },
  { label: 'Tickets', path: '/landlord/tickets', icon: MdConfirmationNumber },
  { label: 'Contractors', path: '/landlord/contractors', icon: MdEngineering },
  { label: 'Analytics', path: '/landlord/analytics', icon: MdBarChart },
  { label: 'Settings', path: '/landlord/settings', icon: MdSettings },
];

export const tenantNav = [
  { label: 'Dashboard', path: '/tenant', icon: MdDashboard },
  { label: 'Submit Request', path: '/tenant/submit-ticket', icon: MdPostAdd },
  { label: 'My Tickets', path: '/tenant/tickets', icon: MdConfirmationNumber },
  { label: 'Settings', path: '/tenant/settings', icon: MdSettings },
];

export const contractorNav = [
  { label: 'Dashboard', path: '/contractor', icon: MdDashboard },
  { label: 'Jobs', path: '/contractor/jobs', icon: MdBuild },
  { label: 'Technicians', path: '/contractor/technicians', icon: MdPeople },
  { label: 'Profile', path: '/contractor/profile', icon: MdPerson },
  { label: 'Analytics', path: '/contractor/analytics', icon: MdBarChart },
  { label: 'Settings', path: '/contractor/settings', icon: MdSettings },
];

export const technicianNav = [
  { label: 'Dashboard', path: '/technician', icon: MdDashboard },
  { label: 'Assignments', path: '/technician/assignments', icon: MdAssignment },
  { label: 'Schedule', path: '/technician/schedule', icon: MdSchedule },
  { label: 'Profile', path: '/technician/profile', icon: MdPerson },
  { label: 'Settings', path: '/technician/settings', icon: MdSettings },
];

export const adminNav = [
  { label: 'Dashboard', path: '/admin', icon: MdDashboard },
  { label: 'Users', path: '/admin/users', icon: MdSupervisorAccount },
  { label: 'Properties', path: '/admin/properties', icon: MdApartment },
  { label: 'Tickets', path: '/admin/tickets', icon: MdConfirmationNumber },
  { label: 'Insights', path: '/admin/insights', icon: MdInsights },
  { label: 'Roles', path: '/admin/roles', icon: MdAdminPanelSettings },
  { label: 'Security', path: '/admin/security', icon: MdSecurity },
  { label: 'Settings', path: '/admin/settings', icon: MdSettings },
];
