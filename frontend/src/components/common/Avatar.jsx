export default function Avatar({ src, name = '', size = 'md' }) {
  const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
  const base = `${sizeMap[size]} rounded-full flex items-center justify-center font-semibold flex-shrink-0`;

  if (src) {
    return (
      <img src={src.startsWith('http') ? src : `${import.meta.env.VITE_API_URL?.replace('/api/v1','')}${src}`}
        alt={name} className={`${base} object-cover bg-gray-100`}
        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
    );
  }
  return (
    <div className={`${base} bg-gradient-to-br from-primary-400 to-purple-500 text-white`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}
