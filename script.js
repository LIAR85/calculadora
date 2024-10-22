document.addEventListener("DOMContentLoaded", () => {
  const pacienteTab = document.getElementById("pacienteTab");
  const calculadoraTab = document.getElementById("calculadoraTab");
  const consultaTab = document.getElementById("consultaTab");
  const graficasTab = document.getElementById("graficasTab");
  const pacienteContent = document.getElementById("pacienteContent");
  const calculadoraContent = document.getElementById("calculadoraContent");
  const consultaContent = document.getElementById("consultaContent");
  const graficasContent = document.getElementById("graficasContent");
  const form = document.getElementById("calculatorForm");
  const mifflinTab = document.getElementById("mifflinTab");
  const harrisTab = document.getElementById("harrisTab");
  const resultado = document.getElementById("Resultado");
  const limpiarBtn = document.getElementById("Limpiar");
  const guardarBtn = document.getElementById("Guardar");
  const pacienteForm = document.getElementById("pacienteForm");
  const pacienteSelect = document.getElementById("PacienteSelect");
  const consultaPacienteSelect = document.getElementById(
    "ConsultaPacienteSelect"
  );
  const graficaPacienteSelect = document.getElementById(
    "GraficaPacienteSelect"
  );
  const datoGraficaSelect = document.getElementById("DatoGrafica");
  const nombreInput = document.getElementById("Nombre");
  const apellidoInput = document.getElementById("Apellido");
  const nombresList = document.getElementById("nombresPacientes");
  const imprimirDatosBtn = document.getElementById("imprimirDatos");
  const toggleResultadosBtn = document.getElementById("toggleResultados"); // Updated ID
  const infoPaciente = document.getElementById("infoPaciente");
  const comentariosPaciente = document.getElementById("comentariosPaciente");
  const listaComentarios = document.getElementById("listaComentarios");
  const nuevoComentarioConsulta = document.getElementById(
    "NuevoComentarioConsulta"
  );
  const agregarComentarioConsultaBtn = document.getElementById(
    "AgregarComentarioConsulta"
  );
  let metodoActivo = "mifflin";
  let pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];
  let pacienteActual = null;
  let resultadoActual = null;
  let chart = null;

  const comentarioPacienteInput = document.getElementById("ComentarioPaciente");

  function ActualizarPacienteSelect() {
    pacienteSelect.innerHTML =
      '<option value="">Seleccione un paciente</option>';
    consultaPacienteSelect.innerHTML =
      '<option value="">Seleccione un paciente</option>';
    graficaPacienteSelect.innerHTML =
      '<option value="">Seleccione un paciente</option>';
    nombresList.innerHTML = "";

    pacientes.sort((a, b) => a.apellido.localeCompare(b.apellido));

    pacientes.forEach((paciente, index) => {
      const nombreCompleto = `${paciente.apellido}, ${paciente.nombre}`;
      const option1 = document.createElement("option");
      option1.value = index;
      option1.textContent = nombreCompleto;
      pacienteSelect.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = index;
      option2.textContent = nombreCompleto;
      consultaPacienteSelect.appendChild(option2);

      const option3 = document.createElement("option");
      option3.value = index;
      option3.textContent = nombreCompleto;
      graficaPacienteSelect.appendChild(option3);

      const option4 = document.createElement("option");
      option4.value = nombreCompleto;
      nombresList.appendChild(option4);
    });
  }

  function MostrarGrafica(paciente) {
    const ctx = document.getElementById("graficaPeso").getContext("2d");
    if (chart) {
      chart.destroy();
    }
    const datoSeleccionado = datoGraficaSelect.value;
    const etiqueta =
      datoSeleccionado === "peso" ? "Peso (kg)" : "Calorías Diarias";
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: paciente.resultados.map((r) =>
          new Date(r.fecha).toLocaleDateString()
        ),
        datasets: [
          {
            label: etiqueta,
            data: paciente.resultados.map((r) =>
              datoSeleccionado === "peso" ? r.peso : r.caloriasDiarias
            ),
            borderColor: "#00b4a8",
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false,
          },
        },
      },
    });

    const tablaComparativa = document.getElementById("tablaComparativa");
    if (paciente.resultados.length >= 2) {
      const ultimaConsulta =
        paciente.resultados[paciente.resultados.length - 1];
      const penultimaConsulta =
        paciente.resultados[paciente.resultados.length - 2];
      tablaComparativa.innerHTML = `
                <table>
                    <tr>
                        <th>Dato</th>
                        <th>Consulta Anterior (${new Date(
                          penultimaConsulta.fecha
                        ).toLocaleDateString()})</th>
                        <th>Última Consulta (${new Date(
                          ultimaConsulta.fecha
                        ).toLocaleDateString()})</th>
                        <th>Diferencia</th>
                    </tr>
                    <tr>
                        <td>Peso (kg)</td>
                        <td>${penultimaConsulta.peso}</td>
                        <td>${ultimaConsulta.peso}</td>
                        <td>${(
                          ultimaConsulta.peso - penultimaConsulta.peso
                        ).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Altura (cm)</td>
                        <td>${penultimaConsulta.altura}</td>
                        <td>${ultimaConsulta.altura}</td>
                        <td>${
                          ultimaConsulta.altura - penultimaConsulta.altura
                        }</td>
                    </tr>
                    <tr>
                        <td>Edad</td>
                        <td>${penultimaConsulta.edad}</td>
                        <td>${ultimaConsulta.edad}</td>
                        <td>${ultimaConsulta.edad - penultimaConsulta.edad}</td>
                    </tr>
                    <tr>
                        <td>Calorías Diarias</td>
                        <td>${penultimaConsulta.caloriasDiarias}</td>
                        <td>${ultimaConsulta.caloriasDiarias}</td>
                        <td>${
                          ultimaConsulta.caloriasDiarias -
                          penultimaConsulta.caloriasDiarias
                        }</td>
                    </tr>
                </table>
            `;
    } else {
      tablaComparativa.innerHTML =
        "<p>No hay suficientes datos para comparar.</p>";
    }
  }

  function MostrarTodosResultados(paciente) {
    const todosResultados = document.getElementById("todosResultados");
    if (paciente.resultados.length > 0) {
      let tablaHTML = `
                <table>
                    <tr>
                        <th>Fecha</th>
                        <th>Peso (kg)</th>
                        <th>Variación de Peso (kg)</th>
                        <th>Altura (cm)</th>
                        <th>Edad</th>
                        <th>Sexo</th>
                        <th>Nivel de Actividad</th>
                        <th>Calorías Diarias</th>
                    </tr>
            `;
      let pesoAnterior = null;
      paciente.resultados.forEach((resultado, index) => {
        const variacionPeso =
          pesoAnterior !== null
            ? (resultado.peso - pesoAnterior).toFixed(2)
            : "N/A";
        tablaHTML += `
                    <tr>
                        <td>${new Date(
                          resultado.fecha
                        ).toLocaleDateString()}</td>
                        <td>${resultado.peso}</td>
                        <td>${variacionPeso}</td>
                        <td>${resultado.altura}</td>
                        <td>${resultado.edad}</td>
                        <td>${resultado.sexo}</td>
                        <td>${resultado.nivelActividad}</td>
                        <td>${resultado.caloriasDiarias}</td>
                    </tr>
                `;
        pesoAnterior = resultado.peso;
      });
      tablaHTML += "</table>";
      todosResultados.innerHTML = tablaHTML;
    } else {
      todosResultados.innerHTML =
        "<p>No hay resultados guardados para este paciente.</p>";
    }
  }

  function CambiarTab(tabButton, tabContent) {
    [pacienteTab, calculadoraTab, consultaTab, graficasTab].forEach((tab) =>
      tab.classList.remove("active")
    );
    [
      pacienteContent,
      calculadoraContent,
      consultaContent,
      graficasContent,
    ].forEach((content) => content.classList.remove("active"));
    tabButton.classList.add("active");
    tabContent.classList.add("active");
  }

  pacienteTab.addEventListener("click", () =>
    CambiarTab(pacienteTab, pacienteContent)
  );
  calculadoraTab.addEventListener("click", () =>
    CambiarTab(calculadoraTab, calculadoraContent)
  );
  consultaTab.addEventListener("click", () =>
    CambiarTab(consultaTab, consultaContent)
  );
  graficasTab.addEventListener("click", () =>
    CambiarTab(graficasTab, graficasContent)
  );

  mifflinTab.addEventListener("click", () => CambiarMetodo("mifflin"));
  harrisTab.addEventListener("click", () => CambiarMetodo("harris"));

  function CambiarMetodo(metodo) {
    metodoActivo = metodo;
    mifflinTab.classList.toggle("active", metodo === "mifflin");
    harrisTab.classList.toggle("active", metodo === "harris");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const peso = parseFloat(document.getElementById("Peso").value);
    const altura = parseFloat(document.getElementById("AlturaCalc").value);
    const edad = parseFloat(document.getElementById("Edad").value);
    const sexo = document.querySelector('input[name="SexoCalc"]:checked').value;
    const nivelActividad = document.getElementById("Actividad").value;

    if (isNaN(peso) || peso <= 0 || isNaN(altura) || isNaN(edad)) {
      alert(
        "Por favor, ingrese valores válidos. El peso debe ser un número positivo."
      );
      return;
    }

    let tmb;
    if (metodoActivo === "mifflin") {
      tmb =
        sexo === "Masculino"
          ? 10 * peso + 6.25 * altura - 5 * edad + 5
          : 10 * peso + 6.25 * altura - 5 * edad - 161;
    } else {
      tmb =
        sexo === "Masculino"
          ? 66 + 13.7 * peso + 5 * altura - 6.8 * edad
          : 655 + 9.6 * peso + 1.8 * altura - 4.7 * edad;
    }

    const factorActividad = {
      Sedentario: 1.2,
      Ligero: 1.375,
      Moderado: 1.55,
      Activo: 1.725,
      "Muy activo": 1.9,
    }[nivelActividad];

    const caloriasDiarias = Math.round(tmb * factorActividad);

    resultado.innerHTML = `
            <h2>Resultado ${
              metodoActivo === "mifflin" ? "Mifflin-St Jeor" : "Harris-Benedict"
            }:</h2>
            <p>${caloriasDiarias} kcal/día</p>
        `;

    resultadoActual = {
      fecha: new Date().toISOString(),
      peso,
      altura,
      edad,
      sexo,
      nivelActividad,
      caloriasDiarias,
    };

    guardarBtn.style.display = pacienteActual ? "block" : "none";
  });

  limpiarBtn.addEventListener("click", () => {
    form.reset();
    resultado.innerHTML = "";
    guardarBtn.style.display = "none";
    resultadoActual = null;
  });

  function GuardarResultado() {
    if (!pacienteActual || !resultadoActual) {
      alert(
        "Por favor, seleccione un paciente y realice un cálculo antes de guardar."
      );
      return;
    }

    pacienteActual.resultados.push(resultadoActual);
    localStorage.setItem("pacientes", JSON.stringify(pacientes));
    alert("Resultado guardado exitosamente.");
    resultadoActual = null;
    guardarBtn.style.display = "none";
  }

  guardarBtn.addEventListener("click", GuardarResultado);

  pacienteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("Nombre").value;
    const apellido = document.getElementById("Apellido").value;
    if (pacientes.some((p) => p.nombre === nombre && p.apellido === apellido)) {
      alert(
        "Ya existe un paciente con ese nombre y apellido. Por favor, use un nombre diferente."
      );
      return;
    }
    const nuevoPaciente = {
      nombre: nombre,
      apellido: apellido,
      telefono: document.getElementById("Telefono").value,
      correo: document.getElementById("Correo").value,
      altura: document.getElementById("Altura").value,
      sexo: document.getElementById("Sexo").value,
      comentarios: [],
      resultados: [],
    };
    const comentarioInicial = comentarioPacienteInput.value.trim();
    if (comentarioInicial) {
      nuevoPaciente.comentarios.push({
        fecha: new Date().toISOString(),
        texto: comentarioInicial,
      });
    }
    pacientes.push(nuevoPaciente);
    localStorage.setItem("pacientes", JSON.stringify(pacientes));
    pacienteForm.reset();
    ActualizarPacienteSelect();
    alert("Paciente guardado exitosamente.");
  });

  nombreInput.addEventListener("input", (e) => {
    const nombreCompleto = e.target.value;
    const pacienteExistente = pacientes.find(
      (p) => `${p.apellido}, ${p.nombre}` === nombreCompleto
    );
    if (pacienteExistente) {
      apellidoInput.value = pacienteExistente.apellido;
      document.getElementById("Telefono").value = pacienteExistente.telefono;
      document.getElementById("Correo").value = pacienteExistente.correo;
      document.getElementById("Altura").value = pacienteExistente.altura;
      document.getElementById("Sexo").value = pacienteExistente.sexo;
    }
  });

  pacienteSelect.addEventListener("change", (e) => {
    const index = e.target.value;
    if (index !== "") {
      pacienteActual = pacientes[index];
      document.getElementById(
        "pacienteNombre"
      ).textContent = `${pacienteActual.nombre} ${pacienteActual.apellido}`;
      document.getElementById("AlturaCalc").value = pacienteActual.altura;
      document.querySelector(
        `input[name="SexoCalc"][value="${pacienteActual.sexo}"]`
      ).checked = true;
    } else {
      pacienteActual = null;
      document.getElementById("pacienteNombre").textContent = "";
      document.getElementById("AlturaCalc").value = "";
      document
        .querySelectorAll('input[name="SexoCalc"]')
        .forEach((radio) => (radio.checked = false));
    }
    guardarBtn.style.display = "none";
    resultadoActual = null;
  });

  consultaPacienteSelect.addEventListener("change", (e) => {
    const index = e.target.value;
    if (index !== "") {
      const paciente = pacientes[index];
      MostrarInfoPaciente(paciente);
    } else {
      infoPaciente.innerHTML = "";
      comentariosPaciente.innerHTML = "";
      nuevoComentarioConsulta.value = "";
      agregarComentarioConsultaBtn.disabled = true;
    }
  });

  function MostrarInfoPaciente(paciente) {
    infoPaciente.innerHTML = `
            <h3>${paciente.apellido}, ${
      paciente.nombre
    } <i class="fas fa-pencil-alt edit-icon" onclick="EditarPaciente(${pacientes.indexOf(
      paciente
    )})"></i></h3>
            <p><strong>Teléfono:</strong> ${paciente.telefono}</p>
            <p><strong>Correo:</strong> ${paciente.correo}</p>
            <p><strong>Altura:</strong> ${paciente.altura} cm</p>
            <p><strong>Sexo:</strong> ${paciente.sexo}</p>
        `;

    MostrarComentariosPaciente(paciente);
    agregarComentarioConsultaBtn.disabled = false;
  }

  function MostrarComentariosPaciente(paciente) {
    listaComentarios.innerHTML = "";
    if (paciente.comentarios && paciente.comentarios.length > 0) {
      paciente.comentarios.forEach((comentario, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
                    <p><strong>${new Date(
                      comentario.fecha
                    ).toLocaleString()}</strong></p>
                    <p>${comentario.texto}</p>
                    <button class="eliminar-comentario" data-index="${index}">Eliminar</button>
                `;
        listaComentarios.appendChild(li);
      });
    } else {
      listaComentarios.innerHTML =
        "<li>No hay comentarios para este paciente.</li>";
    }
  }

  window.EditarPaciente = function (index) {
    const paciente = pacientes[index];
    if (confirm("¿Está seguro que desea editar los datos de este paciente?")) {
      const nuevoNombre = prompt("Nombre:", paciente.nombre);
      const nuevoApellido = prompt("Apellido:", paciente.apellido);
      const nuevoTelefono = prompt("Teléfono:", paciente.telefono);
      const nuevoCorreo = prompt("Correo:", paciente.correo);
      const nuevaAltura = prompt("Altura (cm):", paciente.altura);
      const nuevoSexo = prompt(
        "Sexo (Masculino/Femenino/Otro):",
        paciente.sexo
      );

      if (nuevoNombre && nuevoApellido) {
        paciente.nombre = nuevoNombre;
        paciente.apellido = nuevoApellido;
        paciente.telefono = nuevoTelefono;
        paciente.correo = nuevoCorreo;
        paciente.altura = nuevaAltura;
        paciente.sexo = nuevoSexo;
        localStorage.setItem("pacientes", JSON.stringify(pacientes));
        ActualizarPacienteSelect();
        MostrarInfoPaciente(paciente);
      }
    }
  };

  function AgregarComentario(paciente) {
    const texto = nuevoComentarioConsulta.value.trim();
    if (texto) {
      const nuevoComentario = {
        fecha: new Date().toISOString(),
        texto: texto,
      };
      paciente.comentarios.push(nuevoComentario);
      localStorage.setItem("pacientes", JSON.stringify(pacientes));
      MostrarComentariosPaciente(paciente);
      nuevoComentarioConsulta.value = "";
    }
  }

  function EliminarComentario(paciente, index) {
    paciente.comentarios.splice(index, 1);
    localStorage.setItem("pacientes", JSON.stringify(pacientes));
    MostrarComentariosPaciente(paciente);
  }

  agregarComentarioConsultaBtn.addEventListener("click", () => {
    const pacienteIndex = consultaPacienteSelect.value;
    if (pacienteIndex !== "") {
      const paciente = pacientes[pacienteIndex];
      AgregarComentario(paciente);
    } else {
      alert(
        "Por favor, seleccione un paciente antes de agregar un comentario."
      );
    }
  });

  listaComentarios.addEventListener("click", (e) => {
    if (e.target.classList.contains("eliminar-comentario")) {
      const pacienteIndex = consultaPacienteSelect.value;
      const comentarioIndex = e.target.dataset.index;
      if (pacienteIndex !== "" && comentarioIndex !== undefined) {
        const paciente = pacientes[pacienteIndex];
        if (confirm("¿Está seguro de que desea eliminar este comentario?")) {
          EliminarComentario(paciente, comentarioIndex);
        }
      }
    }
  });

  graficaPacienteSelect.addEventListener("change", (e) => {
    const index = e.target.value;
    if (index !== "") {
      const pacienteSeleccionado = pacientes[index];
      MostrarGrafica(pacienteSeleccionado);
      MostrarTodosResultados(pacienteSeleccionado);
    } else {
      if (chart) {
        chart.destroy();
      }
      document.getElementById("tablaComparativa").innerHTML = "";
      document.getElementById("todosResultados").innerHTML = "";
    }
  });

  datoGraficaSelect.addEventListener("change", () => {
    const index = graficaPacienteSelect.value;
    if (index !== "") {
      const pacienteSeleccionado = pacientes[index];
      MostrarGrafica(pacienteSeleccionado);
    }
  });

  imprimirDatosBtn.addEventListener("click", () => {
    window.print();
  });

  let resultadosVisibles = false;
  toggleResultadosBtn.addEventListener("click", () => {
    // Updated event listener
    const index = graficaPacienteSelect.value;
    if (index !== "") {
      const pacienteSeleccionado = pacientes[index];
      const todosResultados = document.getElementById("todosResultados");
      if (resultadosVisibles) {
        todosResultados.style.display = "none";
        toggleResultadosBtn.textContent = "Mostrar Resultados Generales";
      } else {
        MostrarTodosResultados(pacienteSeleccionado);
        todosResultados.style.display = "block";
        toggleResultadosBtn.textContent = "Ocultar Resultados Generales";
      }
      resultadosVisibles = !resultadosVisibles;
    } else {
      alert("Por favor, seleccione un paciente primero.");
    }
  });

  ActualizarPacienteSelect();
  CambiarTab(pacienteTab, pacienteContent);
});
