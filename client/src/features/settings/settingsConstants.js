import { MdNotifications, MdPerson, MdSecurity } from 'react-icons/md';

export const NOTIFICATION_EVENTS = [
  { key: 'TICKET_CREATED', label: 'New ticket created' },
  { key: 'TICKET_ASSIGNED', label: 'Ticket assigned' },
  { key: 'TICKET_RESOLVED', label: 'Ticket resolved' },
  { key: 'TICKET_CLOSED', label: 'Ticket closed' },
  { key: 'MAINTENANCE_SCHEDULED', label: 'Maintenance scheduled' },
  { key: 'PAYMENT_RECEIVED', label: 'Payment received' },
];

export const SETTINGS_TABS = [
  { key: 'profile', label: 'Profile', icon: MdPerson },
  { key: 'security', label: 'Security', icon: MdSecurity },
  { key: 'notifications', label: 'Notifications', icon: MdNotifications },
];
