"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Transaction, Wallet } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { ArrowDownLeft, ArrowUpRight, GripHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog"

interface TransactionTableProps {
    transactions: Transaction[];
    wallets: Wallet[];
}

export function TransactionTable({ transactions, wallets }: TransactionTableProps) {
    const { deleteTransaction } = useStore();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Billetera</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((transaction) => {
                        const wallet = wallets.find(w => w.id === transaction.walletId);
                        const isIncome = transaction.type === "INCOME";
                        const isAdjustment = transaction.type === "ADJUSTMENT";

                        const badgeColor = isAdjustment
                            ? "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40"
                            : isIncome
                                ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40"
                                : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40";

                        const amountColor = isAdjustment
                            ? "text-blue-600 dark:text-blue-400"
                            : isIncome
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400";

                        const Icon = isAdjustment ? GripHorizontal : isIncome ? ArrowDownLeft : ArrowUpRight;

                        return (
                            <TableRow key={transaction.id}>
                                <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                                <TableCell className="font-medium">{transaction.description}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-muted">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: wallet?.color }}></span>
                                        {wallet?.name || 'Desconocida'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}>
                                        <Icon className="w-3.5 h-3.5" />
                                        <span>{isAdjustment ? 'AJUSTE' : isIncome ? 'INGRESO' : 'GASTO'}</span>
                                    </div>
                                </TableCell>
                                <TableCell className={`text-right font-bold ${amountColor}`}>
                                    {isAdjustment ? '' : (isIncome ? '+' : '-')}{formatCurrency(transaction.amount, wallet?.currency)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <TransactionFormDialog
                                            mode="edit"
                                            defaultValues={{
                                                id: transaction.id,
                                                amount: transaction.amount,
                                                description: transaction.description,
                                                walletId: transaction.walletId,
                                                type: transaction.type as "INCOME" | "EXPENSE"
                                            }}
                                        >
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </TransactionFormDialog>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => {
                                                if (confirm("¿Eliminar transacción?")) deleteTransaction(transaction.id)
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
