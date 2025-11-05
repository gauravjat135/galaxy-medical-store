"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { ShoppingCart } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">GM</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Galaxy Medical</h1>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Button onClick={() => router.push("/dashboard")} variant="default">
                Dashboard
              </Button>
            ) : (
              <>
                <Button onClick={() => router.push("/login")} variant="outline">
                  Login
                </Button>
                <Button onClick={() => router.push("/signup")} variant="default">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl">
          <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">Your Trusted Online Pharmacy</h2>
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            Buy medicines and health essentials with trusted quality and fast delivery. Galaxy Medical brings healthcare
            to your doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => router.push("/signup")} size="lg" className="gap-2">
              <ShoppingCart className="w-5 h-5" />
              Start Shopping
            </Button>
            <Button onClick={() => router.push("/admin-login")} variant="outline" size="lg">
              Admin Portal
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          {[
            { title: "Quality Assured", desc: "All medicines from certified manufacturers" },
            { title: "Fast Delivery", desc: "Quick and safe delivery to your doorstep" },
            { title: "AI Support", desc: "Chat with our AI for medicine information" },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

    </div>

  )
}
