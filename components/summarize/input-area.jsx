"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Clipboard, File, YoutubeLogo } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CommandPalette from "./cmdk";

export default function ExpandableInput({ onSubmit, isLoading }) {
  const [inputValue, setInputValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);

  const handleFileUploadButton = () => {
    alert("File upload functionality not implemented yet.");
  };

  const handleYoutubeURLButton = () => {
    alert("YouTube URL functionality not implemented yet.");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSubmit(inputValue);
      setInputValue("");
      setIsExpanded(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (e) => {
      if (
        textareaRef.current &&
        !textareaRef.current.contains(e.target) &&
        !e.target.closest(".input-container")
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  return (
    <div className="absolute bottom-8 right-8 z-10 flex flex-col items-end gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={toggleExpanded}
            className="h-12 w-12 rounded-lg bg-neutral-800/50 text-blue-400 cursor-pointer hover:bg-neutral-800/50"
          >
            <Clipboard weight="duotone" size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-neutral-950 mr-2">
          Summarize Text
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleFileUploadButton}
            className="h-12 w-12 rounded-lg bg-neutral-800/50 text-teal-400 cursor-pointer hover:bg-neutral-800/50"
          >
            <File weight="duotone" size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-neutral-950 mr-2">
          Summarize Document
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleYoutubeURLButton}
            className="h-12 w-12 rounded-lg bg-neutral-800/50 text-red-400 cursor-pointer hover:bg-neutral-800/50"
          >
            <YoutubeLogo weight="duotone" size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-neutral-950 mr-2">
          Summarize Videos
        </TooltipContent>
      </Tooltip>

      {isExpanded && (
        <div className="input-container bg-neutral-950 border-none rounded-md p-4 w-100 h-80 flex flex-col absolute right-0 bottom-0 z-20">
          <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="flex-grow resize-none rounded-md p-4 text-md text-neutral-300 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-neutral-400 placeholder:text-neutral-400 overflow-y-auto"
              style={{ minHeight: "150px" }}
            />

            <div className="flex justify-end mt-3">
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="px-4 py-2 bg-neutral-300 text-neutral-950 disabled:bg-neutral-700 disabled:text-neutral-300 flex items-center gap-2 text-sm"
              >
                {isLoading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-t-transparent border-neutral-950 animate-spin" />
                ) : (
                  <ArrowUp weight="bold" className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
