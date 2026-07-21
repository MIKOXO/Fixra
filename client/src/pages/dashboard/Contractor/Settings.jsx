import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { MdNotifications, MdSecurity } from 'react-icons/md';
import Button from '@components/ui/Button';
import Skeleton from '@components/ui/Skeleton';
import { updateProfile } from '@services/user.api';
import { changePassword, fetchCurrentUser } from '@store/slices/authSlice';
import { getUserFriendlyError } from '@utils/notificationUtils';
import { NOTIFICATION_EVENTS, SETTINGS_TABS } from '@features/settings/settingsConstants';
import { passwordSchema } from '@features/settings/settingsSchemas';
import { NotificationBanner, NotificationRow, SettingsCard, SettingsTabBar } from '@features/settings/SettingsComponents';

const CONTRACTOR_TABS = SETTINGS_TABS.filter((t) => t.key !== 'profile');

const containerVariants = {
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
};

const inputClass =
  'w-full rounded-xl border border-charcoal-200/90 bg-white px-3.5 py-2.5 font-body text-sm text-charcoal-700 outline-none transition duration-200 placeholder:text-charcoal-400 focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const labelClass = 'mb-1.5 block font-body text-xs font-semibold uppercase tracking-[0.06em] text-charcoal-500';

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading settings">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="flex gap-1 rounded-xl bg-charcoal-50/70 p-1">
        {[1, 2].map((tab) => (
          <Skeleton key={tab} className="h-10 flex-1 rounded-lg" />
        ))}
      </div>

      <div className="max-w-lg rounded-2xl border border-charcoal-200/70 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-charcoal-100/70 px-5 py-4">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
        <div className="space-y-5 p-5">
          {[1, 2, 3].map((field) => (
            <div key={field} className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

const Settings = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState('security');
  const [passwordLoading, setPasswordLoading] = useState(false);
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
      {isLoading || !user ? (
        <PageSkeleton />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-x-6 gap-y-6"
        >
          <motion.div variants={itemVariants}>
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
              Contractor
            </p>
            <h1 className="mt-1 font-heading text-3xl font-bold text-charcoal-950">
              Settings
            </h1>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SettingsTabBar tabs={CONTRACTOR_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
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
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Settings;
