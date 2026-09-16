const path = require("path");
const express = require("express");
const { addTodo, toggleTodo } = require("./todo");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let todos = [];

app.get("/health", (req, res) => {
  if (!process.env.APP_NAME_V2) {
    return res.status(500).json({ status: "error", message: "APP_NAME_V2 not configured" });
  }
  res.status(200).json({ status: "ok", app: process.env.APP_NAME_V2 });
});

app.get("/todos", (req, res) => {
  res.status(200).json(todos);
});

app.post("/todos", (req, res) => {
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
  console.log(`The ${process.env.APP_NAME} is listening on port ${PORT}`);
});
