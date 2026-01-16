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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useStore } from "@/lib/store"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"
import { MoneyInput } from "@/components/ui/money-input"

const formSchema = z.object({
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    description: z.string().min(1, "Description is required"),
    walletId: z.string().min(1, "Please select a wallet"),
    type: z.enum(["INCOME", "EXPENSE"]),
})

interface TransactionFormDialogProps {
    children?: React.ReactNode;
    mode?: 'create' | 'edit';
    defaultValues?: {
        id?: string;
        amount: number;
        description: string;
        walletId: string;
        type: "INCOME" | "EXPENSE";
    };
}

export function TransactionFormDialog({ children, mode = 'create', defaultValues }: TransactionFormDialogProps) {
    const [open, setOpen] = useState(false);
    const { wallets, addTransaction, updateTransaction } = useStore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            amount: defaultValues?.amount || 0,
            description: defaultValues?.description || "",
            walletId: defaultValues?.walletId || "",
            type: defaultValues?.type || "EXPENSE",
        },
    });

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (open) {
            form.reset({
                amount: defaultValues?.amount || 0,
                description: defaultValues?.description || "",
                walletId: defaultValues?.walletId || "",
                type: defaultValues?.type || "EXPENSE",
            });
        }
    }, [open, defaultValues, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (mode === 'create') {
            addTransaction({
                walletId: values.walletId,
                amount: values.amount,
                type: values.type,
                date: new Date().toISOString(),
                description: values.description,
            });
        } else if (mode === 'edit' && defaultValues?.id) {
            updateTransaction(defaultValues.id, {
                walletId: values.walletId,
                amount: values.amount,
                type: values.type,
                description: values.description,
            });
        }
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || <Button>Agregar Transacción</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Nueva Transacción' : 'Editar Transacción'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create' ? 'Registra un ingreso o gasto.' : 'Actualiza los detalles de la transacción.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-row space-x-4 justify-center"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="EXPENSE" id="expense" className="peer sr-only" />
                                                </FormControl>
                                                <FormLabel
                                                    htmlFor="expense"
                                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer w-24 text-center"
                                                >
                                                    Gasto
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="INCOME" id="income" className="peer sr-only" />
                                                </FormControl>
                                                <FormLabel
                                                    htmlFor="income"
                                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer w-24 text-center"
                                                >
                                                    Ingreso
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />





                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto</FormLabel>
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

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Comida, Salario, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="walletId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Billetera</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una billetera" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {wallets.map((wallet) => (
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

                        <DialogFooter>
                            <Button type="submit" className="w-full">
                                {mode === 'create' ? 'Guardar Transacción' : 'Actualizar Transacción'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
