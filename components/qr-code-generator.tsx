"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QRCodeGeneratorProps {
  url: string
  amount: string
  description: string
}

export default function QRCodeGenerator({ url, amount, description }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    generateQRCode()
  }, [url])

  const generateQRCode = async () => {
    if (!canvasRef.current) return

    try {
      // Using QR Server API to generate QR code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        canvas.width = 300
        canvas.height = 300
        ctx.drawImage(img, 0, 0, 300, 300)
      }
      img.src = qrUrl
    } catch (error) {
      console.error("Error generating QR code:", error)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "Copied!",
        description: "Payment link copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  const downloadQRCode = () => {
    if (!canvasRef.current) return

    const link = document.createElement("a")
    link.download = `payment-qr-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="border rounded-lg shadow-sm" style={{ maxWidth: "100%", height: "auto" }} />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm space-y-1">
          <p>
            <strong>Amount:</strong> ${amount}
          </p>
          {description && (
            <p>
              <strong>Description:</strong> {description}
            </p>
          )}
          <p className="text-xs text-gray-500 break-all">
            <strong>Link:</strong> {url}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={copyToClipboard} className="flex-1">
          <Copy className="mr-2 h-4 w-4" />
          Copy Link
        </Button>
        <Button variant="outline" onClick={downloadQRCode} className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download QR
        </Button>
      </div>
    </div>
  )
}
