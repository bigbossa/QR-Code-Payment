"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, CreditCard, Loader2 } from "lucide-react"
import QRCodeGenerator from "@/components/qr-code-generator"
import { useToast } from "@/hooks/use-toast"

export default function PaymentPage() {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [paymentUrl, setPaymentUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const createPaymentIntent = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(Number.parseFloat(amount) * 100), // Convert to cents
          description: description || "Payment via QR Code",
        }),
      })

      const data = await response.json()

      if (data.success) {
        const paymentUrl = `${window.location.origin}/payment/${data.paymentIntentId}`
        setPaymentUrl(paymentUrl)
        toast({
          title: "Payment Link Created",
          description: "QR Code generated successfully!",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create payment link",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setAmount("")
    setDescription("")
    setPaymentUrl("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">QR Code Payment System</h1>
          <p className="text-gray-600">Create secure payment links with QR codes using Stripe</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Create Payment
              </CardTitle>
              <CardDescription>Enter payment details to generate a QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.50"
                  placeholder="10.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Payment for services"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={createPaymentIntent} disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <QrCode className="mr-2 h-4 w-4" />
                      Generate QR Code
                    </>
                  )}
                </Button>

                {paymentUrl && (
                  <Button variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* QR Code Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Payment QR Code
              </CardTitle>
              <CardDescription>Scan to complete payment</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentUrl ? (
                <QRCodeGenerator url={paymentUrl} amount={amount} description={description} />
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <QrCode className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">QR Code will appear here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
