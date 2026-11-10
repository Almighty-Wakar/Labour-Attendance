import React, { useState, useEffect } from 'react';
import { Labour, AdvanceTransaction, AppSettings, TransactionType } from '../types';
import { X, DollarSign, AlertCircle } from 'lucide-react';

interface AdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: AdvanceTransaction) => void;
  labourers: Labour[];
  preselectedLabourId?: string;
  settings: AppSettings;
}

export const AdvanceModal: React.FC<AdvanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  labourers,
  preselectedLabourId,
  settings,
}) => {
  const [labourId, setLabourId] = useState(labourers[0]?.id || '');
  const [amount, setAmount] = useState<number>(500);
  const [type, setType] = useState<TransactionType>('advance');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Bank Transfer' | 'UPI / Mobile Pay' | 'Cheque'>('Cash');
  const [description, setDescription] = useState('');
  const [receiptNo, setReceiptNo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedLabourId) {
      setLabourId(preselectedLabourId);
    } else if (labourers.length > 0 && !labourId) {
      setLabourId(labourers[0].id);
    }
    setDate(new Date().toISOString().split('T')[0]);
    setReceiptNo(`REC-${Date.now().toString().slice(-4)}`);
  }, [preselectedLabourId, isOpen, labourers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labourId) {
      setError('Please select a labourer');
      return;
    }
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    const tx: AdvanceTransaction = {
      id: `adv_${Date.now()}`,
      labourId,
      amount: Number(amount),
      date,
      type,
      paymentMode,
      description: description.trim() || `${type.toUpperCase()} recorded for ${date}`,
      receiptNo: receiptNo.trim(),
    };

    onSave(tx);
    onClose();
  };

  const selectedLabour = labourers.find((l) => l.id === labourId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Log Advance or Deduction
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Directly deducted from the labour's total payroll payout
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

          {/* Select Labour */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Select Labour *
            </label>
            <select
              value={labourId}
              onChange={(e) => setLabourId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {labourers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.role}) — {settings.currencySymbol}{l.dailyWage}/day
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Type Segmented Control */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Transaction Type *
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <button
                type="button"
                onClick={() => setType('advance')}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                  type === 'advance'
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Cash Advance (-)
              </button>
              <button
                type="button"
                onClick={() => setType('deduction')}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                  type === 'deduction'
                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Deduction (-)
              </button>
              <button
                type="button"
                onClick={() => setType('bonus')}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                  type === 'bonus'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Bonus (+)
              </button>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Amount ({settings.currencySymbol}) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-neutral-500 font-mono">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Cash">Cash Handout</option>
                <option value="UPI / Mobile Pay">eSewa / Khalti Mobile Wallet</option>
                <option value="Bank Transfer">Bank Transfer / ConnectIPS</option>
                <option value="Cheque">Bank Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Voucher / Receipt No.
              </label>
              <input
                type="text"
                placeholder="REC-101"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Purpose / Reason
            </label>
            <input
              type="text"
              placeholder="e.g. Mid-week family expense, tool replacement, festival bonus"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {selectedLabour && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg text-xs text-neutral-600 dark:text-neutral-400">
              Worker: <span className="font-semibold text-neutral-900 dark:text-white">{selectedLabour.name}</span> · Daily Wage: <span className="font-mono text-neutral-900 dark:text-white">{settings.currencySymbol}{selectedLabour.dailyWage}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
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
              <DollarSign className="w-4 h-4" />
              <span>Record Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
