function addTodo(list, text) {
  const item = { id: Date.now() + Math.random(), text, done: false };
  return [...list, item];
}

function toggleTodo(list, id) {
  return list.map((item) =>
    item.id === id ? { ...item, done: !item.done } : item
  );
}

module.exports = { addTodo, toggleTodo };
