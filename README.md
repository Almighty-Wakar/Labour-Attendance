# Labour Attendance - Complete App Bundle

A modern, production-grade Progressive Web App (PWA) for construction contractors, site supervisors, and worksite managers to record daily labour attendance, configure individual wage & overtime rates, track cash loans/advances, and automatically calculate net payable wages with printable vouchers and CSV exports.

---

## 🚀 Quick Start / How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` (or the port shown in your terminal).

### 3. Build the Complete Production App Bundle
To create a standalone production bundle ready for deployment:
```bash
npm run build
```
This generates the optimized production build in the `dist/` directory, including:
- HTML, JavaScript, and Tailwind CSS bundles
- Service Worker (`sw.js`) for full offline caching
- Web App Manifest (`manifest.webmanifest`)
- All icon assets (`pwa-192x192.png`, `pwa-512x512.png`, etc.)

To test your production bundle locally:
```bash
npm run preview
```

---

## 📱 How to Install the App (Android, iOS & Desktop)

Labour Attendance is configured as an installable **Progressive Web App (PWA)** that runs without app store delays and works **100% offline**:

### On Android (Chrome / Brave / Edge)
1. Open the app URL in your browser.
2. Click the **"Install App"** button in the top navigation bar, OR tap the browser menu (⋮) and select **"Add to Home screen"** / **"Install App"**.
3. The app will be placed directly on your phone's home screen and app launcher with its own icon and splash screen.

### On iPhone / iPad (Safari)
1. Open the app URL in Safari.
2. Tap the **Share** button in Safari's bottom toolbar.
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add** in the top right.

### On Desktop (Windows / Mac / Chromebook)
1. In Chrome or Edge, click the **"Install App"** button in the header or the install icon in the URL address bar.
2. The app will launch in its own standalone window with no browser address bar.

---

## 💼 Core Features

### 1. Daily Roll Call (`/src/components/DailyAttendanceView.tsx`)
- **Status Selection**: Fast tactile toggles for **Present (P - 1.0 day)**, **Half Day (HD - 0.5 day)**, and **Absent (A - 0.0 day)**.
- **Overtime Engine**: Increment overtime hours (`+0.5h`, `+1h`, `+2h`, etc.) with live earnings calculated per worker.
- **Daily Liability Total**: Real-time worksite liability banner calculating today's gross wage payout across all workers.
- **Bulk Operations**: One-click "All Present" or "All Absent" for rapid jobsite check-in.
- **Worksite Notes**: Attach specific site tasks or notes per labourer for any day.

### 2. Labour Directory & Wage Rate Manager (`/src/components/LabourDirectoryView.tsx`)
- **Set Individual Wage Amounts**: Set daily rate (e.g. ₹850/day or $50/day) and overtime rate per worker.
- **Auto-Calculate OT**: Automatic overtime hourly rate suggestion (`Daily Wage ÷ 8 hours`).
- **Quick Inline Rate Editor**: Adjust worker wage rates directly on the card without digging into settings.
- **Trade Roles**: Mason, Carpenter, Electrician, Plumber, Welder, Painter, General Labour / Helper, Supervisor.

### 3. Payroll & Total Wage Calculator (`/src/components/PayrollCalculatorView.tsx`)
- **Flexible Date Periods**: Choose *This Month, Last Month, This Week, Past 7 Days*, or select any custom date range.
- **Automated Mathematical Calculation**:
  - `Effective Days = Present + (0.5 × Half Days)`
  - `Base Wages = Effective Days × Daily Rate`
  - `OT Wages = Total OT Hours × OT Hourly Rate`
  - `Gross Wages = Base Wages + OT Wages + Bonuses`
  - `Total Deductions = Cash Advances + Damage / Meal Deductions`
  - `Net Payable Amount = Gross Wages - Total Deductions`
- **Printable Wage Slip Voucher**: One-click printable payslip voucher with contractor and worker signature/thumb impression lines.
- **CSV Spreadsheet Export**: Export full calculation spreadsheet for Excel or accounting.

### 4. Advances & Cash Loans Ledger (`/src/components/AdvancesLedgerView.tsx`)
- Record mid-month cash advances, damage deductions, and bonuses.
- Tracks receipt numbers, date, description, and payment method (Cash, UPI, Bank Transfer).
- Automatically deducts advances from the worker's net payable amount.

### 5. Monthly Attendance Matrix (`/src/components/MonthlyMatrixView.tsx`)
- 31-day visual spreadsheet calendar matrix showing every worker's attendance record across the month.
- Interactive clickable cells to toggle status directly from the monthly sheet.

### 6. Offline Support & Data Backup (`/src/utils/storage.ts`)
- **100% Offline Capable**: Works smoothly in remote areas or basements with poor cellular connection using service workers and browser storage.
- **JSON Backup & Restore**: Export full database backup as JSON or import existing backup at any time.

---

## 📂 Project Architecture

```
├── index.html                   # HTML entry point with PWA meta & fonts
├── metadata.json                # AI Studio application metadata
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration with VitePWA plugin
├── public/
│   ├── icon.svg                 # High-contrast brand vector icon
│   ├── pwa-192x192.png          # PWA 192px icon
│   ├── pwa-512x512.png          # PWA 512px icon
│   ├── pwa-maskable-512x512.png # Android maskable icon
│   └── apple-touch-icon.png     # iOS Safari touch icon
└── src/
    ├── main.tsx                 # React application mounting
    ├── App.tsx                  # Root app orchestrator & state manager
    ├── types.ts                 # TypeScript interfaces
    ├── index.css                # Tailwind CSS v4 styles & print CSS
    ├── hooks/
    │   └── usePWAInstall.ts     # PWA installation event hook
    ├── components/
    │   ├── Header.tsx           # Strict Top Bar with navigation
    │   ├── DailyAttendanceView.tsx  # Daily roll call engine
    │   ├── PayrollCalculatorView.tsx# Wage & payroll calculator
    │   ├── LabourDirectoryView.tsx  # Labour & wage rate manager
    │   ├── AdvancesLedgerView.tsx   # Advances & loans ledger
    │   ├── MonthlyMatrixView.tsx    # 31-day attendance matrix
    │   ├── LabourModal.tsx      # Add/edit worker & set amounts
    │   ├── AdvanceModal.tsx     # Record cash advance / deduction
    │   ├── PayslipModal.tsx     # Printable formal wage voucher
    │   ├── SettingsModal.tsx    # Worksite name, currency, backup
    │   ├── PWAInstallButton.tsx # In-app install button & iOS guide
    │   └── OfflineIndicator.tsx # Offline status banner
    └── utils/
        ├── calculations.ts      # Wage & attendance calculation formulas
        ├── exportCsv.ts         # CSV spreadsheet exporter
        ├── seedData.ts          # Realistic preloaded construction dataset
        └── storage.ts           # LocalStorage repository & JSON backup
```
