import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/database";
import User from "@/models/user";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
export async function POST(req) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { amount, currency = "INR" } = await req.json();

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Connect to database
    await connectDB();

    // Check if user already has premium subscription
    const user = await User.findOne({ email: session.user.email });
    if (user?.tier === "premium" && user?.subscriptionStatus === "active") {
      return NextResponse.json(
        { error: "User already has active premium subscription" },
        { status: 400 },
      );
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`,
      notes: {
        userId: session.user.id,
        userEmail: session.user.email,
        planType: "premium",
      },
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      order,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 },
    );
  }
}

// Verify Payment
export async function PUT(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 },
      );
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== "captured") {
      return NextResponse.json(
        { error: "Payment not captured" },
        { status: 400 },
      );
    }

    // Connect to database
    await connectDB();

    // Update user subscription status
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1); // 1 month subscription

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          tier: "premium",
          subscriptionStatus: "active",
          subscriptionId: razorpay_payment_id,
          customerId: payment.customer_id || null,
          subscriptionStart: new Date(),
          subscriptionEnd: subscriptionEnd,
        },
      },
      { new: true, upsert: true },
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified and subscription activated",
      subscription: {
        status: updatedUser.subscriptionStatus,
        tier: updatedUser.tier,
        subscriptionEnd: updatedUser.subscriptionEnd,
        paymentId: razorpay_payment_id,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 },
    );
  }
}
