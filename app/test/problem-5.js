import { memo, useCallback, useState } from "react";

const Child = memo(function Child({ onClick }) {
  console.log("Child render");
  return <button onClick={onClick}>Click</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState("dark");

  const handleClick = useCallback(() => {
    setCount(count + 1);
  }, [count, theme]);

  return (
    <div>
      <Child onClick={handleClick} />
      <p>Count: {count}</p>

      <button onClick={() => setTheme("light")}>Change theme</button>
    </div>
  );
}

export default Parent;
