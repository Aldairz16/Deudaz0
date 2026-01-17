"use client"

import { useStore } from "@/lib/store";
import { WalletCard } from "@/components/wallets/wallet-card";
import { WalletFormDialog } from "@/components/wallets/wallet-form-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { wallets } = useStore();

  const totalBalance = wallets.reduce((acc, curr) => acc + curr.balance, 0);

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
      <header className="flex flex-col gap-2">
        {/* ... header content ... */}
        <h1 className="text-3xl font-bold tracking-tight">Deudazo</h1>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <div className="text-4xl font-extrabold tracking-tighter">
              PEN {totalBalance.toFixed(2)}
            </div>
          </div>
          <WalletFormDialog>
            <Button size="sm" className="gap-1 rounded-full">
              <Plus className="h-4 w-4" /> Add Wallet
            </Button>
          </WalletFormDialog>
        </div>
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
