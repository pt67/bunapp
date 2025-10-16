import { serve } from "bun";
import index from "./index.html";
import { Database } from "bun:sqlite";

// Initialize SQLite database (persistent file)
const db = new Database("./mydb.sqlite");

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log("✅ Table created successfully.");

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    // Create user
    "/api/create": {
      async POST(req) {
        try {
          const body = await req.json();
          const { name } = body;

          if (!name) {
            return Response.json({ error: "Name is required" }, { status: 400 });
          }

          const stmt = db.prepare("INSERT INTO users (name) VALUES (?)");
          const result = stmt.run(name);

          return Response.json({
            message: "User created",
            id: result.lastInsertRowid,
          }, { status: 201 });

        } catch (err) {
          console.error("Error in /api/create:", err);
          return Response.json({ error: "Invalid JSON or internal error" }, { status: 500 });
        }
      },
    },

    // Get all users + update users
    "/api/users": {
      async GET() {
        try {
          const stmt = db.prepare("SELECT * FROM users");
          const users = stmt.all();

          return Response.json(users, { status: 200 });
        } catch (err) {
          console.error("Failed to fetch users:", err);
          return Response.json({ error: "Could not fetch users" }, { status: 500 });
        }
      },

      async PUT(req) {
        try {
          const body = await req.json();
          const { id, name } = body;

          if (!id || !name) {
            return Response.json({ error: "Both 'id' and 'name' are required." }, { status: 400 });
          }

          const stmt = db.prepare("UPDATE users SET name = ? WHERE id = ?");
          const result = stmt.run(name, id);

          if (result.changes === 0) {
            return Response.json({ error: "User not found or no changes made." }, { status: 404 });
          }

          return Response.json({
            message: `User with ID ${id} updated successfully.`,
            updated: result.changes,
          });
        } catch (err) {
          console.error("Error in PUT /api/users:", err);
          return Response.json({ error: "Internal server error." }, { status: 500 });
        }
      }
    },

    // Delete user by ID
    "/api/users/:id": {
      async DELETE(req) {
        try {
          const id = Number(req.params.id);

          if (!id || isNaN(id)) {
            return Response.json({ error: "Valid 'id' parameter is required." }, { status: 400 });
          }

          const stmt = db.prepare("DELETE FROM users WHERE id = ?");
          const result = stmt.run(id);

          if (result.changes === 0) {
            return Response.json({ error: `No user found with id ${id}.` }, { status: 404 });
          }

          return Response.json({
            message: `User with id ${id} deleted successfully.`,
            deleted: result.changes,
          });
        } catch (err) {
          console.error("Error in DELETE /api/users/:id", err);
          return Response.json({ error: "Internal server error." }, { status: 500 });
        }
      },

      async GET(req) {
        const id = req.params.id;
        return Response.json({
          message: `Hello, user with id ${id}!`,
        });
      }
    },

    // Search users by name
    "/api/search": {
      async GET(req) {
        try {
          const url = new URL(req.url);
          const nameQuery = url.searchParams.get("name");

          if (!nameQuery) {
            return Response.json({ error: "Name query parameter is required." }, { status: 400 });
          }

          const stmt = db.prepare("SELECT * FROM users WHERE name LIKE ?");
          const users = stmt.all(`%${nameQuery}%`);

          return Response.json(users, { status: 200 });
        } catch (err) {
          console.error("Error in /api/search:", err);
          return Response.json({ error: "Internal server error." }, { status: 500 });
        }
      }
    },
  },

  // Put development config at the root, not inside routes
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
