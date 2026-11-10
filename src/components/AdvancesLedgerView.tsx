import React, { useState, useMemo } from 'react';
import { Labour, AdvanceTransaction, AppSettings, TransactionType } from '../types';
import { formatCurrency } from '../utils/calculations';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Gift, 
  Calendar,
  Receipt
} from 'lucide-react';

interface AdvancesLedgerViewProps {
  advances: AdvanceTransaction[];
  labourers: Labour[];
  onOpenAdvanceModal: (labourId?: string) => void;
  onDeleteTransaction: (id: string) => void;
  settings: AppSettings;
}

export const AdvancesLedgerView: React.FC<AdvancesLedgerViewProps> = ({
  advances,
  labourers,
  onOpenAdvanceModal,
  onDeleteTransaction,
  settings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabourId, setSelectedLabourId] = useState('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const labourMap = useMemo(() => {
    const map = new Map<string, Labour>();
    labourers.forEach((l) => map.set(l.id, l));
    return map;
  }, [labourers]);

  const filteredTransactions = useMemo(() => {
    return advances
      .filter((t) => {
        const labour = labourMap.get(t.labourId);
        const matchesSearch =
          (labour?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.receiptNo || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLabour = selectedLabourId === 'all' || t.labourId === selectedLabourId;
        const matchesType = selectedType === 'all' || t.type === selectedType;
        return matchesSearch && matchesLabour && matchesType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [advances, searchQuery, selectedLabourId, selectedType, labourMap]);

  // Aggregate stats
  const totals = useMemo(() => {
    let advancesSum = 0;
    let deductionsSum = 0;
    let bonusSum = 0;

    advances.forEach((t) => {
      if (t.type === 'advance') advancesSum += t.amount;
      else if (t.type === 'deduction') deductionsSum += t.amount;
      else if (t.type === 'bonus') bonusSum += t.amount;
    });

    return {
      advancesSum,
      deductionsSum,
      bonusSum,
      netDeductions: advancesSum + deductionsSum - bonusSum,
    };
  }, [advances]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-500" />
              <span>Labour Advances & Cash Loans Ledger</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Record cash handouts, mid-month loan advances, damage deductions, and bonuses
            </p>
          </div>

          <button
            onClick={() => onOpenAdvanceModal()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Record Advance / Loan</span>
          </button>
        </div>

        {/* Ledger Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase">
              Total Transactions
            </span>
            <div className="text-lg font-bold text-neutral-900 dark:text-white font-mono mt-0.5">
              {advances.length}
            </div>
          </div>

          <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-lg border border-rose-200/60 dark:border-rose-900/40">
            <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase">
              Cash Advances Given
            </span>
            <div className="text-lg font-bold text-rose-700 dark:text-rose-400 font-mono mt-0.5">
              {formatCurrency(totals.advancesSum, settings.currencySymbol)}
            </div>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase">
              Tool & Meal Deductions
            </span>
            <div className="text-lg font-bold text-neutral-900 dark:text-white font-mono mt-0.5">
              {formatCurrency(totals.deductionsSum, settings.currencySymbol)}
            </div>
          </div>

          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
              Special Bonuses
            </span>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
              +{formatCurrency(totals.bonusSum, settings.currencySymbol)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search transactions by worker, description, or receipt #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedLabourId}
            onChange={(e) => setSelectedLabourId(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Labourers</option>
            {labourers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.workerCode})
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Types</option>
            <option value="advance">Cash Advances Only</option>
            <option value="deduction">Deductions Only</option>
            <option value="bonus">Bonuses Only</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Labour / ID</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-4 py-3">Description / Purpose</th>
                <th className="px-3 py-3">Payment Mode</th>
                <th className="px-3 py-3">Receipt #</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-3 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                    No transactions found. Record a new advance above.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const labour = labourMap.get(tx.labourId);

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-neutral-600 dark:text-neutral-400">
                        {tx.date}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-bold text-neutral-900 dark:text-white">
                          {labour?.name || 'Unknown Labour'}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          {labour?.workerCode} · {labour?.role}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        {tx.type === 'advance' ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-rose-700 dark:text-rose-400">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            <span>Advance</span>
                          </span>
                        ) : tx.type === 'deduction' ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300">
                            <span>Deduction</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                            <Gift className="w-3.5 h-3.5" />
                            <span>Bonus</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-neutral-800 dark:text-neutral-200">
                        {tx.description}
                      </td>

                      <td className="px-3 py-3 text-neutral-600 dark:text-neutral-400">
                        {tx.paymentMode}
                      </td>

                      <td className="px-3 py-3 font-mono text-neutral-500">
                        {tx.receiptNo || '-'}
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-extrabold text-sm tabular-nums">
                        {tx.type === 'bonus' ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            +{formatCurrency(tx.amount, settings.currencySymbol)}
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400">
                            -{formatCurrency(tx.amount, settings.currencySymbol)}
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this ledger record?')) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          className="p-1 text-neutral-400 hover:text-rose-600 rounded-md transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
