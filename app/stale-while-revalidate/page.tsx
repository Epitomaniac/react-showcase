"use client";
import { useState, useEffect, useRef } from "react";
import ShikiHighlighter from "react-shiki";

type User = {
  id: string;
  name: string;
  email: string;
  updatedAt: number;
};

const users: User[] = [
  {
    id: "01",
    name: "Stephan",
    email: "stephc93@mail.com",
    updatedAt: 1766306575718,
  },
  {
    id: "02",
    name: "Mohiko",
    email: "mohi-san@mail.com",
    updatedAt: 1766302272513,
  },
  {
    id: "03",
    name: "Boris",
    email: "bojohn87@mail.com",
    updatedAt: 1766306523590,
  },
];

async function fetchUser(userId: string): Promise<User> {
  const shouldFail = Math.random() < 0.2;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Request failed"));
        return;
      }

      const user = users.find(u => u.id === userId);
      user ? resolve(user) : reject(new Error("User not found"));
    }, Math.random() * 3000);
  });
}

type Status = "idle" | "loading" | "refreshing" | "error";

function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const requestIdRef = useRef(0);

  useEffect(() => {
    setStatus("loading");
    const cached = localStorage.getItem(userId);
    if (cached) {
      setUser(JSON.parse(cached));
      setStatus("refreshing");
    } else {
      setStatus("loading");
    }

    requestIdRef.current++;
    const requestId = requestIdRef.current;

    fetchUser(userId)
      .then(fetched => {
        if (requestId === requestIdRef.current) {
          setUser(fetched);
          setStatus("idle");
          localStorage.setItem(userId, JSON.stringify(fetched));
        }
      })
      .catch(() => {
        if (requestId === requestIdRef.current) {
          setStatus("error");
        }
      });
  }, [userId]);

  const refresh = () => {
    setStatus("refreshing");
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    fetchUser(userId)
      .then(fetched => {
        if (requestId === requestIdRef.current) {
          setUser(fetched);
          setStatus("idle");
          localStorage.setItem(userId, JSON.stringify(fetched));
        }
      })
      .catch(() => {
        if (requestId === requestIdRef.current) {
          setStatus("error");
        }
      });
  };

  return { user, status, refresh };
}

function UserCard({ userId }: { userId: string }) {
  const { user, status, refresh } = useUser(userId);

  if (status === "loading") {
    return <p className="m-4 animate-pulse">Loading user…</p>;
  }

  if (status === "error") {
    return (
      <div className="m-4 space-y-2">
        <p className="text-red-600">Failed to load user</p>
        <button onClick={refresh} className="rounded border px-3 py-1">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className={`m-4 space-y-1 transition-opacity ${
        status === "refreshing" ? "opacity-60" : "opacity-100"
      }`}
    >
      <div className="font-medium">{user?.name}</div>
      <div className="text-sm text-gray-600">{user?.email}</div>
      <div className="text-xs text-gray-500">
        {user
          ? "Last updated: " + new Date(user.updatedAt).toLocaleTimeString()
          : ""}
      </div>

      {user && (
        <button
          onClick={refresh}
          disabled={status === "refreshing"}
          className="mt-2 rounded border px-3 py-1 disabled:opacity-50"
        >
          {status === "refreshing" ? "Refreshing…" : "Refresh"}
        </button>
      )}
    </div>
  );
}

export default function Home() {
  const [activeId, setActiveId] = useState(users[0].id);
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        // fetch works in the browser only
        const response = await fetch("/StaleWhileRevalidate.tsx");
        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
        const code = await response.text();
        setHtml(code);
      } catch (err) {
        console.error("Failed to fetch or highlight code:", err);
      }
    };

    load();
  }, []);

  return (
    <>
      <div className="p-12">
        <div className="mb-6 flex gap-3">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => setActiveId(user.id)}
              className={`rounded border px-4 py-2 transition ${
                activeId === user.id ? "bg-amber-200" : ""
              }`}
            >
              {user.id}
            </button>
          ))}
        </div>
        <UserCard userId={activeId} />
      </div>

      {html && (
        <ShikiHighlighter language="tsx" theme="github-dark">
          {html}
        </ShikiHighlighter>
      )}
    </>
  );
}
