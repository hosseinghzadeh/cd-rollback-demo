const list = document.getElementById("list");
const form = document.getElementById("add-form");
const input = document.getElementById("add-input");

async function refresh() {
  const res = await fetch("/todos");
  const todos = await res.json();
  list.innerHTML = "";
  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.textContent = todo.text;
    li.className = todo.done ? "done" : "";
    li.addEventListener("click", async () => {
      await fetch(`/todos/${todo.id}/toggle`, { method: "POST" });
      refresh();
    });
    list.appendChild(li);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  await fetch("/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: input.value }),
  });
  input.value = "";
  refresh();
});

refresh();
