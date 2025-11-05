"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogOut, Trash2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    stock_quantity: number
  }
}

export default function CartPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchCart = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)

      const { data } = await supabase
        .from("cart_items")
        .select("id, quantity, product:product_id(id, name, price, stock_quantity)")
        .eq("user_id", user.id)

      const items = (data || []) as any[]
      setCartItems(items as CartItem[])

      const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      setTotal(totalAmount)
      setLoading(false)
    }
    fetchCart()
  }, [])

  const handleRemoveItem = async (cartItemId: string) => {
    await supabase.from("cart_items").delete().eq("id", cartItemId)
    const updated = cartItems.filter((item) => item.id !== cartItemId)
    setCartItems(updated)
    const newTotal = updated.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    setTotal(newTotal)
  }

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId)
      return
    }

    await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", cartItemId)

    const updated = cartItems.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item))
    setCartItems(updated)
    const newTotal = updated.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    setTotal(newTotal)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleCheckout = async () => {
    // Create order
    const { data: order } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user.id,
          total_amount: total,
          status: "pending",
        },
      ])
      .select()
      .single()

    if (order) {
      // Create order items
      for (const item of cartItems) {
        await supabase.from("order_items").insert([
          {
            order_id: order.id,
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          },
        ])
      }

      // Clear cart
      await supabase.from("cart_items").delete().eq("user_id", user.id)

      // Redirect to order confirmation
      router.push(`/order-confirmation/${order.id}`)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">GM</span>
            </div>
            <h1 className="text-2xl font-bold">Galaxy Medical</h1>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="destructive" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Shopping Cart</h2>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="pt-12 text-center">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Link href="/dashboard">
                <Button>Continue Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">₹{item.product.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border border-border rounded text-center text-sm"
                        />
                        <p className="w-20 text-right font-semibold">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button onClick={handleCheckout} className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full bg-transparent">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
