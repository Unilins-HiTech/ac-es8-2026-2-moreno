const API_URL = '/pacientes';

const form = document.querySelector('#patient-form');
const patientList = document.querySelector('#patient-list');
const patientCount = document.querySelector('#patient-count');
const emptyState = document.querySelector('#empty-state');
const loadingMessage = document.querySelector('#loading-message');
const errorMessage = document.querySelector('#error-message');
const statusMessage = document.querySelector('#status-message');
const searchInput = document.querySelector('#search');
const sortNameButton = document.querySelector('#sort-name');
const cancelButton = document.querySelector('#cancel-button');
const saveButton = document.querySelector('#save-button');
const formTitle = document.querySelector('#form-title');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const phoneInput = document.querySelector('#phone');
const birthDateInput = document.querySelector('#birth-date');

let patients = [];
let editingId = null;
let sortDirection = 'asc';

async function request(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.erro || 'Erro HTTP: ' + response.status);
  }
  return response.status === 204 ? null : response.json();
}

async function loadPatients() {
  loadingMessage.hidden = false;
  errorMessage.hidden = true;
  emptyState.hidden = true;

  try {
    patients = await request(API_URL);
    renderPatients();
  } catch (error) {
    errorMessage.textContent = 'Não foi possível carregar os pacientes. ' + error.message;
    errorMessage.hidden = false;
  } finally {
    loadingMessage.hidden = true;
  }
}

function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate + 'T00:00:00');
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

function formatDate(date) {
  const [year, month, day] = date.split('-');
  return day + '/' + month + '/' + year;
}

function createCell(text) {
  const cell = document.createElement('td');
  cell.textContent = text;
  return cell;
}

function renderPatients() {
  const query = searchInput.value.trim().toLocaleLowerCase('pt-BR');
  const visiblePatients = patients
    .filter((patient) => patient.nome.toLocaleLowerCase('pt-BR').includes(query))
    .sort((first, second) => {
      const comparison = first.nome.localeCompare(second.nome, 'pt-BR', { sensitivity: 'base' });
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  patientList.replaceChildren();
  visiblePatients.forEach((patient) => {
    const row = document.createElement('tr');
    row.append(
      createCell(patient.nome),
      createCell(patient.email),
      createCell(patient.telefone),
      createCell(formatDate(patient.nascimento)),
      createCell(calculateAge(patient.nascimento) + ' anos')
    );

    const actions = document.createElement('td');
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Editar';
    editButton.className = 'action-button';
    editButton.addEventListener('click', () => startEditing(patient));

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remover';
    removeButton.className = 'remove-button';
    removeButton.addEventListener('click', () => removePatient(patient.id));

    actions.append(editButton, removeButton);
    row.append(actions);
    patientList.append(row);
  });

  patientCount.textContent = 'Total de pacientes: ' + patients.length;
  emptyState.textContent = patients.length === 0
    ? 'Nenhum paciente cadastrado ainda.'
    : 'Nenhum paciente encontrado.';
  emptyState.hidden = visiblePatients.length > 0;
  sortNameButton.querySelector('span').textContent = sortDirection === 'asc' ? '↑' : '↓';
}

function showMessage(text, isError = false) {
  statusMessage.textContent = text;
  statusMessage.className = isError ? 'message error' : 'message success';
  statusMessage.hidden = false;
}

function startEditing(patient) {
  editingId = patient.id;
  nameInput.value = patient.nome;
  emailInput.value = patient.email;
  phoneInput.value = patient.telefone;
  birthDateInput.value = patient.nascimento;
  formTitle.textContent = 'Editar paciente';
  saveButton.textContent = 'Salvar alterações';
  cancelButton.hidden = false;
  statusMessage.hidden = true;
  nameInput.focus();
}

function clearForm() {
  form.reset();
  editingId = null;
  formTitle.textContent = 'Novo paciente';
  saveButton.textContent = 'Cadastrar paciente';
  cancelButton.hidden = true;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const patient = {
    nome: data.get('name').trim(),
    email: data.get('email').trim(),
    telefone: data.get('phone').trim(),
    nascimento: data.get('birthDate'),
  };
  const method = editingId === null ? 'POST' : 'PUT';
  const url = editingId === null ? API_URL : API_URL + '/' + editingId;

  try {
    await request(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient),
    });
    showMessage(method === 'POST' ? 'Paciente cadastrado.' : 'Paciente atualizado.');
    clearForm();
    await loadPatients(); // A lista sempre vem novamente da API.
  } catch (error) {
    showMessage(error.message, true);
  }
});

async function removePatient(id) {
  if (!confirm('Deseja realmente remover este paciente?')) return;

  try {
    await request(API_URL + '/' + id, { method: 'DELETE' });
    if (editingId === id) clearForm();
    showMessage('Paciente removido.');
    await loadPatients();
  } catch (error) {
    showMessage(error.message, true);
  }
}

cancelButton.addEventListener('click', clearForm);
searchInput.addEventListener('input', renderPatients);
sortNameButton.addEventListener('click', () => {
  sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  renderPatients();
});

loadPatients();
