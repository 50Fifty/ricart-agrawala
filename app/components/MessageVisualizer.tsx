import React from "react";
import { Message } from "./Node";

interface MessageVisualizerProps {
  messages: Message[];
  nodeCount: number;
}

export const MessageVisualizer: React.FC<MessageVisualizerProps> = ({ messages, nodeCount }) => {
  return (
    <div className="border rounded-lg p-4 shadow-md bg-white dark:bg-gray-800 mt-6">
      <h3 className="text-lg font-bold mb-3">Message Log</h3>
      <div className="h-40 overflow-y-auto text-sm">
        {messages.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">No messages exchanged yet</p>
        ) : (
          <ul className="space-y-2">
            {messages.map((message, index) => (
              <li
                key={index}
                className={`flex items-center p-2 rounded ${
                  message.type === "REQUEST" ? "bg-blue-100 dark:bg-blue-900/30" : "bg-green-100 dark:bg-green-900/30"
                }`}
              >
                <div className="flex-1">
                  <span className="font-medium">
                    {messages.length - index}. Node {message.from + 1}{" "}
                    {message.type === "REQUEST" ? "requested" : "replied to"} Node {message.to + 1}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Timestamp: {message.timestamp}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
