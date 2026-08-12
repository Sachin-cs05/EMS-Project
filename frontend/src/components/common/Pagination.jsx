import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4)       return Array.from({ length: 7 }, (_, i) => i + 1);
    if (page >= totalPages - 3) return Array.from({ length: 7 }, (_, i) => totalPages - 6 + i);
    return Array.from({ length: 7 }, (_, i) => page - 3 + i);
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40">
        <HiChevronLeft size={16} />
      </button>
      {getPages().map((p) => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
            ${p === page ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40">
        <HiChevronRight size={16} />
      </button>
    </div>
  );
}
