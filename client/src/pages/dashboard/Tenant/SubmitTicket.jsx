import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import {
  MdOutlineAddPhotoAlternate,
  MdClose,
  MdOutlineCloudUpload,
  MdOutlineDescription,
  MdOutlineTitle,
  MdOutlineCategory,
  MdOutlinePriorityHigh,
  MdCheckCircleOutline,
  MdErrorOutline,
} from 'react-icons/md';
import Select from '@components/ui/Select';
import Skeleton from '@components/ui/Skeleton';
import { createTicket, uploadTicketAttachment } from '@store/slices/ticketSlice';

const CATEGORY_OPTIONS = [
  { value: 'PLUMBING', label: 'Plumbing' },
  { value: 'ELECTRICAL', label: 'Electrical' },
  { value: 'STRUCTURAL', label: 'Structural' },
  { value: 'APPLIANCE', label: 'Appliance' },
  { value: 'HVAC', label: 'HVAC' },
  { value: 'OTHER', label: 'Other' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'EMERGENCY', label: 'Emergency' },
];

const ACCEPTED_MIME_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/quicktime': ['.mov'],
};

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 10;

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  priority: z.string().min(1, 'Priority is required'),
});

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.06,
    },
  },
};

const inputClass =
  'w-full rounded-xl border border-charcoal-200/90 bg-white px-3.5 py-2.5 font-body text-sm text-charcoal-700 outline-none transition duration-200 placeholder:text-charcoal-400 focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const labelClass =
  'font-body text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-600';

const SubmitTicket = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { submitting, operationLoading, error } = useSelector((s) => s.tickets);
  const [files, setFiles] = useState([]);
  const [notification, setNotification] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const notificationTimer = useRef(null);
  const revokeUrls = useRef([]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', category: '', priority: '' },
  });

  useEffect(() => {
    return () => {
      revokeUrls.current.forEach(URL.revokeObjectURL);
    };
  }, []);

  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    if (notificationTimer.current) clearTimeout(notificationTimer.current);
    notificationTimer.current = setTimeout(() => setNotification(null), 4000);
  }, []);

  const compressImage = useCallback(async (file) => {
    if (!file.type.startsWith('image/')) return file;
    try {
      return await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
    } catch {
      return file;
    }
  }, []);

  const onDrop = useCallback(
    async (accepted) => {
      const remaining = MAX_FILES - files.length;
      if (remaining <= 0) {
        showNotification('error', `Maximum ${MAX_FILES} files allowed.`);
        return;
      }
      const toAdd = accepted.slice(0, remaining);
      const processed = await Promise.all(
        toAdd.map(async (f) => {
          const compressed = f.type.startsWith('image/') ? await compressImage(f) : f;
          const preview = URL.createObjectURL(compressed);
          revokeUrls.current.push(preview);
          return Object.assign(compressed, { preview });
        })
      );
      setFiles((prev) => [...prev, ...processed]);
    },
    [files.length, compressImage, showNotification]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_MIME_TYPES,
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    onDropRejected: (rejections) => {
      const msg = rejections[0]?.errors?.[0]?.message;
      if (msg) showNotification('error', msg);
    },
  });

  const removeFile = useCallback((idx) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  const onSubmit = useCallback(
    async (formData) => {
      try {
        const result = await dispatch(createTicket(formData)).unwrap();
        const ticketId = result._id || result.id;

        if (files.length > 0) {
          setUploadProgress({ current: 0, total: files.length });
          for (let i = 0; i < files.length; i++) {
            await dispatch(uploadTicketAttachment({ id: ticketId, file: files[i] })).unwrap();
            setUploadProgress({ current: i + 1, total: files.length });
          }
        }

        setFiles([]);
        showNotification('success', 'Your maintenance request has been submitted.');
        setTimeout(() => navigate('/tenant/tickets'), 1200);
      } catch (err) {
        showNotification('error', err?.message || err || 'Something went wrong.');
      }
    },
    [dispatch, files, navigate, showNotification]
  );

  const isUploading = submitting || operationLoading;

  return (
    <div className="px-6 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl space-y-5"
      >
        <motion.div variants={itemVariants}>
          <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.35em] text-primary-500">
            Tenant dashboard
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-charcoal-950">
            Submit a Maintenance Request
          </h1>
          <p className="mt-1 font-body text-sm text-charcoal-500">
            Describe the issue and your landlord will be notified.
          </p>
        </motion.div>

        {notification && (
          <motion.div
            variants={itemVariants}
            className={`flex items-center gap-3 rounded-2xl border px-5 py-4 ${
              notification.type === 'success'
                ? 'border-sage-200/70 bg-sage-50'
                : 'border-primary-200/60 bg-primary-50/60'
            }`}
          >
            {notification.type === 'success' ? (
              <MdCheckCircleOutline className="shrink-0 text-lg text-sage-600" />
            ) : (
              <MdErrorOutline className="shrink-0 text-lg text-primary-500" />
            )}
            <span
              className={`flex-1 font-body text-sm ${
                notification.type === 'success' ? 'text-sage-700' : 'text-primary-700'
              }`}
            >
              {notification.message}
            </span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="shrink-0 text-lg leading-none opacity-60 transition-opacity hover:opacity-100"
            >
              &times;
            </button>
          </motion.div>
        )}

        <motion.form
          variants={itemVariants}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className={`${labelClass} mb-1 block`}>
                Title <span className="ml-0.5 text-primary-500">*</span>
              </label>
              <div className="relative">
                <MdOutlineTitle className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  id="title"
                  type="text"
                  placeholder="What needs fixing?"
                  disabled={isUploading}
                  {...register('title')}
                  className={`${inputClass} pl-10 ${errors.title ? 'border-primary-300 ring-4 ring-primary-50' : ''}`}
                />
              </div>
              {errors.title && (
                <p className="mt-1 font-body text-xs text-primary-500">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className={`${labelClass} mb-1 block`}>
                Description <span className="ml-0.5 text-primary-500">*</span>
              </label>
              <div className="relative">
                <MdOutlineDescription className="pointer-events-none absolute left-3.5 top-3.5 text-charcoal-400" />
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Describe the issue in detail..."
                  disabled={isUploading}
                  {...register('description')}
                  className={`${inputClass} min-h-[100px] resize-y pl-10 ${errors.description ? 'border-primary-300 ring-4 ring-primary-50' : ''}`}
                />
              </div>
              {errors.description && (
                <p className="mt-1 font-body text-xs text-primary-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={`${labelClass} mb-1 block`}>
                  Category <span className="ml-0.5 text-primary-500">*</span>
                </label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      options={CATEGORY_OPTIONS}
                      placeholder="Select category"
                      className={errors.category ? '[&>button]:border-primary-300 [&>button]:ring-4 [&>button]:ring-primary-50' : ''}
                    />
                  )}
                />
                {errors.category && (
                  <p className="mt-1 font-body text-xs text-primary-500">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className={`${labelClass} mb-1 block`}>
                  Priority <span className="ml-0.5 text-primary-500">*</span>
                </label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      options={PRIORITY_OPTIONS}
                      placeholder="Select priority"
                      className={errors.priority ? '[&>button]:border-primary-300 [&>button]:ring-4 [&>button]:ring-primary-50' : ''}
                    />
                  )}
                />
                <p className="mt-1 font-body text-[11px] text-charcoal-400">
                  Select Emergency only for issues posing immediate safety risk.
                </p>
                {errors.priority && (
                  <p className="mt-1 font-body text-xs text-primary-500">
                    {errors.priority.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className={`${labelClass} mb-1 block`}>
                Media{' '}
                <span className="font-normal lowercase text-charcoal-400">(optional, max {MAX_FILES})</span>
              </label>
              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                  isDragActive
                    ? 'border-primary-400 bg-primary-50/60'
                    : 'border-charcoal-200/70 bg-charcoal-50/30 hover:border-charcoal-300 hover:bg-charcoal-50/50'
                } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
              >
                <input {...getInputProps()} />
                <MdOutlineCloudUpload className="mx-auto text-2xl text-charcoal-400" />
                <p className="mt-1 font-body text-sm text-charcoal-500">
                  {isDragActive
                    ? 'Drop files here'
                    : 'Drag & drop photos or videos, or click to browse'}
                </p>
                <p className="mt-0.5 font-body text-[11px] text-charcoal-400">
                  JPG, PNG, WebP, GIF, MP4, WebM, MOV &mdash; max {MAX_FILE_SIZE_MB}MB each
                </p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {files.map((file, idx) => (
                  <div key={idx} className="group relative aspect-square overflow-hidden rounded-xl border border-charcoal-200/70 bg-charcoal-50">
                    {file.type.startsWith('video/') ? (
                      <video
                        src={file.preview}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={file.preview}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      disabled={isUploading}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-0"
                    >
                      <MdClose className="text-xs" />
                    </button>
                    <p className="absolute bottom-0 left-0 right-0 truncate bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1 pt-4 text-[10px] text-white">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {isUploading && uploadProgress.total > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-charcoal-500">
                  <span>Uploading attachments...</span>
                  <span>
                    {uploadProgress.current} of {uploadProgress.total}
                  </span>
                </div>
                <div className="relative h-1.5 rounded-full bg-charcoal-200/60">
                  <div
                    className="h-full rounded-full bg-primary-500 transition-all duration-300"
                    style={{
                      width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center gap-3 border-t border-charcoal-100 pt-4">
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 rounded-xl bg-primary-500 px-5 py-2 font-heading text-sm font-semibold text-white transition-all hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  {submitting ? 'Submitting...' : `Uploading (${uploadProgress.current}/${uploadProgress.total})...`}
                </span>
              ) : (
                'Submit Request'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/tenant')}
              disabled={isUploading}
              className="rounded-xl border border-charcoal-200/70 bg-white px-4 py-2 font-body text-sm font-medium text-charcoal-700 transition-colors hover:bg-charcoal-50 disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default SubmitTicket;
