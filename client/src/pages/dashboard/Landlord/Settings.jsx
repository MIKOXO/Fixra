import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { MdDeleteForever, MdNotifications, MdPerson, MdSecurity } from 'react-icons/md';
import Button from '@components/ui/Button';
import DeleteConfirmModal from '@components/ui/DeleteConfirmModal';
import { updateProfile } from '@services/user.api';
import { changePassword, deleteAccount, fetchCurrentUser } from '@store/slices/authSlice';
import { getUserFriendlyError } from '@utils/notificationUtils';

const NOTIFICATION_EVENTS = [
  { key: 'TICKET_CREATED', label: 'New ticket created' },
  { key: 'TICKET_ASSIGNED', label: 'Ticket assigned' },
  { key: 'TICKET_RESOLVED', label: 'Ticket resolved' },
  { key: 'TICKET_CLOSED', label: 'Ticket closed' },
  { key: 'MAINTENANCE_SCHEDULED', label: 'Maintenance scheduled' },
  { key: 'PAYMENT_RECEIVED', label: 'Payment received' },
];

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  phone: z
    .string()
    .regex(/^\+251\d{9}$/, 'Phone must be a valid Ethiopian number (e.g. +251911234567)')
    .optional()
    .or(z.literal('')),
  companyName: z.string().trim().max(200).optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128)
      .refine((val) => /[A-Z]/.test(val), 'Must contain an uppercase letter')
      .refine((val) => /[a-z]/.test(val), 'Must contain a lowercase letter')
      .refine((val) => /[0-9]/.test(val), 'Must contain a number')
      .refine((val) => /[^A-Za-z0-9]/.test(val), 'Must contain a special character'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from your current password',
    path: ['newPassword'],
  });

const inputClass =
  'w-full rounded-xl border border-charcoal-200/90 bg-white px-3.5 py-2.5 font-body text-sm text-charcoal-700 outline-none transition duration-200 placeholder:text-charcoal-400 focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const labelClass = 'mb-1.5 block font-body text-xs font-semibold uppercase tracking-[0.06em] text-charcoal-500';

const TABS = [
  { key: 'profile', label: 'Profile', icon: MdPerson },
  { key: 'security', label: 'Security', icon: MdSecurity },
  { key: 'notifications', label: 'Notifications', icon: MdNotifications },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? 'bg-primary-500' : 'bg-charcoal-300'
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function NotificationRow({ event, email, push, onEmailChange, onPushChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-charcoal-50/60 px-4 py-3">
      <p className="font-body text-sm font-medium text-charcoal-800">{event.label}</p>
      <div className="flex items-center gap-5">
        <label className="flex cursor-pointer items-center gap-2">
          <Toggle checked={email} onChange={onEmailChange} />
          <span className="font-body text-xs text-charcoal-500">Email</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <Toggle checked={push} onChange={onPushChange} />
          <span className="font-body text-xs text-charcoal-500">Push</span>
        </label>
      </div>
    </div>
  );
}

function NotificationBanner({ notification, onDismiss }) {
  if (!notification) return null;
  return (
    <div
      className={`rounded-xl border px-4 py-2.5 text-xs flex items-center justify-between gap-3 ${
        notification.type === 'error'
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-sage-200 bg-sage-50 text-sage-700'
      }`}
    >
      <span>{notification.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-2xl leading-none opacity-60 hover:opacity-100 transition-opacity"
      >
        &times;
      </button>
    </div>
  );
}

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState(() => user?.profile?.notificationPreferences ?? {});
  const debounceRef = useRef(null);
  const [notif, setNotif] = useState(null);
  const notifTimerRef = useRef(null);

  const dismissNotif = useCallback(() => {
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    setNotif(null);
  }, []);

  const showBanner = useCallback((type, message) => {
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    setNotif({ type, message });
    notifTimerRef.current = setTimeout(() => setNotif(null), type === 'error' ? 7000 : 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      companyName: user?.profile?.companyName ?? '',
    },
  });

  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    formState: { errors: errorsPw },
    reset: resetPw,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const saveNotifPrefs = useCallback(
    (prefs) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          await updateProfile({ profile: { ...user?.profile, notificationPreferences: prefs } });
          dispatch(fetchCurrentUser());
          showBanner('success', 'Notification preferences saved');
        } catch {
          showBanner('error', 'Failed to save notification preferences');
        }
      }, 300);
    },
    [dispatch, user, showBanner],
  );

  const handleToggle = (eventKey, channel, value) => {
    setNotifPrefs((prev) => {
      const updated = {
        ...prev,
        [eventKey]: {
          email: prev[eventKey]?.email ?? true,
          push: prev[eventKey]?.push ?? true,
          [channel]: value,
        },
      };
      saveNotifPrefs(updated);
      return updated;
    });
  };

  const onSubmitProfile = async (data) => {
    setProfileSubmitting(true);
    try {
      const payload = { name: data.name };
      if (data.phone) payload.phone = data.phone;
      payload.profile = {};
      if (data.companyName) payload.profile.companyName = data.companyName;

      await updateProfile(payload);
      await dispatch(fetchCurrentUser()).unwrap();
      showBanner('success', 'Profile updated');
    } catch (err) {
      const msg = getUserFriendlyError(err?.response?.data?.message) || 'Failed to update profile';
      showBanner('error', msg);
    } finally {
      setProfileSubmitting(false);
    }
  };

  const onSubmitPassword = async (data) => {
    setPasswordLoading(true);
    try {
      await dispatch(changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })).unwrap();
      showBanner('success', 'Password changed');
      resetPw();
    } catch (err) {
      const msg = getUserFriendlyError(err?.response?.data?.message) || getUserFriendlyError(err) || 'Failed to change password';
      showBanner('error', msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteAccount()).unwrap();
    } catch (err) {
      const msg = getUserFriendlyError(err?.response?.data?.message) || 'Failed to delete account';
      showBanner('error', msg);
    }
  };

  const notifPrefsForEvent = (key) => ({
    email: notifPrefs[key]?.email ?? true,
    push: notifPrefs[key]?.push ?? true,
  });

  return (
    <div className="px-6 py-8">
      <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">Landlord</p>
      <h1 className="mt-1 font-heading text-3xl font-bold text-charcoal-950">Settings</h1>

      <div className="mt-6 flex gap-1 rounded-xl bg-charcoal-50/70 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-heading text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white text-charcoal-950 shadow-sm'
                  : 'text-charcoal-500 hover:text-charcoal-800'
              }`}
            >
              <Icon className="text-base" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit(onSubmitProfile)} className="mt-6 max-w-lg space-y-5">
              <div>
                <label className={labelClass}>Name</label>
                <input className={inputClass} {...register('name')} />
                {errors.name && <p className="mt-1 font-body text-xs text-primary-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input className={inputClass} placeholder="+251911234567" {...register('phone')} />
                {errors.phone && <p className="mt-1 font-body text-xs text-primary-500">{errors.phone.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Company Name</label>
                <input className={inputClass} {...register('companyName')} />
              </div>
              <NotificationBanner notification={notif} onDismiss={dismissNotif} />
              <Button type="submit" loading={profileSubmitting} className="!w-auto">
                Save Changes
              </Button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleSubmitPw(onSubmitPassword)} className="mt-6 max-w-lg space-y-5">
              <div>
                <label className={labelClass}>Current Password</label>
                <input type="password" className={inputClass} {...registerPw('currentPassword')} />
                {errorsPw.currentPassword && (
                  <p className="mt-1 font-body text-xs text-primary-500">{errorsPw.currentPassword.message}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>New Password</label>
                <input type="password" className={inputClass} {...registerPw('newPassword')} />
                {errorsPw.newPassword && (
                  <p className="mt-1 font-body text-xs text-primary-500">{errorsPw.newPassword.message}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Confirm New Password</label>
                <input type="password" className={inputClass} {...registerPw('confirmNewPassword')} />
                {errorsPw.confirmNewPassword && (
                  <p className="mt-1 font-body text-xs text-primary-500">{errorsPw.confirmNewPassword.message}</p>
                )}
              </div>
              <NotificationBanner notification={notif} onDismiss={dismissNotif} />
              <Button type="submit" loading={passwordLoading} className="!w-auto">
                Change Password
              </Button>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="mt-6 max-w-lg space-y-3">
              <NotificationBanner notification={notif} onDismiss={dismissNotif} />
              {NOTIFICATION_EVENTS.map((event) => {
                const prefs = notifPrefsForEvent(event.key);
                return (
                  <NotificationRow
                    key={event.key}
                    event={event}
                    email={prefs.email}
                    push={prefs.push}
                    onEmailChange={(val) => handleToggle(event.key, 'email', val)}
                    onPushChange={(val) => handleToggle(event.key, 'push', val)}
                  />
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <hr className="my-10 border-charcoal-200" />

      <div className="max-w-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
            <MdDeleteForever className="text-base text-primary-500" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-charcoal-950">Danger Zone</h3>
            <p className="mt-0.5 font-body text-xs text-charcoal-500">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDeleteOpen(true)}
          className="mt-4 rounded-xl border border-primary-200 bg-primary-50 px-5 py-2.5 font-heading text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-100"
        >
          Delete Account
        </button>
      </div>

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? All your data will be removed and you will be logged out immediately."
      />
    </div>
  );
};

export default Settings;