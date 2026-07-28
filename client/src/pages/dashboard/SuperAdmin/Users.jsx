import { useEffect, useMemo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { MdPeople } from 'react-icons/md';
import Skeleton from '@components/ui/Skeleton';
import Select from '@components/ui/Select';
import DeleteConfirmModal from '@components/ui/DeleteConfirmModal';
import {
  fetchAdminUsers,
  deactivateUserThunk,
  reactivateUserThunk,
} from '@store/slices/adminSlice';

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'LANDLORD', label: 'Landlord' },
  { value: 'TENANT', label: 'Tenant' },
  { value: 'CONTRACTOR', label: 'Contractor' },
  { value: 'TECHNICIAN', label: 'Technician' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'deactivated', label: 'Deactivated' },
];

function TableSkeleton() {
  return (
    <div className="mt-6 space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl bg-charcoal-50/50 px-5 py-4">
          <Skeleton className="h-4 w-[22%] rounded" />
          <Skeleton className="h-4 w-[26%] rounded" />
          <Skeleton className="h-5 w-[12%] rounded-full" />
          <Skeleton className="h-5 w-[12%] rounded-full" />
          <Skeleton className="h-4 w-[14%] rounded" />
          <Skeleton className="ml-auto h-8 w-[10%] rounded-xl" />
        </div>
      ))}
    </div>
  );
}

const Users = () => {
  const dispatch = useDispatch();
  const { users, usersLoading, error } = useSelector((s) => s.admin);

  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [targetUser, setTargetUser] = useState(null);
  const [action, setAction] = useState(null);

  const limit = 15;

  useEffect(() => {
    dispatch(fetchAdminUsers({ page, limit, role: roleFilter || undefined, isActive: statusFilter === 'active' ? true : statusFilter === 'deactivated' ? false : undefined }));
  }, [dispatch, page, roleFilter, statusFilter]);

  const userList = users?.users ?? [];
  const pagination = users?.pagination ?? { page: 1, limit, total: 0, pages: 1 };
  const hasFilters = roleFilter || statusFilter;

  const openConfirm = useCallback((user, actionType) => {
    setTargetUser(user);
    setAction(actionType);
  }, []);

  const closeConfirm = useCallback(() => {
    setTargetUser(null);
    setAction(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!targetUser) return;
    const userId = targetUser._id || targetUser.id;
    try {
      if (action === 'deactivate') {
        await dispatch(deactivateUserThunk(userId)).unwrap();
      } else {
        await dispatch(reactivateUserThunk(userId)).unwrap();
      }
      dispatch(fetchAdminUsers({ page: pagination.page, limit, role: roleFilter || undefined, isActive: statusFilter === 'active' ? true : statusFilter === 'deactivated' ? false : undefined }));
    } catch {
      // error handled by slice
    } finally {
      closeConfirm();
    }
  }, [targetUser, action, dispatch, pagination.page, roleFilter, statusFilter, closeConfirm]);

  const confirmTitle = action === 'deactivate' ? 'Deactivate User' : 'Reactivate User';
  const confirmMessage = action === 'deactivate'
    ? `Are you sure you want to deactivate ${targetUser?.name}? They will lose access to the platform until reactivated.`
    : `Are you sure you want to reactivate ${targetUser?.name}? They will regain access to the platform.`;

  const showSkeleton = usersLoading && !users;

  return (
    <div className="px-6 py-8">
      {showSkeleton ? (
        <>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
          <TableSkeleton />
        </>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
              Super Admin
            </p>
            <h1 className="mt-1 font-heading text-3xl font-bold text-charcoal-950">
              Users
            </h1>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              value={roleFilter}
              onChange={(v) => { setRoleFilter(v); setPage(1); }}
              options={ROLE_OPTIONS}
              placeholder="All Roles"
            />
            <Select
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setPage(1); }}
              options={STATUS_OPTIONS}
              placeholder="All Statuses"
            />
          </motion.div>

          {error && (
            <motion.div variants={itemVariants} className="mt-4 flex items-center gap-3 rounded-2xl border border-primary-200/60 bg-primary-50/60 px-5 py-4">
              <span className="font-body text-sm text-primary-700">
                Could not load users.{' '}
                <button
                  onClick={() => dispatch(fetchAdminUsers({ page, limit, role: roleFilter || undefined, isActive: statusFilter === 'active' ? true : statusFilter === 'deactivated' ? false : undefined }))}
                  className="ml-1 font-semibold underline underline-offset-2 hover:text-primary-800"
                >
                  Retry
                </button>
              </span>
            </motion.div>
          )}

          {!error && userList.length === 0 ? (
            <motion.div variants={itemVariants} className="mt-16 flex flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
                <MdPeople className="text-3xl text-primary-400" />
              </div>
              <h2 className="mt-4 font-heading text-xl font-bold text-charcoal-950">
                {hasFilters ? 'No matching users' : 'No users yet'}
              </h2>
              <p className="mt-1 font-body text-sm text-charcoal-500">
                {hasFilters ? 'Try adjusting your filters.' : 'Users will appear here once they register.'}
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div variants={itemVariants} className="mt-6 overflow-x-auto">
                <div className="min-w-[700px]">
                  <div className="flex items-center gap-4 px-5 py-3 font-heading text-[11px] font-semibold uppercase tracking-[0.06em] text-charcoal-400">
                    <span className="w-[22%]">Name</span>
                    <span className="w-[26%]">Email</span>
                    <span className="w-[12%]">Role</span>
                    <span className="w-[12%]">Status</span>
                    <span className="w-[14%]">Joined</span>
                    <span className="w-[10%]" />
                  </div>
                  <div className="divide-y divide-charcoal-100 rounded-2xl border border-charcoal-200/70 bg-white shadow-sm">
                    {userList.map((u) => {
                      const uid = u._id || u.id;
                      const isActive = u.isActive;
                      return (
                        <div
                          key={uid}
                          className="flex items-center gap-4 px-5 py-3.5"
                        >
                          <span className="w-[22%] truncate font-body text-sm font-medium text-charcoal-950">
                            {u.name}
                          </span>
                          <span className="w-[26%] truncate font-body text-xs text-charcoal-500">
                            {u.email}
                          </span>
                          <span className="w-[12%]">
                            <span className="inline-block rounded-full bg-charcoal-100 px-2.5 py-0.5 font-body text-[11px] font-semibold text-charcoal-600">
                              {u.role?.replace(/_/g, ' ')}
                            </span>
                          </span>
                          <span className="w-[12%]">
                            <span className="inline-flex items-center gap-1 rounded-full bg-charcoal-100 px-2.5 py-0.5 font-body text-[11px] font-semibold text-charcoal-600">
                              {isActive ? 'Active' : 'Deactivated'}
                            </span>
                          </span>
                          <span className="w-[14%] truncate font-body text-xs text-charcoal-400">
                            {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
                          </span>
                          <span className="w-[10%] text-right">
                            <button
                              onClick={() => openConfirm(u, isActive ? 'deactivate' : 'reactivate')}
                              className={`rounded-lg px-3 py-1.5 font-heading text-[11px] font-semibold transition-colors ${
                                isActive
                                  ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                                  : 'bg-sage-50 text-sage-600 hover:bg-sage-100'
                              }`}
                            >
                              {isActive ? 'Deactivate' : 'Reactivate'}
                            </button>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {pagination.pages > 1 && (
                <motion.div variants={itemVariants} className="mt-6 flex items-center justify-between">
                  <p className="font-body text-xs text-charcoal-500">
                    Page {pagination.page} of {pagination.pages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.page <= 1}
                      className="rounded-xl border border-charcoal-200/90 bg-white px-4 py-2 font-heading text-xs font-semibold text-charcoal-700 transition-colors hover:bg-charcoal-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="rounded-xl border border-charcoal-200/90 bg-white px-4 py-2 font-heading text-xs font-semibold text-charcoal-700 transition-colors hover:bg-charcoal-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      )}

      <DeleteConfirmModal
        isOpen={!!targetUser}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
        title={confirmTitle}
        message={confirmMessage}
      />
    </div>
  );
};

export default Users;
