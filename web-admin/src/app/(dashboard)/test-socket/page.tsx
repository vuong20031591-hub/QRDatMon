"use client"

import { useEffect, useState } from "react"
import { useSocket } from "@/hooks/use-socket"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TestSocketPage() {
  const { on, isConnected, emit } = useSocket({ rooms: ["staff"] })
  const [events, setEvents] = useState<Array<{ time: string; type: string; data: any }>>([])

  useEffect(() => {
    if (!isConnected) {
      console.log("[TEST] Socket not connected")
      return
    }

    console.log("[TEST] Socket connected, setting up listeners")

    // Listen for ALL events
    const unsubscribe1 = on("table:status-changed", (data: any) => {
      console.log("[TEST] Received table:status-changed:", data)
      setEvents(prev => [...prev, { 
        time: new Date().toLocaleTimeString(), 
        type: "table:status-changed", 
        data 
      }])
    })

    const unsubscribe2 = on("table:user-joined", (data: any) => {
      console.log("[TEST] Received table:user-joined:", data)
      setEvents(prev => [...prev, { 
        time: new Date().toLocaleTimeString(), 
        type: "table:user-joined", 
        data 
      }])
    })

    const unsubscribe3 = on("table:user-left", (data: any) => {
      console.log("[TEST] Received table:user-left:", data)
      setEvents(prev => [...prev, { 
        time: new Date().toLocaleTimeString(), 
        type: "table:user-left", 
        data 
      }])
    })

    return () => {
      unsubscribe1()
      unsubscribe2()
      unsubscribe3()
    }
  }, [isConnected, on])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Socket Test</h1>
        <Badge variant={isConnected ? "default" : "destructive"}>
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Socket Events ({events.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-muted-foreground">No events received yet. Try joining a table from the customer app.</p>
          ) : (
            <div className="space-y-2">
              {events.slice().reverse().map((event, index) => (
                <div key={index} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge>{event.type}</Badge>
                    <span className="text-sm text-muted-foreground">{event.time}</span>
                  </div>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>1. Keep this page open</p>
          <p>2. Open the customer app on your phone</p>
          <p>3. Scan a QR code and join a table</p>
          <p>4. Watch for events appearing above</p>
          <p className="text-sm text-muted-foreground mt-4">
            Check browser console for detailed logs
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
