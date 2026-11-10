import React, { useState, useEffect } from 'react';
import { Labour, AppSettings } from '../types';
import { X, Calculator, UserCheck, AlertCircle } from 'lucide-react';

interface LabourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (labour: Labour) => void;
  initialLabour?: Labour | null;
  settings: AppSettings;
  existingCodes: string[];
}

import { COMMON_ROLES } from '../utils/seedData';

export const LabourModal: React.FC<LabourModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialLabour,
  settings,
  existingCodes,
}) => {
  const [name, setName] = useState('');
  const [workerCode, setWorkerCode] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(COMMON_ROLES[0]);
  const [dailyWage, setDailyWage] = useState<number>(1200);
  const [overtimeHourlyRate, setOvertimeHourlyRate] = useState<number>(170);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialLabour) {
      setName(initialLabour.name);
      setWorkerCode(initialLabour.workerCode);
      setPhone(initialLabour.phone);
      setRole(initialLabour.role);
      setDailyWage(initialLabour.dailyWage);
      setOvertimeHourlyRate(initialLabour.overtimeHourlyRate);
      setStatus(initialLabour.status);
      setNotes(initialLabour.notes || '');
      setError('');
    } else {
      // Auto-suggest next worker code
      const nextNum = existingCodes.length + 101;
      setWorkerCode(`NP-${nextNum}`);
      setName('');
      setPhone('');
      setRole(COMMON_ROLES[0]);
      setDailyWage(1200);
      setOvertimeHourlyRate(170);
      setStatus('active');
      setNotes('');
      setError('');
    }
  }, [initialLabour, isOpen, existingCodes]);

  if (!isOpen) return null;

  const handleWageChange = (val: number) => {
    setDailyWage(val);
    // Auto calculate suggested 8hr shift overtime rate
    if (!initialLabour || overtimeHourlyRate === Math.round(dailyWage / 8)) {
      setOvertimeHourlyRate(Math.round(val / 8));
    }
  };

  const handleAutoCalcOT = () => {
    setOvertimeHourlyRate(Math.round(dailyWage / 8));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide worker name');
      return;
    }
    if (dailyWage <= 0) {
      setError('Daily wage rate must be greater than 0');
      return;
    }

    const labourData: Labour = {
      id: initialLabour ? initialLabour.id : `lbr_${Date.now()}`,
      workerCode: workerCode.trim() || `LBR-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      phone: phone.trim(),
      role: role.trim(),
      dailyWage: Number(dailyWage),
      overtimeHourlyRate: Number(overtimeHourlyRate) || Math.round(dailyWage / 8),
      joiningDate: initialLabour ? initialLabour.joiningDate : new Date().toISOString().split('T')[0],
      status,
      notes: notes.trim(),
    };

    onSave(labourData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              {initialLabour ? 'Edit Labour & Wage Rates' : 'Register New Labour'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Set personal profile, daily attendance wage, and overtime hourly rates
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-300 rounded-lg border border-rose-200 dark:border-rose-900/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Worker Code / ID
              </label>
              <input
                type="text"
                placeholder="LBR-101"
                value={workerCode}
                onChange={(e) => setWorkerCode(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Trade / Skill Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {COMMON_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+977 98412 34567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Wage Rate Setting Section */}
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Wage Rates & Amounts
              </span>
              <button
                type="button"
                onClick={handleAutoCalcOT}
                className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Auto-set OT (Wage ÷ 8h)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  Daily Wage Rate ({settings.currencySymbol}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-neutral-500 dark:text-neutral-400 font-mono">
                    {settings.currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={dailyWage}
                    onChange={(e) => handleWageChange(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 text-sm font-semibold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums font-mono"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  Full day attendance amount (Half day = 50%)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  Overtime Rate / Hour ({settings.currencySymbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-neutral-500 dark:text-neutral-400 font-mono">
                    {settings.currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={overtimeHourlyRate}
                    onChange={(e) => setOvertimeHourlyRate(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 text-sm font-semibold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums font-mono"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  Per hour rate for extra overtime
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Employment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="active">Active (On Active Roster)</option>
                <option value="inactive">Inactive / On Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Site Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Master plasterer, verified ID"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
            >
              <UserCheck className="w-4 h-4" />
              <span>{initialLabour ? 'Update Worker Rates' : 'Save Labour'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
