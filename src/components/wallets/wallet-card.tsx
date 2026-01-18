"use client"

import Link from "next/link";
import { Wallet } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, getContrastingTextColor } from "@/lib/utils"
import { MoreHorizontal, Pencil, Trash2, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useStore } from "@/lib/store"
import { WalletFormDialog } from "./wallet-form-dialog"
import { useState } from "react"
import { BalanceAdjustmentDialog } from "./balance-adjustment-dialog"
import { motion } from "framer-motion";

interface WalletCardProps {
    wallet: Wallet
    className?: string
}

const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 30 }
    }
} as const;

export function WalletCard({ wallet, className }: WalletCardProps) {
    const { deleteWallet } = useStore();
    const textColor = getContrastingTextColor(wallet.color);

    return (
        <motion.div
            variants={item}
            whileTap={{ scale: 0.92, transition: { duration: 0.1 } }}
            className={`w-full ${className || ''}`}
        >
            <Card
                className="relative overflow-hidden border-0 aspect-[1.2/1] rounded-[24px]"
                style={{
                    backgroundColor: wallet.color,
                    color: textColor,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
            >
                <div className="p-4 flex flex-col justify-between h-full space-y-2 relative">
                    {/* Main Clickable Area Overlay */}
                    <Link href={`/wallets/${wallet.id}`} className="absolute inset-0 z-0" aria-label={`Ver detalles de ${wallet.name}`} />

                    <div className="flex flex-row items-start justify-between pointer-events-none">
                        <div className="min-w-0 flex-1 mr-1">
                            <h3 className="text-base font-bold tracking-tight truncate leading-tight" style={{ color: textColor }}>
                                {wallet.name}
                            </h3>
                            <p className="text-xs font-medium uppercase tracking-wider opacity-80" style={{ color: textColor }}>
                                {wallet.type === 'CREDIT' ? 'Tarjeta de Crédito' : 'Billetera'}
                            </p>
                        </div>

                        <div className="flex items-center -mr-2 -mt-2 shrink-0 pointer-events-auto relative z-10">
                            {/* Adjustment Trigger - Only showing standard tools for now, maybe custom "Pay" for Credit later */}
                            <BalanceAdjustmentDialog wallet={wallet}>
                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-black/10 dark:hover:bg-white/10" style={{ color: textColor }}>
                                    <ArrowLeftRight className="h-3.5 w-3.5" />
                                </Button>
                            </BalanceAdjustmentDialog>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-black/10 dark:hover:bg-white/10" style={{ color: textColor }}>
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <WalletFormDialog mode="edit" defaultValues={wallet}>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <Pencil className="mr-2 h-4 w-4" /> Editar
                                        </DropdownMenuItem>
                                    </WalletFormDialog>
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => {
                                            if (confirm('¿Estás seguro de que deseas eliminar esta billetera?')) {
                                                deleteWallet(wallet.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="pointer-events-none relative z-0 mt-auto space-y-2">
                        {wallet.type === 'CREDIT' && wallet.creditLimit ? (
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] opacity-90 font-medium">
                                    <span>Disp: {formatCurrency(wallet.balance, wallet.currency)}</span>
                                    <span>Límite: {formatCurrency(wallet.creditLimit, wallet.currency)}</span>
                                </div>
                                {/* Progress Bar for Usage (Used / Limit) */}
                                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-current opacity-90 transition-all duration-500"
                                        style={{
                                            width: `${Math.min(100, Math.max(0, ((wallet.creditLimit - wallet.balance) / wallet.creditLimit) * 100))}%`
                                        }}
                                    />
                                </div>
                                <div className="flex justify-end text-[10px] font-bold">
                                    <span className="opacity-70 mr-1">Usado:</span>
                                    <span>{formatCurrency(wallet.creditLimit - wallet.balance, wallet.currency)}</span>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-[10px] opacity-80 mb-0.5" style={{ color: textColor }}>Balance</p>
                                <div className="text-lg font-bold tracking-tight truncate" style={{ color: textColor }}>
                                    {wallet.currency} {wallet.balance.toFixed(2)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
