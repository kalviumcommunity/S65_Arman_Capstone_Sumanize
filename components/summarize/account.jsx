"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { StarFour, PencilSimple, SignOut } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AccountMenu({ user }) {
  const { logout } = useAuth();

  const getInitials = (email) => {
    if (!email) return "U";
    return email.substring(0, 1).toUpperCase();
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return "Recently joined";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="rounded-full overflow-hidden w-10 h-10 border-2 border-neutral-700 transition-colors flex items-center justify-center cursor-pointer">
          <Avatar>
            <AvatarFallback className="bg-neutral-900 text-neutral-300 flex items-center justify-center w-full h-full">
              {getInitials(user.email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="bottom"
        align="end"
        sideOffset={16}
        className="w-70 bg-neutral-950 border-none text-neutral-300 p-6"
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg text-neutral-200 mb-1">{user.email}</h4>
            <p className="text-sm text-neutral-400">
              Joined {formatJoinDate(user.createdAt)}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-neutral-800">
          <div className="flex flex-row gap-2 w-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  className="flex-1 w-full text-neutral-900 bg-neutral-300 hover:bg-neutral-400 justify-center cursor-pointer transition-colors duration-300 ease-in-out"
                  onClick={() => alert("Go Premium")}
                >
                  <StarFour size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-neutral-900 text-neutral-300 mt-2"
              >
                Go Premium
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  className="flex-1 w-full text-neutral-900 bg-neutral-300 hover:bg-neutral-400 justify-center cursor-pointer transition-colors duration-300 ease-in-out"
                  onClick={() => alert("Change Email")}
                >
                  <PencilSimple size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-neutral-900 text-neutral-300 mt-2"
              >
                Change Email
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  className="flex-1 w-full text-neutral-900 bg-neutral-300 hover:bg-neutral-400 justify-center cursor-pointer transition-colors duration-300 ease-in-out"
                  onClick={logout}
                >
                  <SignOut size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-neutral-900 text-neutral-300 mt-2"
              >
                Get outside
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
