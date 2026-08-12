import Modal from './Modal';
import { HiOutlineExclamation } from 'react-icons/hi';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="text-center pb-2">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <HiOutlineExclamation size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
                       bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50">
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
