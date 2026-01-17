"use client"

import { WalletCards, PlusCircle, History, Settings, CreditCard } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        {
            label: 'Billeteras',
            href: '/',
            icon: WalletCards,
        },
        {
            label: 'Agregar',
            href: '/add-transaction',
            icon: PlusCircle,
        },
        {
            label: 'Historial',
            href: '/history',
            icon: History,
        },
        {
            label: 'Deudas',
            href: '/debts',
            icon: CreditCard,
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 md:hidden pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3">
            <nav className="flex justify-around items-center h-auto max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full text-xs gap-1 transition-colors",
                                isActive
                                    ? "text-primary font-medium"
                                    : "text-muted-foreground hover:text-primary"
                            )}
                        >
                            <item.icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
