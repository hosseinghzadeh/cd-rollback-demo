const path = require("path");
const express = require("express");
const { addTodo, toggleTodo } = require("./todo");

if (!process.env.APP_NAME) {
  throw new Error("APP_NAME environment variable is required");
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let todos = [];

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", app: process.env.APP_NAME });
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
  console.log(`${process.env.APP_NAME} listening on port ${PORT}`);
});
