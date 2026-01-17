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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { DebtCategory } from "@/types"
import { FolderPlus, Pencil } from "lucide-react"
import { useState, useEffect } from "react"

interface DebtCategoryDialogProps {
    mode?: 'create' | 'edit';
    defaultValues?: DebtCategory;
    children?: React.ReactNode;
}

export function DebtCategoryDialog({ mode = 'create', defaultValues, children }: DebtCategoryDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const { addDebtCategory, updateDebtCategory } = useStore();

    useEffect(() => {
        if (mode === 'edit' && defaultValues) {
            setName(defaultValues.name);
        } else {
            setName("");
        }
    }, [mode, defaultValues, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            if (mode === 'edit' && defaultValues) {
                updateDebtCategory(defaultValues.id, name);
            } else {
                addDebtCategory(name);
            }
            if (mode === 'create') setName("");
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm" className="gap-2">
                        {mode === 'create' ? <FolderPlus className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                        {mode === 'create' ? "Nueva Carpeta" : "Editar"}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? "Crear Carpeta" : "Editar Carpeta"}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Agrupa tus deudas (ej. "Viaje a Cusco", "Oficina").'
                            : 'Cambia el nombre de tu carpeta de deudas.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nombre de la carpeta"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit">{mode === 'create' ? "Crear" : "Guardar Cambios"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
