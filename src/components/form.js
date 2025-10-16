import React, { useState } from "react";

export default function TaskForm() {
  const [task, setTask] = useState("");
  const [message, setMessage] = useState("");

  const clickHandler = async (e) => {
    e.preventDefault();

    if (!task.trim()) {
      setMessage("Task cannot be empty.");
      return;
    }

    try {
      const res = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: task }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Task added with ID: ${data.id}`);
        setTask("");
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("❌ Failed to send request.");
      console.error(err);
    }
  };

  return (
    <div className="app taskmaker" style={{ maxWidth: "600px", textAlign: "center" }}>
      <h1 style={{ marginBottom: "1rem" }}>Submit the tasks</h1>
      {message && (
        <small
          style={{
            display: "block",
            marginBottom: "1rem",
            color: message.startsWith("✅") ? "#a6e22e" : "#ff5555",
            fontWeight: "600",
          }}
        >
          {message}
        </small>
      )}
      <form onSubmit={clickHandler} style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
        <input
          type="text"
          name="taskname"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="url-input"
          placeholder="Enter your task..."
          style={{ flex: 1 }}
        />
        <button type="submit" className="send-button" style={{ flexShrink: 0 }}>
          Submit
        </button>
      </form>
    </div>
  );
}
