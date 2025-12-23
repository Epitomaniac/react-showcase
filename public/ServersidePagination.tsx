import { useState, useEffect, useRef, memo } from "react";

interface Item {
  id: string;
  name: string;
}

const DATA: Item[] = [
  { id: "i-01", name: "Michael Anderson" },
  { id: "i-02", name: "Sophia Ramirez" },
  { id: "i-03", name: "Daniel Thompson" },
  { id: "i-04", name: "Olivia Chen" },
  { id: "i-05", name: "Robert Williams" },
  { id: "i-06", name: "Isabella Martinez" },
  { id: "i-07", name: "James O’Connor" },
  { id: "i-08", name: "Emily Johnson" },
  { id: "i-09", name: "Carlos Mendoza" },
  { id: "i-10", name: "Hannah Brooks" },
  { id: "i-11", name: "David Kim" },
  { id: "i-12", name: "Natalie Foster" },
  { id: "i-13", name: "Anthony Russo" },
  { id: "i-14", name: "Aisha Patel" },
  { id: "i-15", name: "Benjamin Clarke" },
];

const PAGE_SIZE = 5;

function searchApi(
  query: string,
  page: number
): Promise<{ items: Item[]; totalPages: number }> {
  return new Promise((resolve, reject) => {
    const delay = 400 + Math.random() * 1200;
    const shouldFail = Math.random() < 0.2;

    setTimeout(() => {
      if (shouldFail) reject();

      const filtered = DATA.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );

      const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      const start = (page - 1) * PAGE_SIZE;

      resolve({
        items: filtered.slice(start, start + PAGE_SIZE),
        totalPages,
      });
    }, delay);
  });
}

const Row = memo(function Row({ item }: { item: Item }) {
  return (
    <div className="flex justify-between border-b px-3 py-2">
      <span className="text-gray-500">{item.id}</span>
      <span>{item.name}</span>
    </div>
  );
});

export default function App() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<Item[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const requestIdRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(input.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(t);
  }, [input]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    setStatus("loading");

    searchApi(query, page)
      .then(res => {
        if (requestId !== requestIdRef.current) return;
        setItems(res.items);
        setTotalPages(res.totalPages);
        setStatus("idle");
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setStatus("error");
      });
  }, [query, page]);

  return (
    <div className="mx-auto mt-20 max-w-md rounded-lg border bg-white shadow">
      <div className="border-b p-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Search users..."
          className="w-full rounded border px-3 py-2"
        />
      </div>

      {status === "error" && (
        <div className="p-4 text-sm text-red-600">
          Request failed. Try again.
        </div>
      )}

      <div className={status === "loading" ? "opacity-50" : ""}>
        {items.map(item => (
          <Row key={item.id} item={item} />
        ))}
      </div>

      {status === "loading" && (
        <div className="p-4 text-sm text-gray-500">Updating results…</div>
      )}

      <div className="flex items-center justify-between border-t p-3">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          className="rounded border px-3 py-1 disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-sm">
          {page} / {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
          className="rounded border px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
