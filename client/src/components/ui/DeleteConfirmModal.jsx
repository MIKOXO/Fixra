import Modal from './Modal';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, message, title }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirm Delete'}>
    <p className="font-body text-sm leading-relaxed text-charcoal-600">{message}</p>
    <div className="mt-6 flex justify-end gap-3">
      <button
        onClick={onClose}
        className="rounded-xl border border-charcoal-200/90 bg-white px-5 py-2.5 font-heading text-sm font-semibold text-charcoal-900 transition-colors hover:bg-charcoal-50"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className="rounded-xl bg-primary-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600"
      >
        Delete
      </button>
    </div>
  </Modal>
);

export default DeleteConfirmModal;