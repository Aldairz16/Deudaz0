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

interface WalletCardProps {
    wallet: Wallet
}

export function WalletCard({ wallet }: WalletCardProps) {
    const { deleteWallet } = useStore();
    const textColor = getContrastingTextColor(wallet.color);
    const mutedTextColor = textColor === '#ffffff' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';

    return (
        <Card
            className="relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] border-0 aspect-[1.2/1]"
            style={{ backgroundColor: wallet.color, color: textColor }}
        >
            <div className="p-4 flex flex-col justify-between h-full space-y-2">
                <div className="flex flex-row items-start justify-between">
                    <div className="min-w-0 flex-1 mr-1">
                        <h3 className="text-base font-bold tracking-tight truncate leading-tight" style={{ color: textColor }}>
                            {wallet.name}
                        </h3>
                        <p className="text-xs font-medium uppercase tracking-wider opacity-80" style={{ color: textColor }}>
                            Billetera
                        </p>
                    </div>

                    <div className="flex items-center -mr-2 -mt-2 shrink-0">
                        {/* Adjustment Trigger */}
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

                <Link href={`/wallets/${wallet.id}`} className="block group mt-auto">
                    <div>
                        <p className="text-[10px] opacity-80 mb-0.5" style={{ color: textColor }}>Balance</p>
                        <div className="text-lg font-bold tracking-tight truncate" style={{ color: textColor }}>
                            {wallet.currency} {wallet.balance.toFixed(2)}
                        </div>
                    </div>
                </Link>
            </div>
        </Card>
    )
}
