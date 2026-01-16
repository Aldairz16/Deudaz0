"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const { user, setUser } = useStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    setUser(session.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Auth check error:", error);
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                setLoading(false); // Make sure we stop loading if we get a user late
            }
        });

        return () => subscription.unsubscribe();
    }, [setUser]);

    // Redirect logic in useEffect to avoid "set state during render" error
    useEffect(() => {
        if (!loading && !user && pathname !== "/login") {
            router.push("/login");
        }
        if (!loading && user && pathname === "/login") {
            router.push("/");
        }
    }, [user, loading, pathname, router]);


    // If loading, show spinner
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // If not user and not on login page, show nothing (while redirecting)
    if (!user && pathname !== "/login") return null;


    return <>{children}</>;
}
