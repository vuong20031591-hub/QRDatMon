"use client"

import { useEffect, useCallback } from "react"
import { useSocket } from "@/hooks/use-socket"
import { SOCKET_EVENTS, type OrderCreatedEvent, type OrderStatusUpdatedEvent, type OrderCancelledEvent } from "@/lib/socket/socket-client"
import { toast } from "sonner"

interface UseRealtimeOrdersOptions {
  onOrderCreated?: (order: OrderCreatedEvent) => void
  onOrderStatusUpdated?: (data: OrderStatusUpdatedEvent) => void
  onOrderCancelled?: (data: OrderCancelledEvent) => void
  showNotifications?: boolean
}

export function useRealtimeOrders(options: UseRealtimeOrdersOptions = {}) {
  const { 
    onOrderCreated, 
    onOrderStatusUpdated, 
    onOrderCancelled,
    showNotifications = true 
  } = options
  
  const { on } = useSocket({ rooms: ["staff"] })

  const handleOrderCreated = useCallback((order: OrderCreatedEvent) => {
    if (showNotifications) {
      toast.info(`Đơn hàng mới: ${order.orderNumber}`, {
        description: `Bàn ${order.table || "N/A"} - ${order.items.length} món`,
        duration: 5000,
      })
      
      // Play notification sound
      playNotificationSound()
    }
    
    onOrderCreated?.(order)
  }, [onOrderCreated, showNotifications])

  const handleOrderStatusUpdated = useCallback((data: OrderStatusUpdatedEvent) => {
    if (showNotifications) {
      const statusLabels: Record<string, string> = {
        confirmed: "đã xác nhận",
        preparing: "đang chuẩn bị",
        ready: "sẵn sàng phục vụ",
        served: "đã phục vụ",
        cancelled: "đã hủy",
      }
      
      toast.info(`Đơn hàng ${statusLabels[data.status] || data.status}`)
    }
    
    onOrderStatusUpdated?.(data)
  }, [onOrderStatusUpdated, showNotifications])

  const handleOrderCancelled = useCallback((data: OrderCancelledEvent) => {
    if (showNotifications) {
      toast.warning(`Đơn hàng đã bị hủy`, {
        description: data.reason,
      })
    }
    
    onOrderCancelled?.(data)
  }, [onOrderCancelled, showNotifications])

  useEffect(() => {
    const unsubscribeCreated = on<OrderCreatedEvent>(SOCKET_EVENTS.ORDER_CREATED, handleOrderCreated)
    const unsubscribeStatusUpdated = on<OrderStatusUpdatedEvent>(SOCKET_EVENTS.ORDER_STATUS_UPDATED, handleOrderStatusUpdated)
    const unsubscribeCancelled = on<OrderCancelledEvent>(SOCKET_EVENTS.ORDER_CANCELLED, handleOrderCancelled)

    return () => {
      unsubscribeCreated()
      unsubscribeStatusUpdated()
      unsubscribeCancelled()
    }
  }, [on, handleOrderCreated, handleOrderStatusUpdated, handleOrderCancelled])

  return {
    // Expose methods if needed
  }
}

// Helper function to play notification sound
function playNotificationSound() {
  if (typeof window !== "undefined" && "Audio" in window) {
    try {
      const audio = new Audio("/sounds/notification.mp3")
      audio.volume = 0.5
      audio.play().catch(() => {
        // Ignore autoplay errors
      })
    } catch {
      // Ignore audio errors
    }
  }
}
