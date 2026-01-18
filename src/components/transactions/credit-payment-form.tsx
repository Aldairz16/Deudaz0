"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { MoneyInput } from "@/components/ui/money-input"
import { formatCurrency } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useState } from "react"

const formSchema = z.object({
    amount: z.coerce.number().min(0.01, "Monto requerido"),
    sourceWalletId: z.string().min(1, "Selecciona origen"),
    targetWalletId: z.string().min(1, "Selecciona tarjeta"),
})

interface CreditPaymentFormProps {
    onSuccess?: () => void;
}

export function CreditPaymentForm({ onSuccess }: CreditPaymentFormProps) {
    const { wallets, addTransaction } = useStore();
    const [loading, setLoading] = useState(false);

    // Filter wallets
    const creditWallets = wallets.filter(w => w.type === 'CREDIT');
    const debitWallets = wallets.filter(w => w.type === 'DEBIT');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            amount: 0,
            sourceWalletId: "",
            targetWalletId: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const sourceWallet = wallets.find(w => w.id === values.sourceWalletId);
            const targetWallet = wallets.find(w => w.id === values.targetWalletId);

            if (!sourceWallet || !targetWallet) return;

            const date = new Date().toISOString();

            // 1. Expense from Source (Debit)
            await addTransaction({
                walletId: values.sourceWalletId,
                amount: values.amount,
                type: 'EXPENSE',
                description: `Pago de Tarjeta: ${targetWallet.name}`,
                date: date,
                category: 'Transferencia'
            });

            // 2. Income/Payment to Target (Credit)
            // For credit cards, an INCOME reduces the used balance (increases available).
            await addTransaction({
                walletId: values.targetWalletId,
                amount: values.amount,
                type: 'INCOME', // Logic in store handles INCOME as adding to balance (Available Credit)
                description: `Pago recibido desde: ${sourceWallet.name}`,
                date: date,
                category: 'Pago Tarjeta'
            });

            form.reset();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (creditWallets.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No tienes tarjetas de crédito registradas.
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">

                <FormField
                    control={form.control as any}
                    name="targetWalletId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tarjeta a Pagar</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona la tarjeta" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {creditWallets.map((wallet) => (
                                        <SelectItem key={wallet.id} value={wallet.id}>
                                            {wallet.name} (Deuda: {wallet.creditLimit ? formatCurrency((wallet.creditLimit - wallet.balance), wallet.currency) : '?'})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control as any}
                    name="sourceWalletId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pagar desde</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona cuenta de origen" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {debitWallets.map((wallet) => (
                                        <SelectItem key={wallet.id} value={wallet.id}>
                                            {wallet.name} ({formatCurrency(wallet.balance, wallet.currency)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control as any}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monto a Pagar</FormLabel>
                            <FormControl>
                                <MoneyInput
                                    className="text-right text-lg font-bold"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Realizar Pago
                </Button>
            </form>
        </Form>
    )
}
