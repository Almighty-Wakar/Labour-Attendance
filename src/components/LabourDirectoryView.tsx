import React, { useState, useMemo } from 'react';
import { Labour, AppSettings } from '../types';
import { formatCurrency } from '../utils/calculations';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Phone, 
  Briefcase, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  HardHat,
  Sparkles
} from 'lucide-react';

interface LabourDirectoryViewProps {
  labourers: Labour[];
  onOpenAddLabour: () => void;
  onEditLabour: (labour: Labour) => void;
  onDeleteLabour: (labourId: string) => void;
  onQuickUpdateWage: (labourId: string, dailyWage: number, otRate: number) => void;
  settings: AppSettings;
}

export const LabourDirectoryView: React.FC<LabourDirectoryViewProps> = ({
  labourers,
  onOpenAddLabour,
  onEditLabour,
  onDeleteLabour,
  onQuickUpdateWage,
  settings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Inline editing state for quick wage updates
  const [editingLabourId, setEditingLabourId] = useState<string | null>(null);
  const [inlineDailyWage, setInlineDailyWage] = useState<number>(0);
  const [inlineOtRate, setInlineOtRate] = useState<number>(0);

  const roles = useMemo(() => {
    const set = new Set(labourers.map((l) => l.role));
    return ['all', ...Array.from(set)];
  }, [labourers]);

  const filteredLabourers = useMemo(() => {
    return labourers.filter((l) => {
      const matchesSearch =
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.workerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.phone.includes(searchQuery);
      const matchesRole = roleFilter === 'all' || l.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [labourers, searchQuery, roleFilter, statusFilter]);

  const handleStartInlineEdit = (labour: Labour) => {
    setEditingLabourId(labour.id);
    setInlineDailyWage(labour.dailyWage);
    setInlineOtRate(labour.overtimeHourlyRate);
  };

  const handleSaveInlineWage = (labourId: string) => {
    if (inlineDailyWage <= 0) return;
    onQuickUpdateWage(labourId, inlineDailyWage, inlineOtRate || Math.round(inlineDailyWage / 8));
    setEditingLabourId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <span>Labour Directory & Wage Rates</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Set and adjust daily wage amounts, overtime rates, and trade roles for each worker
            </p>
          </div>

          <button
            onClick={onOpenAddLabour}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Labour</span>
          </button>
        </div>

        {/* Quick Rate Distribution Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase">Total Workers</span>
            <div className="text-lg font-bold text-neutral-900 dark:text-white font-mono mt-0.5">
              {labourers.length}
            </div>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase">Active on Site</span>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
              {labourers.filter((l) => l.status === 'active').length}
            </div>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase">Avg. Daily Wage</span>
            <div className="text-lg font-bold text-neutral-900 dark:text-white font-mono mt-0.5">
              {labourers.length > 0
                ? formatCurrency(
                    Math.round(
                      labourers.reduce((acc, c) => acc + c.dailyWage, 0) / labourers.length
                    ),
                    settings.currencySymbol
                  )
                : '-'}
            </div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200/60 dark:border-amber-800/50">
            <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase">
              Full Day Rate Range
            </span>
            <div className="text-lg font-bold text-neutral-900 dark:text-white font-mono mt-0.5">
              {labourers.length > 0
                ? `${formatCurrency(Math.min(...labourers.map((l) => l.dailyWage)), settings.currencySymbol)} – ${formatCurrency(Math.max(...labourers.map((l) => l.dailyWage)), settings.currencySymbol)}`
                : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by worker name, ID, or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r === 'all' ? 'All Roles' : r}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Labour List */}
      {filteredLabourers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <Users className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            No labourers match your filters
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Add a new worker or change your search filter.
          </p>
          <button
            onClick={onOpenAddLabour}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Labour</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLabourers.map((labour) => {
            const isEditing = editingLabourId === labour.id;

            return (
              <div
                key={labour.id}
                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top line: Name, Code, and Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold text-xs font-mono shrink-0 border border-amber-300/40">
                        {labour.workerCode}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                          {labour.name}
                        </h3>
                        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {labour.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-semibold flex items-center gap-1 ${
                          labour.status === 'active'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-neutral-400'
                        }`}
                      >
                        {labour.status === 'active' ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-neutral-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Wage Amounts Box - The Core "Set Their Amounts" Feature */}
                  <div className="mt-4 p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                        Labour Wage Amounts
                      </span>
                      {!isEditing && (
                        <button
                          onClick={() => handleStartInlineEdit(labour)}
                          className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Quick Adjust</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                              Daily Wage ({settings.currencySymbol})
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={inlineDailyWage}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setInlineDailyWage(val);
                                setInlineOtRate(Math.round(val / 8));
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                              OT Rate / Hr ({settings.currencySymbol})
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={inlineOtRate}
                              onChange={(e) => setInlineOtRate(Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white font-mono"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingLabourId(null)}
                            className="px-2.5 py-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveInlineWage(labour.id)}
                            className="px-3 py-1 text-[11px] font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md shadow-xs"
                          >
                            Save Rates
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-neutral-500 text-[11px]">Daily Full Wage:</div>
                          <div className="text-base font-extrabold text-neutral-900 dark:text-white font-mono tabular-nums mt-0.5">
                            {formatCurrency(labour.dailyWage, settings.currencySymbol)}
                            <span className="text-xs font-normal text-neutral-500"> /day</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-neutral-500 text-[11px]">Overtime Rate:</div>
                          <div className="text-base font-extrabold text-neutral-900 dark:text-white font-mono tabular-nums mt-0.5">
                            {formatCurrency(labour.overtimeHourlyRate, settings.currencySymbol)}
                            <span className="text-xs font-normal text-neutral-500"> /hr</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact & Meta */}
                  <div className="mt-3.5 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{labour.phone || 'No phone number added'}</span>
                    </div>
                    {labour.notes && (
                      <div className="text-[11px] text-neutral-500 mt-1 italic">
                        "{labour.notes}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400">
                    Joined: {labour.joiningDate}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditLabour(labour)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${labour.name} (${labour.workerCode}) from directory?`)) {
                          onDeleteLabour(labour.id);
                        }
                      }}
                      className="p-1 text-neutral-400 hover:text-rose-600 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title="Delete Labour"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
