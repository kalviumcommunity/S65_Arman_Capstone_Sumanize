"use client";

import { useState, useEffect } from "react";

// --- Constants for easy configuration ---
const BAR_WIDTH = 40; // The width of the moving bar in percent
const MAX_LEFT_POSITION = 100 - BAR_WIDTH; // Max left % to keep bar inside
const ANIMATION_STEP = 2; // How many % to move each frame
const FRAME_INTERVAL = 25; // Milliseconds between frames

// The visual component for the progress bar.
const PingPongProgress = ({ position, className }) => {
  return (
    <div
      className={`w-full bg-neutral-800 rounded-full h-2 relative overflow-hidden ${className}`}
    >
      <div
        className="bg-neutral-200 h-2 rounded-full absolute"
        style={{
          width: `${BAR_WIDTH}%`,
          // We use the 'left' property for positioning relative to the parent
          left: `${position}%`,
          // A subtle transition helps smooth the start/stop at the edges
          transition: "left 0.05s ease-out",
        }}
      />
    </div>
  );
};

export default function LoadingScreen() {
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left

  useEffect(() => {
    const timer = setInterval(() => {
      setPosition((prevPosition) => {
        const newPosition = prevPosition + direction * ANIMATION_STEP;

        // Bounce off the right edge
        if (newPosition >= MAX_LEFT_POSITION) {
          setDirection(-1); // Change direction to left
          return MAX_LEFT_POSITION; // Clamp to the max position
        }

        // Bounce off the left edge
        if (newPosition <= 0) {
          setDirection(1); // Change direction to right
          return 0; // Clamp to the starting position
        }

        return newPosition;
      });
    }, FRAME_INTERVAL);

    // Cleanup function to stop the interval when the component unmounts
    return () => {
      clearInterval(timer);
    };
  }, [direction]);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
      <div className="w-full max-w-xs">
        <PingPongProgress position={position} className="w-full" />
      </div>
    </div>
  );
}
