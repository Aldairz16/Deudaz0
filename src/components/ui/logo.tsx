import { Wallet } from "lucide-react";

export function Logo({ className }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 font-bold text-xl tracking-tighter ${className}`}>
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <Wallet className="w-5 h-5" />
            </div>
            <span>Deudazo</span>
        </div>
    );
}
