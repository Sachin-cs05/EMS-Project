const statusMap = {
  active: 'badge-green', inactive: 'badge-gray', on_leave: 'badge-yellow', terminated: 'badge-red',
  present: 'badge-green', absent: 'badge-red', late: 'badge-yellow', half_day: 'badge-blue', holiday: 'badge-purple',
  pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red', cancelled: 'badge-gray',
  sick: 'badge-red', casual: 'badge-blue', earned: 'badge-purple',
};

export default function Badge({ status, children }) {
  const cls = statusMap[status] || 'badge-gray';
  return (
    <span className={`badge ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {children || status?.replace('_', ' ')}
    </span>
  );
}
