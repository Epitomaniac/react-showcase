"use client";

import { memo, useCallback, useState } from "react";

// issue:
// - handleClick has nothing to do with theme, so including theme inside the useCallback's
//   dependency array makes no sense and changing theme will cause unnecessary rerenders of the Child component
// - handleClick has stale closure problems with the count variable, to fix this the original code
//   has included count in the dependency array, but this defeats the purpose of useCallback as each
//   click will cause the Child component to rerender. The correct solution is to remove count from dependencies and use the
//   functional updater for setting count so it access to the most recent count value before each update.

const Child = memo(function Child({ onClick }) {
  console.log("Child render");
  return <button onClick={onClick}>Click</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState("dark");

  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return (
    <div>
      <Child onClick={handleClick} />
      <p>Theme: {theme}</p>
      <p>Count: {count}</p>

      <button onClick={() => setTheme("light")}>Change theme</button>
    </div>
  );
}

export default Parent;
