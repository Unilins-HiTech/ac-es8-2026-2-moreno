const STORAGE_KEY = "ac-es8-patients";

const form = document.querySelector("#patient-form");
const patientList = document.querySelector("#patient-list");
const patientCount = document.querySelector("#patient-count");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#search");
const sortNameButton = document.querySelector("#sort-name");

let patients = loadPatients();
let sortDirection = "asc";

function loadPatients() {
  try {
    const savedPatients = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(savedPatients) ? savedPatients : [];
  } catch {
    return [];
  }
}

function savePatients() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
}

function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(`${birthDate}T00:00:00`);
  let age = today.getFullYear() - birth.getFullYear();
  const birthdayHasNotPassed = today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (birthdayHasNotPassed) age -= 1;
  return age;
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
}

function renderPatients() {
  const query = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  const visiblePatients = patients
    .filter((patient) => patient.name.toLocaleLowerCase("pt-BR").includes(query))
    .sort((first, second) => {
      const comparison = first.name.localeCompare(second.name, "pt-BR", { sensitivity: "base" });
      return sortDirection === "asc" ? comparison : -comparison;
    });

  patientList.replaceChildren();
  visiblePatients.forEach((patient) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(patient.name)}</td>
      <td>${escapeHtml(patient.email)}</td>
      <td>${escapeHtml(patient.phone)}</td>
      <td>${formatDate(patient.birthDate)}</td>
      <td>${calculateAge(patient.birthDate)} anos</td>
      <td><button class="remove-button" type="button" data-id="${patient.id}">Remover</button></td>
    `;
    patientList.append(row);
  });

  patientCount.textContent = `Total de pacientes: ${patients.length}`;
  emptyState.hidden = visiblePatients.length > 0;
  sortNameButton.querySelector("span").textContent = sortDirection === "asc" ? "↑" : "↓";
}

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const email = data.get("email").trim().toLocaleLowerCase("pt-BR");

  if (patients.some((patient) => patient.email === email)) {
    alert("Este e-mail já está cadastrado.");
    return;
  }

  patients.push({
    id: crypto.randomUUID(),
    name: data.get("name").trim(),
    email,
    phone: data.get("phone").trim(),
    birthDate: data.get("birthDate"),
  });
  savePatients();
  form.reset();
  renderPatients();
});

patientList.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-id]");
  if (!removeButton) return;
  patients = patients.filter((patient) => patient.id !== removeButton.dataset.id);
  savePatients();
  renderPatients();
});

searchInput.addEventListener("input", renderPatients);
sortNameButton.addEventListener("click", () => {
  sortDirection = sortDirection === "asc" ? "desc" : "asc";
  renderPatients();
});

renderPatients();
