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
    case 2: respuestas.apellido = input.value.trim(); break;
    case 3: respuestas.edad = input.value.trim(); break;
    case 4: respuestas.tutor = input.value.trim(); break;
    case 5: respuestas.tel = input.value.trim(); break;
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


    

    document.getElementById('resumen').innerHTML = resumen;
  }, 300);
}
