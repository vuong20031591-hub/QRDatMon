"use client"

import dynamic from "next/dynamic"

// Dynamic import to avoid hydration mismatch with Radix UI components
const OrdersPageContent = dynamic(
  () => import("@/features/orders/components/orders-page-content"),
  { ssr: false, loading: () => <OrdersPageSkeleton /> }
)

function OrdersPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded mt-2" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-muted rounded" />
          <div className="h-9 w-28 bg-muted rounded" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="h-16 bg-muted rounded-lg" />
      <div className="h-96 bg-muted rounded-lg" />
    </div>
  )
}

export default function OrdersPage() {
  return <OrdersPageContent />
}
