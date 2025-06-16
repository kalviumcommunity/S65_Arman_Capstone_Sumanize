"use client";

import { useState } from "react";
import Script from "next/script";
import { SealCheck, XCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { PaymentModal } from "@/components/premium/payment-modal";
import { ActionButtons } from "@/components/command/action-buttons";

const plans = [
  {
    id: "free",
    price: 0,
    free: true,
    features: [
      { text: "20 messages every 12 hours", included: true },
      { text: "Sidebar always visible", included: true },
      { text: "Delete chats one at a time", included: true },
      { text: "Advanced document summarization", included: false },
      { text: "Custom avatars", included: false },
      { text: "Keyboard shortcuts", included: false },
      { text: "Permanently delete account", included: false },
    ],
  },
  {
    id: "premium",
    price: 1,
    features: [
      { text: "100 messages every 12 hours", included: true },
      { text: "Collapsible sidebar", included: true },
      { text: "Delete entire chat history", included: true },
      { text: "Advanced document summarization", included: true },
      { text: "Custom avatars", included: true },
      { text: "Keyboard shortcuts", included: true },
      { text: "Permanently delete account", included: true },
    ],
  },
];

export default function PremiumPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handlePremiumClick = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <>
      <Script id="razorpay-js" src="https://js.razorpay.com/v1/razorpay.js" />
      <ActionButtons />
      <div
        className="w-screen h-screen flex items-center justify-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="flex flex-col md:flex-row gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative min-w-[320px] min-h-[440px] max-h-[590px] flex flex-col rounded-2xl border-2 ${
                plan.free
                  ? "bg-comet-850 border-comet-750"
                  : "bg-comet-900 border-comet-850"
              }`}
            >
              <CardHeader>
                <div className="mb-2 text-center">
                  <div className="mb-2">
                    <span className="block text-2xl font-serif text-comet-200">
                      {plan.free ? "Current Plan" : "Premium Plan"}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-serif text-comet-200">
                      ₹{plan.price}
                    </span>
                    <span className="text-base font-serif text-comet-500">
                      / month
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <ul className="flex-1 space-y-3 ml-2 mb-6 mt-2 text-comet-200">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <SealCheck size={16} weight="fill" />
                      ) : (
                        <XCircle size={16} weight="bold" />
                      )}
                      <span
                        className={
                          feature.included
                            ? "text-comet-200"
                            : "text-comet-400 line-through"
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => {
                    if (!plan.free) {
                      handlePremiumClick(plan);
                    }
                  }}
                  className={`w-full py-2 rounded-lg transition-colors duration-300 mt-auto cursor-pointer ${
                    plan.free
                      ? "bg-comet-300 text-comet-900 hover:bg-comet-200"
                      : "bg-comet-700 text-comet-200 hover:bg-comet-600"
                  }`}
                >
                  {plan.free ? "Continue Free" : "Go Premium"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        plan={selectedPlan}
      />
    </>
  );
}
