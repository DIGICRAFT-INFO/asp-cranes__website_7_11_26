'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function DashboardCalendar() {
  const [now, setNow] = useState(null);
  const [viewDate, setViewDate] = useState(null);

  // Only compute the "current" date on the client, after mount, so the
  // server-rendered markup and the first client render match exactly
  // (using `new Date()` during SSR would otherwise cause a hydration
  // mismatch since the server and browser clocks are never in sync).
  useEffect(() => {
    const initial = new Date();
    setNow(initial);
    setViewDate(new Date(initial.getFullYear(), initial.getMonth(), 1));
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const days = useMemo(() => {
    if (!viewDate) return [];
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewDate]);

  if (!now || !viewDate) {
    return <div className="admin-card h-[280px] animate-pulse" />;
  }

  const isCurrentMonth = now.getFullYear() === viewDate.getFullYear() && now.getMonth() === viewDate.getMonth();
  const changeMonth = (delta) => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="admin-card"
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" style={{ color: '#f87171' }} />
          <div>
            <p className="text-white text-sm font-semibold">
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              {now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => changeMonth(-1)} className="btn-ghost p-1.5" aria-label="Previous month">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-white flex items-center gap-1.5 min-w-[110px] justify-center">
            <CalendarDays className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
            {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
          </span>
          <button onClick={() => changeMonth(1)} className="btn-ghost p-1.5" aria-label="Next month">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-[10px] font-bold uppercase py-1" style={{ color: '#64748b' }}>
            {w}
          </div>
        ))}
        {days.map((d, i) => {
          const isToday = isCurrentMonth && d === now.getDate();
          return (
            <div
              key={i}
              className="text-xs py-1.5 rounded-lg"
              style={{
                color: d ? (isToday ? '#fff' : '#cbd5e1') : 'transparent',
                background: isToday ? '#dc2626' : 'transparent',
                fontWeight: isToday ? 700 : 400,
              }}
            >
              {d || '·'}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
