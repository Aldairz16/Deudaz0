"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Plus, Wallet, Zap, Trash2 } from "lucide-react"
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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { TransactionType } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MoneyInput } from "@/components/ui/money-input"
import { formatCurrency } from "@/lib/utils"

const templateSchema = z.object({
    name: z.string().min(1, "Nombre requerido"),
    amount: z.coerce.number(),
    description: z.string().optional(),
    type: z.enum(["INCOME", "EXPENSE"]),
    walletId: z.string().optional(),
    category: z.string().optional(),
})

export function QuickActionsPanel() {
    const { transactionTemplates, addTransactionTemplate, deleteTransactionTemplate, addTransaction, wallets } = useStore();
    const [open, setOpen] = useState(false);
    const [executingId, setExecutingId] = useState<string | null>(null);
    const [selectionOpen, setSelectionOpen] = useState(false);
    const [pendingTemplate, setPendingTemplate] = useState<any | null>(null);

    // Form for creating template
    const form = useForm<z.infer<typeof templateSchema>>({
        resolver: zodResolver(templateSchema) as any,
        defaultValues: {
            name: "",
            amount: 0,
            description: "",
            type: "EXPENSE",
        },
    });

    async function onCreateTemplate(values: z.infer<typeof templateSchema>) {
        await addTransactionTemplate({
            name: values.name,
            amount: values.amount,
            description: values.description || values.name,
            type: values.type,
            walletId: values.walletId === "NONE" ? undefined : values.walletId,
            category: values.category,
            icon: "zap"
        });
        setOpen(false);
        form.reset();
    }

    async function handleExecute(template: any) {
        if (!template.walletId) {
            // If no wallet assigned, open selection dialog
            setPendingTemplate(template);
            setSelectionOpen(true);
            return;
        }

        executeTransaction(template, template.walletId);
    }

    async function executeTransaction(template: any, walletId: string) {
        setExecutingId(template.id);
        setSelectionOpen(false);
        try {
            await addTransaction({
                walletId: walletId,
                amount: template.amount,
                type: template.type,
                description: template.description,
                date: new Date().toISOString(),
                category: template.category,
            });
            alert(`Transacción "${template.name}" registrada correctamente.`);
        } catch (e) {
            console.error(e);
        } finally {
            setExecutingId(null);
            setPendingTemplate(null);
        }
    }

    return (
        <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
                {transactionTemplates.map((template) => (
                    <div
                        key={template.id}
                        className="relative group flex flex-col items-start p-4 bg-card hover:bg-accent/50 border rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm"
                        onClick={() => handleExecute(template)}
                    >
                        <div className="flex items-center gap-2 w-full mb-2">
                            <div className={`p-2 rounded-full ${template.type === 'INCOME' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                <Zap className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-sm truncate flex-1">{template.name}</span>
                        </div>
                        <div className="text-lg font-bold">
                            {formatCurrency(template.amount, 'PEN')}
                        </div>
                        <div className="text-xs text-muted-foreground truncate w-full">
                            {template.walletId
                                ? wallets.find(w => w.id === template.walletId)?.name || "Wallet eliminada"
                                : "Seleccionar al ejecutar"}
                        </div>

                        <button
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("¿Eliminar acción rápida?")) {
                                    deleteTransactionTemplate(template.id);
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="h-full min-h-[120px] flex flex-col gap-2 border-dashed hover:border-primary hover:bg-primary/5">
                            <Plus className="h-6 w-6" />
                            <span>Crear Nuevo</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nueva Acción Rápida</DialogTitle>
                            <DialogDescription>
                                Crea un botón para registrar gastos o ingresos frecuentes con un solo toque.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onCreateTemplate)} className="space-y-4">
                                <FormField
                                    control={form.control as any}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. Pasaje, Almuerzo" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control as any}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="EXPENSE">Gasto</SelectItem>
                                                        <SelectItem value="INCOME">Ingreso</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control as any}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Monto</FormLabel>
                                                <FormControl>
                                                    <MoneyInput value={field.value} onChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control as any}
                                    name="walletId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Billetera (Opcional)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || "NONE"}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="NONE">-- Seleccionar al ejecutar --</SelectItem>
                                                    {wallets.map(w => (
                                                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control as any}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Categoría (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. Transporte, Comida" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full">Guardar Acción Rápida</Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
                {/* Selection Dialog */}
                <Dialog open={selectionOpen} onOpenChange={setSelectionOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Seleccionar Billetera</DialogTitle>
                            <DialogDescription>
                                ¿Con qué billetera quieres pagar "{pendingTemplate?.name}"?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2 py-4">
                            {wallets.map((wallet) => (
                                <Button
                                    key={wallet.id}
                                    variant="outline"
                                    className="justify-start h-auto py-3 px-4"
                                    onClick={() => pendingTemplate && executeTransaction(pendingTemplate, wallet.id)}
                                >
                                    <div className="flex flex-col items-start gap-1">
                                        <div className="font-semibold flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: wallet.color }} />
                                            {wallet.name}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {formatCurrency(wallet.balance, wallet.currency)}
                                        </span>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
