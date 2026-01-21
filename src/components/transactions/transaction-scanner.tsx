"use client"

import { useState, useRef } from "react"
import { Scan, Upload, Loader2, Check, X, Calendar as CalendarIcon } from "lucide-react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"


// Define the shape of a scanned transaction
interface ScannedTransaction {
    id: string; // Temp ID
    description: string;
    amount: number;
    type: 'EXPENSE' | 'INCOME';
    date: string;
    selected: boolean;
}

export function TransactionScanner() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scannedData, setScannedData] = useState<ScannedTransaction[]>([]);
    const [selectedWalletId, setSelectedWalletId] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { wallets, addTransaction } = useStore();

    // Reset when opening
    const handleOpenChange = (val: boolean) => {
        setOpen(val);
        if (!val) {
            setScannedData([]);
            setLoading(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/scan-transaction', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error scanning image');
            }

            // Map response to local state with unique IDs
            const mapped: ScannedTransaction[] = data.transactions.map((t: any, idx: number) => ({
                id: `scan-${Date.now()}-${idx}`,
                description: t.description,
                amount: t.amount,
                type: t.type === 'INCOME' ? 'INCOME' : 'EXPENSE', // Normalize
                date: t.date,
                selected: true,
            }));

            setScannedData(mapped);
            // Default wallet to first one if available
            if (wallets.length > 0 && !selectedWalletId) {
                setSelectedWalletId(wallets[0].id);
            }

        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
            // Reset input so allow re-upload same file
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleImport = async () => {
        if (!selectedWalletId) {
            alert("Por favor selecciona una billetera");
            return;
        }

        const toImport = scannedData.filter(t => t.selected);
        if (toImport.length === 0) return;

        // Add all transactions
        // We do this one by one or we could add a bulk method to store. 
        // For now loop is fine for UI speed.

        let count = 0;
        for (const item of toImport) {
            await addTransaction({
                walletId: selectedWalletId,
                amount: item.amount,
                description: item.description,
                type: item.type,
                date: new Date(item.date).toISOString(),
                category: "Importado", // Default category
            });
            count++;
        }

        // Redirect to history page and force refresh to show new data
        // Using window.location to ensure full re-render of history from DB
        window.location.href = '/history';
    };

    // Toggle row selection
    const toggleSelection = (id: string) => {
        setScannedData(prev => prev.map(item =>
            item.id === id ? { ...item, selected: !item.selected } : item
        ));
    };

    // Update field value
    const updateField = (id: string, field: keyof ScannedTransaction, value: any) => {
        setScannedData(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0" title="Escanear Comprobante">
                    <Scan className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Importación Inteligente</DialogTitle>
                    <DialogDescription>
                        Sube una captura de estado de cuenta o foto de recibo. La IA extraerá los datos.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-6">

                    {/* Upload Section */}
                    {scannedData.length === 0 && !loading && (
                        <div
                            className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors h-64"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-10 w-10 mb-4 opacity-50" />
                            <p className="font-medium">Clic para subir imagen</p>
                            <p className="text-xs mt-2">Soporta estados de cuenta y boletas</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                            <p className="text-sm text-muted-foreground animate-pulse">Analizando imagen...</p>
                        </div>
                    )}

                    {/* Results Table */}
                    {scannedData.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
                                <span className="text-sm font-medium">Billetera de Destino:</span>
                                <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Selecciona billetera" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {wallets.map(w => (
                                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Mobile View (Cards) */}
                            <div className="md:hidden space-y-4">
                                {scannedData.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`border rounded-lg p-3 space-y-3 relative ${!item.selected ? 'opacity-50 bg-muted/20' : 'bg-card'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Selection Toggle */}
                                            <div
                                                className={`mt-1 w-6 h-6 rounded border cursor-pointer flex items-center justify-center shrink-0 ${item.selected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}
                                                onClick={() => toggleSelection(item.id)}
                                            >
                                                {item.selected && <Check className="h-4 w-4" />}
                                            </div>

                                            <div className="flex-1 space-y-2">
                                                {/* Description */}
                                                <div>
                                                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Descripción</label>
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => updateField(item.id, 'description', e.target.value)}
                                                        className="h-9 text-sm"
                                                        placeholder="Descripción"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pl-9">
                                            {/* Amount */}
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase font-bold">Monto</label>
                                                <Input
                                                    type="number"
                                                    value={item.amount}
                                                    onChange={(e) => updateField(item.id, 'amount', parseFloat(e.target.value))}
                                                    className="h-9 text-sm"
                                                />
                                            </div>

                                            {/* Type */}
                                            <div>
                                                <label className="text-[10px] text-muted-foreground uppercase font-bold">Tipo</label>
                                                <Select
                                                    value={item.type}
                                                    onValueChange={(val) => updateField(item.id, 'type', val)}
                                                >
                                                    <SelectTrigger className="h-9 text-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="EXPENSE">Gasto (-)</SelectItem>
                                                        <SelectItem value="INCOME">Ingreso (+)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Date */}
                                            <div className="col-span-2">
                                                <label className="text-[10px] text-muted-foreground uppercase font-bold">Fecha</label>
                                                <Input
                                                    type="date"
                                                    value={item.date}
                                                    onChange={(e) => updateField(item.id, 'date', e.target.value)}
                                                    className="h-9 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop View (Table) */}
                            <div className="hidden md:block rounded-md border">
                                <div className="grid grid-cols-[30px_1fr_100px_110px_120px] gap-2 p-3 bg-muted/50 font-medium text-xs text-muted-foreground">
                                    <div className="text-center">#</div>
                                    <div>Descripción</div>
                                    <div className="text-right">Monto</div>
                                    <div className="text-center">Tipo</div>
                                    <div className="text-right">Fecha</div>
                                </div>

                                {scannedData.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`grid grid-cols-[30px_1fr_100px_110px_120px] gap-2 p-2 items-center border-t text-sm ${!item.selected ? 'opacity-40 bg-muted/20' : ''}`}
                                    >
                                        {/* Checkbox */}
                                        <div className="flex justify-center">
                                            <div
                                                className={`w-5 h-5 rounded border cursor-pointer flex items-center justify-center ${item.selected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}
                                                onClick={() => toggleSelection(item.id)}
                                            >
                                                {item.selected && <Check className="h-3.5 w-3.5" />}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <Input
                                            value={item.description}
                                            onChange={(e) => updateField(item.id, 'description', e.target.value)}
                                            className="h-8 text-xs"
                                        />

                                        {/* Amount */}
                                        <Input
                                            type="number"
                                            value={item.amount}
                                            onChange={(e) => updateField(item.id, 'amount', parseFloat(e.target.value))}
                                            className="h-8 text-xs text-right"
                                        />

                                        {/* Type */}
                                        <Select
                                            value={item.type}
                                            onValueChange={(val) => updateField(item.id, 'type', val)}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="EXPENSE">Gasto (-) </SelectItem>
                                                <SelectItem value="INCOME">Ingreso (+)</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {/* Date */}
                                        <Input
                                            type="date"
                                            value={item.date}
                                            onChange={(e) => updateField(item.id, 'date', e.target.value)}
                                            className="h-8 text-xs text-right"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                <DialogFooter>
                    {scannedData.length > 0 && (
                        <div className="flex w-full justify-between items-center sm:justify-end gap-2">
                            <div className="text-xs text-muted-foreground mr-auto sm:mr-4">
                                {scannedData.filter(i => i.selected).length} seleccionados
                            </div>

                            <Button variant="ghost" onClick={() => setScannedData([])}>
                                Descartar
                            </Button>
                            <Button onClick={handleImport}>
                                Importar
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
