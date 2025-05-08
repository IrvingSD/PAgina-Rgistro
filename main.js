let pasoActual = 1;

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
      
      // Expresión regular que permite:
      // - Apellidos compuestos (palabras con espacios, "de", "del", etc.)
      // - Pero asegura que haya al menos dos bloques de apellidos
      if (!/(^|\s)([^\s]+\s+){1,}[^\s]+$/.test(apellidos) || 
          apellidos.split(/\s+/).filter(Boolean).length < 2) {
        alert("Por favor ingresa al menos dos apellidos\nEjemplos:\n- González López\n- Martínez de la Rosa\n- Del Valle Sánchez");
        return;
      }
      
      respuestas.apellido = apellidos.replace(/\s+/g, ' ').trim(); // Normaliza espacios
      break;
    case 3: // Edad
      const edad = parseInt(input.value.trim());
      if (isNaN(edad) || edad < 2 || edad > 25) {
        alert("Por favor ingresa una edad válida (entre 2 y 25 años)");
        return;
      }
      respuestas.edad = edad;
      break;
    case 4: respuestas.tutor = input.value.trim(); break;
    case 5: // Teléfono
      const telefono = input.value.trim();
      // Eliminar cualquier carácter que no sea dígito
      const soloDigitos = telefono.replace(/\D/g, '');
      
      // Validar que sean exactamente 10 dígitos
      if (soloDigitos.length !== 10) {
        alert("Por favor ingresa exactamente 10 dígitos (sin guiones ni espacios)");
        return;
      }
      
      // Formatear como 555-123-4567 antes de guardar
      respuestas.tel = `${soloDigitos.substring(0, 3)}-${soloDigitos.substring(3, 6)}-${soloDigitos.substring(6)}`;
      break;
    case 6: respuestas.localidad = input.value.trim(); break;
    case '9a': respuestas.condicionDetalle = input.value.trim(); break;
    case '11a': respuestas.iglesia = input.value.trim(); break;
  }

  // Ocultar paso actual y mostrar el siguiente
  pasoActualDiv.classList.add('oculto');
  setTimeout(() => {
    document.getElementById(`step-${siguientePaso}`).classList.remove('oculto');
  }, 300);

  pasoActual = siguientePaso;
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
      document.getElementById('step-12').classList.remove('oculto');
      pasoActual = 12;
    }
  }, 300);
}

function responderPrimeraVez(valor) {
  respuestas.primeraVez = valor;
  finalizar();
}

async function finalizar() {
  // --- Validación (de la primera función) ---
  const pasoActualDiv = document.getElementById(`step-${pasoActual}`);
  const input = pasoActualDiv.querySelector('input');

  if (input && input.value.trim() === "") {
    alert("Por favor, llena el campo antes de continuar.");
    return;
  }

  // --- Datos para el backend (de la segunda función) ---
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

  try {
    // --- Envío al backend (versión asíncrona) ---
    const response = await fetch("https://backend-production-0e41.up.railway.app/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (!response.ok) throw new Error("Error en el servidor");

    // --- Generar y mostrar el resumen (de la primera función) ---
    const resumen = `
      <strong>Nombre:</strong> ${respuestas.nombre} ${respuestas.apellido}<br>
      <strong>Edad:</strong> ${respuestas.edad}<br>
      <strong>Tutor:</strong> ${respuestas.tutor}<br>
      <strong>Teléfono:</strong> ${respuestas.tel}<br>
      <strong>Localidad:</strong> ${respuestas.localidad}<br>
      <strong>¿Puede tomar medicamento?:</strong> ${respuestas.medicamento ? "Sí" : "No"}<br>
      <strong>¿Tiene condición médica?:</strong> ${respuestas.condicion ? respuestas.condicionDetalle : "No"}<br>
      <strong>¿Es cristiano?:</strong> ${respuestas.cristiano ? "Sí" : "No"}<br>
      ${respuestas.cristiano ? `<strong>Iglesia:</strong> ${respuestas.iglesia}<br>` : ""}
      <strong>¿Es su primera vez?:</strong> ${respuestas.primeraVez ? "Sí" : "No"}<br>
    `;

    // --- Transición de pantallas ---
    pasoActualDiv.classList.add('oculto');
    document.getElementById('resumen').innerHTML = resumen;
    document.getElementById('final').classList.remove('oculto');

    console.log("Registro exitoso:", await response.json());
    
  } catch (error) {
    console.error("Error al registrar:", error);
    alert("Hubo un error. Por favor, revisa la consola.");
  }
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