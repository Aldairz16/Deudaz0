"use client"

import { WalletCards, PlusCircle, History, Home, Settings, CreditCard } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { useStore } from "@/lib/store";

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useStore();
    const userName = user?.user_metadata?.full_name || 'Usuario';

    const navItems = [
        {
            label: 'Balance',
            href: '/',
            icon: Home,
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
        {
            label: 'Ajustes',
            href: '/settings',
            icon: Settings,
        },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 border-r bg-background h-screen sticky top-0">
            <div className="p-6">
                <Logo />
                <div className="mt-4 px-2">
                    <p className="text-xs text-muted-foreground">Hola,</p>
                    <p className="font-semibold truncate" title={userName}>{userName}</p>
                </div>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                        >
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn("w-full justify-start gap-3", isActive && "bg-secondary")}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}
            </nav>
            {/* Optional footer area in sidebar */}
            <div className="p-4 border-t space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tema</span>
                    <ModeToggle />
                </div>
                <Button
                    variant="outline"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={async () => {
                        const { supabase } = await import('@/lib/supabase');
                        await supabase.auth.signOut();
                        window.location.reload(); // Hard reload to clear everything
                    }}
                >
                    Cerrar Sesión
                </Button>
                <div className="text-xs text-muted-foreground text-center">
                    <p>© 2024 Deudazo</p>
                </div>
            </div>
        </aside>
    );
}
