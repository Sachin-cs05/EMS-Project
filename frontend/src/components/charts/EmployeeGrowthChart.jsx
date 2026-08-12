import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '../common/index.jsx';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function EmployeeGrowthChart({ data, loading }) {
  if (loading) return <Skeleton className="h-52 w-full" />;
  if (!data?.length) return <p className="text-xs text-gray-400 text-center py-16">No data available</p>;

  const formatted = data.map((d) => ({
    name:  `${MONTHS[d._id.month]} '${String(d._id.year).slice(2)}`,
    count: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formatted} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgb(0 0 0/0.12)', fontSize: 12 }} />
        <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#growthGrad)" name="New Employees" dot={{ r: 3, fill: '#6366f1' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
