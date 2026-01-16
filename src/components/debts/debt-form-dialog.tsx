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
import { MoneyInput } from "@/components/ui/money-input"
import { Debt, DebtType } from "@/types"

const formSchema = z.object({
    amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
    description: z.string().min(1, "La descripción es requerida"),
    type: z.enum(["PAYABLE", "RECEIVABLE"]),
    dueDate: z.string().optional(),
    categoryId: z.string().optional(),
})

interface DebtFormDialogProps {
    children?: React.ReactNode;
    mode?: 'create' | 'edit';
    defaultValues?: Partial<Debt>;
}

export function DebtFormDialog({ children, mode = 'create', defaultValues }: DebtFormDialogProps) {
    const [open, setOpen] = useState(false);
    const { addDebt, updateDebt, debtCategories } = useStore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            amount: defaultValues?.amount || 0,
            description: defaultValues?.description || "",
            type: defaultValues?.type || "PAYABLE",
            dueDate: defaultValues?.dueDate ? new Date(defaultValues.dueDate).toISOString().split('T')[0] : "",
            categoryId: defaultValues?.categoryId || "none",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                amount: defaultValues?.amount || 0,
                description: defaultValues?.description || "",
                type: defaultValues?.type || "PAYABLE",
                dueDate: defaultValues?.dueDate ? new Date(defaultValues.dueDate).toISOString().split('T')[0] : "",
                categoryId: defaultValues?.categoryId || "none",
            });
        }
    }, [open, defaultValues, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        const payload = {
            amount: values.amount,
            description: values.description,
            type: values.type as DebtType,
            dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
            categoryId: values.categoryId === "none" ? undefined : values.categoryId,
        };

        if (mode === 'create') {
            addDebt(payload);
        } else if (mode === 'edit' && defaultValues?.id) {
            updateDebt(defaultValues.id, payload);
        }
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || <Button>Agregar Deuda</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Nueva Deuda' : 'Editar Deuda'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create' ? 'Registra una deuda por pagar o por cobrar.' : 'Actualiza los detalles de la deuda.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

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
                                                    <RadioGroupItem value="PAYABLE" id="payable" className="peer sr-only" />
                                                </FormControl>
                                                <FormLabel
                                                    htmlFor="payable"
                                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-red-500 [&:has([data-state=checked])]:border-red-500 cursor-pointer w-28 text-center"
                                                >
                                                    Por Pagar (Deuda)
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="RECEIVABLE" id="receivable" className="peer sr-only" />
                                                </FormControl>
                                                <FormLabel
                                                    htmlFor="receivable"
                                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-green-500 cursor-pointer w-28 text-center"
                                                >
                                                    Por Cobrar (Crédito)
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
                                    <FormLabel>Descripción / Persona</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Cena, Juan Pérez..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vencimiento</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Carpeta</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sin carpeta" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">Ninguna</SelectItem>
                                                {debtCategories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" className="w-full">
                                {mode === 'create' ? 'Guardar Deuda' : 'Actualizar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
