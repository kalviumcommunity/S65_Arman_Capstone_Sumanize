"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Keyboard } from "@phosphor-icons/react";

export function KeyboardShortcuts() {
  const shortcuts = [
    { key: "Ctrl + K", description: "Search" },
    { key: "Ctrl + Shift + O", description: "New Chat" },
    { key: "Ctrl + B", description: "Toggle Sidebar" },
  ];

  return (
    <Card className="bg-gradient-to-br from-comet-900/60 to-comet-800/40 border-comet-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Keyboard size={24} className="text-comet-400" />
          <span>Keyboard Shortcuts</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-3 px-4 rounded-lg bg-comet-800/20 hover:bg-comet-800/40 transition-colors"
            >
              <span className="text-sm font-medium text-comet-300">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.key.split(" + ").map((keyPart, keyIndex) => (
                  <span key={keyIndex} className="flex items-center gap-1">
                    {keyIndex > 0 && (
                      <span className="text-comet-500 text-xs">+</span>
                    )}
                    <kbd className="px-3 py-1.5 text-xs bg-comet-700 text-comet-100 rounded-md border border-comet-600 shadow-sm font-mono">
                      {keyPart}
                    </kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-comet-800/20 rounded-lg border border-comet-700/50">
          <p className="text-xs text-comet-400 text-center">
            💡 These shortcuts work across the entire application
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
