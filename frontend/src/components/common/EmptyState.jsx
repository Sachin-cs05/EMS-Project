import { HiOutlineInbox } from 'react-icons/hi';

export default function EmptyState({ title = 'No data found', description = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-4">
        <HiOutlineInbox size={28} className="text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
      {description && <p className="text-xs text-gray-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
