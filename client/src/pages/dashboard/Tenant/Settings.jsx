import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { MdNotifications, MdPerson, MdSecurity } from 'react-icons/md';
import Button from '@components/ui/Button';
import { updateProfile } from '@services/user.api';
import { changePassword, fetchCurrentUser } from '@store/slices/authSlice';
import { getUserFriendlyError } from '@utils/notificationUtils';
import { NOTIFICATION_EVENTS, SETTINGS_TABS } from '@features/settings/settingsConstants';
import { passwordSchema } from '@features/settings/settingsSchemas';
import { NotificationBanner, NotificationRow, SettingsCard, SettingsTabBar } from '@features/settings/SettingsComponents';

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  phone: z
    .string()
    .regex(/^\+251\d{9}$/, 'Phone must be a valid Ethiopian number (e.g. +251911234567)')
    .optional()
    .or(z.literal('')),
});

const inputClass =
  'w-full rounded-xl border border-charcoal-200/90 bg-white px-3.5 py-2.5 font-body text-sm text-charcoal-700 outline-none transition duration-200 placeholder:text-charcoal-400 focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const labelClass = 'mb-1.5 block font-body text-xs font-semibold uppercase tracking-[0.06em] text-charcoal-500';

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordLoading, setPasswordLoading] = useState(false);
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

  const notifPrefsForEvent = (key) => ({
    email: notifPrefs[key]?.email ?? true,
    push: notifPrefs[key]?.push ?? true,
  });

  return (
    <div className="px-6 py-8">
      <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">Tenant</p>
      <h1 className="mt-1 font-heading text-3xl font-bold text-charcoal-950">Settings</h1>

      <SettingsTabBar tabs={SETTINGS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'profile' && (
            <SettingsCard
              icon={MdPerson}
              title="Profile"
              description="Manage your personal information"
              iconBg="bg-primary-50"
              iconColor="text-primary-500"
            >
              <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-5">
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
                <NotificationBanner notification={notif} onDismiss={dismissNotif} />
                <Button type="submit" loading={profileSubmitting} className="!w-auto">
                  Save Changes
                </Button>
              </form>
            </SettingsCard>
          )}

          {activeTab === 'security' && (
            <SettingsCard
              icon={MdSecurity}
              title="Security"
              description="Update your password"
              iconBg="bg-sage-50"
              iconColor="text-sage-600"
            >
              <form onSubmit={handleSubmitPw(onSubmitPassword)} className="space-y-5">
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
            </SettingsCard>
          )}

          {activeTab === 'notifications' && (
            <SettingsCard
              icon={MdNotifications}
              title="Notifications"
              description="Choose how you receive updates"
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
            >
              <div className="space-y-3">
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
            </SettingsCard>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Settings;
