"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StarFour, Check } from "@phosphor-icons/react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PremiumModal() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userSubscription, setUserSubscription] = useState(null);

  useEffect(() => {
    if (user) {
      getUserSubscription();
    }
  }, []);

  const getUserSubscription = async () => {
    try {
      const res = await fetch("/api/premium/subscription-status");
      const data = await res.json();
      if (data.success) {
        setUserSubscription(data.subscription);
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error);
    }
  };

  const handleStartSubscription = async () => {
    if (!user) {
      document.dispatchEvent(
        new CustomEvent("open-auth-modal", {
          detail: { tab: "register" },
        }),
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/premium/create-subscription", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        initializeRazorpay(data);
      } else {
        toast.error(data.error || "Failed to create subscription");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to connect to payment service");
    } finally {
      setLoading(false);
    }
  };

  const initializeRazorpay = (data) => {
    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      toast.error("Payment service not loaded. Please refresh the page.");
      return;
    }

    const options = {
      key: data.keyId,
      subscription_id: data.subscriptionId,
      name: "Sumanize",
      description: "Premium Plan Subscription",
      handler: function (response) {
        verifyPayment(response);
      },
      prefill: {
        email: user.email,
      },
      theme: {
        color: "#171717",
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
        },
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay initialization error:", error);
      toast.error("Failed to initialize payment form");
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/premium/verify-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Your premium subscription is now active");
        await getUserSubscription();
      } else {
        toast.error(data.error || "Payment verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Failed to verify payment");
    } finally {
      setLoading(false);
    }
  };

  const FeatureItem = ({ text }) => (
    <div className="flex items-center space-x-2 mb-3">
      <Check size={20} className="text-green-400" />
      <span className="text-neutral-300">{text}</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center p-8 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-serif text-neutral-200 mb-3 flex items-center justify-center gap-2">
          <StarFour size={32} className="text-yellow-500" />
          Sumanize Premium
        </h1>
        <p className="text-neutral-400 max-w-lg mx-auto">
          Upgrade to Premium for faster, more powerful summaries and enhanced
          features.
        </p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 w-full max-w-md">
        {userSubscription?.active ? (
          <div className="text-center">
            <div className="bg-green-900/20 rounded-full py-2 px-4 inline-flex items-center mb-4">
              <Check size={18} className="text-green-400 mr-2" />
              <span className="text-green-400 font-medium">
                Active Subscription
              </span>
            </div>
            <h3 className="text-xl text-neutral-200 mb-2">You're on Premium</h3>
            <p className="text-neutral-400 mb-4">
              Your subscription will renew on{" "}
              {new Date(userSubscription.currentPeriodEnd).toLocaleDateString()}
            </p>
            <Button
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
              onClick={() => router.push("/")}
            >
              Return to Dashboard
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl text-neutral-200">Premium Plan</h3>
                <p className="text-neutral-400">Monthly subscription</p>
              </div>
              <div className="text-right">
                <div className="text-2xl text-neutral-200">$20</div>
                <p className="text-neutral-400 text-sm">per month</p>
              </div>
            </div>

            <div className="border-t border-neutral-800 my-4 pt-4">
              <FeatureItem text="Faster AI-powered summaries" />
              <FeatureItem text="Unlimited document processing" />
              <FeatureItem text="Priority support" />
              <FeatureItem text="Advanced customization options" />
            </div>

            <Button
              onClick={handleStartSubscription}
              disabled={loading}
              className="w-full mt-4 bg-neutral-300 hover:bg-neutral-400 text-neutral-950 font-medium py-2"
            >
              {loading ? "Processing..." : "Upgrade to Premium"}
            </Button>
          </>
        )}
      </div>

      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
    </div>
  );
}
