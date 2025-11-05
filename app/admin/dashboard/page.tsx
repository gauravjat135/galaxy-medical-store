"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogOut, BarChart3, Users, Package, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [authenticated, setAuthenticated] = useState(false)
  const [stats, setStats] = useState({
    employees: 5,
    totalSales: 0,
    orders: 0,
    products: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = () => {
      const isAdmin = localStorage.getItem("admin_authenticated")
      if (!isAdmin) {
        router.push("/admin-login")
        return
      }
      setAuthenticated(true)
      loadStats()
    }
    checkAdmin()
  }, [])

  const loadStats = async () => {
    try {
      const [ordersRes, productsRes, employeesRes] = await Promise.all([
        supabase.from("orders").select("total_amount"),
        supabase.from("products").select("id"),
        supabase.from("employees").select("id"),
      ])

      const totalSales = ordersRes.data?.reduce((sum: number, order: any) => sum + order.total_amount, 0) || 0

      setStats({
        employees: employeesRes.data?.length || 0,
        totalSales: totalSales,
        orders: ordersRes.data?.length || 0,
        products: productsRes.data?.length || 0,
      })
      setLoading(false)
    } catch (error) {
      console.error("Error loading stats:", error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated")
    localStorage.removeItem("admin_email")
    router.push("/")
  }

  if (!authenticated) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">GM</span>
            </div>
            <h1 className="text-2xl font-bold">Galaxy Medical Admin</h1>
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
        <h2 className="text-3xl font-bold mb-8">Admin Dashboard</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.employees}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalSales.toFixed(0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.products}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="products">Products & Stock</TabsTrigger>
            <TabsTrigger value="sales">Sales Report</TabsTrigger>
            <TabsTrigger value="medicines">Medicine Requirements</TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <EmployeesSection />
          </TabsContent>

          <TabsContent value="products">
            <ProductsSection />
          </TabsContent>

          <TabsContent value="sales">
            <SalesSection />
          </TabsContent>

          <TabsContent value="medicines">
            <MedicineRequirementsSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function EmployeesSection() {
  const supabase = createClient()
  const [employees, setEmployees] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [position, setPosition] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      setError(null)
      const { data, error: err } = await supabase
        .from("employees")
        .select("*")
        .order("created_at", { ascending: false })
      if (err) {
        console.error("[v0] Error loading employees:", err)
        setError("Failed to load employees")
        return
      }
      setEmployees(data || [])
    } catch (e) {
      console.error("[v0] Exception loading employees:", e)
      setError("An error occurred while loading employees")
    }
  }

  const handleAddEmployee = async () => {
    if (!name.trim() || !position.trim()) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const { data, error: err } = await supabase
        .from("employees")
        .insert([{ name: name.trim(), email: email.trim() || null, position: position.trim() }])
        .select()

      if (err) {
        console.error("[v0] Error adding employee:", err)
        setError(err.message || "Failed to add employee")
        return
      }

      setSuccess("Employee added successfully!")
      setName("")
      setEmail("")
      setPosition("")
      setShowForm(false)
      loadEmployees()
      setTimeout(() => setSuccess(null), 3000)
    } catch (e) {
      console.error("[v0] Exception adding employee:", e)
      setError("An error occurred while adding employee")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEmployee = async (id: string, empName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${empName}?`)) return

    try {
      setError(null)
      const { error: err } = await supabase.from("employees").delete().eq("id", id)

      if (err) {
        console.error("[v0] Error deleting employee:", err)
        setError("Failed to delete employee")
        return
      }

      setSuccess("Employee deleted successfully!")
      loadEmployees()
      setTimeout(() => setSuccess(null), 3000)
    } catch (e) {
      console.error("[v0] Exception deleting employee:", e)
      setError("An error occurred while deleting employee")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Employee Management</CardTitle>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Employee"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="p-3 bg-destructive/10 text-destructive rounded text-sm">{error}</div>}
        {success && <div className="p-3 bg-green-500/10 text-green-700 rounded text-sm">{success}</div>}

        {showForm && (
          <div className="p-4 border border-border rounded-lg space-y-3">
            <input
              type="text"
              placeholder="Name (required)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded text-sm"
              disabled={loading}
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded text-sm"
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Position (required)"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded text-sm"
              disabled={loading}
            />
            <Button onClick={handleAddEmployee} className="w-full" size="sm" disabled={loading}>
              {loading ? "Adding..." : "Add Employee"}
            </Button>
          </div>
        )}
        <div className="space-y-2">
          {employees.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No employees found</p>
          ) : (
            employees.map((emp) => (
              <div key={emp.id} className="flex items-center justify-between p-3 border border-border rounded">
                <div>
                  <p className="font-semibold">{emp.name}</p>
                  <p className="text-sm text-muted-foreground">{emp.position}</p>
                  {emp.email && <p className="text-xs text-muted-foreground">{emp.email}</p>}
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteEmployee(emp.id, emp.name)}>
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ProductsSection() {
  const supabase = createClient()
  const [products, setProducts] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [category, setCategory] = useState("medicine")
  const [description, setDescription] = useState("")
  const [dosage, setDosage] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setError(null)
      const { data, error: err } = await supabase.from("products").select("*").order("created_at", { ascending: false })
      if (err) {
        console.error("[v0] Error loading products:", err)
        setError("Failed to load products")
        return
      }
      setProducts(data || [])
    } catch (e) {
      console.error("[v0] Exception loading products:", e)
      setError("An error occurred while loading products")
    }
  }

  const handleAddProduct = async () => {
    if (!name.trim() || !price || !stock) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const { data, error: err } = await supabase
        .from("products")
        .insert([
          {
            name: name.trim(),
            description: description.trim(),
            price: Number.parseFloat(price),
            stock_quantity: Number.parseInt(stock),
            category,
            dosage: dosage.trim() || null,
            manufacturer: manufacturer.trim() || null,
          },
        ])
        .select()

      if (err) {
        console.error("[v0] Error adding product:", err)
        setError(err.message || "Failed to add product")
        return
      }

      setSuccess("Product added successfully!")
      setName("")
      setPrice("")
      setStock("")
      setDescription("")
      setDosage("")
      setManufacturer("")
      setCategory("medicine")
      setShowForm(false)
      loadProducts()
      setTimeout(() => setSuccess(null), 3000)
    } catch (e) {
      console.error("[v0] Exception adding product:", e)
      setError("An error occurred while adding product")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${prodName}?`)) return

    try {
      setError(null)
      const { error: err } = await supabase.from("products").delete().eq("id", id)

      if (err) {
        console.error("[v0] Error deleting product:", err)
        setError("Failed to delete product")
        return
      }

      setSuccess("Product deleted successfully!")
      loadProducts()
      setTimeout(() => setSuccess(null), 3000)
    } catch (e) {
      console.error("[v0] Exception deleting product:", e)
      setError("An error occurred while deleting product")
    }
  }

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      const { error: err } = await supabase.from("products").update({ stock_quantity: newStock }).eq("id", id)

      if (err) {
        console.error("[v0] Error updating stock:", err)
        setError("Failed to update stock")
        return
      }

      loadProducts()
    } catch (e) {
      console.error("[v0] Exception updating stock:", e)
      setError("An error occurred while updating stock")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Products & Stock Management</CardTitle>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Product"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="p-3 bg-destructive/10 text-destructive rounded text-sm">{error}</div>}
        {success && <div className="p-3 bg-green-500/10 text-green-700 rounded text-sm">{success}</div>}

        {showForm && (
          <div className="p-4 border border-border rounded-lg space-y-3">
            <input
              type="text"
              placeholder="Product Name (required)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded text-sm"
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded text-sm"
              disabled={loading}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="Price (required)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded text-sm"
                disabled={loading}
              />
              <input
                type="number"
                placeholder="Stock Quantity (required)"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded text-sm"
                disabled={loading}
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded text-sm"
              disabled={loading}
            >
              <option value="medicine">Medicine</option>
              <option value="essentials">Essentials</option>
            </select>
            <input
              type="text"
              placeholder="Dosage (for medicines)"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded text-sm"
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Manufacturer"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded text-sm"
              disabled={loading}
            />
            <Button onClick={handleAddProduct} className="w-full" size="sm" disabled={loading}>
              {loading ? "Adding..." : "Add Product"}
            </Button>
          </div>
        )}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No products found</p>
          ) : (
            products.map((prod) => (
              <div key={prod.id} className="flex items-center justify-between p-3 border border-border rounded">
                <div className="flex-1">
                  <p className="font-semibold">{prod.name}</p>
                  <p className="text-sm text-muted-foreground">₹{prod.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground capitalize">{prod.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <label className="text-xs text-muted-foreground">Stock</label>
                    <input
                      type="number"
                      value={prod.stock_quantity}
                      onChange={(e) => handleUpdateStock(prod.id, Number.parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-border rounded text-center text-sm"
                    />
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(prod.id, prod.name)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function SalesSection() {
  const supabase = createClient()
  const [orders, setOrders] = useState<any[]>([])
  const [totalSales, setTotalSales] = useState(0)

  useEffect(() => {
    loadSalesData()
  }, [])

  const loadSalesData = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false })
    setOrders(data || [])
    const total = data?.reduce((sum: number, order: any) => sum + order.total_amount, 0) || 0
    setTotalSales(total)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted rounded">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
          <div className="p-3 bg-muted rounded">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">₹{totalSales.toFixed(0)}</p>
          </div>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 border border-border rounded">
              <div>
                <p className="font-semibold text-sm">Order: {order.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{order.total_amount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MedicineRequirementsSection() {
  const supabase = createClient()
  const [requirements, setRequirements] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState("")
  const [requiredStock, setRequiredStock] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [reqRes, prodRes] = await Promise.all([
      supabase.from("medicine_requirements").select("*"),
      supabase.from("products").select("*"),
    ])
    setRequirements(reqRes.data || [])
    setProducts(prodRes.data || [])
  }

  const handleAddRequirement = async () => {
    if (!selectedProduct || !requiredStock) return
    const product = products.find((p) => p.id === selectedProduct)
    await supabase.from("medicine_requirements").insert([
      {
        product_id: selectedProduct,
        required_stock: Number.parseInt(requiredStock),
        current_stock: product.stock_quantity,
        status: "pending",
      },
    ])
    setSelectedProduct("")
    setRequiredStock("")
    setShowForm(false)
    loadData()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Medicine Requirements</CardTitle>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Requirement"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="p-4 border border-border rounded-lg space-y-3">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded text-sm"
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Required Stock"
              value={requiredStock}
              onChange={(e) => setRequiredStock(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded text-sm"
            />
            <Button onClick={handleAddRequirement} className="w-full" size="sm">
              Add Requirement
            </Button>
          </div>
        )}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {requirements.map((req) => {
            const product = products.find((p) => p.id === req.product_id)
            return (
              <div key={req.id} className="p-3 border border-border rounded">
                <p className="font-semibold text-sm">{product?.name}</p>
                <div className="text-xs text-muted-foreground mt-1">
                  <p>
                    Required: {req.required_stock} | Current: {req.current_stock}
                  </p>
                  <p>
                    Status: <span className="capitalize">{req.status}</span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
