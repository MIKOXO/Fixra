import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { MdCloudUpload, MdClose } from 'react-icons/md';
import Modal from '@components/ui/Modal';
import Select from '@components/ui/Select';
import NumberInput from '@components/ui/NumberInput';
import { updateProperty } from '@store/slices/propertySlice';
import { uploadPropertyDocuments } from '@services/property.api';
import { REGIONS, getCitiesForRegion } from '@constants/ethiopianLocations';
import useAutoClearErrors from '@hooks/useAutoClearErrors';

const STEPS = ['Location', 'Details', 'Documents'];

const propertyTypeOptions = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'CONDOMINIUM', label: 'Condominium' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'G+1', label: 'G+1' },
  { value: 'G+2', label: 'G+2' },
  { value: 'G+3', label: 'G+3' },
  { value: 'G+4', label: 'G+4' },
];

const schema = z.object({
  address: z.object({
    region: z.string().min(1, 'Region is required'),
    city: z.string().min(1, 'City is required'),
    woreda: z.coerce.number().int().min(1, 'Woreda is required'),
    kebele: z.coerce.number().int().min(1, 'Kebele is required'),
    houseNumber: z.string().min(1, 'House number is required'),
    landmark: z.string().optional(),
  }),
  propertyType: z.string().min(1, 'Property type is required'),
  floors: z.coerce.number().int().min(1, 'Minimum 1 floor').max(99, 'Maximum 99 floors'),
  floorNumber: z.coerce.number().int().min(0, 'Ground floor = 0'),
  yearBuilt: z.union([z.literal(''), z.coerce.number().int().min(1900).max(2026)]).optional(),
  tinNumber: z.string().min(1, 'TIN number is required'),
}).refine(
  (data) => !data.floors || !data.floorNumber || data.floorNumber <= data.floors,
  { message: 'Floor number cannot exceed number of floors', path: ['floorNumber'] }
);

const typeFloorsMap = {
  VILLA: 1,
  'G+1': 2,
  'G+2': 3,
  'G+3': 4,
  'G+4': 5,
};

const btnBase = 'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 font-heading text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60';

const labelClass = 'font-body text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-600';
const inputClass = 'mt-1.5 w-full rounded-xl border border-charcoal-200/90 bg-white px-4 py-2.5 text-charcoal-950 text-sm outline-none transition duration-200 placeholder:text-charcoal-400 placeholder:text-xs focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const EditPropertyModal = ({ isOpen, onClose, property }) => {
  const dispatch = useDispatch();
  const { operationLoading } = useSelector((s) => s.properties);
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const p = property || {};

  const [titleDeedFile, setTitleDeedFile] = useState(null);
  const [titleDeedRemoved, setTitleDeedRemoved] = useState(false);
  const [floorPlanFile, setFloorPlanFile] = useState(null);
  const [floorPlanRemoved, setFloorPlanRemoved] = useState(false);
  const [photosFiles, setPhotosFiles] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    trigger,
    watch,
    setValue,
    getValues,
    clearErrors,
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const formValues = {
      address: {
        region: p.address?.region || '',
        city: p.address?.city || '',
        woreda: p.address?.woreda || '',
        kebele: p.address?.kebele || '',
        houseNumber: p.address?.houseNumber || '',
        landmark: p.address?.landmark || '',
      },
      propertyType: p.propertyType || '',
      floors: p.floors || '',
      floorNumber: p.floorNumber ?? '',
      yearBuilt: p.yearBuilt || '',
      tinNumber: p.tinNumber || '',
    };
    reset(formValues);
    prevRegion.current = formValues.address.region;
    setTitleDeedFile(null);
    setTitleDeedRemoved(false);
    setFloorPlanFile(null);
    setFloorPlanRemoved(false);
    setPhotosFiles([]);
    setTitleDeedError('');
    setFloorPlanError('');
    setPhotosError('');
    setStep(0);
  }, [p._id || p.id]);

  useAutoClearErrors(errors, clearErrors);

  const region = watch('address.region');
  const propertyType = watch('propertyType');
  const floors = watch('floors');
  const cityOptions = getCitiesForRegion(region);
  const prevRegion = useRef(region);

  const typeFloorsMapLocal = {
    VILLA: 1,
    'G+1': 2,
    'G+2': 3,
    'G+3': 4,
    'G+4': 5,
  };

  useEffect(() => {
    if (region && region !== prevRegion.current) {
      setValue('address.city', '');
    }
    prevRegion.current = region;
  }, [region, setValue]);

  useEffect(() => {
    if (!propertyType) return;
    if (propertyType in typeFloorsMapLocal) {
      setValue('floors', typeFloorsMapLocal[propertyType]);
    } else {
      setValue('floors', '');
    }
    setValue('floorNumber', '');
  }, [propertyType, setValue]);

  const [titleDeedError, setTitleDeedError] = useState('');
  const [floorPlanError, setFloorPlanError] = useState('');
  const [photosError, setPhotosError] = useState('');

  const titleDeedDrop = useDropzone({
    onDrop: (files) => { setTitleDeedFile(files[0]); setTitleDeedRemoved(false); setTitleDeedError(''); },
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0];
      if (err?.code === 'file-too-large') setTitleDeedError('File must be under 10 MB');
      else setTitleDeedError(err?.message || 'Invalid file');
    },
    accept: { 'application/pdf': [], 'image/*': [] },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    multiple: false,
  });

  const floorPlanDrop = useDropzone({
    onDrop: (files) => { setFloorPlanFile(files[0]); setFloorPlanRemoved(false); setFloorPlanError(''); },
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0];
      if (err?.code === 'file-too-large') setFloorPlanError('File must be under 10 MB');
      else setFloorPlanError(err?.message || 'Invalid file');
    },
    accept: { 'application/pdf': [], 'image/*': [] },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    multiple: false,
  });

  const photosDrop = useDropzone({
    onDrop: (accepted) => { setPhotosFiles((prev) => [...prev, ...accepted].slice(0, 5)); setPhotosError(''); },
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0];
      if (err?.code === 'file-too-large') setPhotosError('Each photo must be under 5 MB');
      else setPhotosError(err?.message || 'Invalid file');
    },
    accept: { 'image/*': [] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 5,
    multiple: true,
  });

  const removePhoto = (idx) => {
    setPhotosFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const stepFields = [
    ['address.region', 'address.city', 'address.woreda', 'address.kebele', 'address.houseNumber'],
    ['propertyType', 'floors', 'floorNumber', 'yearBuilt'],
    ['tinNumber'],
  ];

  const handleNext = async () => {
    if (step === 1) {
      if (!['APARTMENT', 'CONDOMINIUM'].includes(getValues('propertyType'))) {
        setValue('floorNumber', 0);
      }
    }
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSave = async () => {
    const valid = await trigger(stepFields[2]);
    if (!valid) return;

    if (!['APARTMENT', 'CONDOMINIUM'].includes(getValues('propertyType'))) {
      setValue('floorNumber', 0);
    }

    setIsSaving(true);
    setServerError('');

    try {
      let documents = {
        titleDeed: titleDeedRemoved ? '' : (p.documents?.titleDeed || ''),
        floorPlan: floorPlanRemoved ? '' : (p.documents?.floorPlan || ''),
        photos: p.documents?.photos || [],
      };

      const uploadEntries = [];
      if (titleDeedFile) uploadEntries.push({ field: 'titleDeed', file: titleDeedFile });
      if (floorPlanFile) uploadEntries.push({ field: 'floorPlan', file: floorPlanFile });
      photosFiles.forEach((f) => uploadEntries.push({ field: 'photos', file: f }));

      if (uploadEntries.length > 0) {
        const formData = new FormData();
        uploadEntries.forEach(({ field, file }) => formData.append(field, file));
        const result = await uploadPropertyDocuments(formData);
        if (result.titleDeedUrl) documents.titleDeed = result.titleDeedUrl;
        if (result.floorPlanUrl) documents.floorPlan = result.floorPlanUrl;
        if (result.photosUrls?.length > 0) {
          documents.photos = [...documents.photos, ...result.photosUrls];
        }
      }

      const vals = getValues();

      const propertyData = {
        name: `${vals.address.houseNumber}, ${vals.address.city}`,
        address: {
          region: vals.address.region,
          city: vals.address.city,
          woreda: Number(vals.address.woreda),
          kebele: Number(vals.address.kebele),
          houseNumber: vals.address.houseNumber,
          landmark: vals.address.landmark || '',
        },
        propertyType: vals.propertyType,
        floors: Number(vals.floors),
        floorNumber: Number(vals.floorNumber),
        yearBuilt: vals.yearBuilt ? Number(vals.yearBuilt) : undefined,
        documents,
        tinNumber: vals.tinNumber,
      };

      await dispatch(updateProperty({ id: p._id || p.id, data: propertyData })).unwrap();
      onClose();
    } catch (err) {
      setServerError(err?.message || err || 'Failed to update property');
    } finally {
      setIsSaving(false);
    }
  };

  const dropzoneBase = 'mt-1 cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-colors';
  const dropzoneIdle = 'border-charcoal-200/90 hover:border-primary-300 hover:bg-primary-50/50';
  const dropzoneActive = 'border-primary-400 bg-primary-50';

  const renderDropzone = (dropState, file, onRemove, placeholder, acceptText) => (
    <div {...dropState.getRootProps()} className={`${dropzoneBase} ${dropState.isDragActive ? dropzoneActive : dropzoneIdle}`}>
      <input {...dropState.getInputProps()} />
      {file ? (
        <div className="flex items-center justify-center gap-2 font-body text-sm text-sage-600">
          <MdCloudUpload className="text-lg" />
          <span className="max-w-[220px] truncate">{file.name}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="ml-1 text-primary-500 hover:text-primary-600"
          >
            <MdClose className="text-base" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 font-body text-sm text-charcoal-400">
          <MdCloudUpload className="text-xl" />
          <span>{placeholder}</span>
        </div>
      )}
    </div>
  );

  const existingTitleDeed = p.documents?.titleDeed ? { name: 'Title Deed', existing: true } : null;
  const existingFloorPlan = p.documents?.floorPlan ? { name: 'Floor Plan', existing: true } : null;
  const existingPhotos = (p.documents?.photos || []).map((url, i) => ({ name: `Photo ${i + 1}`, preview: url, existing: true }));

  const effectiveTitleDeed = titleDeedRemoved ? null : (titleDeedFile || existingTitleDeed);
  const effectiveFloorPlan = floorPlanRemoved ? null : (floorPlanFile || existingFloorPlan);
  const effectivePhotosFiles = photosFiles.length > 0 ? photosFiles : existingPhotos;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Property">
      <div className="space-y-5">
        {/* Progress indicator */}
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  i === step
                    ? 'bg-primary-500 text-white'
                    : i < step
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-charcoal-100 text-charcoal-400'
                }`}
              >
                {i < step ? '\u2713' : i + 1}
              </div>
              <span
                className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${
                  i === step ? 'text-primary-600' : 'text-charcoal-400'
                }`}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-px w-10 ${i < step ? 'bg-primary-300' : 'bg-charcoal-200'}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 1: Location ── */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Region <span className="text-primary-500 text-base leading-none">*</span></label>
              <Controller
                name="address.region"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onChange={field.onChange} options={REGIONS} placeholder="Select Region" />
                )}
              />
              {errors.address?.region && <p className="mt-1 font-body text-xs text-primary-500">{errors.address.region.message}</p>}
            </div>
            <div>
              <label className={labelClass}>City / Sub-city <span className="text-primary-500 text-base leading-none">*</span></label>
              <Controller
                name="address.city"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    options={cityOptions}
                    placeholder={region ? 'Select City' : 'Select a region first'}
                    className={!region ? 'pointer-events-none opacity-50' : ''}
                  />
                )}
              />
              {errors.address?.city && <p className="mt-1 font-body text-xs text-primary-500">{errors.address.city.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Woreda No." name="address.woreda" required prefix="No." min={1} error={errors.address?.woreda?.message} {...register('address.woreda')} />
              <NumberInput label="Kebele No." name="address.kebele" required prefix="No." min={1} error={errors.address?.kebele?.message} {...register('address.kebele')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  House Number <span className="text-primary-500 text-base leading-none">*</span>
                </label>
                <input {...register('address.houseNumber')} className={inputClass} placeholder="e.g. 950, 114A" />
                {errors.address?.houseNumber && <p className="mt-1 font-body text-xs text-primary-500">{errors.address.houseNumber.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Landmark / Description</label>
                <input {...register('address.landmark')} className={inputClass} placeholder="Near school, market..." />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Details ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Property Type <span className="text-primary-500 text-base leading-none">*</span></label>
              <Controller
                name="propertyType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onChange={field.onChange} options={propertyTypeOptions} placeholder="Select Property Type" />
                )}
              />
              {errors.propertyType && <p className="mt-1 font-body text-xs text-primary-500">{errors.propertyType.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="Number of Floors"
                name="floors"
                required
                min={1}
                max={99}
                disabled={propertyType in typeFloorsMapLocal}
                error={errors.floors?.message}
                {...register('floors')}
              />
              <NumberInput label="Year Built" name="yearBuilt" optional min={1900} max={2026} error={errors.yearBuilt?.message} {...register('yearBuilt')} />
            </div>
            {propertyType in typeFloorsMapLocal && propertyType && (
              <p className="-mt-1 font-body text-[11px] text-charcoal-400">Fixed for this property type</p>
            )}

            <AnimatePresence mode="wait">
              {['APARTMENT', 'CONDOMINIUM'].includes(propertyType) && (
                <motion.div
                  key="floorNumber"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <NumberInput
                    label="Floor Number"
                    name="floorNumber"
                    required
                    min={0}
                    max={Number(floors) || 99}
                    disabled={!floors}
                    error={errors.floorNumber?.message}
                    helperText="Which floor is this unit located on?"
                    {...register('floorNumber')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Step 3: Documents ── */}
        {step === 2 && (
          <div className="overflow-y-auto max-h-[340px] space-y-3 pr-1 -mr-1">
            <div>
              <label className={labelClass}>Title Deed (ካርታ) <span className="text-primary-500 text-base leading-none">*</span></label>
              <p className="mb-1 font-body text-[11px] text-charcoal-400">Required by Proclamation 1320/2024 — Max 10 MB</p>
              {renderDropzone(titleDeedDrop, effectiveTitleDeed, () => { setTitleDeedFile(null); setTitleDeedRemoved(true); setTitleDeedError(''); }, 'Drop PDF or image here, or click to browse')}
              {titleDeedError && <p className="mt-1 font-body text-xs text-primary-500">{titleDeedError}</p>}
            </div>
            <div>
              <label className={labelClass}>Floor Plan / House Map</label>
              <p className="mb-1 font-body text-[11px] text-charcoal-400">(optional) Max 10 MB</p>
              {renderDropzone(floorPlanDrop, effectiveFloorPlan, () => { setFloorPlanFile(null); setFloorPlanRemoved(true); setFloorPlanError(''); }, 'Drop PDF or image here, or click to browse')}
              {floorPlanError && <p className="mt-1 font-body text-xs text-primary-500">{floorPlanError}</p>}
            </div>
            <div>
              <label className={labelClass}>Property Photos</label>
              <p className="mb-1 font-body text-[11px] text-charcoal-400">(optional) Max 5 images, 5 MB each</p>
              <div {...photosDrop.getRootProps()} className={`${dropzoneBase} ${photosDrop.isDragActive ? dropzoneActive : dropzoneIdle}`}>
                <input {...photosDrop.getInputProps()} />
                <div className="flex flex-col items-center gap-1 font-body text-sm text-charcoal-400">
                  <MdCloudUpload className="text-xl" />
                  <span>Drop images here, or click to browse</span>
                  <span className="text-[11px]">{effectivePhotosFiles.length}/5 selected</span>
                </div>
              </div>
              {photosError && <p className="mt-1 font-body text-xs text-primary-500">{photosError}</p>}
              {effectivePhotosFiles.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {effectivePhotosFiles.map((file, idx) => (
                    <div key={`${file.name}-${idx}`} className="group relative h-14 w-14 overflow-hidden rounded-lg border border-charcoal-200">
                      <img
                        src={file.preview || URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <MdClose className="text-[10px]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className={labelClass}>TIN Number <span className="text-primary-500 text-base leading-none">*</span></label>
              <p className="mb-1 font-body text-[11px] text-charcoal-400">Tax Identification Number</p>
              <input {...register('tinNumber')} className={inputClass} placeholder="e.g. 1234567890" />
              {errors.tinNumber && <p className="mt-1 font-body text-xs text-primary-500">{errors.tinNumber.message}</p>}
            </div>
          </div>
        )}

        {/* Error */}
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
            {serverError}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {step > 0 ? (
            <button type="button" onClick={handleBack} className={`${btnBase} border border-charcoal-300 bg-white text-charcoal-900 hover:border-charcoal-400 hover:bg-charcoal-50`}>
              Back
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={handleNext} className={`${btnBase} bg-primary-500 text-white shadow-[0_12px_28px_rgba(232,93,58,0.22)] hover:bg-primary-600 hover:shadow-[0_16px_34px_rgba(232,93,58,0.28)]`}>
              Next
            </button>
          ) : (
            <button
              type="button"
              disabled={isSaving || operationLoading}
              onClick={handleSave}
              className={`${btnBase} bg-primary-500 text-white shadow-[0_12px_28px_rgba(232,93,58,0.22)] hover:bg-primary-600 hover:shadow-[0_16px_34px_rgba(232,93,58,0.28)]`}
            >
              {isSaving || operationLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default EditPropertyModal;
