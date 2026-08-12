import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '../common/index.jsx';

export default function AttendanceTrendChart({ data, loading }) {
  if (loading) return <Skeleton className="h-52 w-full" />;
  if (!data?.length) return <p className="text-xs text-gray-400 text-center py-16">No data available</p>;

  const formatted = data.map((d) => ({
    ...d,
    date: d._id ? new Date(d._id).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : d.date,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={16}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgb(0 0 0/0.12)', fontSize: 12 }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="present" fill="#10b981" name="Present" radius={[4,4,0,0]} />
        <Bar dataKey="late"    fill="#f59e0b" name="Late"    radius={[4,4,0,0]} />
        <Bar dataKey="absent"  fill="#ef4444" name="Absent"  radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
