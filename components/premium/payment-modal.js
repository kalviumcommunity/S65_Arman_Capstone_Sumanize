"use client";

import { useState } from "react";
import { Dialog, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, CursorClick, Minus } from "@phosphor-icons/react";

export function PaymentModal({ isOpen, setIsOpen, plan }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePayment = async () => {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Please refresh the page.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order
      const orderResponse = await fetch("/api/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: plan.price,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const { order, user } = await orderResponse.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Sumanize Premium",
        description: `Premium Plan - ₹${plan.price}/month`,
        order_id: order.id,

        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: "",
        },

        notes: {
          planId: plan.id,
          planType: "premium",
          userId: user?.id || "",
        },

        handler: async function (response) {
          try {
            const verificationResponse = await fetch("/api/razorpay", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verificationResult = await verificationResponse.json();

            if (verificationResponse.ok) {
              alert("Payment successful! Premium subscription activated.");
              setIsOpen(false);
              window.location.reload();
            } else {
              alert("Payment verification failed: " + verificationResult.error);
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            alert("Payment verification failed. Please contact support.");
          } finally {
            setIsSubmitting(false);
          }
        },

        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },

        theme: {
          color: "#6366f1",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogPortal>
        <DialogPrimitive.Content
          className="bg-comet-900 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 w-full max-w-5xl translate-x-[-50%] translate-y-[-50%] p-0 rounded-2xl border-none shadow-lg duration-200"
          style={{ height: "500px" }}
        >
          <DialogTitle></DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 z- rounded-full text-red-400 bg-red-950 hover:bg-red-950 hover:text-red-400 cursor-pointer"
            aria-label="Close"
          >
            <Minus size={20} weight="bold" />
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            <div className="p-4 md:p-6 flex flex-col justify-center">
              <div className="space-y-3">
                <div className="text-xs text-comet-500 flex items-center justify-center gap-2 bg-comet-850 rounded-lg p-2">
                  🔒 Your card details are encrypted and processed securely by
                  Razorpay
                </div>

                <div className="bg-comet-850 border border-comet-700 rounded-lg p-3">
                  <h4 className="text-base font-medium text-comet-200 mb-3">
                    Payment Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-comet-300">
                      <span>Premium Plan (Monthly)</span>
                      <span>₹{plan.price}</span>
                    </div>
                    <div className="flex justify-between text-comet-300">
                      <span>Taxes & Fees</span>
                      <span>₹0</span>
                    </div>
                    <div className="border-t border-comet-700 pt-2">
                      <div className="flex justify-between text-base font-semibold text-comet-100">
                        <span>Total Amount</span>
                        <span>₹{plan.price}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isSubmitting}
                  className="w-full py-3 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  {isSubmitting
                    ? "Opening Payment..."
                    : `Pay ₹${plan.price} Securely`}
                </Button>
              </div>
            </div>

            <div className="hidden md:flex flex-col border-4 border-comet-900 bg-comet-800 p-2 rounded-2xl">
              <div className="flex-1 flex flex-col justify-center text-center">
                <div className="flex justify-center">
                  <CursorClick size={36} />
                </div>
                <h3 className="font-serif text-4xl text-comet-100 mb-3">
                  Sumanize
                </h3>
                <div className="text-sm text-comet-400 bg-comet-850 rounded-xl p-3 max-w-sm mx-auto">
                  Upgrade to premium for unlimited access to advanced features
                  and enhanced productivity tools.
                </div>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
