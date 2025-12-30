"use client";

import { useEffect, useState } from "react";

// issue:
// - Since the interval function is closing over a stale value of count, setCount
//   cannot increment the value properly; all it does is add 1 to 0 every second
//   to fix: we use the functional updater since it always has access to the most recent
//   value of the state

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => {
        const updatedCount = c + 1;

        console.log("count:", updatedCount);
        return updatedCount;
      });
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}

export default Counter;
