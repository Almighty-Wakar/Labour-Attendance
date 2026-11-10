import React from 'react';
import { 
  Labour, 
  AttendanceRecord, 
  AdvanceTransaction, 
  AppSettings, 
  ActiveTab 
} from '../types';
import { formatCurrency, toDateStr } from '../utils/calculations';
import { 
  CalendarCheck, 
  CheckCheck, 
  Clock, 
  DollarSign, 
  UserPlus, 
  Calculator, 
  Printer, 
  CreditCard, 
  Grid3X3, 
  FileSpreadsheet, 
  Building2, 
  Sliders, 
  Users, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Smartphone
} from 'lucide-react';

interface HomeDashboardViewProps {
  labourers: Labour[];
  attendance: AttendanceRecord[];
  advances: AdvanceTransaction[];
  settings: AppSettings;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddLabour: () => void;
  onOpenAdvanceModal: (labourId?: string) => void;
  onOpenSettings: () => void;
  onQuickMarkAll: (status: 'present' | 'absent') => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  labourers,
  attendance,
  advances,
  settings,
  setActiveTab,
  onOpenAddLabour,
  onOpenAdvanceModal,
  onOpenSettings,
  onQuickMarkAll,
}) => {
  const todayStr = toDateStr(new Date());
  const activeLabourers = labourers.filter((l) => l.status === 'active');

  // Today's attendance stats
  const todayRecords = attendance.filter((r) => r.date === todayStr);
  const presentCount = todayRecords.filter((r) => r.status === 'present').length;
  const halfDayCount = todayRecords.filter((r) => r.status === 'half_day').length;
  const absentCount = todayRecords.filter((r) => r.status === 'absent').length;
  const markedIds = new Set(todayRecords.map((r) => r.labourId));
  const unmarkedCount = activeLabourers.filter((l) => !markedIds.has(l.id)).length;

  // Calculate today's wage liability
  let todayWageLiability = 0;
  todayRecords.forEach((rec) => {
    const labour = labourers.find((l) => l.id === rec.labourId);
    if (!labour) return;
    if (rec.status === 'present') {
      todayWageLiability += labour.dailyWage;
    } else if (rec.status === 'half_day') {
      todayWageLiability += labour.dailyWage * 0.5;
    }
    if (rec.overtimeHours > 0) {
      todayWageLiability += rec.overtimeHours * labour.overtimeHourlyRate;
    }
  });

  // 4-Column Services Grid (Exact layout from the reference image)
  const servicesGrid = [
    {
      id: 'roll_call',
      label: 'Daily Roll',
      badge: 'Today',
      icon: CalendarCheck,
      onClick: () => setActiveTab('attendance'),
    },
    {
      id: 'all_present',
      label: 'All Present',
      badge: '1-Tap',
      icon: CheckCheck,
      onClick: () => onQuickMarkAll('present'),
    },
    {
      id: 'overtime',
      label: 'Overtime',
      badge: 'Hourly',
      icon: Clock,
      onClick: () => setActiveTab('attendance'),
    },
    {
      id: 'wage_calc',
      label: 'Wages',
      badge: 'Auto Calc',
      icon: Calculator,
      onClick: () => setActiveTab('payroll'),
    },
    {
      id: 'add_worker',
      label: 'Add Labour',
      badge: 'New',
      icon: UserPlus,
      onClick: onOpenAddLabour,
    },
    {
      id: 'advances',
      label: 'Advance Cash',
      badge: 'eSewa/Cash',
      icon: CreditCard,
      onClick: () => onOpenAdvanceModal(),
    },
    {
      id: 'payslips',
      label: 'Wage Slips',
      badge: 'Print PDF',
      icon: Printer,
      onClick: () => setActiveTab('payroll'),
    },
    {
      id: 'matrix',
      label: '30-Day Grid',
      badge: 'Monthly',
      icon: Grid3X3,
      onClick: () => setActiveTab('matrix'),
    },
    {
      id: 'roster',
      label: 'Directory',
      badge: `${activeLabourers.length} Labour`,
      icon: Users,
      onClick: () => setActiveTab('labourers'),
    },
    {
      id: 'export_csv',
      label: 'Excel Report',
      badge: 'Download',
      icon: FileSpreadsheet,
      onClick: () => setActiveTab('payroll'),
    },
    {
      id: 'site_info',
      label: 'Worksite',
      badge: 'Kathmandu',
      icon: Building2,
      onClick: onOpenSettings,
    },
    {
      id: 'settings',
      label: 'Settings',
      badge: 'NPR रू',
      icon: Sliders,
      onClick: onOpenSettings,
    },
  ];

  return (
    <div className="space-y-5 pb-24 select-none">
      {/* Services Grid Section (Matching reference image "Recharge & Bill Payments") */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-purple-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
              Labour Operations & Services
            </h2>
            <span className="w-1.5 h-1.5 rounded-full bg-[#5C2D91]" />
          </div>
          <span className="text-[11px] font-semibold text-[#5C2D91]">
            Tap any service
          </span>
        </div>

        {/* 4-Columns Grid */}
        <div className="grid grid-cols-4 gap-y-4 gap-x-2">
          {servicesGrid.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="flex flex-col items-center text-center group focus:outline-none p-1 rounded-xl transition-colors hover:bg-purple-50/60 active:scale-95"
              >
                {/* Purple outline/duotone icon container */}
                <div className="w-11 h-11 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex items-center justify-center text-[#5C2D91] group-hover:bg-[#5C2D91] group-hover:text-white transition-all shadow-2xs">
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>

                {/* English Label */}
                <span className="text-xs font-semibold text-neutral-800 mt-1.5 leading-tight group-hover:text-[#5C2D91]">
                  {item.label}
                </span>

                {/* Vibrant Pink Pill Badge (Matching Khalti 1-3% Cashback pills) */}
                <span className="mt-1 px-2 py-0.5 rounded-full bg-pink-600 text-white font-bold text-[9px] tracking-tight leading-none shadow-2xs whitespace-nowrap">
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's Live Attendance Snapshot Card */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-purple-100 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Today's Attendance Status
            </h3>
            <p className="text-sm font-bold text-neutral-900 mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('attendance')}
            className="flex items-center gap-1 text-xs font-bold text-[#5C2D91] hover:underline"
          >
            <span>Open Roll Call</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Status Counters */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-center">
            <span className="text-[10px] font-bold uppercase text-emerald-800 block">Present (P)</span>
            <span className="text-lg font-black text-emerald-700 font-mono tabular-nums">{presentCount}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-center">
            <span className="text-[10px] font-bold uppercase text-amber-800 block">Half Day (HD)</span>
            <span className="text-lg font-black text-amber-700 font-mono tabular-nums">{halfDayCount}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-center">
            <span className="text-[10px] font-bold uppercase text-rose-800 block">Absent (A)</span>
            <span className="text-lg font-black text-rose-700 font-mono tabular-nums">{absentCount}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-center">
            <span className="text-[10px] font-bold uppercase text-neutral-600 block">Unmarked</span>
            <span className="text-lg font-black text-neutral-800 font-mono tabular-nums">{unmarkedCount}</span>
          </div>
        </div>

        {/* Quick action buttons for roll call */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onQuickMarkAll('present')}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Present</span>
          </button>
          <button
            onClick={() => onQuickMarkAll('absent')}
            className="py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs transition-colors border border-neutral-200"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Quick Workers Roster with Daily Rates */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-purple-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#5C2D91]" />
            <h3 className="text-sm font-bold text-neutral-900">
              Active Labourers & Daily Rates ({activeLabourers.length})
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('labourers')}
            className="text-xs font-bold text-[#5C2D91] hover:underline"
          >
            View All
          </button>
        </div>

        <div className="divide-y divide-purple-50">
          {activeLabourers.slice(0, 5).map((labour) => {
            const todayRec = todayRecords.find((r) => r.labourId === labour.id);
            const status = todayRec?.status || 'not_marked';

            return (
              <div
                key={labour.id}
                className="py-2.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-[#5C2D91] font-bold text-xs flex items-center justify-center shrink-0">
                    {labour.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900 truncate">
                      {labour.name}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {labour.role} · <span className="font-mono">{labour.workerCode}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#5C2D91] font-mono">
                      {settings.currencySymbol}{labour.dailyWage.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      per day
                    </div>
                  </div>

                  {/* Status chip */}
                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase ${
                      status === 'present'
                        ? 'bg-emerald-100 text-emerald-800'
                        : status === 'half_day'
                        ? 'bg-amber-100 text-amber-800'
                        : status === 'absent'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {status === 'present'
                      ? 'P'
                      : status === 'half_day'
                      ? 'HD'
                      : status === 'absent'
                      ? 'A'
                      : 'None'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Advances & Deductions Card */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-purple-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#5C2D91]" />
            <h3 className="text-sm font-bold text-neutral-900">
              Recent Advances & Loans
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('advances')}
            className="text-xs font-bold text-[#5C2D91] hover:underline"
          >
            Ledger ({advances.length})
          </button>
        </div>

        {advances.length === 0 ? (
          <p className="text-xs text-neutral-500 text-center py-4">No advance payments recorded yet.</p>
        ) : (
          <div className="divide-y divide-purple-50">
            {advances.slice(0, 3).map((adv) => {
              const worker = labourers.find((l) => l.id === adv.labourId);
              return (
                <div key={adv.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-neutral-900 block">{worker?.name || 'Worker'}</span>
                    <span className="text-[11px] text-neutral-500">{adv.paymentMode} · {adv.date}</span>
                  </div>
                  <div className="font-mono font-bold text-rose-600">
                    -{settings.currencySymbol}{adv.amount.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
