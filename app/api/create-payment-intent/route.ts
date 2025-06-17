import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(
  "sk_test_51Radr3Q4IHNq78YcPy1jsqpMsYEIwzh83br4bIlQSYdycXDOa09U9xGhQs9SBNupwi6dfl4tmnpHnqW6VS7y2Wvi00AUMrLX1p",
  {
    apiVersion: "2024-12-18.acacia",
  },
)

export async function POST(request: NextRequest) {
  try {
    const { amount, description } = await request.json()

    if (!amount || amount < 50) {
      return NextResponse.json({ success: false, error: "Amount must be at least $0.50" }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      description,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ success: false, error: "Failed to create payment intent" }, { status: 500 })
  }
}
