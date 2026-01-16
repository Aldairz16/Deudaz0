"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import { useState } from "react"
import { Wallet } from "@/types"
import { MoneyInput } from "@/components/ui/money-input"

const formSchema = z.object({
    amount: z.coerce.number(), // Simplified
    description: z.string().optional(),
})

interface BalanceAdjustmentDialogProps {
    wallet: Wallet;
    children: React.ReactNode;
}

export function BalanceAdjustmentDialog({ wallet, children }: BalanceAdjustmentDialogProps) {
    const [open, setOpen] = useState(false);
    const { addTransaction } = useStore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            amount: wallet.balance,
            description: "Ajuste Manual de Balance",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        addTransaction({
            walletId: wallet.id,
            amount: values.amount,
            type: 'ADJUSTMENT',
            date: new Date().toISOString(),
            description: values.description || "Ajuste Manual",
        });
        setOpen(false);
        form.reset();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajustar Balance</DialogTitle>
                    <DialogDescription>
                        Define manualmente el balance actual para {wallet.name}. Esto se registrará en el historial.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">


                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nuevo Balance</FormLabel>
                                    <FormControl>
                                        <MoneyInput
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Actualizar Balance</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
