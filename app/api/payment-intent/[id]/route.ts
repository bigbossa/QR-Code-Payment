import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(
  "sk_test_51Radr3Q4IHNq78YcPy1jsqpMsYEIwzh83br4bIlQSYdycXDOa09U9xGhQs9SBNupwi6dfl4tmnpHnqW6VS7y2Wvi00AUMrLX1p",
  {
    apiVersion: "2024-12-18.acacia",
  },
)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(params.id)

    return NextResponse.json({
      success: true,
      paymentIntent: {
        amount: paymentIntent.amount,
        description: paymentIntent.description,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
      },
    })
  } catch (error) {
    console.error("Error retrieving payment intent:", error)
    return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 })
  }
}
