import React, { useState, useEffect } from "react";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (searchTerm.trim() === "") {
      fetchUsers();
    } else {
      fetchSearchResults(searchTerm);
    }
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();

      if (res.ok) {
        setUsers(data);
      } else {
        console.error("Error fetching users:", data.error);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchResults = async (query) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?name=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (res.ok) {
        setUsers(data);
      } else {
        console.error("Error searching users:", data.error);
        setUsers([]);
      }
    } catch (err) {
      console.error("Search fetch error:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (user) => {
    setEditingId(user.id);
    setEditingName(user.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleUpdate = async (id) => {
    if (!editingName.trim()) {
      alert("Name cannot be empty");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editingName }),
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message || "User updated");
        cancelEditing();
        if (searchTerm.trim() === "") {
          fetchUsers();
        } else {
          fetchSearchResults(searchTerm);
        }
      } else {
        alert(result.error || "Failed to update user");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message || "User deleted");
        if (editingId === id) cancelEditing();
        if (searchTerm.trim() === "") {
          fetchUsers();
        } else {
          fetchSearchResults(searchTerm);
        }
      } else {
        alert(result.error || "Failed to delete user");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="app user-list" style={{ textAlign: "left", maxWidth: "600px" }}>
      <h2 style={{ color: "inherit" }}>User List</h2>

      <input
        type="text"
        placeholder="Search users by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="url-input"
        style={{ marginBottom: "1rem" }}
      />

      {loading && <p>Loading...</p>}

      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {users.length === 0 && !loading && <li>No users found.</li>}

        {users.map((user) => (
          <li
            key={user.id}
            style={{
              marginBottom: "1rem",
              background: "#1a1a1a",
              border: "2px solid #fbf0df",
              borderRadius: "12px",
              padding: "0.75rem",
            }}
          >
            {editingId === user.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="url-input"
                  style={{ marginBottom: "0.5rem" }}
                />
                <button
                  onClick={() => handleUpdate(user.id)}
                  className="send-button"
                  style={{ marginRight: "0.5rem" }}
                >
                  Update
                </button>
                <button onClick={cancelEditing} className="send-button" style={{ background: "#fb6f6f" }}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span>{user.name}</span>{" "}
                <button
                  onClick={() => startEditing(user)}
                  className="send-button"
                  style={{ marginLeft: "1rem", marginRight: "0.5rem" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="send-button"
                  style={{ background: "#fb6f6f", color: "white" }}
                >
                  Delete
                </button>
              </>
            )}
            <div style={{ fontSize: "0.8em", color: "#888", marginTop: "0.5rem" }}>
              Created at: {new Date(user.created_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
