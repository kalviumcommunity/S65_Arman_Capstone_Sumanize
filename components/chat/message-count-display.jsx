import React from "react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function MessageCountDisplay({
  messageCount,
  limit,
  isLimitReached,
  isAuthenticated, // This prop isn't used, but keeping it in case you need it later
}) {
  // Calculate progress percentage
  const progressValue = limit === Infinity ? 0 : (messageCount / limit) * 100;

  // Calculate remaining messages
  const remainingMessages =
    limit === Infinity ? Infinity : limit - messageCount;

  // Determine tooltip text
  const getTooltipText = () => {
    if (limit === Infinity) {
      return "Unlimited messages";
    }

    if (remainingMessages <= 0) {
      return "No messages remaining";
    }

    return `${remainingMessages} message${
      remainingMessages === 1 ? "" : "s"
    } remaining`;
  };

  return (
    <div className="py-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full cursor-pointer">
              <Progress
                value={progressValue}
                className="rounded-full" // This applies to the outer track
                indicatorClassName={
                  // This now correctly applies to the inner fill-bar
                  progressValue >= 80 || isLimitReached ? "bg-red-500" : ""
                }
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipText()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
