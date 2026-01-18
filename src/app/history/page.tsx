"use client"

import { useStore } from "@/lib/store";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Filter, Check } from "lucide-react";
import { isSameMonth, isSameWeek, isSameYear } from "date-fns";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type FilterType = 'ALL' | 'WEEK' | 'MONTH' | 'YEAR';

export default function HistoryPage() {
    const { transactions, wallets } = useStore();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterType>("MONTH");
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

    const filteredTransactions = transactions
        .filter((t) => {
            // Text Search
            const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());

            // Type Filter
            let matchesType = true;
            if (typeFilter !== 'ALL') {
                matchesType = t.type === typeFilter;
            }

            // Date Filter
            let matchesTime = true;
            const tDate = new Date(t.date);
            const now = new Date();

            if (filter === 'WEEK') {
                matchesTime = isSameWeek(tDate, now, { weekStartsOn: 1 });
            } else if (filter === 'MONTH') {
                matchesTime = isSameMonth(tDate, now);
            } else if (filter === 'YEAR') {
                matchesTime = isSameYear(tDate, now);
            }

            return matchesSearch && matchesTime && matchesType;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getFilterLabel = (f: FilterType) => {
        switch (f) {
            case 'WEEK': return 'Esta Semana';
            case 'MONTH': return 'Este Mes';
            case 'YEAR': return 'Este Año';
            default: return 'Todos';
        }
    };

    const getTypeFilterLabel = (f: typeof typeFilter) => {
        switch (f) {
            case 'INCOME': return 'Ingresos';
            case 'EXPENSE': return 'Gastos';
            default: return 'Todos';
        }
    }

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <header className="space-y-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">Historial</h1>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar transacciones..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 relative">
                                <Filter className={`h-4 w-4 ${filter !== 'ALL' || typeFilter !== 'ALL' ? 'text-primary' : ''}`} />
                                {(filter !== 'ALL' || typeFilter !== 'ALL') && (
                                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Tiempo</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setFilter('ALL')}>
                                <span className={filter === 'ALL' ? 'font-bold' : ''}>Todos</span>
                                {filter === 'ALL' && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter('WEEK')}>
                                <span className={filter === 'WEEK' ? 'font-bold' : ''}>Esta Semana</span>
                                {filter === 'WEEK' && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter('MONTH')}>
                                <span className={filter === 'MONTH' ? 'font-bold' : ''}>Este Mes</span>
                                {filter === 'MONTH' && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter('YEAR')}>
                                <span className={filter === 'YEAR' ? 'font-bold' : ''}>Este Año</span>
                                {filter === 'YEAR' && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Tipo de Movimiento</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={() => setTypeFilter('ALL')}>
                                <span className={typeFilter === 'ALL' ? 'font-bold' : ''}>Todos</span>
                                {typeFilter === 'ALL' && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTypeFilter('INCOME')}>
                                <span className={typeFilter === 'INCOME' ? 'font-bold' : ''}>Ingresos</span>
                                {typeFilter === 'INCOME' && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTypeFilter('EXPENSE')}>
                                <span className={typeFilter === 'EXPENSE' ? 'font-bold' : ''}>Gastos</span>
                                {typeFilter === 'EXPENSE' && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {(filter !== 'ALL' || typeFilter !== 'ALL') && (
                    <div className="flex flex-wrap gap-2">
                        {filter !== 'ALL' && (
                            <div className="text-xs px-2 py-1 bg-muted rounded-full flex items-center gap-1">
                                <span>Periodo: {getFilterLabel(filter)}</span>
                                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 rounded-full" onClick={() => setFilter('ALL')}>
                                    <span className="sr-only">Quitar filtro</span>
                                    &times;
                                </Button>
                            </div>
                        )}
                        {typeFilter !== 'ALL' && (
                            <div className="text-xs px-2 py-1 bg-muted rounded-full flex items-center gap-1">
                                <span>Tipo: {getTypeFilterLabel(typeFilter)}</span>
                                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 rounded-full" onClick={() => setTypeFilter('ALL')}>
                                    <span className="sr-only">Quitar filtro</span>
                                    &times;
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </header>

            <div className="space-y-4">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed rounded-xl">
                        <p className="text-muted-foreground">No hay transacciones con estos filtros.</p>
                        <Button
                            variant="link"
                            onClick={() => { setFilter('ALL'); setTypeFilter('ALL'); }}
                            className="mt-2"
                        >
                            Limpiar filtros
                        </Button>
                    </div>
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
