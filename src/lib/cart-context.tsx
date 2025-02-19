"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect } from "react"

interface CartItem {
  id: string
  name: string
  variant?: string
  price: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  tax: number
  isOpen: boolean
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "SET_CART_OPEN"; payload: boolean }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.id === action.payload.id)
      const updatedItems = existingItem
        ? state.items.map((item) => (item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item))
        : [...state.items, action.payload]
      return {
        ...state,
        items: updatedItems,
        isOpen: true, // Automatically open cart when adding item
      }
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
        ),
      }
    case "SET_CART_OPEN":
      return {
        ...state,
        isOpen: action.payload,
      }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    tax: 0.05, // 5% tax
    isOpen: false,
  })

  // Close cart if there are no items
  useEffect(() => {
    if (state.items.length === 0) {
      dispatch({ type: "SET_CART_OPEN", payload: false })
    }
  }, [state.items])

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

