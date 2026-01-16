"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Accordion = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { type?: "single" | "multiple", value?: string | string[], onValueChange?: (value: any) => void }
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
))
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, ...props }, ref) => (
    // We need to pass value down context ideally, but for this simple version let's stick to simple composition
    // Actually, without Context, the Trigger won't know how to toggle.
    // Let's implement a simplified Accordion using Details/Summary for now or just a Context.
    // Context is safer for the API I used.
    <AccordionContext.Provider value={{ itemValue: props.value }}>
        <div ref={ref} className={cn("border-b", className)} {...props} />
    </AccordionContext.Provider>
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const { itemValue } = React.useContext(AccordionContext);
    const { expandedValues, toggle } = React.useContext(AccordionRootContext); // We need a root context!
    const isOpen = expandedValues.includes(itemValue);

    return (
        <div className="flex">
            <button
                ref={ref}
                onClick={() => toggle(itemValue)}
                className={cn(
                    "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
                    className
                )}
                data-state={isOpen ? "open" : "closed"}
                {...props}
            >
                {children}
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </button>
        </div>
    )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { itemValue } = React.useContext(AccordionContext);
    const { expandedValues } = React.useContext(AccordionRootContext);
    const isOpen = expandedValues.includes(itemValue);

    if (!isOpen) return null;

    return (
        <div
            ref={ref}
            className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
            {...props}
        >
            <div className={cn("pb-4 pt-0", className)}>{children}</div>
        </div>
    )
})
AccordionContent.displayName = "AccordionContent"


// Contexts
const AccordionContext = React.createContext<{ itemValue: string }>({ itemValue: "" });
const AccordionRootContext = React.createContext<{ expandedValues: string[], toggle: (val: string) => void }>({ expandedValues: [], toggle: () => { } });

// Real Wrapper
const AccordionRoot = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { type?: "single" | "multiple", value?: string | string[], onValueChange?: (value: any) => void }
>(({ className, type = "single", children, ...props }, ref) => {
    // Basic state implementation
    const [internalState, setInternalState] = React.useState<string[]>([]);

    // Simple toggle logic
    const toggle = (val: string) => {
        setInternalState(prev => {
            if (prev.includes(val)) return prev.filter(v => v !== val);
            return [...prev, val];
        })
    }

    return (
        <AccordionRootContext.Provider value={{ expandedValues: internalState, toggle }}>
            <div ref={ref} className={cn("", className)} {...props}>
                {children}
            </div>
        </AccordionRootContext.Provider>
    )
})
AccordionRoot.displayName = "Accordion"


export { AccordionRoot as Accordion, AccordionItem, AccordionTrigger, AccordionContent }
