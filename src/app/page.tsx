"use client"

import { useStore } from "@/lib/store";
import { WalletCard } from "@/components/wallets/wallet-card";
import { WalletFormDialog } from "@/components/wallets/wallet-form-dialog";
import { Button } from "@/components/ui/button";
import { Plus, TrendingDown, TrendingUp, Wallet, Eye, EyeOff, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TransactionScanner } from "@/components/transactions/transaction-scanner";



export default function Home() {
  const { wallets, debts, showBalances, toggleShowBalances, user } = useStore();

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


  const displayAmount = (amount: number, currency: string = 'PEN') => {
    if (!showBalances) return '••••••';
    return formatCurrency(amount, currency);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Deudazo</h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={toggleShowBalances}
            >
              {showBalances ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </Button>
            <WalletFormDialog>
              <Button size="sm" className="gap-1 rounded-full">
                <Plus className="h-4 w-4" /> Billetera
              </Button>
            </WalletFormDialog>

            <TransactionScanner />

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configuración de Atajos (iOS)</DialogTitle>
                  <DialogDescription>
                    Usa estos valores para configurar tus Atajos de iOS y registrar gastos rápidamente.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>URL del Endpoint</Label>
                    <div className="flex gap-2">
                      <Input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/shortcut/transaction`} />
                      <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/shortcut/transaction`)}>
                        📋
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>User ID</Label>
                    <div className="flex gap-2">
                      <Input readOnly value={user?.id || ''} />
                      <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(user?.id || '')}>
                        📋
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-md text-xs text-muted-foreground">
                    <strong>Nota:</strong> Necesitarás configurar una "Clave Secreta" en las variables de entorno de tu proyecto (SHORTCUT_API_SECRET) y usarla en tu Atajo.
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
                    {displayAmount(realAvailable)}
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
                    {showBalances ? `-${formatCurrency(totalPayables, 'PEN')}` : '••••••'}
                  </p>
                </div>

                {/* Receivables */}
                <div className="space-y-1 text-right">
                  <div className="flex items-center justify-end gap-1.5 text-green-600 dark:text-green-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Por Cobrar</span>
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold tabular-nums">
                    {showBalances ? `+${formatCurrency(totalReceivables, 'PEN')}` : '••••••'}
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
                {displayAmount(totalWalletBalance)}
              </span>
            </div>
          </CardContent>
        </Card>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Mis Billeteras</h2>
        {wallets.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground mb-4">No tienes billeteras creadas.</p>
            <WalletFormDialog>
              <Button variant="outline">Crear mi primera billetera</Button>
            </WalletFormDialog>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {wallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                className={!showBalances ? "blur-sm transition-all hover:blur-none" : "transition-all"}
              // Passing a prop or handling mask internally would be cleaner, but masking via class/blur is a quick visual hack.
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
