export type Currency = 'PEN';

export interface Wallet {
    id: string;
    user_id?: string;
    name: string;
    color: string;
    balance: number;
    currency: Currency;
    created_at?: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'ADJUSTMENT' | 'TRANSFER';

export interface Transaction {
    id: string;
    user_id?: string;
    walletId: string; // This maps to wallet_id in DB. I might need a mapper.
    // wallet_id: string; // Let's try to align with DB or use camelCase mapper
    amount: number;
    description: string;
    type: TransactionType;
    date: string;
    source?: string;
    category?: string;
    created_at?: string;
}

// Helper to match DB
export interface DBTransaction {
    id: string;
    user_id: string;
    wallet_id: string;
    description: string;
    amount: number;
    type: string;
    date: string;
    category: string | null;
    created_at: string;
}

export interface AppState {
    wallets: Wallet[];
    transactions: Transaction[];

    // Actions
    fetchData: () => Promise<void>;

    addWallet: (name: string, color: string) => Promise<void>;
    updateWallet: (id: string, updates: Partial<Wallet>) => Promise<void>;
    deleteWallet: (id: string) => Promise<void>;

    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;

    // Deudas
    debts: Debt[];
    debtCategories: DebtCategory[];

    addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'status'>) => Promise<void>;
    updateDebt: (id: string, updates: Partial<Debt>) => Promise<void>;
    deleteDebt: (id: string) => Promise<void>;
    toggleDebtStatus: (id: string) => Promise<void>;

    addDebtCategory: (name: string) => Promise<void>;
    deleteDebtCategory: (id: string) => Promise<void>;

    processDebtPayment: (debtId: string, amount: number, walletId: string) => Promise<void>;

    // Auth
    user: any | null;
    setUser: (user: any | null) => void;
}

export type DebtType = 'PAYABLE' | 'RECEIVABLE';
export type DebtStatus = 'PENDING' | 'PAID';

export interface DebtCategory {
    id: string;
    name: string;
    user_id?: string;
}

export interface Debt {
    id: string;
    user_id?: string;
    type: DebtType;
    amount: number;
    description: string;
    dueDate?: string; // due_date in DB
    createdAt: string; // created_at in DB
    status: DebtStatus;
    categoryId?: string; // category_id in DB
}

// Mapper helpers could be useful but I'll do it in the store
