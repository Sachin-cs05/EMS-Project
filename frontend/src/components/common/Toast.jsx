import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiX } from 'react-icons/hi';
import { hideToast } from '../../features/ui/uiSlice';

const icons = {
  success: <HiCheckCircle      size={20} className="text-green-500" />,
  error:   <HiXCircle          size={20} className="text-red-500" />,
  info:    <HiInformationCircle size={20} className="text-blue-500" />,
};

export default function Toast() {
  const dispatch = useDispatch();
  const toast    = useSelector((s) => s.ui.toast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => dispatch(hideToast()), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl
                       bg-white dark:bg-[#1a1a2e] shadow-card-lg border border-gray-100
                       dark:border-white/10 min-w-[280px] max-w-sm"
          >
            {icons[toast.type] || icons.info}
            <p className="text-sm font-medium text-gray-800 dark:text-white flex-1">{toast.message}</p>
            <button onClick={() => dispatch(hideToast())} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
              <HiX size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
