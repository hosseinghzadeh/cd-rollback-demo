const test = require("node:test");
const assert = require("node:assert");
const { addTodo, toggleTodo } = require("../app/todo");

test("addTodo adds an item to the list", () => {
  const list = addTodo([], "buy milk");
  assert.strictEqual(list.length, 1);
  assert.strictEqual(list[0].text, "buy milk");
  assert.strictEqual(list[0].done, false);
});

test("toggleTodo flips the done flag", () => {
  const list = addTodo([], "buy milk");
  const id = list[0].id;
  const toggled = toggleTodo(list, id);
  assert.strictEqual(toggled[0].done, true);
});
