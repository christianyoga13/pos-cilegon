import { cn } from "@/lib/utils"

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("container mx-auto px-4", className)}
      {...props}
    />
  )
}
