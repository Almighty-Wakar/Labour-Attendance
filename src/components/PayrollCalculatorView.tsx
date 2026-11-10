import React, { useState, useMemo } from 'react';
import { Labour, AttendanceRecord, AdvanceTransaction, AppSettings, LabourWageSummary } from '../types';
import { calculateLabourWage, formatCurrency, getDateRanges } from '../utils/calculations';
import { exportPayrollCSV } from '../utils/exportCsv';
import { 
  Calculator, 
  Download, 
  Printer, 
  Search, 
  FileText, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar,
  Filter,
  DollarSign
} from 'lucide-react';

interface PayrollCalculatorViewProps {
  labourers: Labour[];
  attendance: AttendanceRecord[];
  advances: AdvanceTransaction[];
  settings: AppSettings;
  onOpenPayslip: (summary: LabourWageSummary, startDate: string, endDate: string) => void;
  onOpenAdvanceModal: (labourId: string) => void;
  onOpenAddLabour: () => void;
}

export const PayrollCalculatorView: React.FC<PayrollCalculatorViewProps> = ({
  labourers,
  attendance,
  advances,
  settings,
  onOpenPayslip,
  onOpenAdvanceModal,
  onOpenAddLabour,
}) => {
  const presets = useMemo(() => getDateRanges(), []);

  // Default to "This Month"
  const defaultPreset = presets.find((p) => p.label === 'This Month') || presets[0];
  const [selectedPreset, setSelectedPreset] = useState<string>(defaultPreset.label);
  const [startDate, setStartDate] = useState<string>(defaultPreset.startDate);
  const [endDate, setEndDate] = useState<string>(defaultPreset.endDate);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  // Handle Preset selection
  const handlePresetChange = (label: string) => {
    setSelectedPreset(label);
    const found = presets.find((p) => p.label === label);
    if (found) {
      setStartDate(found.startDate);
      setEndDate(found.endDate);
    }
  };

  // Unique roles
  const roles = useMemo(() => {
    const set = new Set(labourers.map((l) => l.role));
    return ['all', ...Array.from(set)];
  }, [labourers]);

  // Compute summaries for all labourers
  const allSummaries = useMemo<LabourWageSummary[]>(() => {
    return labourers.map((labour) => {
      return calculateLabourWage(labour, attendance, advances, startDate, endDate);
    });
  }, [labourers, attendance, advances, startDate, endDate]);

  // Filtered summaries
  const displayedSummaries = useMemo(() => {
    return allSummaries.filter((s) => {
      const matchesSearch =
        s.labour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.labour.workerCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'all' || s.labour.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [allSummaries, searchQuery, selectedRole]);

  // Grand totals across all displayed labourers
  const grandTotals = useMemo(() => {
    let totalGross = 0;
    let totalAdvances = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    let totalEffectiveDays = 0;
    let totalOtHours = 0;

    displayedSummaries.forEach((s) => {
      totalGross += s.grossWages;
      totalAdvances += s.totalAdvances;
      totalDeductions += s.totalDeductions;
      totalNet += s.netPayable;
      totalEffectiveDays += s.effectiveDays;
      totalOtHours += s.totalOvertimeHours;
    });

    return {
      totalGross,
      totalAdvances,
      totalDeductions,
      totalNet,
      totalEffectiveDays,
      totalOtHours,
    };
  }, [displayedSummaries]);

  const handleExportCSV = () => {
    exportPayrollCSV(displayedSummaries, startDate, endDate, settings);
  };

  const handlePrintPayroll = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-500" />
              <span>Labour Wage & Payroll Calculator</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Select date period to calculate total days, overtime earnings, advances deducted, and net payable wage for each labourer
            </p>
          </div>

          {/* Action buttons: Export CSV & Print */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700"
              title="Download CSV spreadsheet"
            >
              <Download className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrintPayroll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700"
              title="Print Payroll Sheet"
            >
              <Printer className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>

        {/* Date Presets and Custom Range */}
        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetChange(preset.label)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                  selectedPreset === preset.label
                    ? 'bg-[#5C2D91] text-white font-bold shadow-xs'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-neutral-500 font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setSelectedPreset('custom');
              }}
              className="px-2.5 py-1 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
            />
            <span className="text-xs text-neutral-500 font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setSelectedPreset('custom');
              }}
              className="px-2.5 py-1 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase">Total Days Worked</div>
          <div className="text-xl font-extrabold text-neutral-900 dark:text-white font-mono tabular-nums mt-1">
            {grandTotals.totalEffectiveDays} days
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">
            {displayedSummaries.length} workers · {grandTotals.totalOtHours}h OT
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase">Gross Wages Earned</div>
          <div className="text-xl font-extrabold text-neutral-900 dark:text-white font-mono tabular-nums mt-1">
            {formatCurrency(grandTotals.totalGross, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Includes base rate &amp; overtime
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase">
            Total Advances Given
          </div>
          <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 font-mono tabular-nums mt-1">
            -{formatCurrency(grandTotals.totalAdvances + grandTotals.totalDeductions, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Deducted from final pay
          </div>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border-2 border-[#5C2D91] shadow-xs">
          <div className="text-[11px] font-bold text-[#5C2D91] uppercase">
            Net Payout Required
          </div>
          <div className="text-2xl font-black text-[#5C2D91] dark:text-purple-300 font-mono tabular-nums mt-1">
            {formatCurrency(grandTotals.totalNet, settings.currencySymbol)}
          </div>
          <div className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mt-1">
            Actual amount to disburse
          </div>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 no-print">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search labour in calculations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r === 'all' ? 'All Trades / Roles' : r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main High-Density Calculation Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Labour / ID</th>
                <th className="px-3 py-3">Daily Rate</th>
                <th className="px-3 py-3 text-center">Attendance (P/HD/A)</th>
                <th className="px-3 py-3 text-right">Effective Days</th>
                <th className="px-3 py-3 text-right">Base Wages</th>
                <th className="px-3 py-3 text-right">OT Wages</th>
                <th className="px-3 py-3 text-right">Advances (-)</th>
                <th className="px-4 py-3 text-right text-neutral-950 dark:text-white font-bold">
                  Net Payable Amount
                </th>
                <th className="px-4 py-3 text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {displayedSummaries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-neutral-500">
                    No labour records found for the selected filter.
                  </td>
                </tr>
              ) : (
                displayedSummaries.map((s) => {
                  return (
                    <tr
                      key={s.labour.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      {/* Labour Name & Role */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-neutral-900 dark:text-white">
                          {s.labour.name}
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono">{s.labour.workerCode}</span>
                          <span>·</span>
                          <span>{s.labour.role}</span>
                        </div>
                      </td>

                      {/* Daily Rate */}
                      <td className="px-3 py-3.5 font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
                        {formatCurrency(s.labour.dailyWage, settings.currencySymbol)}
                        <span className="text-[10px] text-neutral-400 block">/day</span>
                      </td>

                      {/* Attendance breakdown pills */}
                      <td className="px-3 py-3.5 text-center font-mono">
                        <div className="inline-flex items-center gap-1.5 text-[11px]">
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold" title="Present">
                            {s.presentDays}P
                          </span>
                          <span className="text-neutral-400">/</span>
                          <span className="text-amber-700 dark:text-amber-400 font-bold" title="Half Day">
                            {s.halfDays}HD
                          </span>
                          <span className="text-neutral-400">/</span>
                          <span className="text-rose-700 dark:text-rose-400 font-bold" title="Absent">
                            {s.absentDays}A
                          </span>
                        </div>
                      </td>

                      {/* Effective Days */}
                      <td className="px-3 py-3.5 text-right font-mono tabular-nums font-bold text-neutral-900 dark:text-white">
                        {s.effectiveDays}
                        <span className="text-[10px] text-neutral-500 font-normal"> d</span>
                      </td>

                      {/* Base Wages */}
                      <td className="px-3 py-3.5 text-right font-mono tabular-nums text-neutral-800 dark:text-neutral-200">
                        {formatCurrency(s.baseWageEarned, settings.currencySymbol)}
                      </td>

                      {/* Overtime Wages */}
                      <td className="px-3 py-3.5 text-right font-mono tabular-nums">
                        {s.totalOvertimeHours > 0 ? (
                          <div>
                            <span className="text-amber-800 dark:text-amber-300 font-semibold">
                              {formatCurrency(s.overtimeWageEarned, settings.currencySymbol)}
                            </span>
                            <span className="text-[10px] text-neutral-400 block font-normal">
                              ({s.totalOvertimeHours}h OT)
                            </span>
                          </div>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>

                      {/* Advances Taken */}
                      <td className="px-3 py-3.5 text-right font-mono tabular-nums">
                        {s.totalDeducted > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            -{formatCurrency(s.totalDeducted, settings.currencySymbol)}
                          </span>
                        ) : (
                          <span className="text-neutral-400 font-normal">-</span>
                        )}
                      </td>

                      {/* Net Payable Amount */}
                      <td className="px-4 py-3.5 text-right font-mono tabular-nums font-extrabold text-sm text-neutral-950 dark:text-white bg-amber-50/40 dark:bg-amber-950/20">
                        {formatCurrency(s.netPayable, settings.currencySymbol)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenPayslip(s, startDate, endDate)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors border border-neutral-200 dark:border-neutral-700"
                            title="Generate Printable Wage Slip"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Slip</span>
                          </button>
                          <button
                            onClick={() => onOpenAdvanceModal(s.labour.id)}
                            className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-amber-600 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            title="Give Advance"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Table Footer with Summary */}
            {displayedSummaries.length > 0 && (
              <tfoot className="bg-neutral-100 dark:bg-neutral-800/90 border-t-2 border-neutral-300 dark:border-neutral-700 font-bold text-neutral-900 dark:text-white">
                <tr>
                  <td className="px-4 py-3 uppercase text-[10px] tracking-wider">
                    Total ({displayedSummaries.length} Workers)
                  </td>
                  <td className="px-3 py-3">-</td>
                  <td className="px-3 py-3">-</td>
                  <td className="px-3 py-3 text-right font-mono">
                    {grandTotals.totalEffectiveDays} d
                  </td>
                  <td className="px-3 py-3 text-right font-mono">
                    {formatCurrency(
                      displayedSummaries.reduce((acc, c) => acc + c.baseWageEarned, 0),
                      settings.currencySymbol
                    )}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-amber-800 dark:text-amber-300">
                    {formatCurrency(
                      displayedSummaries.reduce((acc, c) => acc + c.overtimeWageEarned, 0),
                      settings.currencySymbol
                    )}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-rose-600 dark:text-rose-400">
                    -{formatCurrency(grandTotals.totalAdvances + grandTotals.totalDeductions, settings.currencySymbol)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-base font-black text-neutral-950 dark:text-white bg-amber-400/20">
                    {formatCurrency(grandTotals.totalNet, settings.currencySymbol)}
                  </td>
                  <td className="px-4 py-3 no-print"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
