"use client"

import { Debt, DebtCategory } from "@/types"
import { useStore } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Pencil, Trash2, CheckCircle2, Circle, Info, Folder, Archive } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DebtFormDialog } from "./debt-form-dialog"
import { DebtCategoryDialog } from "./debt-category-dialog"
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
    const { debts, debtCategories, deleteDebt, toggleDebtStatus, deleteDebtCategory } = useStore();
    const [showArchived, setShowArchived] = useState(false);

    // 1. Base Filter by Type (Payable/Receivable)
    const typeFilteredDebts = debts.filter(d => d.type === type);

    // 2. Filter by Status (Pending vs Paid/Archived)
    const relevantDebts = typeFilteredDebts.filter(d =>
        showArchived ? d.status === 'PAID' : d.status === 'PENDING'
    );

    // Grouping Logic
    const debtsByCategory = relevantDebts.reduce((acc, debt) => {
        const catId = debt.categoryId || 'uncategorized';
        if (!acc[catId]) acc[catId] = [];
        acc[catId].push(debt);
        return acc;
    }, {} as Record<string, Debt[]>);

    const categories = [...debtCategories, { id: 'uncategorized', name: 'Sin Carpeta' }];

    const [expandedDebtId, setExpandedDebtId] = useState<string | null>(null);

    const renderDebtRow = (debt: Debt) => {
        const isPaid = debt.status === 'PAID';
        const isExpanded = expandedDebtId === debt.id;

        return (
            <div key={debt.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                <div
                    className="flex flex-row items-center justify-between p-3 cursor-pointer"
                    onClick={() => setExpandedDebtId(isExpanded ? null : debt.id)}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        {/* Payment Trigger - Only for Pending */}
                        {!isPaid ? (
                            <DebtPaymentDialog debt={debt}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-green-500"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Circle className="h-5 w-5" />
                                </Button>
                            </DebtPaymentDialog>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm("¿Marcar esta deuda como pendiente nuevamente?")) {
                                        toggleDebtStatus(debt.id);
                                    }
                                }}
                                className="h-8 w-8 shrink-0 rounded-full text-green-500 hover:text-orange-500"
                            >
                                <CheckCircle2 className="h-5 w-5" />
                            </Button>
                        )}

                        <div className="flex flex-col overflow-hidden">
                            <span className="font-medium truncate">
                                {debt.description}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {debt.dueDate && (
                                    <div className="flex items-center gap-1">
                                        <Info className="h-3 w-3" />
                                        <span>Vence: {format(new Date(debt.dueDate), 'd MMM', { locale: es })}</span>
                                    </div>
                                )}
                                {isPaid && <span className="text-green-600 font-medium">Pagado</span>}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 ml-2">
                        <span className={`font-bold ${isPaid ? 'text-muted-foreground line-through' : (type === 'RECEIVABLE' ? 'text-green-600' : 'text-red-600')}`}>
                            {formatCurrency(debt.amount, 'PEN')}
                        </span>

                        <div className="flex items-center gap-1">
                            <DebtFormDialog mode="edit" defaultValues={debt}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                            </DebtFormDialog>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('¿Eliminar esta deuda permanentemente?')) deleteDebt(debt.id);
                                }}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="px-14 pb-3 text-xs text-muted-foreground animate-in slide-in-from-top-1 fade-in duration-200">
                        <p>Creada el: {format(new Date(debt.createdAt), 'dd MMM yyyy, HH:mm', { locale: es })}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Header Control for Archive */}
            <div className="flex justify-end px-1">
                <Button
                    variant={showArchived ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setShowArchived(!showArchived)}
                    className="text-xs h-7 gap-2"
                >
                    <Archive className="h-3.5 w-3.5" />
                    {showArchived ? 'Ver Pendientes' : 'Ver Archivo'}
                </Button>
            </div>

            {showArchived && (
                <div className="bg-muted/50 p-2 rounded-md text-center text-xs text-muted-foreground">
                    Mostrando deudas archivadas (pagadas).
                </div>
            )}

            {/* Render Categorized first (folders) */}
            <Accordion type="multiple" className="w-full space-y-2">
                {debtCategories.map(cat => {
                    const catDebts = debtsByCategory[cat.id];
                    if (!catDebts || catDebts.length === 0) return null;

                    const totalAmount = catDebts.reduce((sum, d) => sum + d.amount, 0);

                    return (
                        <AccordionItem key={cat.id} value={cat.id} className="border rounded-lg px-2">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <div className="flex items-center justify-between w-full pr-4 group">
                                    <div className="flex items-center gap-2">
                                        <Folder className="h-4 w-4 text-primary" />
                                        <span>{cat.name}</span>
                                        <span className="text-xs text-muted-foreground font-normal ml-2">({catDebts.length})</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold">{formatCurrency(totalAmount, 'PEN')}</span>

                                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                            <DebtCategoryDialog mode="edit" defaultValues={cat}>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                            </DebtCategoryDialog>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm(`¿Eliminar la carpeta "${cat.name}"? Las deudas pasarán a "Sin Carpeta".`)) {
                                                        deleteDebtCategory(cat.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
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
                {(debtsByCategory['uncategorized'] || []).map(renderDebtRow)}

                {relevantDebts.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                        {showArchived ? (
                            <>
                                <Archive className="h-8 w-8 opacity-20" />
                                <p>No hay deudas archivadas.</p>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-8 w-8 opacity-20" />
                                <p>No hay deudas pendientes.</p>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Summary Footer */}
            {relevantDebts.length > 0 && !showArchived && (
                <div className="flex justify-between items-center px-4 py-2 bg-muted/30 rounded-lg mt-2 font-medium text-sm">
                    <span>Total Pendiente</span>
                    <span>
                        {formatCurrency(relevantDebts.reduce((sum, d) => sum + d.amount, 0), 'PEN')}
                    </span>
                </div>
            )}
        </div>
    );
}
