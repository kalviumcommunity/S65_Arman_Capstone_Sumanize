/*
 * WEBHOOK FUNCTIONALITY - COMMENTED OUT FOR DEVELOPMENT
 * Uncomment this entire file when ready to implement webhooks in production
 *
 * To enable webhooks:
 * 1. Uncomment all code in this file
 * 2. Set up webhook URL in Razorpay Dashboard: https://yourdomain.com/api/razorpay/webhook
 * 3. Add RAZORPAY_WEBHOOK_SECRET to your environment variables
 * 4. Configure webhook events: payment.captured, payment.failed, subscription.cancelled
 */

import { NextResponse } from "next/server";
// import crypto from "crypto";
// import connectDB from "@/lib/database";
// import User from "@/models/user";

export async function POST(req) {
  // WEBHOOK FUNCTIONALITY DISABLED FOR DEVELOPMENT
  return NextResponse.json(
    {
      message: "Webhook functionality is currently disabled for development",
      note: "Enable webhooks in production by uncommenting the code in this file",
    },
    { status: 200 },
  );

  /* UNCOMMENT FOR PRODUCTION WEBHOOK FUNCTIONALITY
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("Webhook signature verification failed");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    console.log("Razorpay webhook event:", event.event);

    await connectDB();

    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      
      case "payment.failed":
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      
      case "subscription.cancelled":
        await handleSubscriptionCancelled(event.payload.subscription.entity);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
  */
}

/* UNCOMMENT FOR PRODUCTION WEBHOOK FUNCTIONALITY
async function handlePaymentCaptured(payment) {
  try {
    // Extract user info from payment notes
    const userEmail = payment.notes?.userEmail;
    
    if (!userEmail) {
      console.warn("No user email found in payment notes");
      return;
    }

    // Update user subscription
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

    await User.findOneAndUpdate(
      { email: userEmail },
      {
        $set: {
          tier: "premium",
          subscriptionStatus: "active",
          subscriptionId: payment.id,
          customerId: payment.customer_id || null,
          subscriptionStart: new Date(),
          subscriptionEnd: subscriptionEnd,
        }
      },
      { upsert: true }
    );

    console.log(`Subscription activated for user: ${userEmail}`);
  } catch (error) {
    console.error("Error handling payment captured:", error);
  }
}

async function handlePaymentFailed(payment) {
  try {
    const userEmail = payment.notes?.userEmail;
    
    if (!userEmail) {
      console.warn("No user email found in payment notes");
      return;
    }

    // Log failed payment
    console.log(`Payment failed for user: ${userEmail}, Payment ID: ${payment.id}`);
    
    // You might want to send an email notification here
    
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
}

async function handleSubscriptionCancelled(subscription) {
  try {
    // Find user by subscription ID and update status
    await User.findOneAndUpdate(
      { subscriptionId: subscription.id },
      {
        $set: {
          subscriptionStatus: "cancelled",
          tier: "free", // Downgrade to free tier
        }
      }
    );

    console.log(`Subscription cancelled: ${subscription.id}`);
  } catch (error) {
    console.error("Error handling subscription cancelled:", error);
  }
}
*/
