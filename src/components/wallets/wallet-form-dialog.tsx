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
import { cn } from "@/lib/utils"

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    color: z.string().min(1, "Color is required"),
})

interface WalletFormDialogProps {
    children?: React.ReactNode;
    mode?: 'create' | 'edit';
    defaultValues?: {
        id: string;
        name: string;
        color: string;
    };
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

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: defaultValues?.name || "",
            color: defaultValues?.color || COLORS[0],
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (mode === 'create') {
            addWallet(values.name, values.color);
        } else if (mode === 'edit' && defaultValues?.id) {
            updateWallet(defaultValues.id, values);
        }
        setOpen(false);
        form.reset();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || <Button>Nueva Billetera</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Crear Billetera' : 'Editar Billetera'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create' ? 'Agrega una nueva billetera para rastrear tus finanzas.' : 'Actualiza los detalles de tu billetera.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Efectivo, Banco, Ahorros..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
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
