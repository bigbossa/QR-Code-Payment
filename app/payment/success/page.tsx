"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Home } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccess() {
  const searchParams = useSearchParams()
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null)

  useEffect(() => {
    const pi = searchParams.get("payment_intent")
    if (pi) {
      setPaymentIntent(pi)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">Your payment has been processed successfully. Thank you for your purchase!</p>

          {paymentIntent && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">
                <strong>Payment ID:</strong> {paymentIntent}
              </p>
            </div>
          )}

          <Link href="/">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
