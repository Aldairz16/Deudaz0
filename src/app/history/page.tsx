"use client"

import { useStore } from "@/lib/store";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { TransactionTable } from "@/components/transactions/transaction-table"; // Import was missing or misplaced
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

export default function HistoryPage() {
    const { transactions, wallets } = useStore();
    const [search, setSearch] = useState("");

    const filteredTransactions = transactions
        .filter((t) => t.description.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <header className="space-y-2">
                <h1 className="text-2xl font-bold">Historial</h1>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar transacciones..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </header>

            <div className="space-y-4">
                {filteredTransactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">
                        No se encontraron transacciones.
                    </p>
                ) : (
                    <>
                        {/* Mobile View */}
                        <div className="md:hidden space-y-4">
                            {filteredTransactions.map((transaction) => (
                                <TransactionItem
                                    key={transaction.id}
                                    transaction={transaction}
                                    wallet={wallets.find(w => w.id === transaction.walletId)}
                                />
                            ))}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block">
                            <TransactionTable
                                transactions={filteredTransactions}
                                wallets={wallets}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
