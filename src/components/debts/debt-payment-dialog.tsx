"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { useState } from "react"
import { Debt } from "@/types"
import { MoneyInput } from "@/components/ui/money-input"
import { formatCurrency } from "@/lib/utils"
import { CheckCircle2, DollarSign } from "lucide-react"

interface DebtPaymentDialogProps {
    debt: Debt;
    children?: React.ReactNode;
}

export function DebtPaymentDialog({ debt, children }: DebtPaymentDialogProps) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState(debt.amount);
    const [walletId, setWalletId] = useState("");
    const { wallets, processDebtPayment } = useStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount > 0 && walletId) {
            processDebtPayment(debt.id, amount, walletId);
            setOpen(false);
        }
    };

    const isPayable = debt.type === 'PAYABLE';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-green-500">
                        <DollarSign className="h-5 w-5" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isPayable ? 'Registrar Pago' : 'Registrar Cobro'}</DialogTitle>
                    <DialogDescription>
                        {isPayable
                            ? `¿Cuánto vas a pagar de esta deuda?`
                            : `¿Cuánto te han pagado?`}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Monto a Registrar</Label>
                        <MoneyInput
                            value={amount}
                            onChange={setAmount}
                            className="text-lg font-bold"
                        />
                        <p className="text-xs text-muted-foreground">
                            Deuda total: {formatCurrency(debt.amount, 'PEN')}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>{isPayable ? 'Pagar desde Billetera' : 'Depositar en Billetera'}</Label>
                        <Select onValueChange={setWalletId} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una billetera" />
                            </SelectTrigger>
                            <SelectContent>
                                {wallets.map(wallet => (
                                    <SelectItem key={wallet.id} value={wallet.id}>
                                        {wallet.name} ({formatCurrency(wallet.balance, wallet.currency)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={!amount || !walletId}>
                            Confirmar {isPayable ? 'Pago' : 'Cobro'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
