const path = require("path");
const express = require("express");
const { addTodo, toggleTodo } = require("./todo");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let todos = [];

app.get("/health", (req, res) => {
  if (!process.env.APP_NAME) {
    return res
      .status(500)
      .json({ status: "error", message: "APP_NAME not configured" });
  }
  res.status(200).json({ status: "ok", app: process.env.APP_NAME });
});

app.get("/todos", (req, res) => {
  res.status(200).json(todos);
});

app.post("/todos", (req, res) => {
  // Stand-in for a real DB connection check: in production this would be
  // "can we reach the database with this connection config", not just APP_NAME.
  if (!process.env.APP_NAME) {
    return res.status(500).json({ error: "Storage is unavailable: APP_NAME is not configured" });
  }
  const { text } = req.body;
  todos = addTodo(todos, text);
  res.status(201).json(todos);
});

app.post("/todos/:id/toggle", (req, res) => {
  const id = Number(req.params.id);
  todos = toggleTodo(todos, id);
  res.status(200).json(todos);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`${process.env.APP_NAME} is listening on port ${PORT}`);
});
