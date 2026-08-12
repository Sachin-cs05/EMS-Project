import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { Skeleton } from '../common/index.jsx';

const LEAVE_COLORS = { sick: '#ef4444', casual: '#6366f1', earned: '#10b981' };

export default function LeaveStatsChart({ data, loading }) {
  if (loading) return <Skeleton className="h-52 w-full" />;
  if (!data?.length) return <p className="text-xs text-gray-400 text-center py-16">No data available</p>;

  const formatted = data.map((d) => ({ name: d._id, count: d.count }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={40}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgb(0 0 0/0.12)', fontSize: 12 }} />
        <Bar dataKey="count" name="Leaves" radius={[6,6,0,0]}>
          {formatted.map((entry, i) => <Cell key={i} fill={LEAVE_COLORS[entry.name] || '#6366f1'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
