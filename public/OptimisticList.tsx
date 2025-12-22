import { useState, useRef, useEffect, memo } from "react";

type Item = {
  id: string;
  title: string;
  completed: boolean;
};

type Status = "idle" | "pending" | "error";

function fakeApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    const delay = 500 + Math.random() * 1000;
    const fail = Math.random() < 0.25;

    setTimeout(() => {
      fail ? reject() : resolve();
    }, delay);
  });
}

function useOptimisticItem(initial: Item) {
  const [item, setItem] = useState(initial);
  const [status, setStatus] = useState<Status>("idle");
  const [undoVisible, setUndoVisible] = useState(false);
  const requestIdRef = useRef(0);
  const undoTimerRef = useRef<number | null>(null);

  const toggle = () => {
    const next = { ...item, completed: !item.completed };
    setItem(next);
    setStatus("pending");
    setUndoVisible(true);

    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    undoTimerRef.current = window.setTimeout(() => {
      fakeApi()
        .then(() => {
          if (requestId === requestIdRef.current) {
            setStatus("idle");
            setUndoVisible(false);
          }
        })
        .catch(() => {
          if (requestId === requestIdRef.current) {
            setItem(item);
            setStatus("error");
            setUndoVisible(false);
          }
        });
    }, 3000);
  };

  const undo = () => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }

    requestIdRef.current += 1;
    setItem(prev => ({ ...prev, completed: !prev.completed }));
    setUndoVisible(false);
    setStatus("idle");
  };

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  return { item, status, undoVisible, toggle, undo };
}

const Row = memo(function Row({ data }: { data: Item }) {
  const { item, status, undoVisible, toggle, undo } = useOptimisticItem(data);

  return (
    <div
      className={`flex items-center justify-between rounded-md border p-4 transition ${
        status === "pending" ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={item.completed}
          onChange={toggle}
          disabled={status === "pending"}
          className="h-4 w-4"
        />
        <span
          className={`font-medium ${
            item.completed ? "line-through text-gray-400" : ""
          }`}
        >
          {item.title}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {undoVisible && (
          <button
            onClick={undo}
            className="rounded bg-amber-100 px-3 py-1 text-sm font-medium"
          >
            Undo
          </button>
        )}
        {status === "error" && (
          <span className="text-sm text-red-500">Failed to save</span>
        )}
      </div>
    </div>
  );
});

export default function OptimisticList() {
  const items: Item[] = [
    { id: "1", title: "Write proposal", completed: false },
    { id: "2", title: "Review PRs", completed: true },
    { id: "3", title: "Prepare interview", completed: false },
    { id: "4", title: "Refactor legacy code", completed: true },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-4 p-10">
      <h1 className="text-2xl font-semibold">Optimistic Task List</h1>
      <div className="space-y-3">
        {items.map(item => (
          <Row key={item.id} data={item} />
        ))}
      </div>
    </div>
  );
}
