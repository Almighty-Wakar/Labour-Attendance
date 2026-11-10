import React from 'react';
import { LabourWageSummary, AppSettings } from '../types';
import { formatCurrency } from '../utils/calculations';
import { X, Printer, HardHat } from 'lucide-react';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: LabourWageSummary | null;
  startDate: string;
  endDate: string;
  settings: AppSettings;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  onClose,
  summary,
  startDate,
  endDate,
  settings,
}) => {
  if (!isOpen || !summary) return null;

  const handlePrint = () => {
    window.print();
  };

  const {
    labour,
    presentDays,
    halfDays,
    absentDays,
    effectiveDays,
    baseWageEarned,
    totalOvertimeHours,
    overtimeWageEarned,
    totalBonus,
    grossWages,
    totalAdvances,
    totalDeductions,
    netPayable,
  } = summary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white text-neutral-900 rounded-xl shadow-2xl border border-neutral-300 overflow-hidden my-8 print:border-none print:shadow-none print:p-0">
        
        {/* Top Action Bar (hidden when printing) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 bg-neutral-900 text-white border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <HardHat className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold tracking-wide uppercase text-neutral-200">
              Labour Wage Slip Voucher
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-400 text-neutral-950 hover:bg-amber-300 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-8 space-y-6 print:p-4 print:text-black">
          {/* Header */}
          <div className="border-b-2 border-neutral-900 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-950 uppercase">
                  {settings.companyName}
                </h1>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Worksite: <span className="font-semibold text-neutral-900">{settings.worksiteName}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 text-xs font-bold uppercase bg-neutral-100 text-neutral-800 rounded border border-neutral-300">
                  Labour Wage Voucher
                </span>
                <p className="text-[11px] text-neutral-500 font-mono mt-1">
                  Date: {new Date().toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
          </div>

          {/* Worker Info & Period Metadata */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
            <div>
              <div className="text-neutral-500 uppercase tracking-wider text-[10px] font-semibold">
                Labour Details
              </div>
              <div className="text-sm font-bold text-neutral-900 mt-0.5">{labour.name}</div>
              <div className="text-neutral-600 mt-0.5">
                Role: <span className="font-medium text-neutral-900">{labour.role}</span>
              </div>
              <div className="text-neutral-600">
                Worker Code: <span className="font-mono font-medium text-neutral-900">{labour.workerCode}</span>
              </div>
              <div className="text-neutral-600">
                Phone: {labour.phone || 'N/A'}
              </div>
            </div>

            <div>
              <div className="text-neutral-500 uppercase tracking-wider text-[10px] font-semibold">
                Pay Period
              </div>
              <div className="text-sm font-bold text-neutral-900 mt-0.5 font-mono">
                {startDate} to {endDate}
              </div>
              <div className="text-neutral-600 mt-0.5">
                Daily Rate: <span className="font-mono font-bold text-neutral-900">{formatCurrency(labour.dailyWage, settings.currencySymbol)}</span> / day
              </div>
              <div className="text-neutral-600">
                OT Rate: <span className="font-mono font-bold text-neutral-900">{formatCurrency(labour.overtimeHourlyRate, settings.currencySymbol)}</span> / hr
              </div>
            </div>
          </div>

          {/* Attendance Summary Strip */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
              Attendance Records for Period
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
                <div className="text-neutral-500 text-[11px]">Full Days (P)</div>
                <div className="text-base font-bold text-neutral-900 font-mono">{presentDays}</div>
              </div>
              <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
                <div className="text-neutral-500 text-[11px]">Half Days (HD)</div>
                <div className="text-base font-bold text-neutral-900 font-mono">{halfDays}</div>
              </div>
              <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
                <div className="text-neutral-500 text-[11px]">Absent Days (A)</div>
                <div className="text-base font-bold text-neutral-900 font-mono">{absentDays}</div>
              </div>
              <div className="p-2.5 bg-amber-50 rounded border border-amber-300">
                <div className="text-amber-800 text-[11px] font-semibold">Effective Days</div>
                <div className="text-base font-bold text-amber-950 font-mono">{effectiveDays} days</div>
              </div>
            </div>
          </div>

          {/* Itemized Calculation Ledger Table */}
          <div className="border border-neutral-300 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-100 border-b border-neutral-300 text-neutral-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">Earnings Item</th>
                  <th className="px-4 py-2.5 text-center">Unit / Days</th>
                  <th className="px-4 py-2.5 text-right">Rate</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="px-4 py-2.5 font-medium text-neutral-900">
                    Base Working Days Wage
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono">{effectiveDays} days</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatCurrency(labour.dailyWage, settings.currencySymbol)}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-neutral-900">
                    {formatCurrency(baseWageEarned, settings.currencySymbol)}
                  </td>
                </tr>

                {totalOvertimeHours > 0 && (
                  <tr>
                    <td className="px-4 py-2.5 font-medium text-neutral-900">
                      Overtime Allowance (OT)
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono">{totalOvertimeHours} hrs</td>
                    <td className="px-4 py-2.5 text-right font-mono">{formatCurrency(labour.overtimeHourlyRate, settings.currencySymbol)}/hr</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-neutral-900">
                      {formatCurrency(overtimeWageEarned, settings.currencySymbol)}
                    </td>
                  </tr>
                )}

                {totalBonus > 0 && (
                  <tr>
                    <td className="px-4 py-2.5 font-medium text-emerald-800">
                      Performance / Festival Bonus
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono">-</td>
                    <td className="px-4 py-2.5 text-right font-mono">-</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-emerald-700">
                      +{formatCurrency(totalBonus, settings.currencySymbol)}
                    </td>
                  </tr>
                )}

                <tr className="bg-neutral-50 font-semibold text-neutral-900">
                  <td colSpan={3} className="px-4 py-2 text-right">
                    Gross Wages Earned:
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-sm">
                    {formatCurrency(grossWages, settings.currencySymbol)}
                  </td>
                </tr>

                {/* Deductions section */}
                {totalAdvances > 0 && (
                  <tr className="text-neutral-700">
                    <td className="px-4 py-2.5 text-rose-700 font-medium">
                      Less: Cash Advances Taken
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono">-</td>
                    <td className="px-4 py-2.5 text-right font-mono">-</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-rose-700">
                      -{formatCurrency(totalAdvances, settings.currencySymbol)}
                    </td>
                  </tr>
                )}

                {totalDeductions > 0 && (
                  <tr className="text-neutral-700">
                    <td className="px-4 py-2.5 text-rose-700 font-medium">
                      Less: Damage / Meal Deductions
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono">-</td>
                    <td className="px-4 py-2.5 text-right font-mono">-</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-rose-700">
                      -{formatCurrency(totalDeductions, settings.currencySymbol)}
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Net Total Payable Row */}
              <tfoot className="bg-amber-100/80 border-t-2 border-neutral-900 font-bold text-neutral-950 text-sm">
                <tr>
                  <td colSpan={3} className="px-4 py-3 uppercase tracking-wide">
                    Net Total Amount Payable:
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-base font-extrabold text-neutral-950">
                    {formatCurrency(netPayable, settings.currencySymbol)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures & Declarations */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs">
            <div className="border-t border-neutral-400 pt-2 text-center">
              <p className="font-semibold text-neutral-900">
                Labour Thumb / Signature
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Confirmed received amount
              </p>
            </div>
            <div className="border-t border-neutral-400 pt-2 text-center">
              <p className="font-semibold text-neutral-900">
                Site Supervisor / Thekedar
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Authorized Verification
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer (Screen only) */}
        <div className="no-print flex items-center justify-between px-6 py-3 bg-neutral-100 border-t border-neutral-200">
          <span className="text-xs text-neutral-500">
            Click &apos;Print Slip&apos; to generate a physical receipt or save as PDF.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-950 bg-white border border-neutral-300 rounded-lg shadow-xs hover:bg-neutral-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
