"use client";

import { useEffect, useState } from "react";

// issues:
// - the component does not update itself if useId changes
// - the useEffect does not guard against stale data
// - the component does not handle errors
// - the component does not handle a null user

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    setUser(null);
    setLoading(true);
    setError(false);

    fetch(`/api/users/${userId}`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then(data => {
        setUser(data);
      })
      .catch(e => {
        if (e.name !== "AbortError") setError(true);
      })
      .finally(() => setLoading(false));

    return () => {
      controller.abort();
    };
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error occurred.</p>;
  if (!user) return null;

  return <div>{user.name}</div>;
}

export default UserProfile;
