"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ShoppingCart, AlertCircle } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock_quantity: number
  dosage?: string
  manufacturer?: string
}

interface ProductCardProps {
  product: Product
  onCartUpdate?: () => void
}

export default function ProductCard({ product, onCartUpdate }: ProductCardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      // Check if product already in cart
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single()

      if (existing) {
        // Update quantity
        await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id)
      } else {
        // Add new item
        await supabase.from("cart_items").insert([
          {
            user_id: user.id,
            product_id: product.id,
            quantity: quantity,
          },
        ])
      }

      onCartUpdate?.()
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="line-clamp-2">{product.name}</CardTitle>
        <CardDescription>{product.manufacturer || product.category}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
          {product.dosage && <p className="text-xs text-muted-foreground">Dosage: {product.dosage}</p>}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">₹{product.price.toFixed(2)}</p>
            {product.stock_quantity > 0 ? (
              <p className="text-xs text-green-600">In Stock ({product.stock_quantity})</p>
            ) : (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Out of Stock
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max={product.stock_quantity}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
            className="w-16 px-2 py-2 border border-border rounded text-center text-sm"
            disabled={product.stock_quantity === 0}
          />
          <Button
            onClick={handleAddToCart}
            disabled={isAdding || product.stock_quantity === 0}
            className="flex-1 gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
