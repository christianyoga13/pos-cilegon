"use client"

import { Minus, Plus, User2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { cn } from "@/lib/utils"

interface CartSheetProps {
  className?: string
}

export function CartSheet({ className }: CartSheetProps) {
  const { state, dispatch } = useCart()

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity: newQuantity } })
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * state.tax
  const total = subtotal + tax

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className={cn("flex flex-col w-full h-full bg-background shadow-lg", className)}>
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Delivery Order</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch({ type: "SET_CART_OPEN", payload: false })}
          className="lg:hidden" // Only show close button on mobile
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      <div className="flex items-center gap-2 p-4 border-b">
        <User2 className="w-5 h-5" />
        <span className="text-sm text-muted-foreground">Add customer</span>
      </div>
      <div className="flex-1 overflow-auto">
        {state.items.map((item) => (
          <div key={item.id} className="p-4 border-b">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                {item.variant && <p className="text-sm text-muted-foreground">{item.variant}</p>}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="w-12 text-center">{item.quantity}</div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="w-24 text-right">{formatPrice(item.price * item.quantity)}</div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(item.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t mt-auto space-y-4">
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total</span>
          <span className="font-semibold text-xl">{formatPrice(total)}</span>
        </div>
        <Button className="w-full" size="lg">
          Pay {formatPrice(total)}
        </Button>
      </div>
    </div>
  )
}

