"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

const stripePromise = loadStripe(
  "pk_test_51Radr3Q4IHNq78Yci5yX9UOSG8maWXudrvnHyumpdw9mnGsDgpxqpsKDpE61NM9AfpSWbnAyKo61oEovoL3l529h00nDqmC7ej",
)

interface PaymentInfo {
  amount: number
  description: string
  clientSecret: string
  status: string
}

function PaymentForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) return

    setLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
    })

    if (error) {
      setMessage(error.message || "An unexpected error occurred.")
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </Button>

      {message && <div className="text-red-600 text-sm text-center">{message}</div>}
    </form>
  )
}

export default function PaymentPage() {
  const params = useParams()
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPaymentInfo()
  }, [params.id])

  const fetchPaymentInfo = async () => {
    try {
      const response = await fetch(`/api/payment-intent/${params.id}`)
      const data = await response.json()

      if (data.success) {
        setPaymentInfo(data.paymentIntent)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError("Failed to load payment information")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Payment Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!paymentInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Payment Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">The payment link is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentInfo.status === "succeeded") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Payment Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Your payment has been processed successfully.</p>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p>
                <strong>Amount:</strong> ${(paymentInfo.amount / 100).toFixed(2)}
              </p>
              {paymentInfo.description && (
                <p>
                  <strong>Description:</strong> {paymentInfo.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Complete Payment</CardTitle>
          <CardDescription>Secure payment powered by Stripe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p>
              <strong>Amount:</strong> ${(paymentInfo.amount / 100).toFixed(2)}
            </p>
            {paymentInfo.description && (
              <p>
                <strong>Description:</strong> {paymentInfo.description}
              </p>
            )}
          </div>

          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: paymentInfo.clientSecret,
              appearance: {
                theme: "stripe",
              },
            }}
          >
            <PaymentForm clientSecret={paymentInfo.clientSecret} />
          </Elements>
        </CardContent>
      </Card>
    </div>
  )
}
