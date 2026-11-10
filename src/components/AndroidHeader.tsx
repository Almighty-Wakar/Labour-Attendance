import React, { useState } from 'react';
import { AppSettings } from '../types';
import { 
  Search, 
  Bell, 
  Gift, 
  RotateCw, 
  Eye, 
  EyeOff, 
  UserPlus, 
  Send, 
  CalendarCheck,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { AndroidStatusBar } from './AndroidStatusBar';

interface AndroidHeaderProps {
  settings: AppSettings;
  totalWageLiability: number;
  activeWorkersCount: number;
  onOpenAddLabour: () => void;
  onOpenAdvanceModal: () => void;
  onOpenAttendance: () => void;
  onOpenSettings: () => void;
  onRefreshData?: () => void;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  settings,
  totalWageLiability,
  activeWorkersCount,
  onOpenAddLabour,
  onOpenAdvanceModal,
  onOpenAttendance,
  onOpenSettings,
  onRefreshData,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [isRotating, setIsRotating] = useState(false);

  const handleRefresh = () => {
    setIsRotating(true);
    if (onRefreshData) onRefreshData();
    setTimeout(() => setIsRotating(false), 600);
  };

  return (
    <div className="w-full bg-gradient-to-b from-[#5C2D91] via-[#562788] to-[#4A1D77] text-white pt-1 pb-5 px-4 rounded-b-3xl shadow-lg relative select-none">
      {/* Android System Status Bar */}
      <AndroidStatusBar />

      {/* Top Profile & Utilities Bar */}
      <div className="flex items-center justify-between mt-1 mb-4">
        {/* Profile Avatar & Company Info */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center font-bold text-sm tracking-wide text-white shadow-xs">
              {settings.companyName.slice(0, 2).toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#5C2D91] flex items-center justify-center">
              <ShieldCheck className="w-2.5 h-2.5 text-[#5C2D91]" />
            </span>
          </div>

          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-tight truncate max-w-[150px] sm:max-w-xs">
                {settings.companyName}
              </span>
            </div>
            <p className="text-[11px] text-white/75 truncate max-w-[150px] sm:max-w-xs">
              {settings.worksiteName}
            </p>
          </div>
        </div>

        {/* Action Icons (Search, Offers/Bonus, Notification Bell, Settings) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30 flex items-center justify-center text-xs font-bold">
              <Gift className="w-4 h-4 text-pink-300" />
            </div>
            <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-[14px] rounded-full bg-pink-600 text-white font-extrabold text-[9px] flex items-center justify-center leading-none">
              %
            </span>
          </div>

          <div className="relative">
            <button
              onClick={onOpenAttendance}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 transition-colors"
              title="Daily Attendance Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <span className="absolute -top-1 -right-1 px-1 min-w-[16px] h-[16px] rounded-full bg-pink-600 text-white font-bold text-[9px] flex items-center justify-center shadow-xs">
              {activeWorkersCount}
            </span>
          </div>
        </div>
      </div>

      {/* Main Balance Card & Quick Action Row (Exact Khalti Layout) */}
      <div className="flex items-stretch gap-3">
        {/* Left: White Balance Card */}
        <div className="flex-1 bg-white text-neutral-900 rounded-2xl p-3.5 shadow-md flex items-center justify-between border border-purple-100">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-[#5C2D91] font-mono leading-none">
                {settings.currencySymbol}
              </span>
              <span className="text-xl font-extrabold text-neutral-900 font-mono tracking-tight tabular-nums leading-none">
                {showBalance
                  ? totalWageLiability.toLocaleString('en-IN')
                  : '••••••'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setShowBalance(!showBalance)}
                className="text-neutral-500 hover:text-[#5C2D91] transition-colors"
                title={showBalance ? 'Hide wage balance' : 'Show wage balance'}
              >
                {showBalance ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
              </button>
              <span className="font-semibold text-neutral-600">Wage Liability Balance</span>
            </div>
          </div>

          {/* Refresh sync button */}
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-full text-neutral-400 hover:text-[#5C2D91] hover:bg-purple-50 transition-all ${
              isRotating ? 'animate-spin text-[#5C2D91]' : ''
            }`}
            title="Refresh calculated balance"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Circular Quick Action Buttons (matching Add Money & Send Money) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Add Labour */}
          <button
            onClick={onOpenAddLabour}
            className="flex flex-col items-center gap-1 group text-center focus:outline-none"
          >
            <div className="w-12 h-12 rounded-full bg-white text-[#5C2D91] shadow-md flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-transform border border-purple-100">
              <UserPlus className="w-5 h-5 text-[#5C2D91]" />
            </div>
            <span className="text-[11px] font-semibold text-white/95 leading-tight">
              Add Labour
            </span>
          </button>

          {/* Send Advance */}
          <button
            onClick={onOpenAdvanceModal}
            className="flex flex-col items-center gap-1 group text-center focus:outline-none"
          >
            <div className="w-12 h-12 rounded-full bg-white text-[#5C2D91] shadow-md flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-transform border border-purple-100">
              <Send className="w-5 h-5 text-[#5C2D91]" />
            </div>
            <span className="text-[11px] font-semibold text-white/95 leading-tight">
              Send Advance
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
