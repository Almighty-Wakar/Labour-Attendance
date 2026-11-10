import React, { useState, useMemo } from 'react';
import { Labour, AttendanceRecord, AppSettings } from '../types';
import { getMonthDays, formatCurrency, toDateStr } from '../utils/calculations';
import { ChevronLeft, ChevronRight, Grid3X3, Printer } from 'lucide-react';

interface MonthlyMatrixViewProps {
  labourers: Labour[];
  attendance: AttendanceRecord[];
  onUpdateAttendance: (record: AttendanceRecord) => void;
  settings: AppSettings;
}

export const MonthlyMatrixView: React.FC<MonthlyMatrixViewProps> = ({
  labourers,
  attendance,
  onUpdateAttendance,
  settings,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed

  // Active workers
  const activeLabourers = useMemo(() => {
    return labourers.filter((l) => l.status === 'active');
  }, [labourers]);

  // Days in selected month
  const monthDates = useMemo(() => {
    return getMonthDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Map of attendance key: `${labourId}_${date}` -> AttendanceRecord
  const attendanceLookup = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendance.forEach((r) => {
      map.set(`${r.labourId}_${r.date}`, r);
    });
    return map;
  }, [attendance]);

  const monthLabel = useMemo(() => {
    const d = new Date(currentYear, currentMonth, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Quick cycle status on click: not_marked -> present -> half_day -> absent -> not_marked
  const handleCellClick = (labourId: string, dateStr: string) => {
    const key = `${labourId}_${dateStr}`;
    const existing = attendanceLookup.get(key);
    const currentStatus = existing?.status || 'not_marked';

    let nextStatus: 'present' | 'half_day' | 'absent' | 'not_marked' = 'present';
    if (currentStatus === 'present') nextStatus = 'half_day';
    else if (currentStatus === 'half_day') nextStatus = 'absent';
    else if (currentStatus === 'absent') nextStatus = 'not_marked';
    else nextStatus = 'present';

    const updated: AttendanceRecord = {
      id: existing ? existing.id : key,
      labourId,
      date: dateStr,
      status: nextStatus,
      overtimeHours: existing?.overtimeHours || 0,
      siteLocation: existing?.siteLocation || '',
      notes: existing?.notes || '',
      updatedAt: new Date().toISOString(),
    };
    onUpdateAttendance(updated);
  };

  return (
    <div className="space-y-6">
      {/* Month Navigator Header */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-amber-500" />
              <span>Monthly Attendance Master Grid</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Click any day cell to quickly toggle status (Present → Half Day → Absent → Clear)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white min-w-[130px] text-center">
                {monthLabel}
              </span>

              <button
                onClick={handleNextMonth}
                className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700"
            >
              <Printer className="w-4 h-4" />
              <span>Print Matrix</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">P</span>
            <span className="text-neutral-600 dark:text-neutral-400">Present (1.0 d)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-amber-500 text-neutral-950 font-bold flex items-center justify-center text-[10px]">HD</span>
            <span className="text-neutral-600 dark:text-neutral-400">Half Day (0.5 d)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-rose-600 text-white font-bold flex items-center justify-center text-[10px]">A</span>
            <span className="text-neutral-600 dark:text-neutral-400">Absent (0.0 d)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-400 font-bold flex items-center justify-center text-[10px]">-</span>
            <span className="text-neutral-600 dark:text-neutral-400">Not Marked</span>
          </div>
          <div className="flex items-center gap-1 text-amber-600 font-semibold text-[11px]">
            <span>· Small badge (+2) indicates overtime hours</span>
          </div>
        </div>
      </div>

      {/* Cross-Tab Matrix Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
              <tr>
                <th className="px-4 py-3 sticky left-0 z-10 bg-neutral-50 dark:bg-neutral-800 font-bold min-w-[160px] border-r border-neutral-200 dark:border-neutral-700">
                  Labour / Trade
                </th>
                {monthDates.map((dateStr) => {
                  const d = new Date(dateStr);
                  const dayNum = d.getDate();
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
                  const isSunday = d.getDay() === 0;
                  const isCurrentDay = dateStr === toDateStr(new Date());

                  return (
                    <th
                      key={dateStr}
                      className={`p-1.5 text-center font-mono border-r border-neutral-200 dark:border-neutral-700/60 min-w-[32px] ${
                        isSunday
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 text-rose-600'
                          : isCurrentDay
                          ? 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 font-bold'
                          : ''
                      }`}
                    >
                      <div className="text-[10px] uppercase text-neutral-400">{dayName}</div>
                      <div className="text-xs font-bold">{dayNum}</div>
                    </th>
                  );
                })}
                <th className="px-3 py-3 text-center font-bold min-w-[60px] bg-neutral-100 dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700">
                  Total (d)
                </th>
                <th className="px-3 py-3 text-right font-bold min-w-[90px] bg-neutral-100 dark:bg-neutral-800">
                  Month Wages
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
              {activeLabourers.map((labour) => {
                let pCount = 0;
                let hdCount = 0;
                let aCount = 0;
                let otHours = 0;

                monthDates.forEach((dStr) => {
                  const rec = attendanceLookup.get(`${labour.id}_${dStr}`);
                  if (rec?.status === 'present') pCount += 1;
                  else if (rec?.status === 'half_day') hdCount += 1;
                  else if (rec?.status === 'absent') aCount += 1;
                  if (rec?.overtimeHours) otHours += rec.overtimeHours;
                });

                const effective = pCount + hdCount * 0.5;
                const otRate = labour.overtimeHourlyRate || Math.round(labour.dailyWage / 8);
                const monthEarnings = effective * labour.dailyWage + otHours * otRate;

                return (
                  <tr
                    key={labour.id}
                    className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    {/* Worker Name Column (Sticky left) */}
                    <td className="px-4 py-2 sticky left-0 z-10 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700">
                      <div className="font-bold text-neutral-900 dark:text-white truncate font-sans text-xs">
                        {labour.name}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-sans truncate">
                        {labour.role}
                      </div>
                    </td>

                    {/* Day Cells */}
                    {monthDates.map((dateStr) => {
                      const rec = attendanceLookup.get(`${labour.id}_${dateStr}`);
                      const status = rec?.status || 'not_marked';
                      const ot = rec?.overtimeHours || 0;
                      const isSunday = new Date(dateStr).getDay() === 0;

                      return (
                        <td
                          key={dateStr}
                          onClick={() => handleCellClick(labour.id, dateStr)}
                          className={`p-1 text-center cursor-pointer select-none border-r border-neutral-100 dark:border-neutral-800 transition-colors hover:opacity-80 ${
                            isSunday ? 'bg-neutral-50/60 dark:bg-neutral-800/20' : ''
                          }`}
                          title={`${labour.name} on ${dateStr}: ${status.toUpperCase()} ${ot > 0 ? `(${ot}h OT)` : ''}`}
                        >
                          <div className="relative inline-block">
                            {status === 'present' ? (
                              <span className="w-6 h-6 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-[11px] shadow-2xs">
                                P
                              </span>
                            ) : status === 'half_day' ? (
                              <span className="w-6 h-6 rounded bg-amber-500 text-neutral-950 font-bold flex items-center justify-center text-[10px] shadow-2xs">
                                HD
                              </span>
                            ) : status === 'absent' ? (
                              <span className="w-6 h-6 rounded bg-rose-600 text-white font-bold flex items-center justify-center text-[11px] shadow-2xs">
                                A
                              </span>
                            ) : (
                              <span className="w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center text-xs">
                                -
                              </span>
                            )}

                            {ot > 0 && (
                              <span className="absolute -top-1 -right-1.5 px-0.5 py-0 bg-neutral-900 text-amber-300 text-[8px] font-bold rounded">
                                +{ot}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Effective Days Summary */}
                    <td className="px-3 py-2 text-center font-bold text-neutral-900 dark:text-white bg-neutral-50/50 dark:bg-neutral-800/40 border-l border-neutral-200 dark:border-neutral-700">
                      {effective}d
                    </td>

                    {/* Month Wages Summary */}
                    <td className="px-3 py-2 text-right font-bold text-neutral-900 dark:text-white bg-neutral-50/50 dark:bg-neutral-800/40">
                      {formatCurrency(monthEarnings, settings.currencySymbol)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
