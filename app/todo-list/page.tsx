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

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(todo.title);
  };

  const handleBlur = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== todo.title) onEdit(todo.id, trimmed);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleBlur();
    else if (e.key === "Escape") setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  return (
    <li
      className="flex items-center justify-between p-2 border-b"
      key={todo.id}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="border px-1 rounded flex-1 mr-2"
        />
      ) : (
        <span
          onClick={() => onToggle(todo.id)}
          onDoubleClick={handleDoubleClick}
          className={`flex-1 cursor-pointer select-none ${
            todo.completed ? "line-through text-gray-400" : ""
          }`}
        >
          {todo.title}
        </span>
      )}
      {!isEditing && (
        <button
          onClick={() => onDelete(todo.id)}
          className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-sm"
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

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addTodo();
  };

  const toggleTodo = useCallback(
    (id: string) => dispatch({ type: "completed", payload: { id } }),
    [dispatch]
  );
  const deleteTodo = useCallback(
    (id: string) => dispatch({ type: "deleted", payload: { id } }),
    [dispatch]
  );
  const editTodo = useCallback(
    (id: string, title: string) =>
      dispatch({ type: "edited", payload: { id, title } }),
    [dispatch]
  );

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  return (
    <div className="p-8 max-w-md mx-auto">
      <div className="flex mb-4">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          className="flex-1 border px-2 py-1 rounded mr-2"
          placeholder="Add a new task"
        />
        <button
          onClick={addTodo}
          className="px-4 py-1 bg-green-500 text-white rounded"
        >
          Add
        </button>
      </div>

      <div className="flex mb-4 space-x-2">
        {(["all", "active", "completed"] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab)}
            className={`px-3 py-1 rounded ${
              currentTab === tab ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <ul>
        {currentTodos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
          />
        ))}
      </ul>
    </div>
  );
}
