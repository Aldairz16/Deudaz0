"use client"

import { Wallet } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
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
    // const [showAdjustment, setShowAdjustment] = useState(false);

    return (
        <Card className="relative overflow-hidden transition-all hover:shadow-md border-l-4" style={{ borderLeftColor: wallet.color }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {wallet.name}
                </CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
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
                        {/* <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setShowAdjustment(true); }}>
                <ArrowLeftRight className="mr-2 h-4 w-4" /> Ajustar Balance
             </DropdownMenuItem> */}
                    </DropdownMenuContent>
                </DropdownMenu>
                {/* Adjustment Dialog would go here */}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold" style={{ color: wallet.balance < 0 ? '#ef4444' : 'inherit' }}>
                    {wallet.currency} {wallet.balance.toFixed(2)}
                </div>
            </CardContent>
        </Card>
    )
}
