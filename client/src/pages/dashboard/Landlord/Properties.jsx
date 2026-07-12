import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdApartment, MdAdd, MdEdit, MdDelete, MdPersonAdd } from 'react-icons/md';
import Skeleton from '@components/ui/Skeleton';
import DeleteConfirmModal from '@components/ui/DeleteConfirmModal';
import { fetchProperties, deleteProperty, clearPropertyError } from '@store/slices/propertySlice';
import { fetchTickets } from '@store/slices/ticketSlice';
import AddPropertyModal from '@features/properties/AddPropertyModal';
import EditPropertyModal from '@features/properties/EditPropertyModal';
import InviteTenantModal from '@features/properties/InviteTenantModal';

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm">
      <Skeleton className="h-5 w-2/3 rounded" />
      <Skeleton className="mt-2 h-3 w-1/2 rounded" />
      <div className="mt-4 flex gap-4">
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 w-20 rounded-xl" />
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>
    </div>
  );
}

const Properties = () => {
  const dispatch = useDispatch();
  const { properties, isLoading, error } = useSelector((s) => s.properties);
  const tickets = useSelector((s) => s.tickets.tickets);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editProperty, setEditProperty] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [inviteTarget, setInviteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchProperties());
    dispatch(fetchTickets());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearPropertyError()), 6000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  const openTicketCounts = useMemo(() => {
    const map = {};
    (tickets ?? []).forEach((t) => {
      if (!['RESOLVED', 'CLOSED'].includes(t.status)) {
        const pid = t.propertyId?._id || t.propertyId;
        if (pid) map[pid] = (map[pid] || 0) + 1;
      }
    });
    return map;
  }, [tickets]);

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
            Landlord
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-charcoal-950">Properties</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          <MdAdd className="text-lg" />
          Add Property
        </button>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (properties ?? []).length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
            <MdApartment className="text-3xl text-primary-400" />
          </div>
          <h2 className="mt-4 font-heading text-xl font-bold text-charcoal-950">No properties yet</h2>
          <p className="mt-1 font-body text-sm text-charcoal-500">
            Add your first property to get started.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600"
          >
            <MdAdd className="text-lg" />
            Add Property
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(properties ?? []).map((property) => {
            const pid = property._id || property.id;
            const openCount = openTicketCounts[pid] || 0;
            const addressStr = property.address?.region
              ? [property.address?.houseNumber, property.address?.city, property.address?.region].filter(Boolean).join(', ')
              : [property.address?.street, property.address?.city, property.address?.state].filter(Boolean).join(', ');

            return (
              <div key={pid} className="rounded-2xl border border-charcoal-200/70 bg-white shadow-sm">
                <div className="p-5">
                  <h3 className="font-heading text-lg font-bold text-charcoal-950">
                    {property.name}
                  </h3>
                  {addressStr && (
                    <p className="mt-0.5 font-body text-sm text-charcoal-500">{addressStr}</p>
                  )}

                  <div className="mt-4 flex items-center gap-4 font-body text-sm text-charcoal-600">
                    <span>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          property.isOccupied
                            ? 'bg-sage-100 text-sage-700'
                            : 'bg-charcoal-100 text-charcoal-500'
                        }`}
                      >
                        {property.isOccupied ? 'Occupied' : 'Vacant'}
                      </span>
                    </span>
                    {property.tenantId?.name && (
                      <span className="truncate text-charcoal-500">
                        {property.tenantId.name}
                      </span>
                    )}
                    <span>
                      <span
                        className={`font-semibold ${
                          openCount === 0 ? 'text-sage-600' : 'text-primary-500'
                        }`}
                      >
                        {openCount}
                      </span>{' '}
                      open
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {!property.isOccupied && (
                      <button
                        onClick={() => setInviteTarget(pid)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary-500 px-3 py-2 font-heading text-xs font-semibold text-white transition-colors hover:bg-primary-600"
                      >
                        <MdPersonAdd className="text-sm" />
                        Invite Tenant
                      </button>
                    )}
                    <button
                      onClick={() => setEditProperty(property)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border border-charcoal-200/90 bg-white px-3 py-2 font-heading text-xs font-semibold text-charcoal-700 transition-colors hover:bg-charcoal-50 ${
                        property.isOccupied ? 'flex-1' : ''
                      }`}
                    >
                      <MdEdit className="text-sm" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(property)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-charcoal-200/90 bg-white px-3 py-2 font-heading text-xs font-semibold text-primary-500 transition-colors hover:bg-primary-50"
                    >
                      <MdDelete className="text-sm" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddPropertyModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <EditPropertyModal
        isOpen={!!editProperty}
        onClose={() => setEditProperty(null)}
        property={editProperty}
      />
      <InviteTenantModal
        isOpen={!!inviteTarget}
        onClose={() => setInviteTarget(null)}
        propertyId={inviteTarget}
      />
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Property"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={() => {
          if (deleteTarget) {
            dispatch(deleteProperty(deleteTarget._id || deleteTarget.id));
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
};

export default Properties;
