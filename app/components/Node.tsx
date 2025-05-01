import { useState, useEffect, useRef } from "react";

export type NodeState = "RELEASED" | "WANTED" | "HELD";
export type Message = {
  from: number;
  to: number;
  type: "REQUEST" | "REPLY";
  timestamp: number;
};

interface NodeProps {
  id: number;
  totalNodes: number;
  onSendMessage: (message: Message) => void;
  messages: Message[];
  simulationRunning: boolean;
}

export const Node: React.FC<NodeProps> = ({ id, totalNodes, onSendMessage, messages, simulationRunning }) => {
  const [state, setState] = useState<NodeState>("RELEASED");
  const [queue, setQueue] = useState<number[]>([]);
  const [repliesReceived, setRepliesReceived] = useState<number[]>([]);
  const [timestamp, setTimestamp] = useState<number>(0);
  const [replyCount, setReplyCount] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const queueRef = useRef<number[]>([]);
  const processedCountRef = useRef<number>(0);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {}, [repliesReceived]);

  useEffect(() => {
    if (!simulationRunning) return;

    // Filter and sort messages for this node chronologically
    const allForThisNode = messages.filter((m) => m.to === id).sort((a, b) => a.timestamp - b.timestamp);
    const newMessages = allForThisNode.slice(processedCountRef.current);
    newMessages.forEach((message) => {
      if (message.type === "REQUEST") {
        // Implement the algorithm for receiving a request
        // if (state = HELD or (state = WANTED and (T < Tj or (T = Tj and i < j))))
        if (
          state === "HELD" ||
          (state === "WANTED" &&
            (timestamp < message.timestamp || (timestamp === message.timestamp && id < message.from)))
        ) {
          // Queue request without replying
          setQueue((prevQueue) => [...prevQueue, message.from]);
        } else {
          // Reply immediately
          onSendMessage({
            from: id,
            to: message.from,
            type: "REPLY",
            timestamp: Date.now(),
          });
        }
      } else if (message.type === "REPLY") {
        // Increment reply count for our request
        if (state === "WANTED") {
          setReplyCount((prev) => prev + 1);
          setRepliesReceived((prev) => (prev.includes(message.from) ? prev : [...prev, message.from]));
        }
      }
    });
    // Update processed count
    processedCountRef.current = allForThisNode.length;
  }, [messages, id, state, timestamp, onSendMessage, simulationRunning]);

  // Clean up timers when component unmounts or simulation stops
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Reset state when simulation stops
  useEffect(() => {
    if (!simulationRunning) {
      // Reset processed count when simulation stops
      processedCountRef.current = 0;
      setState("RELEASED");
      setQueue([]);
      setReplyCount(0);
      setRemainingTime(0);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [simulationRunning]);

  // Check if we can enter critical section
  useEffect(() => {
    if (!simulationRunning) return;

    // wait until (number of replies received = (N – 1))
    if (state === "WANTED" && replyCount === totalNodes - 1) {
      // state := HELD
      setState("HELD");
      setReplyCount(0);

      // Clear any existing timers
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Use time in critical section for visualization
      const timeInCriticalSection = Math.floor(Math.random() * 4000) + 4000;
      setRemainingTime(Math.ceil(timeInCriticalSection / 1000));

      // Set up interval to update remaining time
      intervalRef.current = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      // Set up timer to exit critical section
      timerRef.current = setTimeout(() => {
        // To exit the critical section
        // state := RELEASED
        setRepliesReceived([]);
        setRemainingTime(0);
        setState("RELEASED");

        // reply to all queued requests using the ref to get the latest queue
        queueRef.current.forEach((requestId) => {
          onSendMessage({
            from: id,
            to: requestId,
            type: "REPLY",
            timestamp: Date.now(),
          });
        });

        // Clear the queue after sending all replies
        setQueue([]);

        // Clear interval if it's still running
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }, timeInCriticalSection);
    }
  }, [state, replyCount, totalNodes, onSendMessage, id, simulationRunning]);

  const handleRequest = () => {
    if (state !== "RELEASED" || !simulationRunning) return;
    // state := WANTED
    setState("WANTED");
    const newTimestamp = Date.now();
    setTimestamp(newTimestamp);
    // send request to all other nodes
    for (let i = 0; i < totalNodes; i++) {
      if (i !== id) {
        onSendMessage({ from: id, to: i, type: "REQUEST", timestamp: newTimestamp });
      }
    }
  };

  const getStateColor = () => {
    switch (state) {
      case "RELEASED":
        return "bg-gray-200 dark:bg-gray-700";
      case "WANTED":
        return "bg-yellow-200 dark:bg-yellow-700";
      case "HELD":
        return "bg-green-200 dark:bg-green-700";
      default:
        return "bg-gray-200 dark:bg-gray-700";
    }
  };

  return (
    <div className={`border rounded-lg p-4 shadow-md transition-colors ${getStateColor()}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold">Node {id + 1}</h3>
        <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm">
          {state === "HELD" && `Exit in: ${remainingTime}s`}
        </span>
      </div>

      <div className="text-sm mb-2 justify-between flex items-center">
        <div>
          State: <span className="font-semibold">{state}</span>
        </div>
        <button
          onClick={handleRequest}
          disabled={!simulationRunning || state !== "RELEASED"}
          className="ml-2 px-2 py-1 bg-blue-500 text-white rounded disabled:bg-gray-400 text-sm"
        >
          Request Critical Section
        </button>
      </div>

      <div className="mt-3">
        <h4 className="text-sm font-medium mb-1">Queue:</h4>
        <div className="bg-white dark:bg-gray-800 rounded p-2 h-20 overflow-y-auto text-xs">
          {queue.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">Empty</p>
          ) : (
            queue.map((nodeId, idx) => (
              <div key={idx} className="mb-1">
                Request from Node {nodeId + 1}
              </div>
            ))
          )}
        </div>
        <h4 className="text-sm font-medium mb-1 mt-3">
          Replies Received {repliesReceived.length}/{totalNodes - 1}:
        </h4>
        <div className="bg-white dark:bg-gray-800 rounded p-2 h-20 overflow-y-auto text-xs">
          {repliesReceived.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">No replies yet</p>
          ) : (
            repliesReceived.map((nodeId, idx) => (
              <div key={idx} className="mb-1">
                Reply from Node {nodeId + 1}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
