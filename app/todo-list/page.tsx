"use client";
import {
  useState,
  useEffect,
  useRef,
  useReducer,
  useMemo,
  useCallback,
  memo,
} from "react";
import ShikiHighlighter from "react-shiki";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

type TodoAction =
  | { type: "added"; payload: { title: string } }
  | { type: "completed"; payload: { id: string } }
  | { type: "edited"; payload: { id: string; title: string } }
  | { type: "deleted"; payload: { id: string } };

function todoReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case "added":
      return [
        {
          id: crypto.randomUUID(),
          title: action.payload.title,
          completed: false,
          createdAt: Date.now(),
        },
        ...state,
      ];
    case "completed":
      return state.map(todo =>
        todo.id === action.payload.id
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    case "edited":
      return state.map(todo =>
        todo.id === action.payload.id
          ? { ...todo, title: action.payload.title }
          : todo
      );
    case "deleted":
      return state.filter(todo => todo.id !== action.payload.id);
    default:
      throw new Error("Unknown action");
  }
}

const initialTodos: Todo[] = [];

function initTodos(): Todo[] {
  if (typeof window === "undefined") return initialTodos;
  const saved = localStorage.getItem("todos");
  return saved ? JSON.parse(saved) : initialTodos;
}

function useTodoLocalStorage() {
  const [todos, dispatch] = useReducer(todoReducer, initialTodos, initTodos);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  return { todos, dispatch };
}

type Tab = "all" | "active" | "completed";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
}

const TodoItem = memo(function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== todo.title) onEdit(todo.id, trimmed);
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  return (
    <li className="group flex items-center gap-3 border-b border-neutral-200 py-2 last:border-none">
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={e => e.key === "Enter" && handleBlur()}
          className="flex-1 rounded-md border border-neutral-300 bg-transparent px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 "
        />
      ) : (
        <span
          onClick={() => onToggle(todo.id)}
          onDoubleClick={() => setIsEditing(true)}
          className={`flex-1 cursor-pointer select-none text-sm transition ${
            todo.completed
              ? "text-neutral-400 line-through"
              : "text-neutral-800 hover:text-blue-600 "
          }`}
        >
          {todo.title}
        </span>
      )}

      {!isEditing && (
        <button
          onClick={() => onDelete(todo.id)}
          className="invisible rounded-md px-2 py-1 text-xs font-medium text-red-500 transition hover:bg-red-500/10 group-hover:visible"
        >
          Delete
        </button>
      )}
    </li>
  );
});

export default function TodoApp() {
  const { todos, dispatch } = useTodoLocalStorage();
  const [inputValue, setInputValue] = useState("");
  const [currentTab, setCurrentTab] = useState<Tab>("all");
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        // fetch works in the browser only
        const response = await fetch("/TodoList.tsx");
        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
        const code = await response.text();
        setHtml(code);
      } catch (err) {
        console.error("Failed to fetch or highlight code:", err);
      }
    };

    load();
  }, []);

  const currentTodos = useMemo(() => {
    const filtered = todos.filter(todo =>
      currentTab === "active"
        ? !todo.completed
        : currentTab === "completed"
        ? todo.completed
        : true
    );
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }, [todos, currentTab]);

  const addTodo = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    dispatch({ type: "added", payload: { title: trimmed } });
    setInputValue("");
    inputRef.current?.focus();
  }, [inputValue, dispatch]);

  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;

  return (
    <>
      <div className="mx-auto mt-12 mb-20 max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-lg font-semibold text-neutral-800 ">
          Todo List
        </h1>

        <div className="mb-5 flex gap-2">
          <input
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTodo()}
            placeholder="Add a new task"
            className="flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            onClick={addTodo}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 active:scale-[0.98]"
          >
            Add
          </button>
        </div>

        <div className="mb-4 flex gap-1 rounded-lg bg-neutral-100 p-1 ">
          {(["all", "active", "completed"] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition ${
                currentTab === tab
                  ? "bg-white text-blue-600 shadow-sm "
                  : "text-neutral-500 hover:text-neutral-800 "
              }`}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <ul>
          {currentTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={id => dispatch({ type: "completed", payload: { id } })}
              onDelete={id => dispatch({ type: "deleted", payload: { id } })}
              onEdit={(id, title) =>
                dispatch({ type: "edited", payload: { id, title } })
              }
            />
          ))}
        </ul>
      </div>
      {html && (
        <ShikiHighlighter language="tsx" theme="github-dark">
          {html}
        </ShikiHighlighter>
      )}
    </>
  );
}
