export type AttendanceStatus = 'present' | 'half_day' | 'absent' | 'not_marked';

export type WorkerRole = 
  | 'Mason / Mistri'
  | 'Carpenter'
  | 'Electrician'
  | 'Plumber'
  | 'Welder / Fitter'
  | 'Painter'
  | 'General Labour / Helper'
  | 'Supervisor / Foreman'
  | 'Bar Bender / Steel Worker';

export interface Labour {
  id: string;
  workerCode: string;
  name: string;
  phone: string;
  role: string;
  dailyWage: number;            // Amount for 1 full day (Present)
  overtimeHourlyRate: number;    // Amount per 1 hour of overtime
  joiningDate: string;          // YYYY-MM-DD
  status: 'active' | 'inactive';
  notes?: string;
  emergencyContact?: string;
}

export interface AttendanceRecord {
  id: string;                   // `${labourId}_${date}`
  labourId: string;
  date: string;                 // YYYY-MM-DD
  status: AttendanceStatus;
  overtimeHours: number;        // e.g. 0, 1, 2, 3.5
  siteLocation?: string;        // e.g. "Block A - 4th Floor"
  notes?: string;
  updatedAt: string;
}

export type TransactionType = 'advance' | 'deduction' | 'bonus';

export interface AdvanceTransaction {
  id: string;
  labourId: string;
  date: string;                 // YYYY-MM-DD
  amount: number;
  type: TransactionType;        // 'advance' lowers payout, 'deduction' lowers payout, 'bonus' increases payout
  description: string;
  paymentMode: 'Cash' | 'Bank Transfer' | 'UPI / Mobile Pay' | 'Cheque';
  receiptNo?: string;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  companyName: string;
  worksiteName: string;
  defaultShiftHours: number;
  overtimeMultiplier: number;
  language: 'en' | 'ne';
}

export interface LabourWageSummary {
  labour: Labour;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  unmarkedDays: number;
  effectiveDays: number;        // presentDays + (halfDays * 0.5)
  baseWageEarned: number;       // effectiveDays * dailyWage
  totalOvertimeHours: number;
  overtimeWageEarned: number;   // sum of OT wages
  totalBonus: number;
  grossWages: number;           // baseWageEarned + overtimeWageEarned + totalBonus
  totalAdvances: number;
  totalDeductions: number;
  totalDeducted: number;        // totalAdvances + totalDeductions
  netPayable: number;           // grossWages - totalDeducted
}

export type ActiveTab = 'home' | 'attendance' | 'payroll' | 'labourers' | 'advances' | 'matrix';
