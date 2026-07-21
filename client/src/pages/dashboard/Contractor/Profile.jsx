import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { MdBusiness } from 'react-icons/md';
import Button from '@components/ui/Button';
import Skeleton from '@components/ui/Skeleton';
import { updateProfile } from '@services/user.api';
import { fetchCurrentUser } from '@store/slices/authSlice';
import useNotification from '@hooks/useNotification';
import { SettingsCard, NotificationBanner } from '@features/settings/SettingsComponents';

const CATEGORIES = ['PLUMBING', 'ELECTRICAL', 'STRUCTURAL', 'APPLIANCE', 'HVAC', 'OTHER'];

const schema = z.object({
  businessName: z.string().trim().min(1, 'Business name is required'),
});

const inputClass =
  'w-full rounded-xl border border-charcoal-200/90 bg-white px-3.5 py-2.5 font-body text-sm text-charcoal-700 outline-none transition duration-200 placeholder:text-charcoal-400 focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const labelClass = 'mb-1.5 block font-body text-xs font-semibold uppercase tracking-[0.06em] text-charcoal-500';

const containerVariants = {
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
};

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading profile">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-28" />
      </div>

      <Skeleton className="h-4 w-80 rounded" />

      <div className="max-w-lg rounded-2xl border border-charcoal-200/70 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-charcoal-100/70 px-5 py-4">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="space-y-5 p-5">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-36" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((s) => s.auth);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [serverError, setServerError] = useState(null);
  const { notification, dismiss, showSuccess } = useNotification(serverError, {
    onErrorDismiss: () => setServerError(null),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { businessName: '' },
  });

  useEffect(() => {
    if (user) {
      reset({ businessName: user.profile?.businessName || '' });
      setCategories(user.profile?.serviceCategories ?? []);
    }
  }, [user, reset]);

  const toggleCategory = (cat) =>
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const onSubmit = async ({ businessName }) => {
    setSaving(true);
    try {
      await updateProfile({
        profile: {
          ...user?.profile,
          businessName,
          serviceCategories: categories,
        },
      });
      await dispatch(fetchCurrentUser()).unwrap();
      showSuccess('Profile updated successfully.');
    } catch (err) {
      setServerError(err?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

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
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.35em] text-primary-500">
              Contractor
            </p>
            <h1 className="mt-1 font-heading text-3xl font-bold text-charcoal-950">Profile</h1>
          </motion.div>

          <motion.div variants={itemVariants}>
            <p className="font-body text-sm text-charcoal-500">
              This information is visible to landlords considering you for jobs.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SettingsCard
              icon={MdBusiness}
              title="Business Info"
              description="Update your public-facing business details"
              iconBg="bg-primary-50"
              iconColor="text-primary-500"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className={labelClass}>Business Name</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="e.g. Sunrise Maintenance Co."
                    {...register('businessName')}
                  />
                  {errors.businessName && (
                    <p className="mt-1 font-body text-xs text-primary-500">
                      {errors.businessName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Service Categories</label>
                  <p className="mb-2 font-body text-[11px] text-charcoal-400">
                    Select all categories your business handles.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`rounded-full px-3 py-1.5 font-heading text-xs font-semibold transition-colors ${
                          categories.includes(cat)
                            ? 'bg-primary-500 text-white'
                            : 'border border-charcoal-200/90 bg-white text-charcoal-600 hover:border-primary-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <NotificationBanner notification={notification} onDismiss={dismiss} />

                <Button type="submit" loading={saving} className="!w-auto">
                  Save Changes
                </Button>
              </form>
            </SettingsCard>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
