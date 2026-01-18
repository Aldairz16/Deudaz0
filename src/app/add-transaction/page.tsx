"use client"

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpRight, CreditCard, Wallet, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { formatCurrency } from "@/lib/utils";
import { MoneyInput } from "@/components/ui/money-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuickActionsPanel } from "@/components/transactions/quick-actions";
import { CreditPaymentForm } from "@/components/transactions/credit-payment-form";

const formSchema = z.object({
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    description: z.string().min(1, "Description is required"),
    walletId: z.string().min(1, "Please select a wallet"),
    type: z.enum(["INCOME", "EXPENSE"]),
});

export default function AddTransactionPage() {
    const router = useRouter();
    const { wallets, addTransaction } = useStore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            amount: 0,
            description: "",
            walletId: "",
            type: "EXPENSE",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        addTransaction({
            walletId: values.walletId,
            amount: values.amount,
            type: values.type,
            date: new Date().toISOString(),
            description: values.description,
        });
        router.push('/');
    }

    return (
        <div className="space-y-6 pb-24 md:pb-10">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Agregar</h1>
            </div>

            <Tabs defaultValue="transaction" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="transaction" className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4" />
                        <span className="hidden sm:inline">Transacción</span>
                        <span className="sm:hidden">Trans.</span>
                    </TabsTrigger>
                    <TabsTrigger value="quick-actions" className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span className="hidden sm:inline">Rápida</span>
                        <span className="sm:hidden">Rápida</span>
                    </TabsTrigger>
                    <TabsTrigger value="pay-card" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="hidden sm:inline">Pagar TJ</span>
                        <span className="sm:hidden">Pagar</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="transaction">
                    <Card>
                        <CardContent className="pt-6">
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
                                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer w-24 text-center transition-all"
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
                                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer w-24 text-center transition-all"
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

                                    <Button type="submit" className="w-full">Guardar Transacción</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="quick-actions">
                    <Card>
                        <CardContent className="pt-2">
                            <QuickActionsPanel />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pay-card">
                    <Card>
                        <CardContent>
                            <CreditPaymentForm onSuccess={() => router.push('/')} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
