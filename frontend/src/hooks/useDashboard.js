// ── hooks/useDashboard.js ─────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { getDashboardStatsApi, getDashboardChartsApi, getRecentActivityApi } from '../api/index.js';

export function useDashboard() {
  const [stats,           setStats]           = useState(null);
  const [charts,          setCharts]          = useState(null);
  const [activity,        setActivity]        = useState(null);
  const [statsLoading,    setStatsLoading]    = useState(true);
  const [chartsLoading,   setChartsLoading]   = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    getDashboardStatsApi()
      .then(({ data }) => setStats(data.data))
      .finally(() => setStatsLoading(false));

    getDashboardChartsApi()
      .then(({ data }) => setCharts(data.data))
      .finally(() => setChartsLoading(false));

    getRecentActivityApi()
      .then(({ data }) => setActivity(data.data))
      .finally(() => setActivityLoading(false));
  }, []);

  return { stats, charts, activity, statsLoading, chartsLoading, activityLoading };
}
