import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { MdConfirmationNumber } from 'react-icons/md';
import Skeleton from '@components/ui/Skeleton';
import Select from '@components/ui/Select';
import useAuth from '@hooks/useAuth';
import { fetchTickets, transitionTicketStatus, clearTicketError } from '@store/slices/ticketSlice';
import { fetchProperties } from '@store/slices/propertySlice';
import AssignContractorModal from '@features/tickets/AssignContractorModal';
import TicketDetailDrawer from '@features/tickets/TicketDetailDrawer';

const STATUS_COLORS = {
  REPORTED: 'bg-amber-400/20 text-amber-700',
  TRIAGED: 'bg-primary-100 text-primary-700',
  ASSIGNED: 'bg-sage-100 text-sage-700',
  IN_PROGRESS: 'bg-primary-200 text-primary-800',
  PENDING_REVIEW: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-sage-200 text-sage-700',
  CLOSED: 'bg-charcoal-200/50 text-charcoal-600',
};

const PRIORITY_COLORS = {
  LOW: 'bg-charcoal-100 text-charcoal-600',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-primary-100 text-primary-700',
  EMERGENCY: 'bg-primary-200 text-primary-800',
};

const STATUS_OPTIONS = ['REPORTED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_REVIEW', 'RESOLVED', 'CLOSED'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'];
const CATEGORY_OPTIONS = ['PLUMBING', 'ELECTRICAL', 'STRUCTURAL', 'APPLIANCE', 'HVAC', 'OTHER'];

function TableSkeleton() {
  return (
    <div className="mt-6 space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl bg-charcoal-50/50 px-5 py-4">
          <Skeleton className="h-4 w-[26%] rounded" />
          <Skeleton className="h-4 w-[16%] rounded" />
          <Skeleton className="h-5 w-[10%] rounded-full" />
          <Skeleton className="h-5 w-[9%] rounded-full" />
          <Skeleton className="h-4 w-[10%] rounded" />
          <Skeleton className="h-4 w-[13%] rounded" />
          <Skeleton className="ml-auto h-8 w-[9%] rounded-xl" />
        </div>
      ))}
    </div>
  );
}

const Tickets = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { tickets, isLoading, error } = useSelector((s) => s.tickets);
  const properties = useSelector((s) => s.properties.properties);

  const [statusFilter, setStatusFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [drawerTicketId, setDrawerTicketId] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchTickets());
    dispatch(fetchProperties());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearTicketError()), 6000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  const filteredTickets = useMemo(() => {
    return (tickets ?? []).filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (categoryFilter && t.category !== categoryFilter) return false;
      if (propertyFilter) {
        const pid = t.propertyId?._id || t.propertyId;
        if (pid !== propertyFilter) return false;
      }
      return true;
    });
  }, [tickets, statusFilter, propertyFilter, priorityFilter, categoryFilter]);

  const handleTriage = async (e, id) => {
    e.stopPropagation();
    try {
      await dispatch(transitionTicketStatus({ id, data: { status: 'TRIAGED' } })).unwrap();
    } catch {
      // handled by slice error
    }
  };

  const handleOpenDrawer = (id) => {
    setDrawerTicketId(id);
  };

  const handleCloseDrawer = () => {
    setDrawerTicketId(null);
  };

  const statusOptions = useMemo(
    () => [{ value: '', label: 'All Statuses' }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: s }))],
    []
  );
  const priorityOptions = useMemo(
    () => [{ value: '', label: 'All Priorities' }, ...PRIORITY_OPTIONS.map((p) => ({ value: p, label: p }))],
    []
  );
  const categoryOptions = useMemo(
    () => [{ value: '', label: 'All Categories' }, ...CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))],
    []
  );
  const propertyOptions = useMemo(
    () => [
      { value: '', label: 'All Properties' },
      ...(properties ?? []).map((p) => ({ value: p._id || p.id, label: p.name })),
    ],
    [properties]
  );

  const hasFilters = statusFilter || propertyFilter || priorityFilter || categoryFilter;

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
            Landlord
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-charcoal-950">Tickets</h1>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          placeholder="All Statuses"
        />
        <Select
          value={propertyFilter}
          onChange={setPropertyFilter}
          options={propertyOptions}
          placeholder="All Properties"
        />
        <Select
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={priorityOptions}
          placeholder="All Priorities"
        />
        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categoryOptions}
          placeholder="All Categories"
        />
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : filteredTickets.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
            <MdConfirmationNumber className="text-3xl text-primary-400" />
          </div>
          <h2 className="mt-4 font-heading text-xl font-bold text-charcoal-950">
            {hasFilters ? 'No matching tickets' : 'No tickets yet'}
          </h2>
          <p className="mt-1 font-body text-sm text-charcoal-500">
            {hasFilters
              ? 'Try adjusting your filters.'
              : 'Maintenance tickets from your tenants will appear here.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="flex items-center gap-4 px-5 py-3 font-heading text-[11px] font-semibold uppercase tracking-[0.06em] text-charcoal-400">
              <span className="w-[26%]">Title</span>
              <span className="w-[16%]">Property / Unit</span>
              <span className="w-[10%]">Status</span>
              <span className="w-[9%]">Priority</span>
              <span className="w-[10%]">Category</span>
              <span className="w-[13%]">Time</span>
              <span className="w-[10%]" />
            </div>
            <div className="divide-y divide-charcoal-100 rounded-2xl border border-charcoal-200/70 bg-white shadow-sm">
              {filteredTickets.map((ticket) => {
                const tid = ticket._id || ticket.id;
                const propertyName = ticket.propertyId?.name || ticket.propertyName || '—';
                const unitInfo = ticket.unitNumber || ticket.unitId || '';
                return (
                  <button
                    key={tid}
                    onClick={() => handleOpenDrawer(tid)}
                    className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-charcoal-50/50"
                  >
                    <span className="w-[26%] truncate font-body text-sm font-medium text-charcoal-950">
                      {ticket.title}
                    </span>
                    <span className="w-[16%] truncate font-body text-xs text-charcoal-500">
                      {propertyName}
                      {unitInfo ? ` / ${unitInfo}` : ''}
                    </span>
                    <span className="w-[10%]">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                          STATUS_COLORS[ticket.status] || 'bg-charcoal-100 text-charcoal-600'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </span>
                    <span className="w-[9%]">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                          PRIORITY_COLORS[ticket.priority] || 'bg-charcoal-100 text-charcoal-600'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </span>
                    <span className="w-[10%] truncate font-body text-xs text-charcoal-500">
                      {ticket.category}
                    </span>
                    <span className="w-[13%] font-body text-xs text-charcoal-400">
                      {formatDistanceToNow(new Date(ticket.createdAt || ticket.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                    <span className="w-[10%] text-right" onClick={(e) => e.stopPropagation()}>
                      {ticket.status === 'REPORTED' && (
                        <button
                          onClick={(e) => handleTriage(e, tid)}
                          className="rounded-lg bg-primary-50 px-3 py-1.5 font-heading text-[11px] font-semibold text-primary-600 transition-colors hover:bg-primary-100"
                        >
                          Triage
                        </button>
                      )}
                      {ticket.status === 'TRIAGED' && (
                        <button
                          onClick={() => setAssignTarget(tid)}
                          className="rounded-lg bg-primary-50 px-3 py-1.5 font-heading text-[11px] font-semibold text-primary-600 transition-colors hover:bg-primary-100"
                        >
                          Assign
                        </button>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <AssignContractorModal
        isOpen={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        ticketId={assignTarget}
      />

      <TicketDetailDrawer
        isOpen={!!drawerTicketId}
        ticketId={drawerTicketId}
        onClose={() => setDrawerTicketId(null)}
        onAssign={(id) => {
          setDrawerTicketId(null);
          setTimeout(() => setAssignTarget(id), 100);
        }}
        userRole={user?.role}
      />
    </div>
  );
};

export default Tickets;