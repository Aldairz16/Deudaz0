"use client"

import { useForm, SubmitHandler } from "react-hook-form"
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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Wallet } from "@/types"

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    color: z.string().min(1, "Color is required"),
    type: z.enum(['DEBIT', 'CREDIT']),
    creditLimit: z.coerce.number().optional(),
    currentBalance: z.coerce.number().optional(), // For Debit: Balance. For Credit: AVAILABLE Balance.
})

type WalletFormValues = z.infer<typeof formSchema>;

interface WalletFormDialogProps {
    children?: React.ReactNode;
    mode?: 'create' | 'edit';
    defaultValues?: Wallet;
}

const COLORS = [
    "#EF4444", // Red
    "#F97316", // Orange
    "#F59E0B", // Amber
    "#84CC16", // Lime
    "#10B981", // Emerald
    "#06B6D4", // Cyan
    "#3B82F6", // Blue
    "#6366F1", // Indigo
    "#8B5CF6", // Violet
    "#D946EF", // Fuchsia
    "#F43F5E", // Rose
    "#71717A", // Zinc
];

export function WalletFormDialog({ children, mode = 'create', defaultValues }: WalletFormDialogProps) {
    const [open, setOpen] = useState(false);
    const { addWallet, updateWallet } = useStore();

    const form = useForm<WalletFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            color: COLORS[0],
            type: 'DEBIT',
            creditLimit: 0,
            currentBalance: 0,
        },
    });

    // Reset form when dialog opens or defaults change
    useEffect(() => {
        if (open) {
            form.reset({
                name: defaultValues?.name || "",
                color: defaultValues?.color || COLORS[0],
                type: defaultValues?.type || 'DEBIT',
                creditLimit: defaultValues?.creditLimit || 0,
                currentBalance: defaultValues?.balance || 0,
            });
        }
    }, [open, defaultValues, form]);

    const onSubmit: SubmitHandler<WalletFormValues> = (values) => {
        if (mode === 'create') {
            addWallet(
                values.name,
                values.color,
                values.type,
                values.creditLimit || 0,
                values.currentBalance || 0
            );
        } else if (mode === 'edit' && defaultValues?.id) {
            updateWallet(defaultValues.id, {
                name: values.name,
                color: values.color,
                creditLimit: values.creditLimit,
            });
        }
        setOpen(false);
        form.reset();
    }

    const type = form.watch('type');

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || <Button>Nueva Billetera</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Crear Billetera' : 'Editar Billetera'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create' ? 'Agrega una nueva billetera o tarjeta.' : 'Actualiza los detalles.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Type Selection */}
                        <FormField
                            control={form.control as any}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Tipo</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-4"
                                            disabled={mode === 'edit'}
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="DEBIT" />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    Efectivo / Débito
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="CREDIT" />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    Tarjeta de Crédito
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder={type === 'CREDIT' ? "Ej. Visa Oro, MasterCard" : "Ej. Efectivo, BCP Ahorros"} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Credit Limit - Only for Credit */}
                        {type === 'CREDIT' && (
                            <FormField
                                control={form.control as any}
                                name="creditLimit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Línea de Crédito Total</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormDescription>El límite máximo de tu tarjeta.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Balance Input */}
                        {mode === 'create' && (
                            <FormField
                                control={form.control as any}
                                name="currentBalance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{type === 'CREDIT' ? "Crédito Disponible Actual" : "Saldo Inicial"}</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        {type === 'CREDIT' && (
                                            <FormDescription>
                                                ¿Cuánto puedes gastar ahora mismo? (Límite - Deuda Actual)
                                            </FormDescription>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control as any}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {COLORS.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    className={cn(
                                                        "w-8 h-8 rounded-full border-2 transition-all",
                                                        field.value === color ? "border-primary scale-110" : "border-transparent alpha-80"
                                                    )}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => field.onChange(color)}
                                                />
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">{mode === 'create' ? 'Crear' : 'Guardar Cambios'}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
