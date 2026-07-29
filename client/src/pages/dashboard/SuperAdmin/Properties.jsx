import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  MdApartment,
  MdImage,
  MdOpenInNew,
} from 'react-icons/md';
import Skeleton from '@components/ui/Skeleton';
import Select from '@components/ui/Select';
import Modal from '@components/ui/Modal';
import { fetchAdminProperties } from '@store/slices/adminSlice';
import { REGIONS, getCitiesForRegion } from '@constants/ethiopianLocations';

const PROPERTY_TYPE_LABELS = {
  APARTMENT: 'Apartment',
  CONDOMINIUM: 'Condominium',
  VILLA: 'Villa',
  'G+1': 'G+1',
  'G+2': 'G+2',
  'G+3': 'G+3',
  'G+4': 'G+4',
};

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

function TableSkeleton() {
  return (
    <div className="mt-6 space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl bg-charcoal-50/50 px-5 py-4">
          <Skeleton className="h-4 w-[14%] rounded" />
          <Skeleton className="h-4 w-[18%] rounded" />
          <Skeleton className="h-4 w-[10%] rounded" />
          <Skeleton className="h-4 w-[18%] rounded" />
          <Skeleton className="h-5 w-[10%] rounded-full" />
          <Skeleton className="h-4 w-[12%] rounded" />
        </div>
      ))}
    </div>
  );
}

const detailLabelClass = 'font-body text-[10px] font-semibold uppercase tracking-[0.08em] text-charcoal-400';
const detailValueClass = 'mt-0.5 font-body text-sm text-charcoal-900';

const steps = [
  { key: 'location', label: 'Location' },
  { key: 'details', label: 'Details' },
  { key: 'documents', label: 'Documents' },
];

function PropertyDetailModal({ property, isOpen, onClose }) {
  const [step, setStep] = useState(0);
  if (!property) return null;

  const address = property.address || {};
  const docs = property.documents || {};

  const stepContent = [
    <div key="location" className="grid grid-cols-2 gap-x-6 gap-y-3">
      <div>
        <p className={detailLabelClass}>Region</p>
        <p className={detailValueClass}>{address.region || '—'}</p>
      </div>
      <div>
        <p className={detailLabelClass}>City</p>
        <p className={detailValueClass}>{address.city || '—'}</p>
      </div>
      <div>
        <p className={detailLabelClass}>Woreda</p>
        <p className={detailValueClass}>{address.woreda ?? '—'}</p>
      </div>
      <div>
        <p className={detailLabelClass}>Kebele</p>
        <p className={detailValueClass}>{address.kebele ?? '—'}</p>
      </div>
      <div>
        <p className={detailLabelClass}>House Number</p>
        <p className={detailValueClass}>{address.houseNumber || '—'}</p>
      </div>
      <div>
        <p className={detailLabelClass}>Landmark</p>
        <p className={detailValueClass}>{address.landmark || '—'}</p>
      </div>
    </div>,
    <div key="details" className="grid grid-cols-2 gap-x-6 gap-y-3">
      <div>
        <p className={detailLabelClass}>Property Type</p>
        <p className={detailValueClass}>{PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType}</p>
      </div>
      <div>
        <p className={detailLabelClass}>TIN Number</p>
        <p className={detailValueClass}>{property.tinNumber || '—'}</p>
      </div>
      <div>
        <p className={detailLabelClass}>Floors</p>
        <p className={detailValueClass}>{property.floors ?? '—'}</p>
      </div>
      <div>
        <p className={detailLabelClass}>Floor Number</p>
        <p className={detailValueClass}>{property.floorNumber != null ? property.floorNumber : '—'}</p>
      </div>
      <div>
        <p className={detailLabelClass}>Year Built</p>
        <p className={detailValueClass}>{property.yearBuilt || '—'}</p>
      </div>
      <div>
        <p className={detailLabelClass}>Occupied</p>
        <p className={detailValueClass}>{property.isOccupied ? 'Yes' : 'No'}</p>
      </div>
      <div>
        <p className={detailLabelClass}>Landlord</p>
        <p className={detailValueClass}>{property.landlordId?.name || '—'}</p>
      </div>
      <div>
        <p className={detailLabelClass}>Contact</p>
        <p className={detailValueClass}>
          {property.landlordId?.email || property.landlordId?.phone
            ? [property.landlordId.email, property.landlordId.phone].filter(Boolean).join(' · ')
            : '—'}
        </p>
      </div>
    </div>,
    <div key="documents" className="space-y-3">
      <div className="flex items-center justify-between rounded-lg bg-charcoal-50/60 p-3">
        <div>
          <p className={detailLabelClass}>Title Deed</p>
          <p className="mt-0.5 font-body text-xs text-charcoal-600">
            {docs.titleDeed ? 'Uploaded' : 'Not uploaded'}
          </p>
        </div>
        {docs.titleDeed && (
          <a href={docs.titleDeed} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 font-body text-xs font-medium text-primary-600 shadow-sm ring-1 ring-charcoal-200/70 transition-colors hover:bg-primary-50">
            <MdOpenInNew className="text-[11px]" />
            View
          </a>
        )}
      </div>
      <div className="flex items-center justify-between rounded-lg bg-charcoal-50/60 p-3">
        <div>
          <p className={detailLabelClass}>Floor Plan</p>
          <p className="mt-0.5 font-body text-xs text-charcoal-600">
            {docs.floorPlan ? 'Uploaded' : 'Not uploaded'}
          </p>
        </div>
        {docs.floorPlan && (
          <a href={docs.floorPlan} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 font-body text-xs font-medium text-primary-600 shadow-sm ring-1 ring-charcoal-200/70 transition-colors hover:bg-primary-50">
            <MdOpenInNew className="text-[11px]" />
            View
          </a>
        )}
      </div>
      {docs.photos?.length > 0 && (
        <div>
          <p className={detailLabelClass}>Photos ({docs.photos.length})</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {docs.photos.slice(0, 8).map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-14 w-14 items-center justify-center rounded-lg bg-charcoal-100 text-[10px] text-charcoal-400 transition-colors hover:bg-charcoal-200"
              >
                <MdImage className="text-lg" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>,
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={property.name || 'Property Details'}>
      <div className="flex gap-1 rounded-xl bg-charcoal-50/80 p-1">
        {steps.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setStep(i)}
            className={`flex-1 rounded-lg py-2 text-center font-body text-xs font-semibold transition-colors ${
              step === i ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-400 hover:text-charcoal-600'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {stepContent[step]}
      </div>
    </Modal>
  );
}

const Properties = () => {
  const dispatch = useDispatch();
  const { properties, propertiesLoading, error } = useSelector((s) => s.admin);

  const [regionFilter, setRegionFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const limit = 15;

  const cityOptions = useMemo(
    () => [{ value: '', label: 'All Cities' }, ...getCitiesForRegion(regionFilter)],
    [regionFilter]
  );

  useEffect(() => {
    dispatch(fetchAdminProperties({
      page,
      limit,
      region: regionFilter || undefined,
      city: cityFilter || undefined,
    }));
  }, [dispatch, page, regionFilter, cityFilter]);

  const propertyList = properties?.properties ?? [];
  const pagination = properties?.pagination ?? { page: 1, limit, total: 0, pages: 1 };
  const hasFilters = regionFilter || cityFilter;

  const showSkeleton = propertiesLoading && !properties;

  const regionOptions = useMemo(
    () => [{ value: '', label: 'All Regions' }, ...REGIONS],
    []
  );

  return (
    <div className="px-6 py-8">
      {showSkeleton ? (
        <>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-36" />
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
              Properties
            </h1>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              value={regionFilter}
              onChange={(v) => { setRegionFilter(v); setCityFilter(''); setPage(1); }}
              options={regionOptions}
              placeholder="All Regions"
            />
            <Select
              value={cityFilter}
              onChange={(v) => { setCityFilter(v); setPage(1); }}
              options={cityOptions}
              placeholder="All Cities"
            />
          </motion.div>

          {error && (
            <motion.div variants={itemVariants} className="mt-4 flex items-center gap-3 rounded-2xl border border-primary-200/60 bg-primary-50/60 px-5 py-4">
              <span className="font-body text-sm text-primary-700">
                Could not load properties.{' '}
                <button
                  onClick={() => dispatch(fetchAdminProperties({ page, limit, region: regionFilter || undefined, city: cityFilter || undefined }))}
                  className="ml-1 font-semibold underline underline-offset-2 hover:text-primary-800"
                >
                  Retry
                </button>
              </span>
            </motion.div>
          )}

          {!error && propertyList.length === 0 ? (
            <motion.div variants={itemVariants} className="mt-16 flex flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
                <MdApartment className="text-3xl text-primary-400" />
              </div>
              <h2 className="mt-4 font-heading text-xl font-bold text-charcoal-950">
                {hasFilters ? 'No matching properties' : 'No properties yet'}
              </h2>
              <p className="mt-1 font-body text-sm text-charcoal-500">
                {hasFilters ? 'Try adjusting your filters.' : 'Properties will appear here once landlords add them.'}
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div variants={itemVariants} className="mt-6 overflow-x-auto">
                <div className="min-w-[750px]">
                  <div className="flex items-center gap-4 px-5 py-3 font-heading text-[11px] font-semibold uppercase tracking-[0.06em] text-charcoal-400">
                    <span className="w-[14%]">Type</span>
                    <span className="w-[18%]">Region / City</span>
                    <span className="w-[10%]">House #</span>
                    <span className="w-[18%]">Landlord</span>
                    <span className="w-[10%]">Occupancy</span>
                    <span className="w-[12%]">Created</span>
                  </div>
                  <div className="divide-y divide-charcoal-100 rounded-2xl border border-charcoal-200/70 bg-white shadow-sm">
                    {propertyList.map((p) => {
                      const pid = p._id || p.id;
                      const address = p.address || {};
                      return (
                        <button
                          key={pid}
                          onClick={() => setSelectedProperty(p)}
                          className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-charcoal-50/50"
                        >
                          <span className="w-[14%] truncate font-body text-sm font-medium text-charcoal-950">
                            {PROPERTY_TYPE_LABELS[p.propertyType] || p.propertyType}
                          </span>
                          <span className="w-[18%] truncate font-body text-xs text-charcoal-500">
                            {address.region ? `${address.region}${address.city ? `, ${address.city}` : ''}` : '—'}
                          </span>
                          <span className="w-[10%] truncate font-body text-xs text-charcoal-500">
                            {address.houseNumber || '—'}
                          </span>
                          <span className="w-[18%] truncate font-body text-xs text-charcoal-500">
                            {p.landlordId?.name || '—'}
                          </span>
                          <span className="w-[10%]">
                            <span className="inline-block rounded-full bg-charcoal-100 px-2.5 py-0.5 font-body text-[11px] font-semibold text-charcoal-600">
                              {p.isOccupied ? 'Occupied' : 'Vacant'}
                            </span>
                          </span>
                          <span className="w-[12%] truncate font-body text-xs text-charcoal-400">
                            {p.createdAt ? format(new Date(p.createdAt), 'MMM d, yyyy') : '—'}
                          </span>
                        </button>
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

      <PropertyDetailModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  );
};

export default Properties;
