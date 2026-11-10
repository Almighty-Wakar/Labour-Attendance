import { Labour, AttendanceRecord, AdvanceTransaction, AppSettings } from '../types';
import {
  INITIAL_LABOURERS,
  generateSeedAttendance,
  generateSeedAdvances,
  DEFAULT_SETTINGS,
} from './seedData';

const KEYS = {
  LABOURERS: 'labour_attendance_workers_v3_en',
  ATTENDANCE: 'labour_attendance_records_v3_en',
  ADVANCES: 'labour_attendance_advances_v3_en',
  SETTINGS: 'labour_attendance_settings_v3_en',
};

export function loadLabourers(): Labour[] {
  try {
    const raw = localStorage.getItem(KEYS.LABOURERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse saved labourers, falling back to initial seed', e);
  }
  saveLabourers(INITIAL_LABOURERS);
  return INITIAL_LABOURERS;
}

export function saveLabourers(workers: Labour[]): void {
  try {
    localStorage.setItem(KEYS.LABOURERS, JSON.stringify(workers));
  } catch (e) {
    console.error('Failed to save labourers', e);
  }
}

export function loadAttendance(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.ATTENDANCE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse saved attendance, using seed attendance', e);
  }
  const seed = generateSeedAttendance();
  saveAttendance(seed);
  return seed;
}

export function saveAttendance(records: AttendanceRecord[]): void {
  try {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save attendance', e);
  }
}

export function loadAdvances(): AdvanceTransaction[] {
  try {
    const raw = localStorage.getItem(KEYS.ADVANCES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse saved advances, using seed advances', e);
  }
  const seed = generateSeedAdvances();
  saveAdvances(seed);
  return seed;
}

export function saveAdvances(advances: AdvanceTransaction[]): void {
  try {
    localStorage.setItem(KEYS.ADVANCES, JSON.stringify(advances));
  } catch (e) {
    console.error('Failed to save advances', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to parse settings, using default', e);
  }
  saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function resetAllData(): {
  labourers: Labour[];
  attendance: AttendanceRecord[];
  advances: AdvanceTransaction[];
  settings: AppSettings;
} {
  const seedLabourers = INITIAL_LABOURERS;
  const seedAttendance = generateSeedAttendance();
  const seedAdvances = generateSeedAdvances();
  const settings = DEFAULT_SETTINGS;

  saveLabourers(seedLabourers);
  saveAttendance(seedAttendance);
  saveAdvances(seedAdvances);
  saveSettings(settings);

  return {
    labourers: seedLabourers,
    attendance: seedAttendance,
    advances: seedAdvances,
    settings,
  };
}

export function exportBackupJSON(
  labourers: Labour[],
  attendance: AttendanceRecord[],
  advances: AdvanceTransaction[],
  settings: AppSettings
): void {
  const data = {
    app: 'Labour Attendance & Wage Manager',
    exportedAt: new Date().toISOString(),
    version: '1.0',
    labourers,
    attendance,
    advances,
    settings,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `labour_attendance_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
