"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useStore } from "@/lib/store"
import { Folder, FolderCog, Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { DebtCategoryDialog } from "./debt-category-dialog"

export function ManageCategoriesDialog() {
    const { debtCategories, deleteDebtCategory } = useStore();
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <FolderCog className="h-4 w-4" />
                    Carpetas
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Administrar Carpetas</DialogTitle>
                    <DialogDescription>
                        Crea, edita o elimina tus categorías de deudas.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <DebtCategoryDialog mode="create">
                        <Button className="w-full gap-2" variant="secondary">
                            <Plus className="h-4 w-4" /> Nueva Carpeta
                        </Button>
                    </DebtCategoryDialog>

                    <div className="rounded-md border">
                        <div className="h-[300px] w-full p-4 overflow-y-auto">
                            {debtCategories.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground py-10">
                                    No tienes carpetas creadas.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {debtCategories.map((cat) => (
                                        <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Folder className="h-4 w-4 text-primary" />
                                                </div>
                                                <span className="font-medium text-sm">{cat.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <DebtCategoryDialog mode="edit" defaultValues={cat}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </DebtCategoryDialog>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => {
                                                        if (confirm(`¿Eliminar la carpeta "${cat.name}"?`)) {
                                                            deleteDebtCategory(cat.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
