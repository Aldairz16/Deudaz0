"use client"

import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { Plus, FolderPlus } from "lucide-react"
import { DebtList } from "@/components/debts/debt-list"
import { DebtFormDialog } from "@/components/debts/debt-form-dialog"
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
import { useState } from "react"
import { Label } from "@/components/ui/label"

function AddCategoryDialog() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const { addDebtCategory } = useStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            addDebtCategory(name);
            setName("");
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <FolderPlus className="h-4 w-4" />
                    Nueva Carpeta
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Carpeta</DialogTitle>
                    <DialogDescription>
                        Agrupa tus deudas (ej. "Viaje a Cusco", "Oficina").
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la carpeta" />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Crear</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default function DebtsPage() {
    return (
        <div className="space-y-6 pb-24 md:pb-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Gestión de Deudas</h1>
                <div className="flex items-center gap-2">
                    <AddCategoryDialog />
                    <DebtFormDialog>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Agregar Deuda
                        </Button>
                    </DebtFormDialog>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mis Deudas Column */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Mis Deudas</h2>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Por Pagar</span>
                    </div>
                    <DebtList type="PAYABLE" />
                </div>

                {/* Por Cobrar Column */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">Cuentas por Cobrar</h2>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">A mi favor</span>
                    </div>
                    <DebtList type="RECEIVABLE" />
                </div>
            </div>
        </div>
    );
}
