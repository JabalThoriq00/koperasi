import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types
export type UserRole = 'nasabah' | 'admin';
export type TransactionType = 'simpanan' | 'penarikan' | 'pinjaman' | 'angsuran';
export type TransactionStatus = 'pending' | 'approved' | 'rejected';
export type SavingsType = 'pokok' | 'wajib' | 'sukarela';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  role: UserRole;
  accountStatus: 'active' | 'pending' | 'suspended';
  ktpUrl?: string;
  address?: string;
  memberSince?: string;
  occupation?: string;
  birthDate?: string;
}

export interface OCRResult {
  senderName: string;
  amount: number;
  date: string;
  referenceNumber: string;
  confidence: number;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: TransactionType;
  savingsType?: SavingsType;
  amount: number;
  status: TransactionStatus;
  date: string;
  proofUrl?: string;
  ocrResult?: OCRResult;
  notes?: string;
  whatsappSent?: boolean;
  whatsappSentAt?: string;
  transactionNumber?: string;
  loanId?: string; // For angsuran
}

export interface Loan {
  id: string;
  userId: string;
  userName?: string;
  amount: number;
  purpose: string;
  status: TransactionStatus;
  approvedAt?: string;
  rejectedAt?: string;
  tenure: number; // months
  monthlyInstallment: number;
  interestRate: number;
  remainingAmount: number;
  installments: Installment[];
  documents?: string[];
  createdAt: string;
}

export interface Installment {
  id: string;
  loanId: string;
  month: number;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: 'paid' | 'unpaid' | 'overdue';
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  whatsappSent: boolean;
  link?: string;
}

export interface SavingsBalance {
  userId: string;
  pokok: number;
  wajib: number;
  sukarela: number;
  total: number;
}

interface AppState {
  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (userData: Partial<User>) => boolean;

  // Users
  users: User[];
  getUser: (id: string) => User | undefined;
  updateUser: (id: string, data: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;
  activateUser: (id: string) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'transactionNumber'>) => string;
  updateTransactionStatus: (id: string, status: TransactionStatus, sendWhatsapp?: boolean) => void;
  getUserTransactions: (userId: string) => Transaction[];
  getTransactionsByType: (type: TransactionType) => Transaction[];

  // Savings (Simpanan)
  addSimpanan: (userId: string, amount: number, savingsType: SavingsType, proofUrl?: string) => string;
  getUserBalance: (userId: string) => number;
  getUserSavingsDetail: (userId: string) => SavingsBalance;
  getMonthlyData: (userId: string) => { month: string; simpanan: number; penarikan: number }[];

  // Withdrawal (Penarikan)
  addPenarikan: (userId: string, amount: number, notes?: string) => string | null;
  canWithdraw: (userId: string, amount: number) => boolean;

  // Loans (Pinjaman)
  loans: Loan[];
  addLoan: (loan: Omit<Loan, 'id' | 'createdAt' | 'installments'>) => string;
  updateLoanStatus: (id: string, status: TransactionStatus) => void;
  getUserLoans: (userId: string) => Loan[];
  getUserActiveLoan: (userId: string) => Loan | undefined;
  payInstallment: (loanId: string, installmentId: string, proofUrl?: string) => string;
  calculateLoan: (amount: number, tenure: number, interestRate: number) => { monthlyInstallment: number; totalPayment: number; totalInterest: number };

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;
  getUserNotifications: (userId: string) => Notification[];
  getUnreadCount: (userId: string) => number;

  // Admin Stats & Actions
  getTotalMembers: () => number;
  getActiveMembers: () => number;
  getTotalSavings: () => number;
  getTotalLoans: () => number;
  getTotalOverdue: () => number;
  getPendingApprovals: () => Transaction[];
  getPendingLoans: () => Loan[];
  getRecentActivities: () => { id: string; message: string; time: string; type: string }[];
  getGrowthData: () => { month: string; nasabah: number; simpanan: number; pinjaman: number }[];
  
  // Admin Approval Actions
  approveTransaction: (transactionId: string) => void;
  rejectTransaction: (transactionId: string, reason?: string) => void;
  approveLoan: (loanId: string) => void;
  rejectLoan: (loanId: string, reason?: string) => void;
  sendWhatsAppNotification: (transactionId: string) => void;

  // Reset (for testing)
  resetToDefault: () => void;
}

// Generate unique IDs
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const generateTransactionNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `TRX${year}${month}${day}${random}`;
};

const formatDate = (date: Date = new Date()) => {
  return date.toISOString().split('T')[0];
};

const formatDateTime = (date: Date = new Date()) => {
  return date.toISOString().replace('T', ' ').substring(0, 19);
};

// Generate installments for a loan
const generateInstallments = (loanId: string, tenure: number, monthlyAmount: number, startDate: Date): Installment[] => {
  const installments: Installment[] = [];
  for (let i = 1; i <= tenure; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    installments.push({
      id: generateId('inst'),
      loanId,
      month: i,
      amount: monthlyAmount,
      dueDate: formatDate(dueDate),
      status: 'unpaid',
    });
  }
  return installments;
};

// Dummy Data
const createDummyUsers = (): User[] => [
  {
    id: '1',
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '08123456789',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    role: 'nasabah',
    accountStatus: 'active',
    address: 'Jl. Merdeka No. 123, Jakarta Selatan',
    memberSince: '2023-01-15',
    occupation: 'Wiraswasta',
    birthDate: '1985-05-20',
  },
  {
    id: '2',
    name: 'Admin Koperasi',
    email: 'admin@koperasi.com',
    phone: '08129876543',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    role: 'admin',
    accountStatus: 'active',
    memberSince: '2022-01-01',
  },
  {
    id: '3',
    name: 'Siti Nurhaliza',
    email: 'siti@example.com',
    phone: '08134567890',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    role: 'nasabah',
    accountStatus: 'active',
    address: 'Jl. Sudirman No. 456, Bandung',
    memberSince: '2023-03-20',
    occupation: 'Pegawai Swasta',
  },
  {
    id: '4',
    name: 'Ahmad Rizki',
    email: 'ahmad@example.com',
    phone: '08145678901',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    role: 'nasabah',
    accountStatus: 'pending',
    memberSince: '2024-11-25',
  },
  {
    id: '5',
    name: 'Dewi Sartika',
    email: 'dewi@example.com',
    phone: '08156789012',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
    role: 'nasabah',
    accountStatus: 'active',
    memberSince: '2023-06-10',
    occupation: 'Dokter',
  },
  {
    id: '6',
    name: 'Rudi Hermawan',
    email: 'rudi@example.com',
    phone: '08167890123',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    role: 'nasabah',
    accountStatus: 'active',
    memberSince: '2023-09-05',
  },
  {
    id: '7',
    name: 'Maya Indah',
    email: 'maya@example.com',
    phone: '08178901234',
    photo: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&h=200&fit=crop',
    role: 'nasabah',
    accountStatus: 'active',
    memberSince: '2024-01-15',
  },
  {
    id: '8',
    name: 'Andi Pratama',
    email: 'andi@example.com',
    phone: '08189012345',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
    role: 'nasabah',
    accountStatus: 'suspended',
    memberSince: '2023-04-20',
  },
  {
    id: '9',
    name: 'Lina Susanti',
    email: 'lina@example.com',
    phone: '08190123456',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    role: 'nasabah',
    accountStatus: 'active',
    memberSince: '2023-11-08',
  },
  {
    id: '10',
    name: 'Hendra Gunawan',
    email: 'hendra@example.com',
    phone: '08101234567',
    photo: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop',
    role: 'nasabah',
    accountStatus: 'active',
    memberSince: '2024-02-28',
  },
  {
    id: '11',
    name: 'Putri Wulandari',
    email: 'putri@example.com',
    phone: '08112345678',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop',
    role: 'nasabah',
    accountStatus: 'pending',
    memberSince: '2024-11-28',
  },
  {
    id: '12',
    name: 'Fajar Nugroho',
    email: 'fajar@example.com',
    phone: '08123456780',
    photo: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop',
    role: 'nasabah',
    accountStatus: 'active',
    memberSince: '2024-05-12',
  },
];

const createDummyTransactions = (): Transaction[] => [
  // Budi's transactions - Active member with many transactions
  { id: 'tr1', userId: '1', userName: 'Budi Santoso', type: 'simpanan', savingsType: 'pokok', amount: 100000, status: 'approved', date: '2023-01-15', whatsappSent: true, whatsappSentAt: '2023-01-15 10:00:00', transactionNumber: 'TRX20230115001' },
  { id: 'tr2', userId: '1', userName: 'Budi Santoso', type: 'simpanan', savingsType: 'wajib', amount: 50000, status: 'approved', date: '2023-02-01', whatsappSent: true, transactionNumber: 'TRX20230201001' },
  { id: 'tr3', userId: '1', userName: 'Budi Santoso', type: 'simpanan', savingsType: 'sukarela', amount: 500000, status: 'approved', date: '2023-04-15', whatsappSent: true, transactionNumber: 'TRX20230415001' },
  { id: 'tr4', userId: '1', userName: 'Budi Santoso', type: 'simpanan', savingsType: 'wajib', amount: 50000, status: 'approved', date: '2023-05-01', whatsappSent: true, transactionNumber: 'TRX20230501001' },
  { id: 'tr5', userId: '1', userName: 'Budi Santoso', type: 'simpanan', savingsType: 'sukarela', amount: 300000, status: 'approved', date: '2023-06-20', whatsappSent: true, transactionNumber: 'TRX20230620001' },
  { id: 'tr6', userId: '1', userName: 'Budi Santoso', type: 'penarikan', amount: 200000, status: 'approved', date: '2023-07-10', whatsappSent: true, transactionNumber: 'TRX20230710001' },
  { id: 'tr7', userId: '1', userName: 'Budi Santoso', type: 'simpanan', savingsType: 'wajib', amount: 50000, status: 'approved', date: '2024-10-01', whatsappSent: true, transactionNumber: 'TRX20241001001' },
  { id: 'tr8', userId: '1', userName: 'Budi Santoso', type: 'simpanan', savingsType: 'wajib', amount: 50000, status: 'approved', date: '2024-11-01', whatsappSent: true, transactionNumber: 'TRX20241101001' },

  // Siti's transactions
  { id: 'tr10', userId: '3', userName: 'Siti Nurhaliza', type: 'simpanan', savingsType: 'pokok', amount: 100000, status: 'approved', date: '2023-03-20', whatsappSent: true, transactionNumber: 'TRX20230320001' },
  { id: 'tr11', userId: '3', userName: 'Siti Nurhaliza', type: 'simpanan', savingsType: 'wajib', amount: 50000, status: 'approved', date: '2023-04-01', whatsappSent: true, transactionNumber: 'TRX20230401002' },
  { id: 'tr12', userId: '3', userName: 'Siti Nurhaliza', type: 'simpanan', savingsType: 'sukarela', amount: 1000000, status: 'approved', date: '2023-05-15', whatsappSent: true, transactionNumber: 'TRX20230515001' },
  { id: 'tr13', userId: '3', userName: 'Siti Nurhaliza', type: 'simpanan', savingsType: 'sukarela', amount: 750000, status: 'pending', date: '2024-11-29', transactionNumber: 'TRX20241129001', ocrResult: { senderName: 'SITI NURHALIZA', amount: 750000, date: '29/11/2024', referenceNumber: 'TRX20241129001', confidence: 92 } },

  // Hendra's pending transaction
  { id: 'tr14', userId: '10', userName: 'Hendra Gunawan', type: 'simpanan', savingsType: 'sukarela', amount: 500000, status: 'pending', date: '2024-11-30', transactionNumber: 'TRX20241130001', ocrResult: { senderName: 'HENDRA GUNAWAN', amount: 500000, date: '30/11/2024', referenceNumber: 'TRX20241130001', confidence: 95 } },

  // Rudi's pending withdrawal
  { id: 'tr15', userId: '6', userName: 'Rudi Hermawan', type: 'penarikan', amount: 1000000, status: 'pending', date: '2024-11-28', transactionNumber: 'TRX20241128001' },

  // Other members' initial deposits
  { id: 'tr20', userId: '5', userName: 'Dewi Sartika', type: 'simpanan', savingsType: 'pokok', amount: 100000, status: 'approved', date: '2023-06-10', whatsappSent: true, transactionNumber: 'TRX20230610001' },
  { id: 'tr21', userId: '5', userName: 'Dewi Sartika', type: 'simpanan', savingsType: 'sukarela', amount: 2000000, status: 'approved', date: '2023-08-20', whatsappSent: true, transactionNumber: 'TRX20230820001' },
  { id: 'tr22', userId: '6', userName: 'Rudi Hermawan', type: 'simpanan', savingsType: 'pokok', amount: 100000, status: 'approved', date: '2023-09-05', whatsappSent: true, transactionNumber: 'TRX20230905001' },
  { id: 'tr23', userId: '6', userName: 'Rudi Hermawan', type: 'simpanan', savingsType: 'sukarela', amount: 5000000, status: 'approved', date: '2023-11-15', whatsappSent: true, transactionNumber: 'TRX20231115001' },
  { id: 'tr24', userId: '7', userName: 'Maya Indah', type: 'simpanan', savingsType: 'pokok', amount: 100000, status: 'approved', date: '2024-01-15', whatsappSent: true, transactionNumber: 'TRX20240115001' },
  { id: 'tr25', userId: '7', userName: 'Maya Indah', type: 'simpanan', savingsType: 'sukarela', amount: 800000, status: 'approved', date: '2024-03-10', whatsappSent: true, transactionNumber: 'TRX20240310001' },
  { id: 'tr26', userId: '9', userName: 'Lina Susanti', type: 'simpanan', savingsType: 'pokok', amount: 100000, status: 'approved', date: '2023-11-08', whatsappSent: true, transactionNumber: 'TRX20231108001' },
  { id: 'tr27', userId: '9', userName: 'Lina Susanti', type: 'simpanan', savingsType: 'sukarela', amount: 600000, status: 'approved', date: '2024-02-20', whatsappSent: true, transactionNumber: 'TRX20240220001' },
  { id: 'tr28', userId: '10', userName: 'Hendra Gunawan', type: 'simpanan', savingsType: 'pokok', amount: 100000, status: 'approved', date: '2024-02-28', whatsappSent: true, transactionNumber: 'TRX20240228001' },
  { id: 'tr29', userId: '10', userName: 'Hendra Gunawan', type: 'simpanan', savingsType: 'sukarela', amount: 1200000, status: 'approved', date: '2024-04-15', whatsappSent: true, transactionNumber: 'TRX20240415002' },
  { id: 'tr30', userId: '12', userName: 'Fajar Nugroho', type: 'simpanan', savingsType: 'pokok', amount: 100000, status: 'approved', date: '2024-05-12', whatsappSent: true, transactionNumber: 'TRX20240512001' },
  { id: 'tr31', userId: '12', userName: 'Fajar Nugroho', type: 'simpanan', savingsType: 'sukarela', amount: 350000, status: 'approved', date: '2024-07-20', whatsappSent: true, transactionNumber: 'TRX20240720001' },
];

const createDummyLoans = (): Loan[] => [
  {
    id: 'ln1',
    userId: '1',
    userName: 'Budi Santoso',
    amount: 5000000,
    purpose: 'Modal Usaha Warung',
    status: 'approved',
    approvedAt: '2024-06-01',
    tenure: 12,
    interestRate: 1.5,
    monthlyInstallment: 450000,
    remainingAmount: 3150000,
    createdAt: '2024-05-28',
    installments: [
      { id: 'in1', loanId: 'ln1', month: 1, amount: 450000, dueDate: '2024-07-01', paidAt: '2024-07-01', status: 'paid' },
      { id: 'in2', loanId: 'ln1', month: 2, amount: 450000, dueDate: '2024-08-01', paidAt: '2024-08-01', status: 'paid' },
      { id: 'in3', loanId: 'ln1', month: 3, amount: 450000, dueDate: '2024-09-01', paidAt: '2024-09-02', status: 'paid' },
      { id: 'in4', loanId: 'ln1', month: 4, amount: 450000, dueDate: '2024-10-01', paidAt: '2024-10-01', status: 'paid' },
      { id: 'in5', loanId: 'ln1', month: 5, amount: 450000, dueDate: '2024-11-01', status: 'overdue' },
      { id: 'in6', loanId: 'ln1', month: 6, amount: 450000, dueDate: '2024-12-01', status: 'unpaid' },
      { id: 'in7', loanId: 'ln1', month: 7, amount: 450000, dueDate: '2025-01-01', status: 'unpaid' },
      { id: 'in8', loanId: 'ln1', month: 8, amount: 450000, dueDate: '2025-02-01', status: 'unpaid' },
      { id: 'in9', loanId: 'ln1', month: 9, amount: 450000, dueDate: '2025-03-01', status: 'unpaid' },
      { id: 'in10', loanId: 'ln1', month: 10, amount: 450000, dueDate: '2025-04-01', status: 'unpaid' },
      { id: 'in11', loanId: 'ln1', month: 11, amount: 450000, dueDate: '2025-05-01', status: 'unpaid' },
      { id: 'in12', loanId: 'ln1', month: 12, amount: 450000, dueDate: '2025-06-01', status: 'unpaid' },
    ],
  },
  {
    id: 'ln2',
    userId: '5',
    userName: 'Dewi Sartika',
    amount: 10000000,
    purpose: 'Biaya Pendidikan Anak',
    status: 'pending',
    tenure: 24,
    interestRate: 1.2,
    monthlyInstallment: 467000,
    remainingAmount: 10000000,
    createdAt: '2024-11-25',
    installments: [],
  },
  {
    id: 'ln3',
    userId: '6',
    userName: 'Rudi Hermawan',
    amount: 15000000,
    purpose: 'Ekspansi Bisnis',
    status: 'pending',
    tenure: 36,
    interestRate: 1.0,
    monthlyInstallment: 458000,
    remainingAmount: 15000000,
    createdAt: '2024-11-28',
    installments: [],
  },
];

const createDummyNotifications = (): Notification[] => [
  { id: 'n1', userId: '1', message: 'Angsuran bulan November jatuh tempo! Segera bayar sebelum terkena denda.', type: 'warning', read: false, createdAt: '2024-11-25 08:00:00', whatsappSent: true },
  { id: 'n2', userId: '1', message: 'Simpanan wajib Rp 50.000 telah disetujui', type: 'success', read: true, createdAt: '2024-11-01 10:30:00', whatsappSent: true },
  { id: 'n3', userId: '3', message: 'Setoran simpanan Rp 750.000 menunggu persetujuan admin', type: 'info', read: false, createdAt: '2024-11-29 09:00:00', whatsappSent: false },
  { id: 'n4', userId: '5', message: 'Pengajuan pinjaman Rp 10.000.000 sedang diproses', type: 'info', read: false, createdAt: '2024-11-25 11:00:00', whatsappSent: true },
  { id: 'n5', userId: '6', message: 'Pengajuan pinjaman Rp 15.000.000 sedang diproses', type: 'info', read: false, createdAt: '2024-11-28 15:00:00', whatsappSent: true },
  { id: 'n6', userId: '6', message: 'Permintaan penarikan Rp 1.000.000 sedang diproses', type: 'info', read: false, createdAt: '2024-11-28 16:00:00', whatsappSent: false },
];

// Initial State
const getInitialState = () => ({
  darkMode: false,
  currentUser: null,
  isAuthenticated: false,
  users: createDummyUsers(),
  transactions: createDummyTransactions(),
  loans: createDummyLoans(),
  notifications: createDummyNotifications(),
});

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      // Theme
      toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),

      // Auth
      login: (email, password) => {
        const user = get().users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user && user.accountStatus !== 'suspended') {
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => set({ currentUser: null, isAuthenticated: false }),

      register: (userData) => {
        const existing = get().users.find(u => u.email === userData.email);
        if (existing) return false;

        const newUser: User = {
          id: generateId('user'),
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          photo: userData.photo || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200&h=200&fit=crop',
          role: 'nasabah',
          accountStatus: 'pending',
          address: userData.address,
          ktpUrl: userData.ktpUrl,
          memberSince: formatDate(),
          occupation: userData.occupation,
          birthDate: userData.birthDate,
        };

        set(state => ({ users: [...state.users, newUser] }));

        // Add notification for admin
        get().addNotification({
          userId: '2', // Admin
          message: `Pendaftaran nasabah baru: ${newUser.name}`,
          type: 'info',
          read: false,
          createdAt: formatDateTime(),
          whatsappSent: false,
        });

        return true;
      },

      // Users
      getUser: (id) => get().users.find(u => u.id === id),

      updateUser: (id, data) => {
        set(state => ({
          users: state.users.map(u => u.id === id ? { ...u, ...data } : u),
          currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...data } : state.currentUser,
        }));
      },

      toggleUserStatus: (id) => {
        const user = get().getUser(id);
        if (!user) return;

        const newStatus = user.accountStatus === 'active' ? 'suspended' : 'active';
        set(state => ({
          users: state.users.map(u => u.id === id ? { ...u, accountStatus: newStatus } : u),
        }));

        // Notify user
        get().addNotification({
          userId: id,
          message: newStatus === 'active' ? 'Akun Anda telah diaktifkan kembali' : 'Akun Anda telah ditangguhkan',
          type: newStatus === 'active' ? 'success' : 'warning',
          read: false,
          createdAt: formatDateTime(),
          whatsappSent: true,
        });
      },

      activateUser: (id) => {
        set(state => ({
          users: state.users.map(u => u.id === id ? { ...u, accountStatus: 'active' } : u),
        }));

        get().addNotification({
          userId: id,
          message: 'Selamat! Akun Anda telah diaktifkan. Silakan mulai menggunakan layanan koperasi.',
          type: 'success',
          read: false,
          createdAt: formatDateTime(),
          whatsappSent: true,
        });
      },

      // Transactions
      addTransaction: (transaction) => {
        const id = generateId('tr');
        const newTransaction: Transaction = {
          ...transaction,
          id,
          transactionNumber: generateTransactionNumber(),
        };
        set(state => ({ transactions: [newTransaction, ...state.transactions] }));
        return id;
      },

      updateTransactionStatus: (id, status, sendWhatsapp = true) => {
        const transaction = get().transactions.find(t => t.id === id);
        if (!transaction) return;

        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === id ? {
              ...t,
              status,
              whatsappSent: sendWhatsapp && status !== 'pending',
              whatsappSentAt: sendWhatsapp && status !== 'pending' ? formatDateTime() : t.whatsappSentAt
            } : t
          ),
        }));
      },

      getUserTransactions: (userId) => {
        return get().transactions
          .filter(t => t.userId === userId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getTransactionsByType: (type) => get().transactions.filter(t => t.type === type),

      // Simpanan
      addSimpanan: (userId, amount, savingsType, proofUrl) => {
        const user = get().getUser(userId);
        if (!user) return '';

        const transaction: Omit<Transaction, 'id' | 'transactionNumber'> = {
          userId,
          userName: user.name,
          type: 'simpanan',
          savingsType,
          amount,
          status: 'pending',
          date: formatDate(),
          proofUrl,
          ocrResult: proofUrl ? {
            senderName: user.name.toUpperCase(),
            amount,
            date: new Date().toLocaleDateString('id-ID'),
            referenceNumber: generateTransactionNumber(),
            confidence: Math.floor(Math.random() * 10) + 90, // 90-99%
          } : undefined,
        };

        const id = get().addTransaction(transaction);

        // Notify user
        get().addNotification({
          userId,
          message: `Setoran ${savingsType} Rp ${amount.toLocaleString('id-ID')} menunggu persetujuan admin`,
          type: 'info',
          read: false,
          createdAt: formatDateTime(),
          whatsappSent: false,
        });

        return id;
      },

      getUserBalance: (userId) => {
        const transactions = get().transactions.filter(t => t.userId === userId && t.status === 'approved');
        const deposits = transactions.filter(t => t.type === 'simpanan').reduce((sum, t) => sum + t.amount, 0);
        const withdrawals = transactions.filter(t => t.type === 'penarikan').reduce((sum, t) => sum + t.amount, 0);
        return deposits - withdrawals;
      },

      getUserSavingsDetail: (userId) => {
        const transactions = get().transactions.filter(t => t.userId === userId && t.type === 'simpanan' && t.status === 'approved');
        const withdrawals = get().transactions
          .filter(t => t.userId === userId && t.type === 'penarikan' && t.status === 'approved')
          .reduce((sum, t) => sum + t.amount, 0);

        const pokok = transactions.filter(t => t.savingsType === 'pokok').reduce((sum, t) => sum + t.amount, 0);
        const wajib = transactions.filter(t => t.savingsType === 'wajib').reduce((sum, t) => sum + t.amount, 0);
        const sukarelaBruto = transactions.filter(t => t.savingsType === 'sukarela').reduce((sum, t) => sum + t.amount, 0);
        const sukarela = Math.max(0, sukarelaBruto - withdrawals);

        return { userId, pokok, wajib, sukarela, total: pokok + wajib + sukarela };
      },

      getMonthlyData: (userId) => {
        const transactions = get().transactions.filter(t => t.userId === userId && t.status === 'approved');
        const months = ['Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'];
        const currentYear = new Date().getFullYear();

        return months.map((month, index) => {
          const monthNum = index + 6;
          const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() + 1 === monthNum && tDate.getFullYear() === currentYear;
          });

          return {
            month,
            simpanan: monthTransactions.filter(t => t.type === 'simpanan').reduce((sum, t) => sum + t.amount, 0),
            penarikan: monthTransactions.filter(t => t.type === 'penarikan').reduce((sum, t) => sum + t.amount, 0),
          };
        });
      },

      // Penarikan
      canWithdraw: (userId, amount) => {
        const savings = get().getUserSavingsDetail(userId);
        return savings.sukarela >= amount;
      },

      addPenarikan: (userId, amount, notes) => {
        if (!get().canWithdraw(userId, amount)) return null;

        const user = get().getUser(userId);
        if (!user) return null;

        const transaction: Omit<Transaction, 'id' | 'transactionNumber'> = {
          userId,
          userName: user.name,
          type: 'penarikan',
          amount,
          status: 'pending',
          date: formatDate(),
          notes,
        };

        const id = get().addTransaction(transaction);

        get().addNotification({
          userId,
          message: `Permintaan penarikan Rp ${amount.toLocaleString('id-ID')} sedang diproses`,
          type: 'info',
          read: false,
          createdAt: formatDateTime(),
          whatsappSent: false,
        });

        return id;
      },

      // Loans
      calculateLoan: (amount, tenure, interestRate) => {
        const totalInterest = amount * (interestRate / 100) * tenure;
        const totalPayment = amount + totalInterest;
        const monthlyInstallment = Math.ceil(totalPayment / tenure);
        return { monthlyInstallment, totalPayment, totalInterest };
      },

      addLoan: (loan) => {
        const user = get().getUser(loan.userId);
        const id = generateId('ln');

        const newLoan: Loan = {
          ...loan,
          id,
          userName: user?.name || '',
          createdAt: formatDate(),
          installments: [],
        };

        set(state => ({ loans: [newLoan, ...state.loans] }));

        get().addNotification({
          userId: loan.userId,
          message: `Pengajuan pinjaman Rp ${loan.amount.toLocaleString('id-ID')} sedang diproses`,
          type: 'info',
          read: false,
          createdAt: formatDateTime(),
          whatsappSent: true,
        });

        return id;
      },

      updateLoanStatus: (id, status) => {
        const loan = get().loans.find(l => l.id === id);
        if (!loan) return;

        let installments = loan.installments;
        if (status === 'approved' && loan.installments.length === 0) {
          installments = generateInstallments(id, loan.tenure, loan.monthlyInstallment, new Date());
        }

        set(state => ({
          loans: state.loans.map(l =>
            l.id === id ? {
              ...l,
              status,
              installments,
              approvedAt: status === 'approved' ? formatDate() : l.approvedAt,
              rejectedAt: status === 'rejected' ? formatDate() : undefined,
            } : l
          ),
        }));
      },

      getUserLoans: (userId) => get().loans.filter(l => l.userId === userId),

      getUserActiveLoan: (userId) => get().loans.find(l => l.userId === userId && l.status === 'approved' && l.remainingAmount > 0),

      payInstallment: (loanId, installmentId, proofUrl) => {
        const loan = get().loans.find(l => l.id === loanId);
        if (!loan) return '';

        const installment = loan.installments.find(i => i.id === installmentId);
        if (!installment || installment.status === 'paid') return '';

        const user = get().getUser(loan.userId);
        if (!user) return '';

        // Check sukarela balance
        const savingsDetail = get().getUserSavingsDetail(loan.userId);
        if (savingsDetail.sukarela < installment.amount) return '';

        // 1. Create angsuran transaction (auto approved)
        const transactionId = get().addTransaction({
          userId: loan.userId,
          userName: user.name,
          type: 'angsuran',
          amount: installment.amount,
          status: 'approved',
          date: formatDate(),
          proofUrl,
          loanId,
          notes: `Pembayaran cicilan ke-${installment.month} - ${loan.purpose}`,
        });

        // 2. Deduct from sukarela (create internal deduction)
        const deductionTx: Transaction = {
          id: generateId('tx'),
          transactionNumber: generateTransactionNumber(),
          userId: loan.userId,
          userName: user.name,
          type: 'penarikan',
          amount: installment.amount,
          status: 'approved',
          date: formatDate(),
          savingsType: 'sukarela',
          notes: `Potong saldo untuk cicilan ke-${installment.month}`,
        };
        set(state => ({ transactions: [deductionTx, ...state.transactions] }));

        // 3. Mark installment as paid and update loan
        set(state => ({
          loans: state.loans.map(l => {
            if (l.id === loanId) {
              const updatedInstallments = l.installments.map(i => 
                i.id === installmentId 
                  ? { ...i, status: 'paid' as const, paidDate: formatDate() }
                  : i
              );
              const newRemaining = Math.max(0, l.remainingAmount - installment.amount);
              return {
                ...l,
                installments: updatedInstallments,
                remainingAmount: newRemaining,
                status: newRemaining <= 0 ? 'completed' as const : l.status,
              };
            }
            return l;
          }),
        }));

        // 4. Add notification
        get().addNotification({
          userId: loan.userId,
          type: 'success',
          title: 'Pembayaran Berhasil',
          message: `Cicilan ke-${installment.month} untuk ${loan.purpose} berhasil dibayar`,
          read: false,
          createdAt: new Date().toISOString(),
        });

        return transactionId;
      },

      // Notifications
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: generateId('n'),
        };
        set(state => ({ notifications: [newNotification, ...state.notifications] }));
      },

      markNotificationAsRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
        }));
      },

      markAllNotificationsAsRead: (userId) => {
        set(state => ({
          notifications: state.notifications.map(n => n.userId === userId ? { ...n, read: true } : n),
        }));
      },

      getUserNotifications: (userId) => {
        return get().notifications
          .filter(n => n.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getUnreadCount: (userId) => get().notifications.filter(n => n.userId === userId && !n.read).length,

      // Admin Stats
      getTotalMembers: () => get().users.filter(u => u.role === 'nasabah').length,

      getActiveMembers: () => get().users.filter(u => u.role === 'nasabah' && u.accountStatus === 'active').length,

      getTotalSavings: () => {
        const transactions = get().transactions.filter(t => t.status === 'approved');
        const deposits = transactions.filter(t => t.type === 'simpanan').reduce((sum, t) => sum + t.amount, 0);
        const withdrawals = transactions.filter(t => t.type === 'penarikan').reduce((sum, t) => sum + t.amount, 0);
        return deposits - withdrawals;
      },

      getTotalLoans: () => {
        return get().loans.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.remainingAmount, 0);
      },

      getTotalOverdue: () => {
        const today = new Date();
        return get().loans
          .filter(l => l.status === 'approved')
          .flatMap(l => l.installments)
          .filter(i => i.status !== 'paid' && new Date(i.dueDate) < today).length;
      },

      getPendingApprovals: () => {
        return get().transactions
          .filter(t => t.status === 'pending')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getPendingLoans: () => get().loans.filter(l => l.status === 'pending'),

      getRecentActivities: () => {
        return get().transactions.slice(0, 10).map(t => ({
          id: t.id,
          message: `${t.userName} ${t.type} Rp ${t.amount.toLocaleString('id-ID')}`,
          time: t.date,
          type: t.type,
        }));
      },

      getGrowthData: () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return months.map((month, index) => {
          const monthNum = index + 1;
          const simpanan = get().transactions
            .filter(t => t.status === 'approved' && t.type === 'simpanan')
            .filter(t => new Date(t.date).getMonth() + 1 <= monthNum)
            .reduce((sum, t) => sum + t.amount, 0);

          const pinjaman = get().loans
            .filter(l => l.status === 'approved' && l.approvedAt)
            .filter(l => new Date(l.approvedAt!).getMonth() + 1 <= monthNum)
            .reduce((sum, l) => sum + l.amount, 0);

          return { month, nasabah: 5 + index, simpanan: simpanan / 1000000, pinjaman: pinjaman / 1000000 };
        });
      },

      // Admin Approval Actions
      approveTransaction: (transactionId) => {
        const transaction = get().transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        get().updateTransactionStatus(transactionId, 'approved', true);

        // If it's an angsuran, update the installment
        if (transaction.type === 'angsuran' && transaction.loanId) {
          const loan = get().loans.find(l => l.id === transaction.loanId);
          if (loan) {
            const nextUnpaid = loan.installments.find(i => i.status !== 'paid');
            if (nextUnpaid) {
              set(state => ({
                loans: state.loans.map(l =>
                  l.id === transaction.loanId ? {
                    ...l,
                    installments: l.installments.map(i =>
                      i.id === nextUnpaid.id ? { ...i, status: 'paid', paidAt: formatDate() } : i
                    ),
                    remainingAmount: l.remainingAmount - nextUnpaid.amount,
                  } : l
                ),
              }));
            }
          }
        }

        // Notify user
        const typeLabel = transaction.type === 'simpanan' ? 'Setoran' : transaction.type === 'penarikan' ? 'Penarikan' : 'Transaksi';
        get().addNotification({
          userId: transaction.userId,
          message: `${typeLabel} Rp ${transaction.amount.toLocaleString('id-ID')} telah disetujui`,
          type: 'success',
          read: false,
          createdAt: formatDateTime(),
          whatsappSent: true,
        });
      },

      rejectTransaction: (transactionId, reason) => {
        const transaction = get().transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        get().updateTransactionStatus(transactionId, 'rejected', true);

        get().addNotification({
          userId: transaction.userId,
          message: `Transaksi Rp ${transaction.amount.toLocaleString('id-ID')} ditolak${reason ? `: ${reason}` : ''}`,
          type: 'error',
          read: false,
          createdAt: formatDateTime(),
          whatsappSent: true,
        });
      },

      approveLoan: (loanId) => {
        const loan = get().loans.find(l => l.id === loanId);
        if (!loan) return;

        get().updateLoanStatus(loanId, 'approved');

        get().addNotification({
          userId: loan.userId,
          message: `Selamat! Pinjaman Rp ${loan.amount.toLocaleString('id-ID')} telah disetujui. Angsuran pertama jatuh tempo 1 bulan dari sekarang.`,
          type: 'success',
          read: false,
          createdAt: formatDateTime(),
          whatsappSent: true,
        });
      },

      rejectLoan: (loanId, reason) => {
        const loan = get().loans.find(l => l.id === loanId);
        if (!loan) return;

        get().updateLoanStatus(loanId, 'rejected');

        get().addNotification({
          userId: loan.userId,
          message: `Pengajuan pinjaman Rp ${loan.amount.toLocaleString('id-ID')} ditolak${reason ? `: ${reason}` : ''}`,
          type: 'error',
          read: false,
          createdAt: formatDateTime(),
          whatsappSent: true,
        });
      },

      sendWhatsAppNotification: (transactionId) => {
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === transactionId ? { ...t, whatsappSent: true, whatsappSentAt: formatDateTime() } : t
          ),
        }));
      },

      // Reset
      resetToDefault: () => set(getInitialState()),
    }),
    {
      name: 'koperasi-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        darkMode: state.darkMode,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        users: state.users,
        transactions: state.transactions,
        loans: state.loans,
        notifications: state.notifications,
      }),
    }
  )
);
