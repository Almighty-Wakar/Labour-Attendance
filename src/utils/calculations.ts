import { Labour, AttendanceRecord, AdvanceTransaction, LabourWageSummary } from '../types';

export function calculateLabourWage(
  labour: Labour,
  records: AttendanceRecord[],
  transactions: AdvanceTransaction[],
  startDateStr: string,
  endDateStr: string
): LabourWageSummary {
  // Filter attendance records within the selected date range
  const filteredRecords = records.filter(
    (r) => r.labourId === labour.id && r.date >= startDateStr && r.date <= endDateStr
  );

  let presentDays = 0;
  let halfDays = 0;
  let absentDays = 0;
  let totalOvertimeHours = 0;
  let overtimeWageEarned = 0;

  const otRate = labour.overtimeHourlyRate || Math.round(labour.dailyWage / 8);

  filteredRecords.forEach((record) => {
    if (record.status === 'present') {
      presentDays += 1;
    } else if (record.status === 'half_day') {
      halfDays += 1;
    } else if (record.status === 'absent') {
      absentDays += 1;
    }

    if (record.overtimeHours && record.overtimeHours > 0) {
      totalOvertimeHours += record.overtimeHours;
      overtimeWageEarned += record.overtimeHours * otRate;
    }
  });

  const effectiveDays = presentDays + halfDays * 0.5;
  const baseWageEarned = effectiveDays * labour.dailyWage;

  // Filter transactions within the selected date range
  const filteredTransactions = transactions.filter(
    (t) => t.labourId === labour.id && t.date >= startDateStr && t.date <= endDateStr
  );

  let totalAdvances = 0;
  let totalDeductions = 0;
  let totalBonus = 0;

  filteredTransactions.forEach((t) => {
    if (t.type === 'advance') {
      totalAdvances += t.amount;
    } else if (t.type === 'deduction') {
      totalDeductions += t.amount;
    } else if (t.type === 'bonus') {
      totalBonus += t.amount;
    }
  });

  const grossWages = baseWageEarned + overtimeWageEarned + totalBonus;
  const totalDeducted = totalAdvances + totalDeductions;
  const netPayable = grossWages - totalDeducted;

  // Calculate days in range
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const totalDaysInRange = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const loggedDays = presentDays + halfDays + absentDays;
  const unmarkedDays = Math.max(0, totalDaysInRange - loggedDays);

  return {
    labour,
    presentDays,
    halfDays,
    absentDays,
    unmarkedDays,
    effectiveDays,
    baseWageEarned,
    totalOvertimeHours,
    overtimeWageEarned,
    totalBonus,
    grossWages,
    totalAdvances,
    totalDeductions,
    totalDeducted,
    netPayable,
  };
}

export function formatCurrency(amount: number, symbol: string = 'रू'): string {
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });
  const space = symbol === 'रू' || symbol.length > 1 ? ' ' : '';
  if (amount < 0) {
    return `-${symbol}${space}${formatted}`;
  }
  return `${symbol}${space}${formatted}`;
}

export function getDateRanges(): {
  label: string;
  startDate: string;
  endDate: string;
}[] {
  const now = new Date();
  const todayStr = toDateStr(now);

  // This Week (starting Monday)
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // Last Week
  const lastMonday = new Date(monday);
  lastMonday.setDate(monday.getDate() - 7);
  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);

  // This Month
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Last Month
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Past 7 Days
  const past7Days = new Date(now);
  past7Days.setDate(now.getDate() - 6);

  // Past 30 Days
  const past30Days = new Date(now);
  past30Days.setDate(now.getDate() - 29);

  return [
    { label: 'Today', startDate: todayStr, endDate: todayStr },
    { label: 'Past 7 Days', startDate: toDateStr(past7Days), endDate: todayStr },
    { label: 'This Week', startDate: toDateStr(monday), endDate: toDateStr(sunday) },
    { label: 'This Month', startDate: toDateStr(thisMonthStart), endDate: toDateStr(thisMonthEnd) },
    { label: 'Last Week', startDate: toDateStr(lastMonday), endDate: toDateStr(lastSunday) },
    { label: 'Last Month', startDate: toDateStr(lastMonthStart), endDate: toDateStr(lastMonthEnd) },
    { label: 'Past 30 Days', startDate: toDateStr(past30Days), endDate: todayStr },
  ];
}

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getMonthDays(year: number, monthIndex: number): string[] {
  const dates: string[] = [];
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, monthIndex, i);
    dates.push(toDateStr(d));
  }
  return dates;
}
