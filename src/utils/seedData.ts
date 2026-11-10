import { Labour, AttendanceRecord, AdvanceTransaction, AppSettings } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'NPR',
  currencySymbol: 'रू',
  companyName: 'Himalayan Builders & Construction',
  worksiteName: 'Baluwatar Residency - Ward 4, Kathmandu',
  defaultShiftHours: 8,
  overtimeMultiplier: 1.25,
  language: 'en',
};

export const COMMON_ROLES = [
  'Mason (Dakkarmi)',
  'Carpenter (Sikharmi)',
  'Electrician',
  'Plumber',
  'Bar Bender (Steel Worker)',
  'Helper (General Labour)',
  'Painter',
  'Concrete Caster (Dhalai Mistri)',
  'Welder & Fabricator',
  'Tiles & Marble Worker',
  'Site Supervisor (Thekedar)',
];

export const INITIAL_LABOURERS: Labour[] = [
  {
    id: 'lbr_1',
    workerCode: 'NP-101',
    name: 'Ram Bahadur Thapa',
    phone: '+977 98412 34567',
    role: 'Mason (Dakkarmi)',
    dailyWage: 1400,
    overtimeHourlyRate: 200,
    joiningDate: '2026-01-10',
    status: 'active',
    notes: 'Lead mason for brick masonry, plastering and alignment.',
  },
  {
    id: 'lbr_2',
    workerCode: 'NP-102',
    name: 'Santosh Tamang',
    phone: '+977 98510 98765',
    role: 'Carpenter (Sikharmi)',
    dailyWage: 1350,
    overtimeHourlyRate: 190,
    joiningDate: '2026-01-15',
    status: 'active',
    notes: 'Shuttering, centering, and column formwork specialist.',
  },
  {
    id: 'lbr_3',
    workerCode: 'NP-103',
    name: 'Bikash Shrestha',
    phone: '+977 98130 55443',
    role: 'Electrician',
    dailyWage: 1450,
    overtimeHourlyRate: 210,
    joiningDate: '2026-02-01',
    status: 'active',
    notes: 'Conduit laying, DB panel installation, and cabling.',
  },
  {
    id: 'lbr_4',
    workerCode: 'NP-104',
    name: 'Dil Bahadur Gurung',
    phone: '+977 98032 11223',
    role: 'Bar Bender (Steel Worker)',
    dailyWage: 1300,
    overtimeHourlyRate: 180,
    joiningDate: '2026-02-10',
    status: 'active',
    notes: 'Column, beam and slab reinforcement bar binding.',
  },
  {
    id: 'lbr_5',
    workerCode: 'NP-105',
    name: 'Rameshwor Chaudhary',
    phone: '+977 98234 66778',
    role: 'Helper (General Labour)',
    dailyWage: 950,
    overtimeHourlyRate: 135,
    joiningDate: '2026-03-01',
    status: 'active',
    notes: 'Concrete mixing, material shifting, and curing duty.',
  },
  {
    id: 'lbr_6',
    workerCode: 'NP-106',
    name: 'Prakash BK',
    phone: '+977 98601 22334',
    role: 'Helper (General Labour)',
    dailyWage: 950,
    overtimeHourlyRate: 135,
    joiningDate: '2026-03-01',
    status: 'active',
    notes: 'Mortar mixing, scaffolding assistance and site cleanup.',
  },
  {
    id: 'lbr_7',
    workerCode: 'NP-107',
    name: 'Prem Rai',
    phone: '+977 98499 88776',
    role: 'Painter',
    dailyWage: 1250,
    overtimeHourlyRate: 175,
    joiningDate: '2026-03-15',
    status: 'active',
    notes: 'Wall putty, primer coat, and exterior emulsion finish.',
  },
  {
    id: 'lbr_8',
    workerCode: 'NP-108',
    name: 'Deepak Magar',
    phone: '+977 98188 44332',
    role: 'Welder & Fabricator',
    dailyWage: 1350,
    overtimeHourlyRate: 190,
    joiningDate: '2026-02-20',
    status: 'active',
    notes: 'Safety railing, staircase grills, and gate fabrication.',
  },
];

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateSeedAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();

  // Generate 14 days of realistic past records leading up to today
  for (let i = 13; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    const dateStr = formatDate(targetDate);
    const dayOfWeek = targetDate.getDay(); // Saturday = 6

    INITIAL_LABOURERS.forEach((labour, index) => {
      // On Saturdays, either off or half-day curing
      if (dayOfWeek === 6) {
        if (index === 4 || index === 0) {
          records.push({
            id: `${labour.id}_${dateStr}`,
            labourId: labour.id,
            date: dateStr,
            status: 'half_day',
            overtimeHours: 0,
            siteLocation: 'Kathmandu Main Tower',
            notes: 'Saturday slab curing duty',
            updatedAt: new Date().toISOString(),
          });
        } else {
          records.push({
            id: `${labour.id}_${dateStr}`,
            labourId: labour.id,
            date: dateStr,
            status: 'absent',
            overtimeHours: 0,
            siteLocation: 'Kathmandu Main Tower',
            notes: 'Saturday weekly site off',
            updatedAt: new Date().toISOString(),
          });
        }
        return;
      }

      // Regular weekdays
      let status: 'present' | 'half_day' | 'absent' = 'present';
      let ot = 0;

      if ((index + i) % 11 === 0) {
        status = 'absent';
      } else if ((index + i) % 7 === 0) {
        status = 'half_day';
      } else {
        status = 'present';
        if ((index + i) % 4 === 0) {
          ot = (index % 2 === 0) ? 2 : 1.5;
        }
      }

      records.push({
        id: `${labour.id}_${dateStr}`,
        labourId: labour.id,
        date: dateStr,
        status,
        overtimeHours: ot,
        siteLocation: index < 4 ? 'Block A - 3rd Floor' : 'Block B - Foundation',
        notes: ot > 0 ? `Completed casting with ${ot}h overtime` : '',
        updatedAt: new Date().toISOString(),
      });
    });
  }

  return records;
}

export function generateSeedAdvances(): AdvanceTransaction[] {
  const today = new Date();
  const d1 = new Date(today);
  d1.setDate(today.getDate() - 10);
  const d2 = new Date(today);
  d2.setDate(today.getDate() - 5);
  const d3 = new Date(today);
  d3.setDate(today.getDate() - 2);

  return [
    {
      id: 'adv_1',
      labourId: 'lbr_1', // Ram Bahadur Thapa
      date: formatDate(d1),
      amount: 3000,
      type: 'advance',
      description: 'Mid-month cash advance for family expenses',
      paymentMode: 'Cash',
      receiptNo: 'REC-NP01',
    },
    {
      id: 'adv_2',
      labourId: 'lbr_5', // Rameshwor Chaudhary
      date: formatDate(d2),
      amount: 1500,
      type: 'advance',
      description: 'Weekly ration and grocery allowance',
      paymentMode: 'Cash',
      receiptNo: 'REC-NP02',
    },
    {
      id: 'adv_3',
      labourId: 'lbr_2', // Santosh Tamang
      date: formatDate(d3),
      amount: 2000,
      type: 'advance',
      description: 'Advance payment via eSewa mobile wallet',
      paymentMode: 'UPI / Mobile Pay',
      receiptNo: 'REC-NP03',
    },
    {
      id: 'adv_4',
      labourId: 'lbr_3', // Bikash Shrestha
      date: formatDate(d2),
      amount: 1000,
      type: 'bonus',
      description: 'Special bonus for flawless panel board installation',
      paymentMode: 'Bank Transfer',
      receiptNo: 'REC-NP04',
    },
    {
      id: 'adv_5',
      labourId: 'lbr_6', // Prakash BK
      date: formatDate(d3),
      amount: 500,
      type: 'deduction',
      description: 'Tool replacement deduction',
      paymentMode: 'Cash',
      receiptNo: 'REC-NP05',
    },
  ];
}
