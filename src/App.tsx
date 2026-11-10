/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Labour, 
  AttendanceRecord, 
  AdvanceTransaction, 
  AppSettings, 
  ActiveTab, 
  LabourWageSummary 
} from './types';
import { 
  loadLabourers, 
  saveLabourers, 
  loadAttendance, 
  saveAttendance, 
  loadAdvances, 
  saveAdvances, 
  loadSettings, 
  saveSettings, 
  resetAllData 
} from './utils/storage';
import { toDateStr, calculateLabourWage } from './utils/calculations';
import { AndroidHeader } from './components/AndroidHeader';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { HomeDashboardView } from './components/HomeDashboardView';
import { DailyAttendanceView } from './components/DailyAttendanceView';
import { PayrollCalculatorView } from './components/PayrollCalculatorView';
import { LabourDirectoryView } from './components/LabourDirectoryView';
import { AdvancesLedgerView } from './components/AdvancesLedgerView';
import { MonthlyMatrixView } from './components/MonthlyMatrixView';
import { LabourModal } from './components/LabourModal';
import { AdvanceModal } from './components/AdvanceModal';
import { PayslipModal } from './components/PayslipModal';
import { SettingsModal } from './components/SettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Smartphone, Monitor } from 'lucide-react';

import { INITIAL_LABOURERS, DEFAULT_SETTINGS } from './utils/seedData';

export default function App() {
  const [labourers, setLabourers] = useState<Labour[]>(() => {
    try {
      return loadLabourers();
    } catch {
      return INITIAL_LABOURERS;
    }
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      return loadAttendance();
    } catch {
      return [];
    }
  });

  const [advances, setAdvances] = useState<AdvanceTransaction[]>(() => {
    try {
      return loadAdvances();
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      return loadSettings();
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Default to the Khalti-style Home Dashboard
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedDate, setSelectedDate] = useState<string>(toDateStr(new Date()));
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);

  // Modals state
  const [isLabourModalOpen, setIsLabourModalOpen] = useState(false);
  const [editingLabour, setEditingLabour] = useState<Labour | null>(null);

  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [preselectedLabourId, setPreselectedLabourId] = useState<string | undefined>(undefined);

  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [payslipSummary, setPayslipSummary] = useState<LabourWageSummary | null>(null);
  const [payslipStart, setPayslipStart] = useState<string>('');
  const [payslipEnd, setPayslipEnd] = useState<string>('');

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Initial load
  useEffect(() => {
    setLabourers(loadLabourers());
    setAttendance(loadAttendance());
    setAdvances(loadAdvances());
    setSettings(loadSettings());
  }, []);

  // Calculate Month Total Wage Liability for the Khalti Balance Card
  const totalMonthWageLiability = useMemo(() => {
    const now = new Date();
    const startStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const endStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    let total = 0;
    labourers
      .filter((l) => l.status === 'active')
      .forEach((l) => {
        const summary = calculateLabourWage(l, attendance, advances, startStr, endStr, settings);
        total += Math.max(0, summary.netPayable);
      });
    return total;
  }, [labourers, attendance, advances, settings]);

  // Handlers for Attendance
  const handleUpdateAttendance = (record: AttendanceRecord) => {
    setAttendance((prev) => {
      const idx = prev.findIndex(
        (r) => r.id === record.id || (r.labourId === record.labourId && r.date === record.date)
      );
      let next: AttendanceRecord[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = record;
      } else {
        next = [...prev, record];
      }
      saveAttendance(next);
      return next;
    });
  };

  const handleBulkUpdateAttendance = (records: AttendanceRecord[]) => {
    setAttendance((prev) => {
      const next = [...prev];
      records.forEach((newRec) => {
        const idx = next.findIndex(
          (r) => r.id === newRec.id || (r.labourId === newRec.labourId && r.date === newRec.date)
        );
        if (idx >= 0) {
          next[idx] = newRec;
        } else {
          next.push(newRec);
        }
      });
      saveAttendance(next);
      return next;
    });
  };

  const handleQuickMarkAll = (status: 'present' | 'absent') => {
    const todayStr = toDateStr(new Date());
    const newRecords: AttendanceRecord[] = labourers
      .filter((l) => l.status === 'active')
      .map((l) => ({
        id: `${l.id}_${todayStr}`,
        labourId: l.id,
        date: todayStr,
        status,
        overtimeHours: 0,
        siteLocation: settings.worksiteName,
        notes: `Quick 1-tap ${status} via Android Home`,
        updatedAt: new Date().toISOString(),
      }));

    handleBulkUpdateAttendance(newRecords);
  };

  // Handlers for Labourers
  const handleSaveLabour = (labour: Labour) => {
    setLabourers((prev) => {
      const idx = prev.findIndex((l) => l.id === labour.id);
      let next: Labour[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = labour;
      } else {
        next = [labour, ...prev];
      }
      saveLabourers(next);
      return next;
    });
  };

  const handleDeleteLabour = (labourId: string) => {
    setLabourers((prev) => {
      const next = prev.filter((l) => l.id !== labourId);
      saveLabourers(next);
      return next;
    });
  };

  const handleQuickUpdateWage = (labourId: string, dailyWage: number, otRate: number) => {
    setLabourers((prev) => {
      const next = prev.map((l) => {
        if (l.id === labourId) {
          return {
            ...l,
            dailyWage,
            overtimeHourlyRate: otRate,
          };
        }
        return l;
      });
      saveLabourers(next);
      return next;
    });
  };

  // Handlers for Advances & Deductions
  const handleSaveAdvance = (tx: AdvanceTransaction) => {
    setAdvances((prev) => {
      const next = [tx, ...prev];
      saveAdvances(next);
      return next;
    });
  };

  const handleDeleteAdvance = (id: string) => {
    setAdvances((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveAdvances(next);
      return next;
    });
  };

  // Handlers for Settings & Reset
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleResetData = () => {
    const res = resetAllData();
    setLabourers(res.labourers);
    setAttendance(res.attendance);
    setAdvances(res.advances);
    setSettings(res.settings);
  };

  const handleImportData = (data: {
    labourers: Labour[];
    attendance: AttendanceRecord[];
    advances: AdvanceTransaction[];
    settings?: AppSettings;
  }) => {
    setLabourers(data.labourers);
    saveLabourers(data.labourers);

    setAttendance(data.attendance);
    saveAttendance(data.attendance);

    setAdvances(data.advances);
    saveAdvances(data.advances);

    if (data.settings) {
      setSettings(data.settings);
      saveSettings(data.settings);
    }
  };

  // Modal openers
  const handleOpenAddLabour = () => {
    setEditingLabour(null);
    setIsLabourModalOpen(true);
  };

  const handleEditLabour = (labour: Labour) => {
    setEditingLabour(labour);
    setIsLabourModalOpen(true);
  };

  const handleOpenAdvanceModal = (labourId?: string) => {
    setPreselectedLabourId(labourId);
    setIsAdvanceModalOpen(true);
  };

  const handleOpenPayslip = (summary: LabourWageSummary, start: string, end: string) => {
    setPayslipSummary(summary);
    setPayslipStart(start);
    setPayslipEnd(end);
    setIsPayslipModalOpen(true);
  };

  const activeWorkersCount = labourers.filter((l) => l.status === 'active').length;

  return (
    <div className="min-h-screen bg-[#F3F4F8] text-neutral-900 flex flex-col font-sans transition-colors antialiased">
      {/* Optional Desktop Viewport Mode Toggle (hidden when printing or on small screens) */}
      <div className="hidden md:flex items-center justify-between max-w-5xl mx-auto w-full px-4 pt-3 pb-1 no-print">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5C2D91]" />
          <span>Labour Attendance Android App</span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-neutral-200 text-xs shadow-2xs">
          <button
            onClick={() => setIsPhoneFrame(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              isPhoneFrame
                ? 'bg-[#5C2D91] text-white font-bold shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Frame</span>
          </button>
          <button
            onClick={() => setIsPhoneFrame(false)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              !isPhoneFrame
                ? 'bg-[#5C2D91] text-white font-bold shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Responsive View</span>
          </button>
        </div>
      </div>

      {/* Main Container: Full screen on mobile; phone frame or responsive container on desktop */}
      <div
        className={`w-full mx-auto flex-1 flex flex-col transition-all ${
          isPhoneFrame
            ? 'max-w-[420px] my-4 rounded-[40px] shadow-[0_25px_60px_-15px_rgba(92,45,145,0.3)] border-[8px] border-neutral-800 bg-white overflow-hidden relative'
            : 'max-w-md md:max-w-3xl lg:max-w-4xl'
        }`}
      >
        {/* Android Khalti-Style Purple Header */}
        <AndroidHeader
          settings={settings}
          totalWageLiability={totalMonthWageLiability}
          activeWorkersCount={activeWorkersCount}
          onOpenAddLabour={handleOpenAddLabour}
          onOpenAdvanceModal={() => handleOpenAdvanceModal()}
          onOpenAttendance={() => setActiveTab('attendance')}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onRefreshData={() => {
            setLabourers(loadLabourers());
            setAttendance(loadAttendance());
            setAdvances(loadAdvances());
          }}
        />

        {/* Content Area */}
        <main className="flex-1 w-full px-3 sm:px-4 py-4 pb-28">
          {activeTab === 'home' && (
            <HomeDashboardView
              labourers={labourers}
              attendance={attendance}
              advances={advances}
              settings={settings}
              setActiveTab={setActiveTab}
              onOpenAddLabour={handleOpenAddLabour}
              onOpenAdvanceModal={handleOpenAdvanceModal}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
              onQuickMarkAll={handleQuickMarkAll}
            />
          )}

          {activeTab === 'attendance' && (
            <DailyAttendanceView
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              labourers={labourers}
              attendance={attendance}
              onUpdateAttendance={handleUpdateAttendance}
              onBulkUpdateAttendance={handleBulkUpdateAttendance}
              onOpenAdvanceModal={handleOpenAdvanceModal}
              onOpenAddLabour={handleOpenAddLabour}
              settings={settings}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollCalculatorView
              labourers={labourers}
              attendance={attendance}
              advances={advances}
              settings={settings}
              onOpenPayslip={handleOpenPayslip}
              onOpenAdvanceModal={handleOpenAdvanceModal}
              onOpenAddLabour={handleOpenAddLabour}
            />
          )}

          {activeTab === 'labourers' && (
            <LabourDirectoryView
              labourers={labourers}
              onOpenAddLabour={handleOpenAddLabour}
              onEditLabour={handleEditLabour}
              onDeleteLabour={handleDeleteLabour}
              onQuickUpdateWage={handleQuickUpdateWage}
              settings={settings}
            />
          )}

          {activeTab === 'advances' && (
            <AdvancesLedgerView
              advances={advances}
              labourers={labourers}
              onOpenAdvanceModal={handleOpenAdvanceModal}
              onDeleteTransaction={handleDeleteAdvance}
              settings={settings}
            />
          )}

          {activeTab === 'matrix' && (
            <MonthlyMatrixView
              labourers={labourers}
              attendance={attendance}
              onUpdateAttendance={handleUpdateAttendance}
              settings={settings}
            />
          )}
        </main>

        {/* Android Bottom Navigation Bar */}
        <AndroidBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onQuickRollCall={() => handleQuickMarkAll('present')}
          activeLabourCount={activeWorkersCount}
        />
      </div>

      {/* Modals */}
      <LabourModal
        isOpen={isLabourModalOpen}
        onClose={() => setIsLabourModalOpen(false)}
        onSave={handleSaveLabour}
        initialLabour={editingLabour}
        settings={settings}
        existingCodes={labourers.map((l) => l.workerCode)}
      />

      <AdvanceModal
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        onSave={handleSaveAdvance}
        labourers={labourers}
        preselectedLabourId={preselectedLabourId}
        settings={settings}
      />

      <PayslipModal
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        summary={payslipSummary}
        startDate={payslipStart}
        endDate={payslipEnd}
        settings={settings}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetData={handleResetData}
        onImportData={handleImportData}
        labourers={labourers}
        attendance={attendance}
        advances={advances}
      />

      {/* Offline Connectivity Notification */}
      <OfflineIndicator />
    </div>
  );
}
