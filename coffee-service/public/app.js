// Config: si true, el frontend usará datos mock cuando la API no responda
const USE_MOCK_IF_OFFLINE = true;

// Datos mock iniciales (se usarán si no hay backend disponible)
let mockCoffees = [
  { id: 1, name: 'Café Colombia', origin: 'Colombia', price: 4.5 },
  { id: 2, name: 'Espresso Blend', origin: 'Brasil', price: 3.25 },
];

async function fetchCoffees() {
  try {
    const res = await fetch('/api/coffees');
    if (!res.ok) throw new Error('API responded with ' + res.status);
    return await res.json();
  } catch (err) {
    if (USE_MOCK_IF_OFFLINE) {
      console.warn('Falling back to mock data for coffees:', err.message);
      return mockCoffees;
    }
    throw err;
  }
}

function renderList(coffees) {
  const ul = document.getElementById('coffee-list');
  ul.innerHTML = '';
  coffees.forEach((c) => {
    const li = document.createElement('li');
    li.textContent = `${c.id} - ${c.name} (${c.origin || '—'}) — $${c.price}`;
    const del = document.createElement('button');
    del.textContent = 'Eliminar';
    del.onclick = async () => {
      try {
        const res = await fetch(`/api/coffees/${c.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed ' + res.status);
        load();
      } catch (err) {
        if (USE_MOCK_IF_OFFLINE) {
          // Update mock data locally
          mockCoffees = mockCoffees.filter((m) => m.id !== c.id);
          renderList(mockCoffees);
        } else {
          console.error(err);
        }
      }
    };
    li.appendChild(del);
    ul.appendChild(li);
  });
}

async function load() {
  const coffees = await fetchCoffees();
  renderList(coffees);
}

document.getElementById('coffee-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    name: form.name.value,
    origin: form.origin.value,
    price: form.price.value || 0,
  };
  try {
    const res = await fetch('/api/coffees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Create failed ' + res.status);
    form.reset();
    load();
  } catch (err) {
    if (USE_MOCK_IF_OFFLINE) {
      // Simulate server-assigned id
      const nextId = mockCoffees.length ? Math.max(...mockCoffees.map((m) => m.id)) + 1 : 1;
      const newCoffee = { id: nextId, ...data };
      mockCoffees.push(newCoffee);
      form.reset();
      renderList(mockCoffees);
    } else {
      console.error(err);
    }
  }
});

load();
