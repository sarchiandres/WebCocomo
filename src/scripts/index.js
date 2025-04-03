// Constantes del modelo COCOMO 81
const PROJECT_TYPES = {
    organic: { a: 3.2, b: 1.05, c: 2.5, d: 0.38, name: "Orgánico" },
    semi: { a: 3.0, b: 1.12, c: 2.5, d: 0.35, name: "Semi-acoplado" },
    embedded: { a: 2.8, b: 1.20, c: 2.5, d: 0.32, name: "Empotrado" }
  };
  
  // Inicialización al cargar la página
  document.addEventListener('DOMContentLoaded', function() {
    // Mostrar año actual en el footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Cargar vista de formulario
    loadFormView();
  });
  
  // Función para cargar la vista del formulario
  function loadFormView() {
    const mainContent = document.getElementById('main-content');
    const formTemplate = document.getElementById('form-template');
    
    // Limpiar contenido actual
    mainContent.innerHTML = '';
    
    // Clonar el template del formulario
    const formNode = document.importNode(formTemplate.content, true);
    mainContent.appendChild(formNode);
    
    // Configurar evento de tipo de cálculo
    const radioButtons = document.querySelectorAll('input[name="calculationType"]');
    radioButtons.forEach(radio => {
      radio.addEventListener('change', toggleCalculationType);
    });
    
    // Configurar evento de envío del formulario
    const form = document.getElementById('cocomo-form');
    form.addEventListener('submit', handleFormSubmit);
    
    // Asegurarse de que la vista de tipo de cálculo esté correcta
    toggleCalculationType();
  }
  
  // Función para alternar entre tipo de cálculo (equipo o duración)
  function toggleCalculationType() {
    const calculationType = document.querySelector('input[name="calculationType"]:checked').value;
    const teamSizeContainer = document.getElementById('teamSizeContainer');
    const durationContainer = document.getElementById('durationContainer');
    const teamSizeInput = document.getElementById('teamSize');
    const durationInput = document.getElementById('duration');
    
    if (calculationType === 'team') {
      teamSizeContainer.style.display = 'block';
      durationContainer.style.display = 'none';
      teamSizeInput.required = true;
      durationInput.required = false;
    } else {
      teamSizeContainer.style.display = 'none';
      durationContainer.style.display = 'block';
      teamSizeInput.required = false;
      durationInput.required = true;
    }
  }
  
  // Función para manejar el envío del formulario
  function handleFormSubmit(event) {
    event.preventDefault();
    
    // Recopilar datos del formulario
    const formData = {
      projectType: document.getElementById('projectType').value,
      kloc: parseFloat(document.getElementById('kloc').value),
      rely: parseFloat(document.getElementById('rely').value),
      aexp: parseFloat(document.getElementById('aexp').value),
      tool: parseFloat(document.getElementById('tool').value),
      calculationType: document.querySelector('input[name="calculationType"]:checked').value,
      teamSize: document.getElementById('teamSize').value ? parseInt(document.getElementById('teamSize').value) : null,
      duration: document.getElementById('duration').value ? parseFloat(document.getElementById('duration').value) : null,
      monthlySalary: parseFloat(document.getElementById('monthlySalary').value)
    };
    
    // Calcular resultados
    const results = calculateCocomo(formData);
    
    // Mostrar resultados
    loadResultsView(formData, results);
  }
  
  // Función para calcular COCOMO
  function calculateCocomo(formData) {
    const {
      projectType,
      kloc,
      rely,
      aexp,
      tool,
      calculationType,
      teamSize,
      duration,
      monthlySalary
    } = formData;
  
    // Obtener constantes según el tipo de proyecto
    const { a, b, c, d } = PROJECT_TYPES[projectType];
  
    // Calcular EAF (Factor de Ajuste de Esfuerzo)
    const eaf = rely * aexp * tool;
  
    // Calcular esfuerzo nominal (E = a * (KLOC)^b)
    const nominalEffort = a * Math.pow(kloc, b);
    
    // Calcular esfuerzo ajustado (E = a * (KLOC)^b * EAF)
    const effort = nominalEffort * eaf;
    
    // Calcular tiempo de desarrollo nominal (D = c * (E)^d)
    const nominalDuration = c * Math.pow(effort, d);
    
    let calculatedDuration, calculatedTeamSize, durationMessage;
    
    // Calcular según el tipo seleccionado
    if (calculationType === "team") {
      // Si se especificó el tamaño del equipo, calcular la duración
      calculatedTeamSize = teamSize;
      calculatedDuration = effort / calculatedTeamSize;
      
      // Comprobar si la duración calculada es realista
      if (calculatedDuration < nominalDuration * 0.75) {
        durationMessage = "La duración calculada es menor que el 75% de la duración estimada por el modelo. " +
                         "Podría ser poco realista completar el proyecto en este tiempo.";
      } else if (calculatedDuration > nominalDuration * 1.5) {
        durationMessage = "La duración calculada es mayor que el 150% de la duración estimada por el modelo. " +
                         "Podría haber una subutilización del equipo.";
      }
    } else {
      // Si se especificó la duración, calcular el tamaño del equipo
      calculatedDuration = duration;
      calculatedTeamSize = effort / calculatedDuration;
      
      // Comprobar si el tamaño del equipo calculado es realista
      if (calculatedDuration < nominalDuration * 0.75) {
        durationMessage = "La duración especificada es menor que el 75% de la duración estimada por el modelo. " +
                         "Se necesitaría un equipo más grande de lo normal.";
      } else if (calculatedDuration > nominalDuration * 1.5) {
        durationMessage = "La duración especificada es mayor que el 150% de la duración estimada por el modelo. " +
                         "El equipo podría ser más pequeño de lo necesario.";
      }
    }
    
    // Calcular productividad por persona
    const productivityPerPerson = kloc / calculatedTeamSize;
    
    // Calcular costos
    const baseCost = effort * monthlySalary;
    
    // Calcular costo con incremento anual
    let totalCost = 0;
    const years = calculatedDuration / 12;
    
    if (years <= 1) {
      totalCost = baseCost;
    } else {
      const fullYears = Math.floor(years);
      const remainingMonths = calculatedDuration - (fullYears * 12);
      
      // Calcular costo para cada año completo con incremento
      for (let i = 0; i < fullYears; i++) {
        const yearlyRate = monthlySalary * Math.pow(1.05, i);
        totalCost += yearlyRate * calculatedTeamSize * 12;
      }
      
      // Añadir el costo de los meses restantes
      const finalRate = monthlySalary * Math.pow(1.05, fullYears);
      totalCost += finalRate * calculatedTeamSize * remainingMonths;
    }
    
    return {
      nominalEffort,
      effort,
      eaf,
      duration: calculatedDuration,
      teamSize: calculatedTeamSize,
      durationMessage,
      productivityPerPerson,
      baseCost,
      totalCost,
      years
    };
  }
  
  // Función para cargar la vista de resultados
  function loadResultsView(formData, results) {
    const mainContent = document.getElementById('main-content');
    const resultsTemplate = document.getElementById('results-template');
    
    // Limpiar contenido actual
    mainContent.innerHTML = '';
    
    // Clonar el template de resultados
    const resultsNode = document.importNode(resultsTemplate.content, true);
    mainContent.appendChild(resultsNode);
    
    // Mostrar los parámetros del proyecto
    document.getElementById('result-project-type').textContent = PROJECT_TYPES[formData.projectType].name;
    document.getElementById('result-kloc').textContent = formData.kloc + " KLOC";
    document.getElementById('result-factors').textContent = `RELY: ${formData.rely}, AEXP: ${formData.aexp}, TOOL: ${formData.tool}`;
    document.getElementById('result-eaf').textContent = results.eaf.toFixed(4);
    
    // Mostrar estimaciones de esfuerzo y tiempo
    document.getElementById('result-nominal-effort').textContent = results.nominalEffort.toFixed(2) + " persona-mes";
    document.getElementById('result-effort').textContent = results.effort.toFixed(2) + " persona-mes";
    document.getElementById('result-duration').textContent = results.duration.toFixed(2) + " meses";
    document.getElementById('result-team-size').textContent = results.teamSize.toFixed(2) + " personas";
    
    // Mostrar productividad si corresponde
    if (results.productivityPerPerson) {
      document.getElementById('result-productivity').textContent = results.productivityPerPerson.toFixed(2) + " KLOC/persona";
    } else {
      document.getElementById('result-productivity-row').style.display = 'none';
    }
    
    // Mostrar costos si se proporcionó salario
    if (formData.monthlySalary > 0) {
      document.getElementById('result-salary').textContent = "$" + formData.monthlySalary.toFixed(2);
      document.getElementById('result-base-cost').textContent = "$" + results.baseCost.toFixed(2);
      document.getElementById('result-total-cost').textContent = "$" + results.totalCost.toFixed(2);
      
      // Mostrar años si es más de un año
      if (results.years > 1) {
        document.getElementById('result-years').textContent = results.years.toFixed(2) + " años";
      } else {
        document.getElementById('result-years-row').style.display = 'none';
      }
    } else {
      document.getElementById('cost-section').style.display = 'none';
    }
    
    // Mostrar interpretación
    document.getElementById('result-interpretation-main').textContent = 
      `Según el modelo COCOMO 81 Intermedio, se estima que el proyecto requerirá un esfuerzo total de ${results.effort.toFixed(2)} persona-mes, con una duración aproximada de ${results.duration.toFixed(2)} meses y un equipo promedio de ${results.teamSize.toFixed(2)} personas.`;
    
    // Mostrar mensaje de duración si existe
    if (results.durationMessage) {
      document.getElementById('result-interpretation-duration').textContent = `Nota: ${results.durationMessage}`;
      document.getElementById('result-interpretation-duration').style.display = 'block';
    }
    
    // Mostrar interpretación de factores
    document.getElementById('result-interpretation-factors').textContent = 
      `Los factores de ajuste seleccionados (RELY, AEXP, TOOL) han ${results.eaf < 1 ? "reducido" : "aumentado"} el esfuerzo base en un ${Math.abs((results.eaf - 1) * 100).toFixed(2)}%.`;
    
    // Mostrar interpretación de costo si aplica
    if (formData.monthlySalary > 0) {
      document.getElementById('result-interpretation-cost').textContent = 
        `El costo total estimado del proyecto es de $${results.totalCost.toFixed(2)}, considerando un incremento anual del 5% en los salarios.`;
    } else {
      document.getElementById('result-interpretation-cost').style.display = 'none';
    }
    
    // Configurar evento del botón volver
    document.getElementById('back-button').addEventListener('click', loadFormView);
  }