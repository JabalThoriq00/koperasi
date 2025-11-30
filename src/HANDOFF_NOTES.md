# 🏦 Aplikasi Koperasi Modern - Handoff Notes

## 📋 Overview

UI aplikasi web koperasi modern yang responsif dengan tema hijau profesional. Aplikasi ini dibangun menggunakan React + Zustand untuk state management dengan dummy data, **belum terhubung dengan API backend**.

---

## 🎨 Design System

### Color Palette
- **Primary**: `#1D8348` (Hijau Tua)
- **Primary Light**: `#27AE60` (Hijau Sedang)
- **Primary Lighter**: `#A9DFBF` (Hijau Muda)
- **Approved**: `#27AE60` (Hijau)
- **Pending**: `#F1C40F` (Kuning)
- **Rejected**: `#E74C3C` (Merah)

### Typography
- **Font Family**: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Font Sizes**: Menggunakan default typography dari `/styles/globals.css`
- **Font Weights**: 400 (regular), 600 (semibold), 700 (bold)

### Spacing & Layout
- **Border Radius**: 12px (rounded-xl)
- **Card Shadow**: shadow-md (elevasi 2-3)
- **Padding**: Konsisten menggunakan Tailwind spacing (p-4, p-6, p-8)
- **Gaps**: gap-2, gap-3, gap-4 untuk spacing antar elemen

### Icons
- **Library**: Lucide React
- **Size**: w-5 h-5 (default), w-6 h-6 (larger icons)

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (default)
- **Desktop**: >= 768px (md:), >= 1024px (lg:)

### Mobile-Specific Features
1. **Sidebar → Bottom Navigation**
   - Sidebar hilang di mobile
   - Muncul bottom navbar dengan 5 menu utama
   - Hamburger menu untuk akses full menu

2. **Table → Card List**
   - Desktop: Menggunakan komponen `<Table />`
   - Mobile: Menggunakan komponen `<ListItem />` dalam format card

3. **Modal Full Screen**
   - Modal otomatis full screen di mobile
   - Scrollable content

4. **Floating Action Button**
   - Hanya muncul di mobile
   - Akses cepat untuk Setor Simpanan & Ajukan Pinjaman

---

## 🧩 Komponen Reusable

### 1. Button (`/components/Button.tsx`)
```tsx
<Button variant="primary" size="md" fullWidth>
  Click Me
</Button>
```
- **Variants**: primary, secondary, danger, ghost
- **Sizes**: sm, md, lg
- **Props**: fullWidth, disabled, onClick, dll

### 2. Input, Textarea, Select (`/components/Input.tsx`)
```tsx
<Input
  label="Email"
  type="email"
  placeholder="Enter email"
  error="Error message"
  icon={<Mail />}
/>
```

### 3. CardInfo (`/components/CardInfo.tsx`)
```tsx
<CardInfo
  title="Total Nasabah"
  value="150"
  icon={<Users />}
  iconBg="bg-[#A9DFBF]"
  onClick={handleClick}
/>
```

### 4. Table & ListItem (`/components/Table.tsx`)
```tsx
// Desktop
<Table columns={columns} data={data} onRowClick={handleRowClick} />

// Mobile
<ListItem onClick={handleClick}>
  <div>Content</div>
</ListItem>
```

### 5. StatusBadge (`/components/StatusBadge.tsx`)
```tsx
<StatusBadge status="approved" size="md" />
```
- Status: approved, pending, rejected, active, suspended, paid, unpaid, overdue

### 6. Modal (`/components/Modal.tsx`)
```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Title"
  size="md"
>
  Content
</Modal>
```
- Size: sm, md, lg, full

### 7. OCRResult (`/components/OCRResult.tsx`)
```tsx
<OCRResult result={ocrData} expectedAmount={500000} />
```
- Menampilkan hasil OCR dari bukti transfer
- Auto validasi jika nominal cocok

### 8. WAButton & WAStatusIcon (`/components/WAButton.tsx`)
```tsx
<WAButton sent={false} onClick={handleSend} />
<WAStatusIcon sent={true} />
```

### 9. Snackbar + useSnackbar Hook (`/components/Snackbar.tsx`)
```tsx
const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

showSnackbar('Success message', 'success');

<Snackbar {...snackbar} onClose={closeSnackbar} />
```
- Types: success, error, warning, info

---

## 🗂️ State Management (Zustand)

### Store Location
`/store/useStore.ts`

### State Structure
```typescript
{
  // Auth
  currentUser: User | null
  isAuthenticated: boolean
  
  // Data
  users: User[]
  transactions: Transaction[]
  loans: Loan[]
  notifications: Notification[]
}
```

### Main Methods
```typescript
// Auth
login(email, password)
logout()
register(userData)

// Transactions
addTransaction(transaction)
updateTransactionStatus(id, status)
getUserTransactions(userId)

// Savings
getUserBalance(userId)

// Loans
addLoan(loan)
getUserLoans(userId)
getUserActiveLoan(userId)

// Admin Stats
getTotalMembers()
getTotalSavings()
getTotalLoans()
getPendingApprovals()
```

---

## 📄 Halaman-Halaman

### 1. **Login** (`/pages/LoginPage.tsx`)
- Email/HP + Password
- Demo accounts tersedia
- Responsive layout

### 2. **Register** (`/pages/RegisterPage.tsx`)
- Form biodata lengkap
- Upload KTP dengan preview
- Auto status "pending approval"

### 3. **Dashboard Nasabah** (`/pages/DashboardNasabahPage.tsx`)
- Info card: Saldo, Pinjaman, Angsuran
- Quick actions: Setor & Ajukan Pinjaman
- Riwayat transaksi terakhir
- Floating button (mobile)
- Alert jika akun pending

### 4. **Dashboard Admin** (`/pages/DashboardAdminPage.tsx`)
- Statistik: Total Nasabah, Simpanan, Pinjaman, Tunggakan
- Antrean approval
- Quick actions

### 5. **Simpanan** (`/pages/SimpananPage.tsx`)
- Saldo card dengan gradient
- Form setor simpanan + upload bukti
- Riwayat setoran

### 6. **Penarikan** (dalam `App.tsx`)
- Form penarikan dengan validasi saldo
- Riwayat penarikan

### 7. **Pinjaman** (`/pages/PinjamanPage.tsx`)
- Card pinjaman aktif
- Form ajukan pinjaman
- Jadwal angsuran (modal)
- Status pembayaran per bulan

### 8. **Riwayat Transaksi** (dalam `App.tsx`)
- Semua transaksi user
- Filter by type & date

### 9. **Approval Admin** (`/pages/ApprovalPage.tsx`)
- Table/List pending approvals
- Detail transaksi dengan OCR result
- Tombol Approve/Reject
- Auto approve toggle
- WhatsApp notification

### 10. **Notifikasi WA Log** (dalam `App.tsx`)
- Log pengiriman WhatsApp
- Status terkirim + timestamp

### 11. **Profil** (dalam `App.tsx`)
- Info user lengkap
- Status akun
- Member since

### 12. **404 Error Page** (`/pages/NotFoundPage.tsx`)
- Friendly error message
- Navigation buttons

---

## 🔐 Authentication Flow

1. **Login**: Email/password → Set currentUser → Redirect ke dashboard
2. **Register**: Form → Status "pending" → Admin approval diperlukan
3. **Pending User**: Bisa login tapi tidak bisa transaksi
4. **Logout**: Clear currentUser → Redirect ke login

---

## 📊 Dummy Data

### Demo Accounts
```
Nasabah:
  Email: budi@example.com
  Password: password (any password works for demo)

Admin:
  Email: admin@koperasi.com
  Password: password (any password works for demo)
```

### Data Structure
- **4 Users** (2 nasabah aktif, 1 admin, 1 pending)
- **4 Sample Transactions** (berbagai status)
- **2 Active Loans** dengan jadwal angsuran
- **3 Notifications**

---

## 🎯 Features Highlight

### Nasabah Features
✅ Setor simpanan dengan upload bukti transfer  
✅ Ajukan pinjaman dengan estimasi angsuran  
✅ Lihat jadwal angsuran detail  
✅ Riwayat transaksi lengkap  
✅ Notifikasi real-time  
✅ Tarik simpanan  

### Admin Features
✅ Dashboard statistik real-time  
✅ Approval transaksi dengan OCR preview  
✅ Auto-approve jika OCR cocok  
✅ Kirim notifikasi WhatsApp  
✅ Kelola data nasabah  
✅ Log notifikasi WA  

---

## 🚀 Next Steps untuk Integrasi Backend

### 1. API Integration
Ganti dummy data dengan API calls:
```typescript
// Contoh di useStore.ts
login: async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  set({ currentUser: data.user, isAuthenticated: true });
}
```

### 2. File Upload
Implementasi upload file ke server:
```typescript
const formData = new FormData();
formData.append('file', file);
await fetch('/api/upload', { method: 'POST', body: formData });
```

### 3. Real OCR Integration
Integrasikan dengan OCR service (Tesseract, Google Vision, dll)

### 4. WhatsApp Integration
Integrasikan dengan WhatsApp Business API

### 5. Real-time Notifications
Implementasi WebSocket atau Server-Sent Events untuk notifikasi real-time

---

## 📝 Technical Notes

### Routing
- Menggunakan **hash-based routing** (`window.location.hash`)
- Format: `#dashboard`, `#simpanan`, dll
- Mudah diganti dengan React Router jika diperlukan

### Form Handling
- Menggunakan controlled components
- Validasi client-side basic
- Siap untuk integrasi dengan React Hook Form atau Formik

### Image Handling
- Preview menggunakan FileReader API
- Base64 encoding untuk dummy data
- Siap untuk URL dari CDN/storage

### State Persistence
- Saat ini state hilang saat refresh
- Bisa ditambahkan localStorage persistence
- Atau session management dengan cookies/JWT

---

## ✅ Checklist Handoff

- [x] Semua halaman responsif (desktop & mobile)
- [x] Komponen reusable tersedia
- [x] Zustand state management terintegrasi
- [x] Dummy data lengkap dan realistis
- [x] UI bersih dan profesional
- [x] Color scheme konsisten (tema hijau)
- [x] Error handling basic (snackbar)
- [x] Loading states (dapat ditambahkan)
- [x] Auto layout aktif (Tailwind + Flexbox/Grid)
- [x] Component variants (Button, Badge, dll)
- [x] Desktop & Mobile frames untuk semua halaman

---

## 🎨 Design Tokens (CSS Variables)

```css
--primary: #1D8348
--primary-light: #27AE60
--primary-lighter: #A9DFBF
--approved: #27AE60
--pending: #F1C40F
--rejected: #E74C3C
```

Accessible via Tailwind atau CSS `var(--primary)`

---

## 📞 Support

Untuk pertanyaan teknis atau klarifikasi desain, silakan hubungi tim development.

**Status**: ✅ Ready for Frontend Integration  
**Backend**: ❌ Belum terhubung API (menggunakan dummy data)

---

*Generated: November 30, 2024*  
*Version: 1.0.0*
