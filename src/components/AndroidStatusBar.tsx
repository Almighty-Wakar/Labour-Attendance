import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

export const AndroidStatusBar: React.FC = () => {
  const [time, setTime] = useState('2:31');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      // Format 12-hour or 24-hour style
      if (hours > 12) hours -= 12;
      if (hours === 0) hours = 12;
      setTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-between px-6 py-2 text-white/90 text-xs font-semibold select-none z-20">
      {/* Left: Time & notification indicator */}
      <div className="flex items-center gap-1.5 min-w-[50px]">
        <span className="tracking-tight font-medium text-[13px]">{time}</span>
        <span className="w-2 h-2 rounded-full bg-pink-400 opacity-80" />
      </div>

      {/* Center: Android Camera Punch-hole */}
      <div className="flex items-center justify-center">
        <div className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-white/10 shadow-inner flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-neutral-900" />
        </div>
      </div>

      {/* Right: Icons (Signal, Wifi, Battery) */}
      <div className="flex items-center gap-2 text-white/90">
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center gap-0.5">
          <BatteryMedium className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
