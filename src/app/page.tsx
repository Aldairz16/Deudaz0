"use client"

import { useStore } from "@/lib/store";
import { WalletCard } from "@/components/wallets/wallet-card";
import { WalletFormDialog } from "@/components/wallets/wallet-form-dialog";
import { Button } from "@/components/ui/button";
import { Plus, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function Home() {
  const { wallets, debts } = useStore();

  const totalWalletBalance = wallets.reduce((acc, curr) => acc + curr.balance, 0);

  // Calculate used credit from Credit Cards
  const totalCreditUsed = wallets
    .filter(w => w.type === 'CREDIT' && w.creditLimit)
    .reduce((acc, w) => acc + ((w.creditLimit || 0) - w.balance), 0);

  const totalPayables = debts
    .filter(d => d.type === 'PAYABLE' && d.status === 'PENDING')
    .reduce((acc, d) => acc + d.amount, 0) + totalCreditUsed;

  const totalReceivables = debts
    .filter(d => d.type === 'RECEIVABLE' && d.status === 'PENDING')
    .reduce((acc, d) => acc + d.amount, 0);

  // "Real" Available = What I have (Wallets) + What I will collect (Receivables) - What I owe (Payables)
  const realAvailable = (totalWalletBalance + totalReceivables) - totalPayables;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Deudazo</h1>
          <WalletFormDialog>
            <Button size="sm" className="gap-1 rounded-full">
              <Plus className="h-4 w-4" /> Billetera
            </Button>
          </WalletFormDialog>
        </div>

        {/* Financial Summary Card */}
        <Card className="bg-card/50 backdrop-blur-sm border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 space-y-4">
              {/* Main Balance: Real Available */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Disponible para Gastar</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tighter text-blue-600 dark:text-blue-400">
                    {formatCurrency(realAvailable, 'PEN')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Dinero real (Billeteras + Por Cobrar - Deudas)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                {/* Payables */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Deudas</span>
                  </div>
                  <p className="text-lg font-bold tabular-nums">
                    -{formatCurrency(totalPayables, 'PEN')}
                  </p>
                </div>

                {/* Receivables */}
                <div className="space-y-1 text-right">
                  <div className="flex items-center justify-end gap-1.5 text-green-600 dark:text-green-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Por Cobrar</span>
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold tabular-nums">
                    +{formatCurrency(totalReceivables, 'PEN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Wallet Total Reference */}
            <div className="bg-muted/30 px-4 py-2 flex items-center justify-between border-t text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" />
                Total en Billeteras
              </span>
              <span className="font-medium text-foreground">
                {formatCurrency(totalWalletBalance, 'PEN')}
              </span>
            </div>
          </CardContent>
        </Card>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">My Wallets</h2>
        {wallets.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground mb-4">No wallets found.</p>
            <WalletFormDialog>
              <Button variant="outline">Create your first wallet</Button>
            </WalletFormDialog>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {wallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
