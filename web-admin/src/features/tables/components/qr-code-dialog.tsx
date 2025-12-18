"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { Download, Printer, RefreshCw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Table } from "@/types"

interface QRCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table | null
  onRegenerate?: (table: Table) => Promise<void>
}

export function QRCodeDialog({ open, onOpenChange, table, onRegenerate }: QRCodeDialogProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (table?.qrToken && open) {
      const baseUrl = process.env.NEXT_PUBLIC_CUSTOMER_APP_URL || "http://localhost:3001"
      const qrUrl = `${baseUrl}/table/${table.qrToken}`
      QRCode.toDataURL(qrUrl, { width: 300, margin: 2, color: { dark: "#000000", light: "#ffffff" } })
        .then(setQrDataUrl)
        .catch(console.error)
    }
  }, [table, open])

  const handleDownload = () => {
    if (!qrDataUrl || !table) return
    const link = document.createElement("a")
    link.download = `QR-Ban-${table.tableNumber}.png`
    link.href = qrDataUrl
    link.click()
  }

  const handlePrint = () => {
    if (!qrDataUrl || !table) return
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>QR Code - Bàn ${table.tableNumber}</title>
        <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:sans-serif;}
        h1{margin-bottom:20px;}img{max-width:300px;}</style></head>
        <body><h1>Bàn ${table.tableNumber}</h1><img src="${qrDataUrl}" /><p>Quét mã QR để đặt món</p></body></html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleRegenerate = async () => {
    if (!table || !onRegenerate) return
    setLoading(true)
    try { await onRegenerate(table) } finally { setLoading(false) }
  }

  if (!table) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - Bàn {table.tableNumber}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-4">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt={`QR Code bàn ${table.tableNumber}`} className="w-64 h-64 border rounded-lg" />
          ) : (
            <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Đang tạo QR Code...</p>
            </div>
          )}
          <p className="mt-4 text-sm text-muted-foreground text-center">Khách hàng quét mã này để đặt món tại bàn</p>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {onRegenerate && (
            <Button variant="outline" onClick={handleRegenerate} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Tạo mới
            </Button>
          )}
          <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />In</Button>
          <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" />Tải xuống</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
