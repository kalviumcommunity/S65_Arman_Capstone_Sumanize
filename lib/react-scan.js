"use client";

import { scan } from "react-scan";
import React, { useEffect } from "react";

export function ReactScan() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      scan({ enabled: false });
    }
  }, []);

  return <></>;
}
