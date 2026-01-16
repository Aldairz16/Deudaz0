"use client"

import { Transaction, Wallet } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { ArrowDownLeft, ArrowUpRight, GripHorizontal, MoreVertical, Trash2, Pencil } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { TransactionFormDialog } from "./transaction-form-dialog"

interface TransactionItemProps {
    transaction: Transaction;
    wallet: Wallet | undefined;
}

export function TransactionItem({ transaction, wallet }: TransactionItemProps) {
    const { deleteTransaction } = useStore();

    const isIncome = transaction.type === "INCOME";
    const isAdjustment = transaction.type === "ADJUSTMENT";

    // Color based on type
    const colorClasses = isAdjustment
        ? "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30"
        : isIncome
            ? "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30"
            : "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30";

    const amountColor = isAdjustment
        ? "text-blue-600 dark:text-blue-400"
        : isIncome
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400";


    const Icon = isAdjustment
        ? GripHorizontal
        : isIncome
            ? ArrowDownLeft
            : ArrowUpRight;

    return (
        <div className="flex items-center justify-between p-4 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-full ${colorClasses}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex text-xs text-muted-foreground gap-2">
                        <span>{format(new Date(transaction.date), 'dd/MM/yyyy')}</span>
                        <span>•</span>
                        <span className="font-medium" style={{ color: wallet?.color }}>
                            {wallet?.name || 'Desconocida'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className={`text-right font-bold ${amountColor}`}>
                    {isAdjustment ? '' : (isIncome ? '+' : '-')}{formatCurrency(transaction.amount, wallet?.currency)}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                        </TransactionFormDialog>

                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                                if (confirm('¿Eliminar esta transacción?')) {
                                    deleteTransaction(transaction.id);
                                }
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
