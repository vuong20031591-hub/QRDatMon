"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { Socket } from "socket.io-client"
import { getSocket, disconnectSocket, SOCKET_EVENTS } from "@/lib/socket/socket-client"

interface UseSocketOptions {
  autoConnect?: boolean
  rooms?: ("staff" | "kitchen" | "admin")[]
}

export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true, rooms = ["staff"] } = options
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!autoConnect) return

    const socket = getSocket()
    socketRef.current = socket

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    // Check initial connection state
    if (socket.connected) {
      handleConnect()
    }

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)

    // Join rooms
    rooms.forEach(room => {
      switch (room) {
        case "staff":
          socket.emit(SOCKET_EVENTS.JOIN_STAFF)
          break
        case "kitchen":
          socket.emit(SOCKET_EVENTS.JOIN_KITCHEN)
          break
        case "admin":
          socket.emit(SOCKET_EVENTS.JOIN_ADMIN)
          break
      }
    })

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
    }
  }, [autoConnect, rooms])

  const on = useCallback(<T>(event: string, callback: (data: T) => void) => {
    const socket = socketRef.current || getSocket()
    socket.on(event, callback)
    return () => {
      socket.off(event, callback)
    }
  }, [])

  const off = useCallback((event: string, callback?: (...args: unknown[]) => void) => {
    const socket = socketRef.current || getSocket()
    if (callback) {
      socket.off(event, callback)
    } else {
      socket.off(event)
    }
  }, [])

  const emit = useCallback((event: string, data?: unknown) => {
    const socket = socketRef.current || getSocket()
    socket.emit(event, data)
  }, [])

  const disconnect = useCallback(() => {
    disconnectSocket()
    socketRef.current = null
    setIsConnected(false)
  }, [])

  const getSocketInstance = useCallback(() => socketRef.current, [])

  return {
    getSocket: getSocketInstance,
    on,
    off,
    emit,
    disconnect,
    isConnected,
  }
}
