import { LabourWageSummary, AppSettings } from '../types';

export function exportPayrollCSV(
  summaries: LabourWageSummary[],
  startDate: string,
  endDate: string,
  settings: AppSettings
): void {
  const headers = [
    'Worker ID',
    'Labour Name',
    'Role / Trade',
    'Phone',
    'Daily Wage Rate',
    'OT Rate / Hr',
    'Present Days',
    'Half Days',
    'Absent Days',
    'Effective Days',
    'Base Wages Earned',
    'OT Hours',
    'OT Wages Earned',
    'Bonus',
    'Gross Wages',
    'Advances Taken',
    'Deductions',
    'Total Deductions',
    'Net Payable Amount',
  ];

  const rows = summaries.map((s) => [
    `"${s.labour.workerCode}"`,
    `"${s.labour.name}"`,
    `"${s.labour.role}"`,
    `"${s.labour.phone}"`,
    s.labour.dailyWage,
    s.labour.overtimeHourlyRate,
    s.presentDays,
    s.halfDays,
    s.absentDays,
    s.effectiveDays,
    s.baseWageEarned,
    s.totalOvertimeHours,
    s.overtimeWageEarned,
    s.totalBonus,
    s.grossWages,
    s.totalAdvances,
    s.totalDeductions,
    s.totalDeducted,
    s.netPayable,
  ]);

  const csvContent =
    `# ${settings.companyName} - Labour Attendance & Wage Report\n` +
    `# Worksite: ${settings.worksiteName} | Period: ${startDate} to ${endDate}\n` +
    `# Currency: ${settings.currency} (${settings.currencySymbol})\n\n` +
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Labour_Payroll_${startDate}_to_${endDate}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
