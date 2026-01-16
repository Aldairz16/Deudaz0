import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    value: number
    onChange: (value: number) => void
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
    ({ className, value, onChange, ...props }, ref) => {
        // Convert the number value to a string of digits for local state
        // e.g. 1.23 -> "123", 0.05 -> "5"
        const [displayValue, setDisplayValue] = React.useState("0.00")

        React.useEffect(() => {
            // Format the initial or external value
            // We only want to update this if the value actually changed significantly 
            // to avoid fighting with local state, but since we control the input logic,
            // we can just derive formatting from the prop.
            const formatted = new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                useGrouping: false, // We don't want commas for now to keep it simple, or maybe we do?
            }).format(value)
            setDisplayValue(formatted)
        }, [value])


        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            // We don't use the event value directly for calculation because we want to implement
            // a specific "push" behavior. However, HTML inputs don't give us the "key pressed" easily in onChange.
            // So we might need onKeyDown.
            // Actually, preventing standard input and handling text selection is hard.
            // A simpler way for "ATM style" input:
            // 1. Listen to onKeyDown to capture digits and Backspace.
            // 2. Update the internal "cents" integer.
            // 3. Call onChange(cents / 100).
            // 4. Force the input value to be the formatted string.
        }

        // Changing approach to use a ref to hold the current 'cents' value to avoid closure staleness if needed,
        // but state is fine. 

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            const key = e.key

            // Allow navigation keys
            if (['Tab', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(key)) return

            e.preventDefault() // Block default typing

            if (['Backspace', 'Delete'].includes(key)) {
                // Remove last digit
                // Current value * 100 rounded to integer
                let currentCents = Math.round(value * 100)
                let newCents = Math.floor(currentCents / 10)
                onChange(newCents / 100)
                return
            }

            if (/^[0-9]$/.test(key)) {
                const digit = parseInt(key)
                let currentCents = Math.round(value * 100)

                // Limit to avoiding overflow if needed, but JS numbers are large enough.
                // Check for max safe integer?
                if (currentCents > 90000000000000) return; // arbitrary limit

                let newCents = currentCents * 10 + digit
                onChange(newCents / 100)
            }
        }

        return (
            <Input
                {...props}
                ref={ref}
                type="text" // Must be text to allow us to control formatting (e.g. 0.00)
                inputMode="numeric"
                value={displayValue}
                onChange={() => { }} // Controlled by onKeyDown
                onKeyDown={handleKeyDown}
                className={cn("text-right font-mono", className)}
            />
        )
    }
)
MoneyInput.displayName = "MoneyInput"
