import React from 'react';
import { ActiveTab } from '../types';
import { 
  Home, 
  CalendarCheck, 
  Calculator, 
  Users, 
  CheckCheck,
  CreditCard,
  Grid3X3
} from 'lucide-react';

interface AndroidBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onQuickRollCall: () => void;
  activeLabourCount: number;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onQuickRollCall,
  activeLabourCount,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] select-none no-print">
      <div className="max-w-md md:max-w-xl mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Tab 1: Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'home'
              ? 'text-[#5C2D91]'
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className={`text-[10px] mt-0.5 ${activeTab === 'home' ? 'font-bold' : 'font-medium'}`}>
            Home
          </span>
          {activeTab === 'home' && (
            <span className="w-1 h-1 rounded-full bg-[#5C2D91] mt-0.5" />
          )}
        </button>

        {/* Tab 2: Daily Attendance */}
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'attendance'
              ? 'text-[#5C2D91]'
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <CalendarCheck className={`w-5 h-5 ${activeTab === 'attendance' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className={`text-[10px] mt-0.5 ${activeTab === 'attendance' ? 'font-bold' : 'font-medium'}`}>
            Roll Call
          </span>
          {activeTab === 'attendance' && (
            <span className="w-1 h-1 rounded-full bg-[#5C2D91] mt-0.5" />
          )}
        </button>

        {/* Center Elevated Floating Action Button (Khalti Scan & Pay Style) */}
        <div className="flex-1 flex flex-col items-center justify-center relative -top-4">
          <button
            onClick={() => {
              setActiveTab('attendance');
              onQuickRollCall();
            }}
            className="w-14 h-14 rounded-full bg-[#5C2D91] hover:bg-[#4E247D] text-white flex items-center justify-center shadow-xl ring-4 ring-white active:scale-95 transition-all group"
            title="Mark Attendance & Quick Roll Call"
          >
            <div className="flex flex-col items-center justify-center">
              <CheckCheck className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </div>
          </button>
          <span className="text-[10px] font-bold text-[#5C2D91] mt-1 tracking-tight">
            Mark Today
          </span>
        </div>

        {/* Tab 4: Wages / Payroll */}
        <button
          onClick={() => setActiveTab('payroll')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'payroll'
              ? 'text-[#5C2D91]'
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <Calculator className={`w-5 h-5 ${activeTab === 'payroll' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className={`text-[10px] mt-0.5 ${activeTab === 'payroll' ? 'font-bold' : 'font-medium'}`}>
            Wages
          </span>
          {activeTab === 'payroll' && (
            <span className="w-1 h-1 rounded-full bg-[#5C2D91] mt-0.5" />
          )}
        </button>

        {/* Tab 5: Labour Roster */}
        <button
          onClick={() => setActiveTab('labourers')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative ${
            activeTab === 'labourers'
              ? 'text-[#5C2D91]'
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'labourers' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className={`text-[10px] mt-0.5 ${activeTab === 'labourers' ? 'font-bold' : 'font-medium'}`}>
            Labourers
          </span>
          {activeTab === 'labourers' && (
            <span className="w-1 h-1 rounded-full bg-[#5C2D91] mt-0.5" />
          )}
          <span className="absolute top-1 right-3 px-1 min-w-[14px] h-[14px] bg-pink-600 text-white font-bold text-[8px] rounded-full flex items-center justify-center">
            {activeLabourCount}
          </span>
        </button>
      </div>
    </div>
  );
};
