"use client"

import { Debt, DebtCategory } from "@/types"
import { useStore } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Pencil, Trash2, CheckCircle2, Circle, Info, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DebtFormDialog } from "./debt-form-dialog"
import { DebtPaymentDialog } from "./debt-payment-dialog"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface DebtListProps {
    type: 'PAYABLE' | 'RECEIVABLE';
}

export function DebtList({ type }: DebtListProps) {
    const { debts, debtCategories, deleteDebt, toggleDebtStatus } = useStore();

    // Filter by type
    const relevantDebts = debts.filter(d => d.type === type);

    // Grouping Logic
    const debtsByCategory = relevantDebts.reduce((acc, debt) => {
        const catId = debt.categoryId || 'uncategorized';
        if (!acc[catId]) acc[catId] = [];
        acc[catId].push(debt);
        return acc;
    }, {} as Record<string, Debt[]>);

    const categories = [...debtCategories, { id: 'uncategorized', name: 'Sin Carpeta' }]; // Virtual category for uncategorized

    // Sort logic? maybe by due date later.

    const renderDebtRow = (debt: Debt) => {
        const isPaid = debt.status === 'PAID';

        return (
            <div key={debt.id} className={`flx flex-row items-center justify-between p-3 border-b last:border-0 hover:bg-muted/40 transition-colors ${isPaid ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                    {/* Payment Trigger */}
                    {!isPaid ? (
                        <DebtPaymentDialog debt={debt}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-green-500"
                            >
                                <Circle className="h-5 w-5" />
                            </Button>
                        </DebtPaymentDialog>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled
                            className="h-8 w-8 shrink-0 rounded-full text-green-500"
                        >
                            <CheckCircle2 className="h-5 w-5" />
                        </Button>
                    )}

                    <div className="flex flex-col overflow-hidden">
                        <span className={`font-medium truncate ${isPaid ? 'line-through decoration-slate-500' : ''}`}>
                            {debt.description}
                        </span>
                        {debt.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Info className="h-3 w-3" />
                                <span>Vence: {format(new Date(debt.dueDate), 'd MMM yyyy', { locale: es })}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 ml-2">
                    <span className={`font-bold ${type === 'RECEIVABLE' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(debt.amount, 'PEN')}
                    </span>

                    <div className="flex items-center gap-1">
                        <DebtFormDialog mode="edit" defaultValues={debt}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                        </DebtFormDialog>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                                if (confirm('¿Eliminar esta deuda?')) deleteDebt(debt.id);
                            }}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Render Categorized first (folders) */}
            <Accordion type="multiple" className="w-full space-y-2">
                {debtCategories.map(cat => {
                    const catDebts = debtsByCategory[cat.id];
                    if (!catDebts || catDebts.length === 0) return null;

                    const totalAmount = catDebts.reduce((sum, d) => d.status === 'PENDING' ? sum + d.amount : sum, 0);

                    return (
                        <AccordionItem key={cat.id} value={cat.id} className="border rounded-lg px-2">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <div className="flex items-center justify-between w-full pr-4">
                                    <div className="flex items-center gap-2">
                                        <Folder className="h-4 w-4 text-primary" />
                                        <span>{cat.name}</span>
                                        <span className="text-xs text-muted-foreground font-normal ml-2">({catDebts.length})</span>
                                    </div>
                                    <span className="text-sm font-semibold">{formatCurrency(totalAmount, 'PEN')}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="pt-2">
                                    {catDebts.map(renderDebtRow)}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>

            {/* Render Uncategorized */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                {(debtsByCategory['uncategorized'] || []).map((debt, index) => (
                    // Add wrapper div to apply flex class since renderDebtRow returns just the div content logic
                    // Wait, renderDebtRow returns a div.
                    renderDebtRow(debt)
                ))}
                {(!debtsByCategory['uncategorized'] || debtsByCategory['uncategorized'].length === 0) && debtCategories.length === 0 && relevantDebts.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                        No hay registros.
                    </div>
                )}
            </div>

            {/* Summary Footer */}
            {relevantDebts.length > 0 && (
                <div className="flex justify-between items-center px-4 py-2 bg-muted/30 rounded-lg mt-2 font-medium text-sm">
                    <span>Total Pendiente</span>
                    <span>
                        {formatCurrency(relevantDebts.reduce((sum, d) => d.status === 'PENDING' ? sum + d.amount : sum, 0), 'PEN')}
                    </span>
                </div>
            )}
        </div>
    );
}
