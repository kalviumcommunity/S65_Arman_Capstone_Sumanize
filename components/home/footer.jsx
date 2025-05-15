"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="text-md text-neutral-400 text-center mt-16 mb-16">
      <p>
        &copy; 2025 Sumanize. Designed and developed by{" "}
        <a
          href="https://github.com/vereoman"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-neutral-200"
        >
          @vereoman
        </a>
        .
      </p>
    </footer>
  );
}
