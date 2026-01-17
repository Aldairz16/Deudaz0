import { useStore } from "@/lib/store";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isSameMonth, isSameWeek, isSameYear, parseISO, startOfDay } from "date-fns";

type FilterType = 'ALL' | 'WEEK' | 'MONTH' | 'YEAR';

export default function HistoryPage() {
    const { transactions, wallets } = useStore();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterType>("MONTH");

    const filteredTransactions = transactions
        .filter((t) => {
            // Text Search
            const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());

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

            return matchesSearch && matchesTime;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <header className="space-y-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">Historial</h1>
                </div>

                <div className="space-y-3">
                    <Tabs defaultValue="MONTH" value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="ALL">Todos</TabsTrigger>
                            <TabsTrigger value="WEEK">Semana</TabsTrigger>
                            <TabsTrigger value="MONTH">Mes</TabsTrigger>
                            <TabsTrigger value="YEAR">Año</TabsTrigger>
                        </TabsList>
                    </Tabs>

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
                </div>
            </header>

            <div className="space-y-4">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed rounded-xl">
                        <p className="text-muted-foreground">No hay transacciones en este periodo.</p>
                        {filter !== 'ALL' && (
                            <button onClick={() => setFilter('ALL')} className="text-sm text-primary hover:underline mt-2">
                                Ver todas
                            </button>
                        )}
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
