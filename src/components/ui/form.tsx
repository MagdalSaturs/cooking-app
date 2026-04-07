import * as React from "react"
import { FormProvider, useFormContext, Controller } from "react-hook-form"
import { Label } from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export const Form = FormProvider

export function FormField({ name, control, render }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) =>
        render({
          field,
          error: fieldState.error,
        })
      }
    />
  )
}

export function FormItem({ className, ...props }) {
  return <div className={cn("space-y-2", className)} {...props} />
}

export function FormLabel({ className, ...props }) {
  return <Label className={cn(className)} {...props} />
}

export function FormControl({ ...props }) {
  return <Slot {...props} />
}

export function FormMessage({ error }) {
  if (!error) return null
  return <p className="text-sm font-medium text-red-500">{error.message}</p>
}
