import React, { useState } from 'react';
import { AppSettings, Labour, AttendanceRecord, AdvanceTransaction } from '../types';
import { exportBackupJSON } from '../utils/storage';
import { X, Save, Download, Upload, RotateCcw, Building2, Coins, ShieldAlert } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetData: () => void;
  onImportData: (data: {
    labourers: Labour[];
    attendance: AttendanceRecord[];
    advances: AdvanceTransaction[];
    settings?: AppSettings;
  }) => void;
  labourers: Labour[];
  attendance: AttendanceRecord[];
  advances: AdvanceTransaction[];
}

const CURRENCIES = [
  { code: 'NPR', symbol: 'रू', label: 'NPR (रू) - Nepalese Rupee' },
  { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
  { code: 'AED', symbol: 'AED', label: 'AED - UAE Dirham' },
  { code: 'SAR', symbol: 'SAR', label: 'SAR - Saudi Riyal' },
  { code: 'QAR', symbol: 'QR', label: 'QAR - Qatari Riyal' },
  { code: 'MYR', symbol: 'RM', label: 'MYR - Malaysian Ringgit' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetData,
  onImportData,
  labourers,
  attendance,
  advances,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [importStatus, setImportStatus] = useState<string>('');

  if (!isOpen) return null;

  const handleCurrencyChange = (code: string) => {
    const selected = CURRENCIES.find((c) => c.code === code);
    if (selected) {
      setFormData({
        ...formData,
        currency: selected.code,
        currencySymbol: selected.symbol,
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  const handleExport = () => {
    exportBackupJSON(labourers, attendance, advances, formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.labourers && parsed.attendance && parsed.advances) {
          onImportData({
            labourers: parsed.labourers,
            attendance: parsed.attendance,
            advances: parsed.advances,
            settings: parsed.settings,
          });
          setImportStatus('Backup restored successfully!');
          setTimeout(() => setImportStatus(''), 3000);
        } else {
          setImportStatus('Invalid backup file format');
        }
      } catch (err) {
        setImportStatus('Failed to read backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Worksite & App Settings
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Configure company branding, currency, and data backups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {importStatus && (
            <div className="p-3 text-xs bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 text-amber-900 dark:text-amber-200 rounded-lg">
              {importStatus}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Contractor / Company Name
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Current Worksite / Project Name
              </label>
              <input
                type="text"
                required
                value={formData.worksiteName}
                onChange={(e) => setFormData({ ...formData, worksiteName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Currency Symbol & Code
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Standard Shift Hours
                </label>
                <input
                  type="number"
                  min="4"
                  max="12"
                  value={formData.defaultShiftHours}
                  onChange={(e) => setFormData({ ...formData, defaultShiftHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Site Settings</span>
              </button>
            </div>
          </form>

          {/* Backup & Data Section */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Data Management & Backup
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 p-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg text-xs font-semibold transition-colors border border-neutral-200 dark:border-neutral-700"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON Backup</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg text-xs font-semibold transition-colors border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import JSON Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* PWA & App Creation / Installation Box */}
            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  📱 Install App on Mobile & Desktop
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  PWA Ready
                </span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-300">
                Labour Attendance is a complete Progressive Web App (PWA). You can install it on your Android phone, iPhone, or PC to use it like a native app with full offline support on construction sites.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                <div>
                  <strong className="text-neutral-800 dark:text-neutral-200 block">Android:</strong>
                  Tap browser menu (⋮) → "Add to Home screen" or "Install App".
                </div>
                <div>
                  <strong className="text-neutral-800 dark:text-neutral-200 block">iPhone / iPad:</strong>
                  Tap Share in Safari → "Add to Home Screen".
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all labourers, attendance, and advances to demo sample data? Current data will be replaced.')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors border border-rose-200 dark:border-rose-900/50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default Demo Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
