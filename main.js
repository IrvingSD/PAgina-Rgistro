let pasoActual = 1;

function mostrarPaso(siguientePaso) {
  const pasoActualDiv = document.getElementById(`step-${pasoActual}`);
  const input = pasoActualDiv.querySelector('input');

  // Validar campo vacío
  if (!input || input.value.trim() === "") {
    alert("Por favor, completa el campo antes de continuar.");
    return;
  }

  // Ocultar paso actual
  pasoActualDiv.classList.add('oculto');

  // Mostrar siguiente paso después de un pequeño retraso
  const siguientePasoDiv = document.getElementById(`step-${siguientePaso}`);
  setTimeout(() => {
    siguientePasoDiv.classList.remove('oculto');
  }, 300);

  pasoActual = siguientePaso;
}

function finalizar() {
  const pasoActualDiv = document.getElementById(`step-${pasoActual}`);
  const input = pasoActualDiv.querySelector('input');

  if (input && input.value.trim() === "") {
    alert("Por favor, llena el campo antes de continuar.");
    return;
  }

  pasoActualDiv.classList.add('oculto');
  setTimeout(() => {
    const finalDiv = document.getElementById('final');
    finalDiv.classList.remove('oculto');

    // Resumen (puedes ajustar qué datos mostrar)
    const nombre = document.getElementById('nombre')?.value || "";
    const apellido = document.getElementById('apellido')?.value || "";
    const edad = document.getElementById('edad')?.value || "";
    const tutor = document.getElementById('tutor')?.value || "";
    const tel = document.getElementById('tel')?.value || "";

    document.getElementById('resumen').innerText = 
      `Gracias por registrarte, ${nombre} ${apellido}. 
Edad: ${edad}.
Tutor: ${tutor}.
Contacto: ${tel}.`;
  }, 300);
}

function ocultarTodos() {
    document.querySelectorAll('.step').forEach(step => {
      step.classList.remove('activo');
      step.classList.add('oculto');
    });
  }

  function responderCondicion(tieneCondicion) {
    const pasoActualDiv = document.getElementById(`step-${pasoActual}`);
    pasoActualDiv.classList.add('oculto');
  
    setTimeout(() => {
      if (tieneCondicion) {
        document.getElementById('step-7a').classList.remove('oculto');
        pasoActual = '7a';
      } else {
        document.getElementById('step-8').classList.remove('oculto');
        pasoActual = 8;
      }
    }, 300);
  }

  function responderCristiano(esCristiano) {
    const pasoActualDiv = document.getElementById(`step-${pasoActual}`);
    pasoActualDiv.classList.add('oculto');
  
    setTimeout(() => {
      if (esCristiano) {
        document.getElementById('step-9a').classList.remove('oculto');
        pasoActual = '9a';
      } else {
        document.getElementById('step-10').classList.remove('oculto');
        pasoActual = 10;
      }
    }, 300);
  }
