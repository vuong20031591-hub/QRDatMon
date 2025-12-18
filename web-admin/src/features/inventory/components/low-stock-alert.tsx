/**
 * Low Stock Alert Component
 * Displays prominent alerts for low stock items
 */

"use client"

import { AlertTriangle, XCircle, Package } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { InventoryItem } from "@/types/inventory"

interface LowStockAlertProps {
  items: InventoryItem[]
  onUpdateStock: (item: InventoryItem) => void
}

export function LowStockAlert({ items, onUpdateStock }: LowStockAlertProps) {
  if (items.length === 0) return null

  const outOfStock = items.filter(item => item.isOutOfStock)
  const lowStock = items.filter(item => item.isLowStock && !item.isOutOfStock)

  return (
    <div className="space-y-4">
      {outOfStock.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Hết hàng ({outOfStock.length} món)</AlertTitle>
          <AlertDescription>
            <ScrollArea className="max-h-32 mt-2">
              <div className="space-y-2">
                {outOfStock.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span className="text-sm">{item.menuItem.name}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateStock(item)}
                    >
                      Nhập kho
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </AlertDescription>
        </Alert>
      )}

      {lowStock.length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">
            Sắp hết hàng ({lowStock.length} món)
          </AlertTitle>
          <AlertDescription>
            <ScrollArea className="max-h-32 mt-2">
              <div className="space-y-2">
                {lowStock.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.menuItem.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.quantity}/{item.minThreshold} {item.unit}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateStock(item)}
                    >
                      Nhập kho
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

interface LowStockSummaryProps {
  outOfStockCount: number
  lowStockCount: number
}

export function LowStockSummary({ outOfStockCount, lowStockCount }: LowStockSummaryProps) {
  return (
    <div className="flex items-center gap-4">
      {outOfStockCount > 0 && (
        <div className="flex items-center gap-2 text-red-600">
          <XCircle className="h-4 w-4" />
          <span className="text-sm font-medium">{outOfStockCount} hết hàng</span>
        </div>
      )}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-2 text-yellow-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">{lowStockCount} sắp hết</span>
        </div>
      )}
      {outOfStockCount === 0 && lowStockCount === 0 && (
        <div className="flex items-center gap-2 text-green-600">
          <Package className="h-4 w-4" />
          <span className="text-sm font-medium">Kho hàng ổn định</span>
        </div>
      )}
    </div>
  )
}
