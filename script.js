const STORAGE_KEY = "ac-es8-patients";
const PATIENTS_URL = "pacientes.json";

const form = document.querySelector("#patient-form");
const patientList = document.querySelector("#patient-list");
const patientCount = document.querySelector("#patient-count");
const sourceCount = document.querySelector("#source-count");
const emptyState = document.querySelector("#empty-state");
const loadingMessage = document.querySelector("#loading-message");
const errorMessage = document.querySelector("#error-message");
const searchInput = document.querySelector("#search");
const sortNameButton = document.querySelector("#sort-name");

let patients = [];
let sortDirection = "asc";

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function loadManualPatients() {
  try {
    const savedPatients = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(savedPatients)
      ? savedPatients.map((patient) => ({ ...patient, origin: "manual" }))
      : [];
  } catch {
    return [];
  }
}

function saveManualPatients() {
  const manualPatients = patients
    .filter((patient) => patient.origin === "manual")
    .map(({ origin, ...patient }) => patient);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(manualPatients));
}

async function loadPatients() {
  loadingMessage.hidden = false;
  errorMessage.hidden = true;
  patientList.replaceChildren();
  emptyState.hidden = true;

  try {
    await delay(1000);
    const response = await fetch(PATIENTS_URL);
    if (!response.ok) throw new Error("Não foi possível carregar os pacientes.");

    const jsonPatients = await response.json();
    if (!Array.isArray(jsonPatients)) throw new Error("Formato inválido na lista de pacientes.");

    patients = jsonPatients.map((patient, index) => ({
      ...patient,
      id: patient.id || `json-${index}`,
      origin: "json",
    })).concat(loadManualPatients());
    loadingMessage.hidden = true;
    renderPatients();
  } catch (error) {
    loadingMessage.hidden = true;
    errorMessage.textContent = `Não foi possível carregar os pacientes. ${error.message}`;
    errorMessage.hidden = false;
    patients = loadManualPatients();
    renderPatients();
  } 
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
  sourceCount.textContent = `Arquivo JSON: ${patients.filter((patient) => patient.origin === "json").length} | Cadastro manual: ${patients.filter((patient) => patient.origin === "manual").length}`;
  emptyState.textContent = patients.length === 0 ? "Nenhum paciente cadastrado ainda" : "Nenhum paciente encontrado.";
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
    origin: "manual",
  });
  saveManualPatients();
  form.reset();
  renderPatients();
});

patientList.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-id]");
  if (!removeButton) return;
  patients = patients.filter((patient) => patient.id !== removeButton.dataset.id);
  saveManualPatients();
  renderPatients();
});

searchInput.addEventListener("input", renderPatients);
sortNameButton.addEventListener("click", () => {
  sortDirection = sortDirection === "asc" ? "desc" : "asc";
  renderPatients();
});

loadPatients();
