# 🔒 DesignInk Roster - Development Guide

## ⚠️ CRITICAL: PDF GENERATION LOGIC IS LOCKED

**DO NOT MODIFY** the following file without explicit user permission:
- `src/utils/pdfGenerator.js`

### Protected PDF Logic
The PDF generation system is **LOCKED** and **FINALIZED**. Any changes to this logic require explicit user approval.

**Protected Components:**
- Font size (currently: 16)
- Field mappings (all DD/MM/YY fields)
- Date formatting logic
- Shift time calculations
- CL/VL 6H logic
- Total OT calculations
- Template path (`New_fillable_v3.pdf`)

---

## 📋 Current Application Structure

### Core Files
```
src/
├── components/
│   ├── Calendar.jsx          # Main roster calendar view
│   ├── ProfileForm.jsx       # User profile editor
│   ├── EditDayModal.jsx      # Shift editing modal
│   └── ui/                   # Reusable UI components
├── pages/
│   ├── CalendarPage.jsx      # Calendar page wrapper
│   ├── ProfilePage.jsx       # Profile management
│   ├── NursesPage.jsx        # News/resources hub
│   └── SummaryPage.jsx       # Monthly summary
├── utils/
│   ├── pdfGenerator.js       # 🔒 LOCKED - PDF generation
│   ├── reportingPeriod.js    # Date calculations
│   └── validation.js         # Data validation
├── context/
│   └── StoreContext.jsx      # State management + Firebase
└── lib/
    └── firebase.js           # Firebase configuration
```

---

## ✅ Safe Areas for Development

### 1. **UI/UX Improvements**
You can freely modify:
- Component styling (CSS/Tailwind classes)
- Layout changes
- Color schemes
- Animations
- Responsive design

**Files you can edit:**
- All files in `src/components/ui/`
- `src/index.css`
- Component JSX (layout/styling only)

### 2. **New Features**
Safe additions:
- New pages/routes
- Additional calendar views
- Export formats (Excel, CSV, etc.)
- Notifications/reminders
- Dark mode
- Print layouts

**Example - Adding a new page:**
```jsx
// 1. Create: src/pages/ReportsPage.jsx
// 2. Add route in src/App.jsx
// 3. Add navigation link in RosterLayout.jsx
```

### 3. **Data Management**
You can enhance:
- Profile fields (add new, non-PDF fields)
- Shift types/categories
- Validation rules
- Data export/import

**Example - Adding new profile field:**
```jsx
// 1. Update StoreContext.jsx initialProfile
// 2. Add input in ProfileForm.jsx
// ⚠️ DO NOT modify pdfGenerator.js unless user approves
```

### 4. **Firebase/Auth**
Safe to modify:
- Authentication flows
- Data structure (Firestore)
- Security rules
- Backup/restore features

---

## 🚫 What NOT to Change

### Never modify without permission:
1. **PDF Generation Logic** (`src/utils/pdfGenerator.js`)
   - Field mappings
   - Date formats
   - Calculations
   - Template references

2. **Core Business Logic**
   - Reporting period calculations (unless user requests)
   - Shift hour calculations
   - OT formulas

3. **Template Files**
   - `public/New_fillable_v3.pdf`

---

## 🛠️ Development Workflow

### 1. **Setup & Running**
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Firebase
firebase deploy
```

### 2. **Making Changes**
1. **Always ask first** if unsure about PDF logic impact
2. Test locally before deploying
3. Keep changes focused and modular
4. Document new features

### 3. **Testing PDF Generation**
```bash
# Create test script in scripts/
node scripts/your_test.js

# Verify output PDF manually
```

---

## 📦 Recommended Enhancements

### High Priority
- [ ] Add data backup/export feature
- [ ] Implement print-friendly calendar view
- [ ] Add shift templates (save/load common patterns)
- [ ] Email/SMS notifications for upcoming shifts

### Medium Priority
- [ ] Dark mode support
- [ ] Mobile app (React Native wrapper)
- [ ] Multi-language support
- [ ] Admin dashboard for hospital management

### Low Priority
- [ ] Statistics/analytics dashboard
- [ ] Shift swap/trade with colleagues
- [ ] Integration with hospital systems
- [ ] Automated schedule optimization

---

## 🔐 Security Best Practices

1. **Never expose sensitive data** in client-side code
2. Use **Firebase Security Rules** properly
3. Validate all user inputs
4. Keep dependencies updated
5. Use environment variables for configs

---

## 📞 Need to Modify PDF Logic?

**Before making changes:**
1. ✅ Get explicit user approval
2. ✅ Document what will change
3. ✅ Create backup of current version
4. ✅ Test thoroughly with real data
5. ✅ Deploy only after user verification

---

## 🎯 Quick Reference

### Current PDF Settings (LOCKED)
- **Font Size:** 16
- **Template:** `New_fillable_v3.pdf`
- **Date Format:** YY/MM/DD
- **CL/VL Hours:** 6H
- **OT Calculation:** Total Hours - 36

### Firebase Config
- **Project:** designink-roster
- **Hosting:** https://designink-roster.web.app
- **Database:** Cloud Firestore

### Key Commands
```bash
npm run dev      # Start development
npm run build    # Build production
firebase deploy  # Deploy to hosting
```

---

**Last Updated:** 2026-02-10  
**PDF Logic Version:** v3 (LOCKED)
