// Base de datos inicial en memoria o localStorage
let listaEventos = JSON.parse(localStorage.getItem('fuentedelsaber_eventos')) || [
  {
    id: 1,
    titulo: "Juegos Deportivos Intercursos",
    fecha: "2026-11-15T09:00",
    categoria: "Deporte",
    descripcion: "Inauguración de las competencias deportivas anuales en las disciplinas de Baloncesto, Futbolito y Voleibol.",
    imagen: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    titulo: "Feria de Ciencias e Innovación",
    fecha: "2026-10-20T10:30",
    categoria: "Academia",
    descripcion: "Exposición de proyectos creativos desarrollados por los estudiantes de Bachillerato en Física, Química y Biología.",
    imagen: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80"
  }
];

let tabActual = 'proximos';

// Referencias a elementos del DOM
const tabProximos = document.getElementById('tab-proximos');
const tabAnteriores = document.getElementById('tab-anteriores');
const eventsGrid = document.getElementById('events-grid');
const emptyEvents = document.getElementById('empty-events');

const btnDirectivaNav = document.getElementById('btn-directiva-nav');
const linkDirectivaFooter = document.getElementById('link-directiva-footer');
const modalDirectiva = document.getElementById('modal-directiva');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelarModal = document.getElementById('btn-cancelar-modal');
const formNuevoEvento = document.getElementById('form-nuevo-evento');

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  renderizarEventos();
  iniciarTemporizadorLive();

  // Eventos de Pestañas
  tabProximos.addEventListener('click', () => cambiarTab('proximos'));
  tabAnteriores.addEventListener('click', () => cambiarTab('anteriores'));

  // Modales Directiva
  btnDirectivaNav.addEventListener('click', verificarAutenticacionDirectiva);
  linkDirectivaFooter.addEventListener('click', (e) => {
    e.preventDefault();
    verificarAutenticacionDirectiva();
  });

  btnCloseModal.addEventListener('click', cerrarModal);
  btnCancelarModal.addEventListener('click', cerrarModal);

  // Guardar nuevo evento
  formNuevoEvento.addEventListener('submit', guardarNuevoEvento);
});

// Función para cambiar de pestañas (Próximos / Anteriores)
function cambiarTab(tab) {
  tabActual = tab;
  if (tab === 'proximos') {
    tabProximos.classList.add('active');
    tabAnteriores.classList.remove('active');
  } else {
    tabAnteriores.classList.add('active');
    tabProximos.classList.remove('active');
  }
  renderizarEventos();
}

// Renderizado dinámico de tarjetas de eventos estilo Roblox
function renderizarEventos() {
  eventsGrid.innerHTML = '';
  const ahora = new Date();

  // Filtrar según la pestaña activa
  const eventosFiltrados = listaEventos.filter(ev => {
    const fechaEv = new Date(ev.fecha);
    return tabActual === 'proximos' ? fechaEv >= ahora : fechaEv < ahora;
  });

  if (eventosFiltrados.length === 0) {
    emptyEvents.classList.remove('hidden');
    eventsGrid.classList.add('hidden');
    return;
  }

  emptyEvents.classList.add('hidden');
  eventsGrid.classList.remove('hidden');

  eventosFiltrados.forEach(evento => {
    const card = document.createElement('div');
    card.className = 'event-card';

    const fechaFormat = new Date(evento.fecha).toLocaleDateString('es-VE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const bgImage = evento.imagen 
      ? `style="background-image: linear-gradient(180deg, rgba(7,19,37,0.3) 0%, rgba(7,19,37,0.9) 100%), url('${evento.imagen}')"`
      : '';

    card.innerHTML = `
      <div class="event-header" ${bgImage}>
        <span class="event-category">${evento.categoria}</span>
        <div class="countdown-box" data-date="${evento.fecha}">
          <i class="fa-solid fa-stopwatch"></i>
          <span class="countdown-text">Calculando...</span>
        </div>
      </div>
      <div class="event-body">
        <div class="event-date-badge">
          <i class="fa-regular fa-calendar-days"></i> ${fechaFormat}
        </div>
        <h3 class="event-card-title">${evento.titulo}</h3>
        <p class="event-card-desc">${evento.descripcion}</p>
        <button class="btn-delete-event" onclick="eliminarEvento(${evento.id})" title="Eliminar Evento">
          <i class="fa-solid fa-trash"></i> Eliminar
        </button>
      </div>
    `;

    eventsGrid.appendChild(card);
  });

  actualizarContadores();
}

// Reloj contador estilo Roblox en tiempo real
function actualizarContadores() {
  const contadores = document.querySelectorAll('.countdown-box');
  const ahora = new Date().getTime();

  contadores.forEach(box => {
    const targetDate = new Date(box.getAttribute('data-date')).getTime();
    const dif = targetDate - ahora;

    const textSpan = box.querySelector('.countdown-text');

    if (dif > 0) {
      const dias = Math.floor(dif / (1000 * 60 * 60 * 24));
      const horas = Math.floor((dif % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((dif % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((dif % (1000 * 60)) / 1000);

      textSpan.textContent = `Faltan: ${dias}d ${horas}h ${minutos}m ${segundos}s`;
    } else {
      textSpan.textContent = "Evento Finalizado";
    }
  });
}

function iniciarTemporizadorLive() {
  setInterval(actualizarContadores, 1000);
}

// Control del Modal de la Directiva
function verificarAutenticacionDirectiva() {
  const clave = prompt("Petición de Acceso Directivo:\nIngrese la clave institucional (Clave de prueba: admin123):");
  if (clave === "admin123" || clave === "directora" || clave === "coordinadora") {
    modalDirectiva.classList.remove('hidden');
  } else if (clave !== null) {
    alert("Clave incorrecta. Acceso solo permitido para la Directora o Coordinadora.");
  }
}

function cerrarModal() {
  modalDirectiva.classList.add('hidden');
  formNuevoEvento.reset();
}

function guardarNuevoEvento(e) {
  e.preventDefault();

  const nuevoEvento = {
    id: Date.now(),
    titulo: document.getElementById('titulo-evento').value,
    fecha: document.getElementById('fecha-evento').value,
    categoria: document.getElementById('categoria-evento').value,
    descripcion: document.getElementById('descripcion-evento').value,
    imagen: document.getElementById('imagen-evento').value || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80"
  };

  listaEventos.unshift(nuevoEvento);
  localStorage.setItem('fuentedelsaber_eventos', JSON.stringify(listaEventos));

  cerrarModal();
  renderizarEventos();
  alert("¡Evento publicado con éxito en la cartelera!");
}

function eliminarEvento(id) {
  if (confirm("¿Estás seguro de eliminar este evento de la cartelera?")) {
    listaEventos = listaEventos.filter(e => e.id !== id);
    localStorage.setItem('fuentedelsaber_eventos', JSON.stringify(listaEventos));
    renderizarEventos();
  }
}