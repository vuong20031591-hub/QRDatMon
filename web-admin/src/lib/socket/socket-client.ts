/**
 * Socket.io Client Configuration
 * Handles real-time communication for orders, tables, and notifications
 */

import { io, Socket } from "socket.io-client"

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000"

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id)
    })

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
    })

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message)
    })
  }

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Socket event types
export interface OrderCreatedEvent {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  table: string
  items: Array<{
    id: string
    itemName: string
    quantity: number
    status: string
  }>
  createdAt: string
}

export interface OrderStatusUpdatedEvent {
  orderId: string
  status: string
  updatedAt: string
}

export interface OrderItemStatusUpdatedEvent {
  orderId: string
  itemId: string
  status: string
  itemName: string
  tableId?: string
}

export interface OrderReadyEvent {
  orderId: string
  orderNumber: string
  tableNumber?: string
}

export interface OrderCancelledEvent {
  orderId: string
  reason: string
  cancelledBy?: string
  tableId?: string
}

// Socket event names
export const SOCKET_EVENTS = {
  // Order events
  ORDER_CREATED: "order:created",
  ORDER_STATUS_UPDATED: "order:statusUpdated",
  ORDER_ITEM_STATUS_UPDATED: "order:itemStatusUpdated",
  ORDER_READY: "order:ready",
  ORDER_CANCELLED: "order:cancelled",
  
  // Table events
  TABLE_STATUS_UPDATED: "table:statusUpdated",
  TABLE_STATUS_CHANGED: "table:status-changed",
  TABLE_USER_JOINED: "table:user-joined",
  TABLE_USER_LEFT: "table:user-left",
  
  // Room events
  JOIN_STAFF: "join:staff",
  JOIN_KITCHEN: "join:kitchen",
  JOIN_ADMIN: "join:admin",
} as const
