import React, { useState, useEffect } from "react";
import { Node, Message } from "./Node";
import { MessageVisualizer } from "./MessageVisualizer";

export const Simulation: React.FC = () => {
  const [nodeCount, setNodeCount] = useState<number>(3);
  const [messages, setMessages] = useState<Message[]>([]);
  const [running, setRunning] = useState<boolean>(false);

  const handleSendMessage = (message: Message) => {
    setMessages((prevMessages) => [message, ...prevMessages]);
  };

  useEffect(() => {
    setMessages([]);
  }, [nodeCount, running]);

  // Clear messages when count grows too large
  useEffect(() => {
    if (messages.length >= 500) {
      setMessages([]);
    }
  }, [messages]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Ricart-Agrawala Algorithm Simulation</h1>
        <p className="text-center max-w-3xl mb-6">
          This is a simulation of the Ricart-Agrawala algorithm for distributed mutual exclusion. Each node can manually
          request access to the critical section. The algorithm ensures that only one node can be in the critical
          section at a time.
        </p>

        <div className="flex flex-wrap gap-4 mb-6 items-center justify-center">
          <div className="flex items-center">
            <label className="mr-3 text-sm font-medium">Nodes:</label>
            <select
              className="bg-white dark:bg-gray-800 border rounded-md p-2"
              value={nodeCount}
              onChange={(e) => setNodeCount(parseInt(e.target.value))}
              disabled={running}
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
            </select>
          </div>

          <button
            onClick={() => setRunning(!running)}
            className={`px-4 py-2 rounded-md transition-colors ${
              running ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {running ? "Stop" : "Start"} Simulation
          </button>
        </div>

        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg mb-6 w-full max-w-2xl">
          <h3 className="font-semibold mb-2">Legend:</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mr-2"></div>
              <span>RELEASED</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-700 rounded mr-2"></div>
              <span>WANTED</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-200 dark:bg-green-700 rounded mr-2"></div>
              <span>HELD</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: nodeCount }).map((_, index) => (
          <Node
            key={index}
            id={index}
            totalNodes={nodeCount}
            onSendMessage={handleSendMessage}
            messages={messages.filter((m) => m.to === index)}
            simulationRunning={running}
          />
        ))}
      </div>

      <MessageVisualizer messages={messages} />
    </div>
  );
};
