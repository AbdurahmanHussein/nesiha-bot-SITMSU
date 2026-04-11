import { useState, useEffect } from 'react';
import { EthDateTime } from 'ethiopian-calendar-date-converter';

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getHijriDate = (date) => {
    return new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getEthiopianDate = (date) => {
    try {
      const ethDate = EthDateTime.fromEuropeanDate(date);
      // toDateWithDayString formats like "Tuesday, 1 Miyazya 2018"
      return ethDate.toDateWithDayString();
    } catch {
      return "Unavailable";
    }
  };

  const shiftDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const isToday = new Date().toDateString() === currentDate.toDateString();

  return (
    <div className="card" style={{ marginBottom: 24, padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Multi-Calendar Widget</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '13px', margin: '4px 0 0 0' }}>Plan ahead across different date systems</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => shiftDate(-1)}>← Prev Day</button>
          {!isToday && <button className="btn btn-primary btn-sm" onClick={() => setCurrentDate(new Date())}>Today</button>}
          <button className="btn btn-outline btn-sm" onClick={() => shiftDate(1)}>Next Day →</button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 0, gap: '16px' }}>
        <div className="stat-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Gregorian</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gray-900)' }}>
            {new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(currentDate)}
          </div>
        </div>

        <div className="stat-card" style={{ padding: '20px', background: 'var(--primary-50)', borderColor: 'var(--primary-200)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Hijri (Islamic)</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-900)' }}>
            {getHijriDate(currentDate)}
          </div>
        </div>

        <div className="stat-card" style={{ padding: '20px', background: '#fffbeb', borderColor: '#fde68a' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#92400e', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Ethiopian</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#92400e' }}>
            {getEthiopianDate(currentDate)}
          </div>
        </div>
      </div>
    </div>
  );
}
