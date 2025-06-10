import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const MESSAGE_LIMITS = {
  GUEST_LIMIT: 4,
  AUTH_LIMIT: 50,
  PREMIUM: Infinity,
};

export function useMessageLimit() {
  const { data: session, status } = useSession();
  const [messageCount, setMessageCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      setMessageCount(session.user.usage?.messagesToday || 0);
    } else if (status === "unauthenticated") {
      loadGuestUsageFromLocalStorage();
    }
  }, [status, session]);

  useEffect(() => {
    const limit = getMessageLimit();
    const currentCount = messageCount || 0;
    setIsLimitReached(currentCount >= limit);
  }, [messageCount, session, status]);

  const getMessageLimit = () => {
    if (status === "authenticated") {
      return (
        session.user.rateLimits?.messagesPerDay || MESSAGE_LIMITS.AUTH_LIMIT
      );
    }
    return MESSAGE_LIMITS.GUEST_LIMIT;
  };

  const loadGuestUsageFromLocalStorage = () => {
    try {
      const storedUsage = localStorage.getItem("guest_usage");
      if (storedUsage) {
        const usage = JSON.parse(storedUsage);
        if (Date.now() > usage.expiry) {
          localStorage.removeItem("guest_usage");
          setMessageCount(0);
        } else {
          setMessageCount(usage.count);
        }
      } else {
        setMessageCount(0);
      }
    } catch (error) {
      console.error("Error loading guest usage:", error);
      setMessageCount(0);
    }
  };

  const updateGuestUsage = () => {
    try {
      let usage = { count: 0, expiry: 0 };
      const storedUsage = localStorage.getItem("guest_usage");

      if (storedUsage) {
        const parsedUsage = JSON.parse(storedUsage);
        if (Date.now() < parsedUsage.expiry) {
          usage = parsedUsage;
        }
      }

      if (usage.count === 0) {
        usage.expiry = Date.now() + 24 * 60 * 60 * 1000;
      }

      const newCount = usage.count + 1;
      usage.count = newCount;

      localStorage.setItem("guest_usage", JSON.stringify(usage));
      setMessageCount(newCount);
    } catch (error) {
      console.error("Error updating guest usage:", error);
    }
  };

  const incrementMessageCount = () => {
    if (session) {
      setMessageCount((prev) => prev + 1);
    } else {
      updateGuestUsage();
    }
  };

  const limit = getMessageLimit();
  const isAuthenticated = !!session;

  return {
    messageCount,
    limit,
    isLimitReached,
    isAuthenticated,
    incrementMessageCount,
  };
} 