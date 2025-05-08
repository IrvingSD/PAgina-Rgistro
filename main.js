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
  const pasoActualDiv = document.getElementById(`step-${pasoActual}`);
  const botones = pasoActualDiv.querySelectorAll('button');
  let intentos = 0;
  const MAX_INTENTOS = 3;

  const enviarDatos = async () => {
      intentos++;
      try {
          // Estado de carga
          botones.forEach(boton => {
              boton.disabled = true;
              boton.innerHTML = intentos > 1 ? 
                  `⌛ Intentando nuevamente (${intentos}/${MAX_INTENTOS})` : 
                  '⌛ Enviando...';
          });

          // Validación (tu código existente)
          if (pasoActualDiv.querySelector('input')?.value.trim() === "") {
              throw new Error("Por favor completa el campo");
          }
          
        // --- Preparar datos ---
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

           // Intento de envío con timeout
           const controller = new AbortController();
           const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos

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

           // Éxito - mostrar resumen
           mostrarResumen();
           
       } catch (error) {
           console.error(`Intento ${intentos} fallido:`, error);
           
           if (intentos < MAX_INTENTOS) {
               // Reintentar automáticamente después de un delay
               await new Promise(resolve => setTimeout(resolve, 1000 * intentos));
               return enviarDatos();
           }
           
           // Mostrar error final después de todos los intentos
           botones.forEach(boton => {
               boton.disabled = false;
               boton.textContent = pasoActual === 12 ? 'Enviar' : 'Siguiente →';
           });
           
           alert(`No se pudo enviar después de ${MAX_INTENTOS} intentos. Por favor verifica tu conexión e intenta nuevamente.`);
       }
   };

   // Iniciar el proceso
   await enviarDatos();
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