"use client"

import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { ArrowLeft, ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react"; // Added "use" import
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function WalletDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { wallets, transactions } = useStore();
    const router = useRouter();
    // Unwrap params using React.use() for Next.js 15+ async params
    const { id } = use(params);

    const wallet = wallets.find(w => w.id === id);
    const walletTransactions = transactions.filter(t => t.walletId === id);

    // Calculate stats
    const totalIncome = walletTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = walletTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

    if (!wallet) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground mb-4">Billetera no encontrada.</p>
                <Button onClick={() => router.push('/')} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{wallet.name}</h1>
                    <p className="text-sm text-muted-foreground">Detalles e historial</p>
                </div>
            </div>

            {/* Wallet Card / Summary */}
            <div className="relative overflow-hidden rounded-xl border p-6 shadow-sm" style={{ borderLeft: `6px solid ${wallet.color}` }}>
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Balance Actual</span>
                    <span className="text-3xl font-bold tracking-tight">
                        {formatCurrency(wallet.balance, wallet.currency)}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <Card>
                        <CardContent className="p-4 flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                <TrendingUp className="h-4 w-4" /> Importes
                            </div>
                            <span className="text-lg font-bold">{formatCurrency(totalIncome, wallet.currency)}</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                                <TrendingDown className="h-4 w-4" /> Gastos
                            </div>
                            <span className="text-lg font-bold">{formatCurrency(totalExpense, wallet.currency)}</span>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Historial de Movimientos</h2>
                {walletTransactions.length === 0 ? (
                    <div className="text-center py-10 border rounded-lg bg-card/50">
                        <p className="text-muted-foreground text-sm">No hay movimientos en esta billetera.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {walletTransactions.map((transaction) => (
                            <TransactionItem key={transaction.id} transaction={transaction} wallet={wallet} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
