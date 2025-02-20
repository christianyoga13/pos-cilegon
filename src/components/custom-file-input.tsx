import * as React from "react"
import { Button } from "@/components/ui/button"

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CustomFileInput({ onChange, disabled, ...props }: FileInputProps) {
  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        variant="outline"
        asChild
        className="cursor-pointer"
        disabled={disabled}
      >
        <label className="cursor-pointer">
          Choose Image
          <input
            type="file"
            className="hidden"
            onChange={onChange}
            disabled={disabled}
            accept="image/*"
            {...props}
          />
        </label>
      </Button>
    </div>
  )
}
