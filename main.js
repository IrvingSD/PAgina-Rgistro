let tipoRegistro = null;
let pasoActual = 1;
let seleccionado = null;

const respuestas = {
  nombre: "",
  apellido: "",
  edad: "",
  tutor: "",
  tel: "",
  localidad: "",
  medicamento: null,
  condicion: null,
  condicionDetalle: "",
  cristiano: null,
  iglesia: "",
  primeraVez: null
};

const respuestasServidor = {
  nombre: "",
  apellido: "",
  cristiano: null,
  iglesia_nuestra: null
};

async function buscarCoincidencias() {
  const query = document.getElementById('busqueda').value.trim();
  const resultados = document.getElementById('resultados');
  const boton = document.getElementById('btn-confirmar');
  const mensaje = document.getElementById('mensaje');

  resultados.innerHTML = "";
  seleccionado = null;
  boton.disabled = true;
  mensaje.textContent = "";

  if (query.length < 2) return;

  try {
    const response = await fetch(`https://backend-production-0e41.up.railway.app/buscar_coincidencias?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    data.forEach(niño => {
      const li = document.createElement('li');
      li.textContent = `${niño.nombre} ${niño.apellido}`;
      li.style.cursor = "pointer";
      li.onclick = () => {
        seleccionado = niño;
        resultados.innerHTML = `<li><strong>✅ ${niño.nombre} ${niño.apellido}</strong></li>`;
        boton.disabled = false;
      };
      resultados.appendChild(li);
    });

  } catch (e) {
    resultados.innerHTML = "<li>Error al buscar</li>";
  }
}

async function confirmarAsistencia() {
  if (!seleccionado) return;
  const mensaje = document.getElementById('mensaje');
  mensaje.textContent = "⌛ Registrando asistencia...";

  try {
    const response = await fetch("https://backend-production-0e41.up.railway.app/registrar_asistencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: seleccionado.nombre, apellido: seleccionado.apellido })
    });

    const data = await response.json();

    if (response.ok) {
      mensaje.textContent = data.repetido
        ? "⚠️ Ya se había registrado asistencia hoy."
        : "✅ Asistencia registrada con éxito.";
    } else {
      mensaje.textContent = `❌ ${data.detail || "Error al registrar"}`;
    }

  } catch (err) {
    mensaje.textContent = "❌ Error de conexión.";
  }
}

function nuevoRegistro() {
  // Reiniciar variables
  pasoActual = 1;
  tipoRegistro = null;

  // Limpiar respuestas
  for (const key in respuestas) respuestas[key] = key === "medicamento" || key === "cristiano" || key === "primeraVez" ? null : "";
  respuestas.condicionDetalle = "";

  // Reset visual
  document.getElementById('final').classList.add('oculto');
  document.getElementById('step-inicio').classList.remove('oculto');
  document.getElementById('resumen').innerHTML = "";

  // Reset inputs visibles si fuera necesario
  document.querySelectorAll('.step input').forEach(input => input.value = "");
}



function iniciarFlujo(tipo) {
  tipoRegistro = tipo;
  document.getElementById('step-inicio').classList.add('oculto');

  setTimeout(() => {
    if (tipo === 'niño') {
      document.getElementById('step-1').classList.remove('oculto');
      pasoActual = 1;
    } else {
      document.getElementById('step-s1').classList.remove('oculto');
      pasoActual = 's1';
    }
  }, 300);
}

function mostrarPaso(siguientePaso) {
  const pasoActualDiv = document.getElementById(`step-${pasoActual}`);
  const input = pasoActualDiv.querySelector('input');

  // Validar campo vacío
  if (input && input.value.trim() === "") {
    alert("Por favor, completa el campo antes de continuar.");
    return;
  }

  // Guardar valor según paso
  switch (pasoActual) {
    case 1: respuestas.nombre = input.value.trim(); break;
    case 2: // Apellido
      const apellidos = input.value.trim();
      if (!/(^|\s)([^\s]+\s+){1,}[^\s]+$/.test(apellidos) || 
          apellidos.split(/\s+/).filter(Boolean).length < 2) {
        alert("Por favor ingresa al menos dos apellidos\nEjemplos:\n- González López\n- Martínez de la Rosa\n- Del Valle Sánchez");
        return;
      }
      respuestas.apellido = apellidos.replace(/\s+/g, ' ').trim();
      break;
    case 3:
      const edad = parseInt(input.value.trim());
      if (isNaN(edad) || edad < 3 || edad > 25) {
        alert("Por favor ingresa una edad válida (entre 3 y 25 años)");
        return;
      }
      respuestas.edad = edad;
      break;
    case 4: respuestas.tutor = input.value.trim(); break;
    case 5:
      const telefono = input.value.trim();
      const soloDigitos = telefono.replace(/\D/g, '');
      if (soloDigitos.length !== 10) {
        alert("Por favor ingresa exactamente 10 dígitos (sin guiones ni espacios)");
        return;
      }
      respuestas.tel = `${soloDigitos.substring(0, 3)}-${soloDigitos.substring(3, 6)}-${soloDigitos.substring(6)}`;
      break;
    case 6: respuestas.localidad = input.value.trim(); break;
    case '9a': respuestas.condicionDetalle = input.value.trim(); break;
    case '11a': respuestas.iglesia = input.value.trim(); break;
  }

  // Ocultar paso actual
  pasoActualDiv.classList.add('oculto');

  // Mostrar siguiente paso
  setTimeout(() => {
    const siguienteDiv = document.getElementById(`step-${siguientePaso}`);
    
    // Si es el paso 12, regenerar dinámicamente los botones
    if (siguientePaso === 12) {
      siguienteDiv.innerHTML = `
        <h1>¿Es la primera vez que asistes<br>al campo de verano?</h1>
        <div class="opciones">
          <button onclick="responderPrimeraVez(true)">Sí</button>
          <button onclick="responderPrimeraVez(false)">No</button>
        </div>
      `;
    }

    siguienteDiv.classList.remove('oculto');
  }, 300);

  pasoActual = siguientePaso;
}


function mostrarPasoServidor(siguientePaso) {
  const pasoDiv = document.getElementById(`step-${pasoActual}`);
  const input = pasoDiv.querySelector('input');

  if (!input || input.value.trim() === "") {
    alert("Por favor completa este campo.");
    return;
  }

  switch (pasoActual) {
    case 's1': respuestasServidor.nombre = input.value.trim(); break;
    case 's2': respuestasServidor.apellido = input.value.trim(); break;
  }

  pasoDiv.classList.add('oculto');
  setTimeout(() => {
    document.getElementById(`step-${siguientePaso}`).classList.remove('oculto');
    pasoActual = siguientePaso;
  }, 300);
}

function responderCristianoServidor(valor) {
  respuestasServidor.cristiano = valor;
  document.getElementById(`step-${pasoActual}`).classList.add('oculto');
  setTimeout(() => {
    if (valor) {
      document.getElementById('step-s4').classList.remove('oculto');
      pasoActual = 's4';
    } else {
      finalizarServidor(null); // no es cristiano, iglesia_nuestra no aplica
    }
  }, 300);
}


function responderMedicamento(valor) {
  respuestas.medicamento = valor;
  document.getElementById(`step-${pasoActual}`).classList.add('oculto');
  setTimeout(() => {
    document.getElementById('step-8').classList.remove('oculto');
    pasoActual = 8;
  }, 300);
}

function responderCondicion(tieneCondicion) {
  respuestas.condicion = tieneCondicion;
  document.getElementById(`step-${pasoActual}`).classList.add('oculto');
  setTimeout(() => {
    if (tieneCondicion) {
      document.getElementById('step-9a').classList.remove('oculto');
      pasoActual = '9a';
    } else {
      document.getElementById('step-10').classList.remove('oculto');
      pasoActual = 10;
    }
  }, 300);
}

function responderCristiano(esCristiano) {
  respuestas.cristiano = esCristiano;
  document.getElementById(`step-${pasoActual}`).classList.add('oculto');

  setTimeout(() => {
    if (esCristiano) {
      document.getElementById('step-11a').classList.remove('oculto');
      pasoActual = '11a';
    } else {
      const paso = document.getElementById('step-12');
      paso.classList.remove('oculto');
      pasoActual = 12;

      // 🛡️ Asegura que los botones se agregan dinámicamente (previene clics fantasma)
      paso.innerHTML = `
        <h1>¿Es la primera vez que asistes<br>al campo de verano?</h1>
        <div class="opciones">
          <button onclick="responderPrimeraVez(true)">Sí</button>
          <button onclick="responderPrimeraVez(false)">No</button>
        </div>
      `;
    }
  }, 300);
}


function responderPrimeraVez(valor) {
  respuestas.primeraVez = valor;

  // Desactiva botones para evitar doble clic
  const botones = document.querySelectorAll(`#step-${pasoActual} button`);
  botones.forEach(btn => {
    btn.disabled = true;
    btn.textContent = "⌛ Enviando...";
  });

  finalizar();
}

async function finalizar() {
  const pasoActualDiv = document.getElementById(`step-${pasoActual}`);

  // 🔒 Prevención: no continuar si el paso actual no está visible
  if (!pasoActualDiv || pasoActualDiv.classList.contains('oculto')) {
    console.warn("Paso actual inactivo, se cancela el envío.");
    return;
  }

  const botones = pasoActualDiv.querySelectorAll('button');
  let intentos = 0;
  const MAX_INTENTOS = 3;

  const enviarDatos = async () => {
    intentos++;
    try {
      // Estado de carga en los botones
      botones.forEach(boton => {
        boton.disabled = true;
        boton.innerHTML = intentos > 1
          ? `⌛ Intentando nuevamente (${intentos}/${MAX_INTENTOS})`
          : '⌛ Enviando...';
      });

      // Validación básica
      if (pasoActualDiv.querySelector('input')?.value.trim() === "") {
        throw new Error("Por favor completa el campo");
      }

      // Preparar datos
      const datos = {
        nombre: respuestas.nombre,
        apellido: respuestas.apellido,
        edad: parseInt(respuestas.edad),
        tutor: respuestas.tutor,
        telefono: respuestas.tel,
        localidad: respuestas.localidad,
        medicamento: respuestas.medicamento,
        condicion: respuestas.condicion ? respuestas.condicionDetalle : "Ninguna",
        cristiano: respuestas.cristiano,
        iglesia: respuestas.iglesia || "No aplica",
        primeraVez: respuestas.primeraVez
      };

      // Enviar con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s
      const response = await fetch("https://backend-production-0e41.up.railway.app/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Error en el servidor");
      }

      // ✅ Éxito → mostrar resumen
      mostrarResumen();

    } catch (error) {
      console.error(`Intento ${intentos} fallido:`, error);

      if (intentos < MAX_INTENTOS) {
        await new Promise(resolve => setTimeout(resolve, 1000 * intentos));
        return enviarDatos();
      }

      // ❌ Todos los intentos fallaron → restaurar UI
      pasoActualDiv.innerHTML = `
        <h1>¿Es la primera vez que asistes<br>al campo de verano?</h1>
        <div class="opciones">
          <button onclick="responderPrimeraVez(true)">Sí</button>
          <button onclick="responderPrimeraVez(false)">No</button>
        </div>
      `;

      alert(`No se pudo enviar después de ${MAX_INTENTOS} intentos. Por favor verifica tu conexión e intenta nuevamente.`);
    }
  };

  await enviarDatos();
}


async function finalizarServidor(iglesia_nuestra) {
  respuestasServidor.iglesia_nuestra = iglesia_nuestra;

  const datos = {
    nombre: respuestasServidor.nombre,
    apellido: respuestasServidor.apellido,
    cristiano: respuestasServidor.cristiano,
    iglesia_nuestra: respuestasServidor.iglesia_nuestra
  };

  try {
    const response = await fetch("https://backend-production-0e41.up.railway.app/registrar_servidor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (!response.ok) throw new Error("Error al registrar servidor");

    // Mostrar final
    document.getElementById(`step-${pasoActual}`).classList.add('oculto');
    document.getElementById('final').classList.remove('oculto');
    document.getElementById('resumen').innerHTML = `
      <h2>¡Servidor registrado!</h2>
      <p><strong>Nombre:</strong> ${datos.nombre} ${datos.apellido}</p>
      <p><strong>Es cristiano:</strong> ${datos.cristiano ? "Sí" : "No"}</p>
      ${datos.cristiano ? `<p><strong>¿De nuestra iglesia?:</strong> ${datos.iglesia_nuestra ? "Sí" : "No"}</p>` : ""}
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (e) {
    alert("Error al registrar. Intenta de nuevo.");
  }
}


function mostrarResumen() {
  // 1. Generar el HTML del resumen
  const resumenHTML = `
    <div class="resumen-container">
      <h2>¡Registro Completo!</h2>
      <div class="resumen-datos">
        <p><strong>Nombre:</strong> ${respuestas.nombre} ${respuestas.apellido}</p>
        <p><strong>Edad:</strong> ${respuestas.edad} años</p>
        <p><strong>Tutor:</strong> ${respuestas.tutor}</p>
        <p><strong>Teléfono:</strong> ${formatearTelefono(respuestas.tel)}</p>
        <p><strong>Localidad:</strong> ${respuestas.localidad}</p>
        <p><strong>Medicamento autorizado:</strong> ${respuestas.medicamento ? "✅ Sí" : "❌ No"}</p>
        <p><strong>Condición médica:</strong> ${respuestas.condicion ? "✅ " + respuestas.condicionDetalle : "❌ Ninguna"}</p>
        <p><strong>Es cristiano:</strong> ${respuestas.cristiano ? "✅ Sí" + (respuestas.iglesia ? ` (${respuestas.iglesia})` : '') : "❌ No"}</p>
        <p><strong>Primera vez:</strong> ${respuestas.primeraVez ? "✨ Sí" : "🔄 No"}</p>
      </div>
    </div>
  `;

  // 2. Insertar en el DOM
  const resumenElement = document.getElementById('resumen');
  resumenElement.innerHTML = resumenHTML;
  
  // 3. Mostrar pantalla final (transición)
  document.querySelector(`#step-${pasoActual}`).classList.add('oculto');
  document.getElementById('final').classList.remove('oculto');
  
  // 4. (Opcional) Scroll suave al inicio
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Función auxiliar para formato de teléfono
function formatearTelefono(tel) {
  if (!tel) return 'No proporcionado';
  const nums = tel.replace(/\D/g, '');
  return nums.length === 10 ? 
    `${nums.substring(0, 3)}-${nums.substring(3, 6)}-${nums.substring(6)}` : 
    tel;
}

// Configuración de eventos después de cargar la página
document.addEventListener('DOMContentLoaded', function() {
  // 1. Enter para avanzar en todos los inputs
  document.querySelectorAll('.step input').forEach(input => {
      input.addEventListener('keydown', function(event) {
          if (event.key === 'Enter') {
              event.preventDefault();
              const nextButton = this.closest('.step').querySelector('button');
              if (nextButton) nextButton.click();
          }
      });
  });
  
  // 2. Auto-focus al mostrar un paso
  const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
          if (mutation.attributeName === 'class') {
              const step = mutation.target;
              if (!step.classList.contains('oculto')) {
                  const input = step.querySelector('input');
                  if (input) input.focus();
              }
          }
      });
  });
  
  // Observar todos los pasos
  document.querySelectorAll('.step').forEach(step => {
      observer.observe(step, { attributes: true });
  });
});