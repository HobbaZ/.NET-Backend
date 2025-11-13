import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Fetch todos
  useEffect(() => {
    fetch("/api/todos")
      .then((res) => res.json())
      .then(setTodos)
      .catch((err) => console.error("Error fetching todos:", err));
  }, []);

  // Add a new todo
  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTodo, completed: false }),
    });
    const added = await res.json();
    setTodos((prev) => [...prev, added]);
    setNewTodo("");
  };

  // Delete a todo
  const deleteTodo = async (id) => {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // Toggle completed
  const toggleComplete = async (todo) => {
    const updated = { ...todo, completed: !todo.completed };

    await fetch(`/api/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
  };

  // Start editing
  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  // Save edited todo
  const saveEdit = async (id) => {
    const updated = { ...todos.find((t) => t.id === id), title: editingTitle };

    await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));

    setEditingId(null);
    setEditingTitle("");
  };

  return (
    <div className="app">
      <div className="content">
        <h1 className="mx-auto">Todo List</h1>

        <div className="input-section">
          <input
            type="text"
            placeholder="Add new todo..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <button onClick={addTodo}>Add</button>
        </div>

        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleComplete(todo)}
              />
              {editingId === todo.id ? (
                <>
                  <input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                  />
                  <button onClick={() => saveEdit(todo.id)}>Save</button>
                </>
              ) : (
                <>
                  <span
                    style={{
                      textDecoration: todo.completed ? "line-through" : "none",
                    }}
                  >
                    {todo.title}
                  </span>
                  <button onClick={() => startEditing(todo)}>Edit</button>
                </>
              )}
              <button onClick={() => deleteTodo(todo.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
