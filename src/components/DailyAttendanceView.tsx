import React, { useState, useMemo } from 'react';
import { Labour, AttendanceRecord, AttendanceStatus, AppSettings } from '../types';
import { formatCurrency, toDateStr } from '../utils/calculations';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Search, 
  CheckCheck, 
  XCircle, 
  Clock, 
  Plus, 
  Minus,
  MapPin,
  DollarSign,
  Users
} from 'lucide-react';

interface DailyAttendanceViewProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  labourers: Labour[];
  attendance: AttendanceRecord[];
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onBulkUpdateAttendance: (records: AttendanceRecord[]) => void;
  onOpenAdvanceModal: (labourId: string) => void;
  onOpenAddLabour: () => void;
  settings: AppSettings;
}

export const DailyAttendanceView: React.FC<DailyAttendanceViewProps> = ({
  selectedDate,
  setSelectedDate,
  labourers,
  attendance,
  onUpdateAttendance,
  onBulkUpdateAttendance,
  onOpenAdvanceModal,
  onOpenAddLabour,
  settings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  // Filter only active workers
  const activeLabourers = useMemo(() => {
    return labourers.filter((l) => l.status === 'active');
  }, [labourers]);

  // Unique roles for filter dropdown
  const roles = useMemo(() => {
    const set = new Set(activeLabourers.map((l) => l.role));
    return ['all', ...Array.from(set)];
  }, [activeLabourers]);

  // Filtered workers based on search and role
  const displayedLabourers = useMemo(() => {
    return activeLabourers.filter((l) => {
      const matchesSearch =
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.workerCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'all' || l.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [activeLabourers, searchQuery, selectedRole]);

  // Map of attendance for the current selected date
  const todayRecordsMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendance
      .filter((r) => r.date === selectedDate)
      .forEach((r) => {
        map.set(r.labourId, r);
      });
    return map;
  }, [attendance, selectedDate]);

  // Calculate day KPI metrics
  const dayStats = useMemo(() => {
    let present = 0;
    let halfDay = 0;
    let absent = 0;
    let totalWageLiability = 0;
    let totalOtHours = 0;

    activeLabourers.forEach((labour) => {
      const record = todayRecordsMap.get(labour.id);
      const status = record?.status;
      const ot = record?.overtimeHours || 0;
      const otRate = labour.overtimeHourlyRate || Math.round(labour.dailyWage / 8);

      if (status === 'present') {
        present += 1;
        totalWageLiability += labour.dailyWage + ot * otRate;
      } else if (status === 'half_day') {
        halfDay += 1;
        totalWageLiability += labour.dailyWage * 0.5 + ot * otRate;
      } else if (status === 'absent') {
        absent += 1;
      }

      totalOtHours += ot;
    });

    const notMarked = activeLabourers.length - (present + halfDay + absent);

    return {
      present,
      halfDay,
      absent,
      notMarked,
      totalWageLiability,
      totalOtHours,
    };
  }, [activeLabourers, todayRecordsMap]);

  // Date Navigation Handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(toDateStr(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(toDateStr(d));
  };

  const handleTodayJump = () => {
    setSelectedDate(toDateStr(new Date()));
  };

  // Status Change Handler
  const handleStatusChange = (labourId: string, newStatus: AttendanceStatus) => {
    const existing = todayRecordsMap.get(labourId);
    const updated: AttendanceRecord = {
      id: existing ? existing.id : `${labourId}_${selectedDate}`,
      labourId,
      date: selectedDate,
      status: newStatus,
      overtimeHours: existing?.overtimeHours || 0,
      siteLocation: existing?.siteLocation || '',
      notes: existing?.notes || '',
      updatedAt: new Date().toISOString(),
    };
    onUpdateAttendance(updated);
  };

  // Overtime adjust handler
  const handleOvertimeChange = (labourId: string, delta: number) => {
    const existing = todayRecordsMap.get(labourId);
    const currentOt = existing?.overtimeHours || 0;
    const newOt = Math.max(0, Math.min(12, currentOt + delta));

    const updated: AttendanceRecord = {
      id: existing ? existing.id : `${labourId}_${selectedDate}`,
      labourId,
      date: selectedDate,
      status: existing?.status || 'present', // auto default to present if adding OT
      overtimeHours: newOt,
      siteLocation: existing?.siteLocation || '',
      notes: existing?.notes || '',
      updatedAt: new Date().toISOString(),
    };
    onUpdateAttendance(updated);
  };

  // Notes change handler
  const handleNotesChange = (labourId: string, notes: string) => {
    const existing = todayRecordsMap.get(labourId);
    const updated: AttendanceRecord = {
      id: existing ? existing.id : `${labourId}_${selectedDate}`,
      labourId,
      date: selectedDate,
      status: existing?.status || 'not_marked',
      overtimeHours: existing?.overtimeHours || 0,
      siteLocation: existing?.siteLocation || '',
      notes,
      updatedAt: new Date().toISOString(),
    };
    onUpdateAttendance(updated);
  };

  // Bulk actions
  const handleBulkMark = (status: AttendanceStatus) => {
    const updates: AttendanceRecord[] = displayedLabourers.map((l) => {
      const existing = todayRecordsMap.get(l.id);
      return {
        id: existing ? existing.id : `${l.id}_${selectedDate}`,
        labourId: l.id,
        date: selectedDate,
        status,
        overtimeHours: existing?.overtimeHours || 0,
        siteLocation: existing?.siteLocation || '',
        notes: existing?.notes || '',
        updatedAt: new Date().toISOString(),
      };
    });
    onBulkUpdateAttendance(updates);
  };

  const isToday = selectedDate === toDateStr(new Date());

  const formattedDateHeader = useMemo(() => {
    const d = new Date(selectedDate);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* Top Controls: Date Navigator & Quick Stats */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          {/* Date Navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDay}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-700"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <CalendarIcon className="w-4 h-4 text-[#5C2D91]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs sm:text-sm font-semibold bg-transparent text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
              />
              <span className="hidden md:inline text-xs font-medium text-neutral-500 dark:text-neutral-400 border-l border-neutral-300 dark:border-neutral-600 pl-2">
                {formattedDateHeader}
              </span>
            </div>

            <button
              onClick={handleNextDay}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-700"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isToday && (
              <button
                onClick={handleTodayJump}
                className="px-2.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Today
              </button>
            )}
          </div>

          {/* Quick Bulk Operations */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 hidden lg:inline">Quick Roll Call:</span>
            <button
              onClick={() => handleBulkMark('present')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>All Present</span>
            </button>
            <button
              onClick={() => handleBulkMark('absent')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg transition-colors border border-rose-200 dark:border-rose-800"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>All Absent</span>
            </button>
          </div>
        </div>

        {/* Day Metric KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <div className="text-[11px] font-semibold text-neutral-500 uppercase">On Roster</div>
            <div className="text-lg font-bold text-neutral-900 dark:text-white tabular-nums font-mono mt-0.5">
              {activeLabourers.length} workers
            </div>
          </div>

          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40">
            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
              Present (1.0)
            </div>
            <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300 tabular-nums font-mono mt-0.5">
              {dayStats.present}
            </div>
          </div>

          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase">
              Half Day (0.5)
            </div>
            <div className="text-lg font-bold text-amber-800 dark:text-amber-300 tabular-nums font-mono mt-0.5">
              {dayStats.halfDay}
            </div>
          </div>

          <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-lg border border-rose-200/60 dark:border-rose-900/40">
            <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase">
              Absent (0)
            </div>
            <div className="text-lg font-bold text-rose-800 dark:text-rose-300 tabular-nums font-mono mt-0.5">
              {dayStats.absent}
            </div>
          </div>

          <div className="p-3 col-span-2 sm:col-span-1 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-[11px] font-bold text-[#5C2D91] uppercase">
              Wage Liability Today
            </div>
            <div className="text-lg font-extrabold text-[#5C2D91] tabular-nums font-mono mt-0.5">
              {formatCurrency(dayStats.totalWageLiability, settings.currencySymbol)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search labour by name or worker ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5C2D91]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#5C2D91]"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r === 'all' ? 'All Trades / Roles' : r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Labour Daily Roll Call Cards */}
      {displayedLabourers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <Users className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            No labourers match your search
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Try adjusting your search query or trade filter, or add a new worker.
          </p>
          <button
            onClick={onOpenAddLabour}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#5C2D91] hover:bg-[#4E247D] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Labour</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedLabourers.map((labour) => {
            const record = todayRecordsMap.get(labour.id);
            const status: AttendanceStatus = record?.status || 'not_marked';
            const ot = record?.overtimeHours || 0;
            const otRate = labour.overtimeHourlyRate || Math.round(labour.dailyWage / 8);

            // Compute today's payout for this labour
            let todayWage = 0;
            if (status === 'present') todayWage += labour.dailyWage;
            else if (status === 'half_day') todayWage += labour.dailyWage * 0.5;
            const todayOt = ot * otRate;
            const totalEarnedToday = todayWage + todayOt;

            return (
              <div
                key={labour.id}
                className={`bg-white dark:bg-neutral-900 rounded-xl border transition-all p-4 ${
                  status === 'present'
                    ? 'border-emerald-300/70 dark:border-emerald-800/60 shadow-xs'
                    : status === 'half_day'
                    ? 'border-amber-300/70 dark:border-amber-800/60 shadow-xs'
                    : status === 'absent'
                    ? 'border-rose-300/70 dark:border-rose-800/60 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Worker Info */}
                  <div className="flex items-start gap-3 min-w-[240px]">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 font-mono shrink-0">
                      {labour.workerCode}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                          {labour.name}
                        </h4>
                        <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                          · {labour.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        <span>
                          Daily Rate: <strong className="text-neutral-900 dark:text-white font-mono">{formatCurrency(labour.dailyWage, settings.currencySymbol)}</strong>
                        </span>
                        <span>·</span>
                        <span>
                          OT: <strong className="text-neutral-900 dark:text-white font-mono">{formatCurrency(otRate, settings.currencySymbol)}/h</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tactile Attendance Status Selector */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(labour.id, 'present')}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                        status === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Present (P)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(labour.id, 'half_day')}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                        status === 'half_day'
                          ? 'bg-amber-500 text-neutral-950 shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Half Day (HD)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(labour.id, 'absent')}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                        status === 'absent'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      <span>Absent (A)</span>
                    </button>
                  </div>

                  {/* Overtime Adjuster */}
                  <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800/70 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 shrink-0">
                    <span className="text-[11px] font-semibold text-neutral-500 uppercase">
                      Overtime:
                    </span>
                    <button
                      type="button"
                      disabled={ot <= 0}
                      onClick={() => handleOvertimeChange(labour.id, -0.5)}
                      className="p-1 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold text-xs tabular-nums text-neutral-900 dark:text-white min-w-[32px] text-center">
                      {ot}h
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOvertimeChange(labour.id, 0.5)}
                      className="p-1 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    {ot > 0 && (
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 font-mono pl-1">
                        (+{formatCurrency(todayOt, settings.currencySymbol)})
                      </span>
                    )}
                  </div>

                  {/* Today Total Calculated Amount & Quick Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100 dark:border-neutral-800">
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-neutral-500 uppercase block">
                        Today Total
                      </span>
                      <span className="text-sm font-extrabold text-neutral-900 dark:text-white tabular-nums font-mono">
                        {status === 'not_marked'
                          ? 'Not Marked'
                          : formatCurrency(totalEarnedToday, settings.currencySymbol)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenAdvanceModal(labour.id)}
                      className="px-2.5 py-1.5 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700"
                      title="Log Cash Advance or Deduction"
                    >
                      + Advance
                    </button>
                  </div>
                </div>

                {/* Optional Day Note / Task location */}
                <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Worksite location or daily task note (e.g. 4th floor concrete slab, beam welding)..."
                    value={record?.notes || ''}
                    onChange={(e) => handleNotesChange(labour.id, e.target.value)}
                    className="text-xs text-neutral-600 dark:text-neutral-300 placeholder-neutral-400 bg-transparent w-full focus:outline-none focus:text-neutral-900 dark:focus:text-white"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
