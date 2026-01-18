import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { AppState, Wallet, Transaction, Debt, DebtCategory, TransactionTemplate } from '@/types';

// Helper to map DB transaction to App Transaction
const mapDBTransaction = (t: any): Transaction => ({
    id: t.id,
    walletId: t.wallet_id,
    amount: t.amount,
    description: t.description,
    type: t.type.toUpperCase() as any,
    date: t.date,
    category: t.category,
    created_at: t.created_at,
});

const mapDBDebt = (d: any): Debt => ({
    id: d.id,
    type: d.type.toUpperCase(),
    amount: d.amount,
    description: d.person_name, // Changed from description to person_name in my thoughts? 
    // Wait, schema says: person_name text not null.
    // My Types say: description.
    // Let's map person_name -> description for the UI.
    dueDate: d.due_date,
    createdAt: d.created_at,
    status: d.status.toUpperCase(),
    categoryId: d.category_id,
});


// Helper to map DB Template
const mapDBTemplate = (t: any): TransactionTemplate => ({
    id: t.id,
    name: t.name,
    amount: t.amount,
    description: t.description,
    type: t.type.toUpperCase() as any,
    walletId: t.wallet_id,
    category: t.category,
    icon: t.icon
});

export const useStore = create<AppState>((set, get) => ({
    wallets: [],
    transactions: [],
    transactionTemplates: [],
    debts: [],
    debtCategories: [],
    user: null,

    setUser: (user) => {
        set({ user });
        if (user) {
            get().fetchData();
        } else {
            set({ wallets: [], transactions: [], debts: [], debtCategories: [], transactionTemplates: [] });
        }
    },

    fetchData: async () => {
        const user = get().user;
        if (!user) return;

        // Fetch Wallets
        const { data: wallets } = await supabase.from('wallets').select('*').order('created_at', { ascending: true });

        // Fetch Transactions
        const { data: transactions } = await supabase.from('transactions').select('*').order('date', { ascending: false });

        // Fetch Debt Categories
        const { data: debtCategories } = await supabase.from('debt_categories').select('*');

        // Fetch Debts
        const { data: debts } = await supabase.from('debts').select('*').order('created_at', { ascending: false });

        // Fetch Transaction Templates
        const { data: templates } = await supabase.from('transaction_templates').select('*');

        if (wallets) set({
            wallets: wallets.map(w => ({
                ...w,
                creditLimit: w.credit_limit,
                type: w.type as 'DEBIT' | 'CREDIT',
                category: w.category // New field
            })) as Wallet[]
        });

        if (transactions) set({ transactions: transactions.map(mapDBTransaction) });
        if (debtCategories) set({ debtCategories: debtCategories as DebtCategory[] });
        if (debts) set({ debts: debts.map(mapDBDebt) });
        if (templates) set({ transactionTemplates: templates.map(mapDBTemplate) });
    },

    addWallet: async (name, color, type = 'DEBIT', creditLimit, initialBalance = 0, category = 'General') => {
        const dbWallet: any = {
            name,
            color,
            balance: initialBalance,
            currency: 'PEN',
            type: type,
            category: category // New field
        };

        if (type === 'CREDIT' && creditLimit !== undefined) {
            dbWallet.credit_limit = creditLimit;
        }

        const { data, error } = await supabase
            .from('wallets')
            .insert(dbWallet)
            .select()
            .single();

        if (error) {
            console.error(error);
            return;
        }

        const newWallet: Wallet = {
            ...data,
            creditLimit: data.credit_limit,
            type: data.type as 'DEBIT' | 'CREDIT',
            category: data.category
        };

        set((state) => ({ wallets: [...state.wallets, newWallet] }));
    },

    updateWallet: async (id, updates) => {
        const { error } = await supabase.from('wallets').update(updates).eq('id', id);
        if (error) {
            console.error(error);
            return;
        }
        set((state) => ({
            wallets: state.wallets.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        }));
    },

    deleteWallet: async (id) => {
        const { error } = await supabase.from('wallets').delete().eq('id', id);
        if (error) {
            console.error(error);
            return;
        }
        set((state) => ({
            wallets: state.wallets.filter((w) => w.id !== id),
            transactions: state.transactions.filter((t) => t.walletId !== id),
        }));
    },

    addTransaction: async (transactionData) => {
        // Prepare for DB
        const dbTransaction = {
            wallet_id: transactionData.walletId,
            description: transactionData.description,
            amount: transactionData.amount,
            type: transactionData.type.toLowerCase(),
            date: transactionData.date,
            category: transactionData.category,
        };

        const { data, error } = await supabase
            .from('transactions')
            .insert(dbTransaction)
            .select()
            .single();

        if (error) {
            console.error(error);
            return;
        }

        const wallet = get().wallets.find(w => w.id === transactionData.walletId);
        if (wallet) {
            let newBalance = wallet.balance;
            if (transactionData.type === 'ADJUSTMENT') {
                newBalance = transactionData.amount;
            } else {
                const delta = transactionData.type === 'INCOME' ? transactionData.amount : -transactionData.amount;
                newBalance += delta;
            }

            // Update wallet in DB
            await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);

            // Update wallet in Local State
            set((state) => ({
                wallets: state.wallets.map(w => w.id === wallet.id ? { ...w, balance: newBalance } : w)
            }));
        }

        set((state) => ({
            transactions: [mapDBTransaction(data), ...state.transactions],
        }));
    },

    deleteTransaction: async (id) => {
        const transaction = get().transactions.find((t) => t.id === id);
        if (!transaction) return;

        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) return;

        // Revert balance
        const wallet = get().wallets.find(w => w.id === transaction.walletId);
        if (wallet) {
            if (transaction.type !== 'ADJUSTMENT') {
                const delta = transaction.type === 'INCOME' ? -transaction.amount : transaction.amount;
                const newBalance = wallet.balance + delta;

                await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);
                set((state) => ({
                    wallets: state.wallets.map(w => w.id === wallet.id ? { ...w, balance: newBalance } : w)
                }));
            }
        }

        set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
        }));
    },

    updateTransaction: async (id, updates) => {
        const transaction = get().transactions.find((t) => t.id === id);
        if (!transaction) return;

        // 1. Revert previous effect on wallet balance
        const oldWallet = get().wallets.find((w) => w.id === transaction.walletId);
        if (oldWallet && transaction.type !== 'ADJUSTMENT') {
            const revertDelta = transaction.type === 'INCOME' ? -transaction.amount : transaction.amount;
            const revertedBalance = oldWallet.balance + revertDelta;

            set((state) => ({
                wallets: state.wallets.map(w => w.id === oldWallet.id ? { ...w, balance: revertedBalance } : w)
            }));
            await supabase.from('wallets').update({ balance: revertedBalance }).eq('id', oldWallet.id);
        }

        // 2. Prepare new values
        const newWalletId = updates.walletId || transaction.walletId;
        const newAmount = updates.amount !== undefined ? updates.amount : transaction.amount;
        const newType = updates.type || transaction.type;

        // 3. Apply new effect on wallet balance
        const currentWallets = get().wallets; // Refetch updated state
        const targetWallet = currentWallets.find(w => w.id === newWalletId);

        if (targetWallet && newType !== 'ADJUSTMENT') {
            const applyDelta = newType === 'INCOME' ? newAmount : -newAmount;
            const newBalance = targetWallet.balance + applyDelta;

            set((state) => ({
                wallets: state.wallets.map(w => w.id === targetWallet.id ? { ...w, balance: newBalance } : w)
            }));
            await supabase.from('wallets').update({ balance: newBalance }).eq('id', targetWallet.id);
        }

        // 4. Update Transaction Record
        const dbUpdates: any = {};
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
        if (updates.date) dbUpdates.date = updates.date;
        if (updates.type) dbUpdates.type = updates.type.toLowerCase();
        if (updates.walletId) dbUpdates.wallet_id = updates.walletId;
        if (updates.category) dbUpdates.category = updates.category;

        const { error } = await supabase.from('transactions').update(dbUpdates).eq('id', id);

        if (!error) {
            set((state) => ({
                transactions: state.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
            }));
        }
    },

    // Transaction Templates
    addTransactionTemplate: async (template) => {
        const dbTemplate = {
            name: template.name,
            amount: template.amount,
            description: template.description,
            type: template.type.toLowerCase(),
            wallet_id: template.walletId,
            category: template.category,
            icon: template.icon
        };

        const { data, error } = await supabase.from('transaction_templates').insert(dbTemplate).select().single();
        if (!error) {
            set((state) => ({
                transactionTemplates: [...state.transactionTemplates, mapDBTemplate(data)]
            }));
        } else {
            console.error("Error adding template:", error);
        }
    },

    deleteTransactionTemplate: async (id) => {
        const { error } = await supabase.from('transaction_templates').delete().eq('id', id);
        if (!error) {
            set((state) => ({
                transactionTemplates: state.transactionTemplates.filter(t => t.id !== id)
            }));
        }
    },

    // Deudas
    addDebt: async (debtData) => {
        const dbDebt = {
            person_name: debtData.description,
            amount: debtData.amount,
            type: debtData.type.toLowerCase(),
            due_date: debtData.dueDate,
            category_id: debtData.categoryId,
            status: 'pending'
        };

        const { data, error } = await supabase.from('debts').insert(dbDebt).select().single();
        if (error) {
            console.error(error);
            return;
        }

        set((state) => ({ debts: [mapDBDebt(data), ...state.debts] }));
    },

    updateDebt: async (id, updates) => {
        const dbUpdates: any = {};
        if (updates.description) dbUpdates.person_name = updates.description;
        if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
        if (updates.status) dbUpdates.status = updates.status.toLowerCase();
        if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
        if (updates.categoryId) dbUpdates.category_id = updates.categoryId;
        if (updates.type) dbUpdates.type = updates.type.toLowerCase();

        const { error } = await supabase.from('debts').update(dbUpdates).eq('id', id);

        if (!error) {
            set((state) => ({
                debts: state.debts.map((d) => (d.id === id ? { ...d, ...updates } : d)),
            }));
        }
    },

    deleteDebt: async (id) => {
        const { error } = await supabase.from('debts').delete().eq('id', id);
        if (!error) {
            set((state) => ({
                debts: state.debts.filter((d) => d.id !== id),
            }));
        }
    },

    toggleDebtStatus: async (id) => {
        const debt = get().debts.find(d => d.id === id);
        if (!debt) return;

        const newStatus = debt.status === 'PENDING' ? 'paid' : 'pending';
        const { error } = await supabase.from('debts').update({ status: newStatus }).eq('id', id);

        if (!error) {
            set((state) => ({
                debts: state.debts.map((d) =>
                    d.id === id ? { ...d, status: d.status === 'PENDING' ? 'PAID' : 'PENDING' } : d
                ),
            }));
        }
    },

    addDebtCategory: async (name) => {
        const { data, error } = await supabase.from('debt_categories').insert({ name }).select().single();
        if (!error) {
            set((state) => ({
                debtCategories: [...state.debtCategories, data as DebtCategory],
            }));
        }
    },

    updateDebtCategory: async (id, name) => {
        const { error } = await supabase.from('debt_categories').update({ name }).eq('id', id);
        if (!error) {
            set((state) => ({
                debtCategories: state.debtCategories.map((c) => (c.id === id ? { ...c, name } : c)),
            }));
        }
    },

    deleteDebtCategory: async (id) => {
        const { error } = await supabase.from('debt_categories').delete().eq('id', id);
        if (!error) {
            set((state) => ({
                debtCategories: state.debtCategories.filter((c) => c.id !== id),
                debts: state.debts.map((d) => (d.categoryId === id ? { ...d, categoryId: undefined } : d)),
            }));
        }
    },

    processDebtPayment: async (debtId, amount, walletId) => {
        const debt = get().debts.find(d => d.id === debtId);
        const wallet = get().wallets.find(w => w.id === walletId);
        if (!debt || !wallet) return;

        const newAmount = debt.amount - amount;
        const newStatus = newAmount <= 0.01 ? 'paid' : 'pending';
        const transactionType = debt.type === 'PAYABLE' ? 'EXPENSE' : 'INCOME';

        await get().updateDebt(debtId, { amount: newAmount > 0 ? newAmount : 0, status: newStatus.toUpperCase() as any });

        await get().addTransaction({
            walletId: walletId,
            amount,
            description: `Pago deuda: ${debt.description}`,
            type: transactionType,
            date: new Date().toISOString(),
            source: 'Deudas',
        });
    },

}));
