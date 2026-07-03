"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Topbar } from "@/components/Topbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiCall } from "@/lib/api/client"
import {
  Warehouse,
  Truck,
  User,
  Eye,
  RefreshCw,
  Package,
  AlertTriangle,
} from "lucide-react"

type Van = {
  id: string
  plateNumber: string
  model: string | null
  isActive: boolean
  driver: { id: string; name: string; email: string } | null
}

export default function WarehouseIndexPage() {
  const router = useRouter()
  const [vans, setVans] = useState<Van[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("active")

  const filteredVans = vans.filter((van) => {
    if (statusFilter === "active") return van.isActive
    if (statusFilter === "inactive") return !van.isActive
    return true
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiCall<{ success: boolean; data: Van[] }>("/api/v1/admin/vans")
      setVans(res.data ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load vans")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Van Warehouse"
        actions={
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Header banner */}
        <div className="rounded-xl p-5 border border-blue-200 bg-linear-to-r from-indigo-50 to-blue-100">
          <div className="flex items-center gap-4">
            <div
              className="h-14 w-14 rounded-xl flex items-center justify-center shadow"
              style={{ background: "linear-gradient(to bottom right,#1B60E8,#1450C9)" }}
            >
              <Warehouse className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Van Warehouse</h1>
              <p className="text-sm text-slate-500">
                Select a van to view its stock, sales and remaining inventory for any date.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Tabs Filter */}
        <div className="flex justify-between items-center">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="active">Active Warehouses</TabsTrigger>
              <TabsTrigger value="inactive">Archived / Inactive</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* Vans grid */}
        {!loading && filteredVans.length === 0 && (
          <div className="text-center text-muted-foreground py-16">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No vans found.</p>
          </div>
        )}

        {!loading && filteredVans.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVans.map((van) => (
              <Card
                key={van.id}
                className="hover:shadow-md transition-shadow border-slate-200"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                        <Truck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-base">{van.plateNumber}</p>
                        <p className="text-xs text-slate-500">{van.model ?? "—"}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        van.isActive
                          ? "border-green-300 text-green-700 bg-green-50"
                          : "border-slate-300 text-slate-500 bg-slate-50"
                      }
                    >
                      {van.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                    <User className="h-4 w-4 text-slate-400" />
                    {van.driver ? (
                      <span>{van.driver.name}</span>
                    ) : (
                      <span className="text-slate-400 italic">No driver assigned</span>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    style={{ background: "linear-gradient(to right,#1B60E8,#1450C9)" }}
                    onClick={() =>
                      router.push(`/dashboard/vans/${van.id}/warehouse?date=${today}`)
                    }
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Warehouse
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
