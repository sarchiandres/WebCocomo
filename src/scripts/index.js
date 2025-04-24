// Función para manejar las pestañas
function openTab(evt, tabName) {
  // Ocultar todos los contenidos de pestañas
  const tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
  }

  // Desactivar todos los botones de pestañas
  const tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Mostrar la pestaña actual y activar el botón
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

// Constantes para el modelo COCOMO Básico
const COCOMO_BASICO = {
  organico: { a: 2.4, b: 1.05, c: 2.5, d: 0.38 },
  semi: { a: 3.0, b: 1.12, c: 2.5, d: 0.35 },
  embebido: { a: 3.6, b: 1.20, c: 2.5, d: 0.32 }
};

// Cálculo del modelo COCOMO Básico
function calcularCocomoBasico() {
  // Obtener valores de entrada
  const kloc = parseFloat(document.getElementById("kloc").value);
  const tipoProyecto = document.getElementById("proyecto-tipo").value;
  const costoHombreMes = parseFloat(document.getElementById("costo-hombre-mes").value);
  
  // Validar entradas
  if (isNaN(kloc) || kloc <= 0) {
      alert("Por favor, ingrese un valor válido para KLOC.");
      return;
  }
  
  if (isNaN(costoHombreMes) || costoHombreMes <= 0) {
      alert("Por favor, ingrese un valor válido para el costo por persona-mes.");
      return;
  }
  
  // Obtener coeficientes según el tipo de proyecto
  const coef = COCOMO_BASICO[tipoProyecto];
  
  // Calcular esfuerzo: E = a * (KLOC)^b
  const esfuerzo = coef.a * Math.pow(kloc, coef.b);
  
  // Calcular tiempo de desarrollo: T = c * E^d
  const tiempo = coef.c * Math.pow(esfuerzo, coef.d);
  
  // Calcular personal promedio: P = E/T
  const personal = esfuerzo / tiempo;
  
  // Calcular costo total: E * Costo por persona-mes
  const costo = esfuerzo * costoHombreMes;
  
  // Calcular productividad: KLOC / E
  const productividad = (kloc * 1000) / esfuerzo;
  
  // Mostrar resultados
  document.getElementById("esfuerzo").textContent = esfuerzo.toFixed(2);
  document.getElementById("tiempo").textContent = tiempo.toFixed(2);
  document.getElementById("personal").textContent = personal.toFixed(2);
  document.getElementById("costo").textContent = costo.toFixed(2);
  document.getElementById("productividad").textContent = productividad.toFixed(2);
  
  // Mostrar la sección de resultados
  document.getElementById("resultados-basico").style.display = "block";
}

// Cálculo del modelo COCOMO Intermedio
function calcularCocomoIntermedio() {
  // Obtener valores de entrada
  const kloc = parseFloat(document.getElementById("kloc-intermedio").value);
  const tipoProyecto = document.getElementById("proyecto-tipo-intermedio").value;
  const costoHombreMes = parseFloat(document.getElementById("costo-hombre-mes-intermedio").value);
  
  // Validar entradas
  if (isNaN(kloc) || kloc <= 0) {
      alert("Por favor, ingrese un valor válido para KLOC.");
      return;
  }
  
  if (isNaN(costoHombreMes) || costoHombreMes <= 0) {
      alert("Por favor, ingrese un valor válido para el costo por persona-mes.");
      return;
  }
  
  // Obtener coeficientes según el tipo de proyecto
  const coef = COCOMO_BASICO[tipoProyecto];
  
  // Obtener todos los multiplicadores de esfuerzo
  const rely = parseFloat(document.getElementById("rely").value);
  const data = parseFloat(document.getElementById("data").value);
  const cplx = parseFloat(document.getElementById("cplx").value);
  const docu = parseFloat(document.getElementById("docu").value);
  const time = parseFloat(document.getElementById("time").value);
  const stor = parseFloat(document.getElementById("stor").value);
  const virt = parseFloat(document.getElementById("virt").value);
  const turn = parseFloat(document.getElementById("turn").value);
  const acap = parseFloat(document.getElementById("acap").value);
  const aexp = parseFloat(document.getElementById("aexp").value);
  const pcap = parseFloat(document.getElementById("pcap").value);
  const vexp = parseFloat(document.getElementById("vexp").value);
  const lexp = parseFloat(document.getElementById("lexp").value);
  const modp = parseFloat(document.getElementById("modp").value);
  const tool = parseFloat(document.getElementById("tool").value);
  const sced = parseFloat(document.getElementById("sced").value);
  const site = parseFloat(document.getElementById("site").value);
  const pcon = parseFloat(document.getElementById("pcon").value);
  const plex = parseFloat(document.getElementById("plex").value);
  
  // Calcular el factor de ajuste de esfuerzo (EAF)
  const eaf = rely * data * cplx * docu * time * stor * virt * turn * 
              acap * aexp * pcap * vexp * lexp * modp * tool * sced * 
              site * pcon * plex;
  
  // Calcular esfuerzo: E = a * (KLOC)^b * EAF
  const esfuerzo = coef.a * Math.pow(kloc, coef.b) * eaf;
  
  // Calcular tiempo de desarrollo: T = c * E^d
  const tiempo = coef.c * Math.pow(esfuerzo, coef.d);
  
  // Calcular personal promedio: P = E/T
  const personal = esfuerzo / tiempo;
  
  // Calcular costo total: E * Costo por persona-mes
  const costo = esfuerzo * costoHombreMes;
  
  // Calcular productividad: KLOC / E
  const productividad = (kloc * 1000) / esfuerzo;
  
  // Mostrar resultados
  document.getElementById("eaf").textContent = eaf.toFixed(4);
  document.getElementById("esfuerzo-intermedio").textContent = esfuerzo.toFixed(2);
  document.getElementById("tiempo-intermedio").textContent = tiempo.toFixed(2);
  document.getElementById("personal-intermedio").textContent = personal.toFixed(2);
  document.getElementById("costo-intermedio").textContent = costo.toFixed(2);
  document.getElementById("productividad-intermedio").textContent = productividad.toFixed(2);
  
  // Mostrar la sección de resultados
  document.getElementById("resultados-intermedio").style.display = "block";
}

// Al cargar la página, mostrar la pestaña por defecto (Básico)
document.addEventListener("DOMContentLoaded", function() {
  // Establecer la pestaña "Básico" como predeterminada
  document.getElementById("basico").style.display = "block";
  
  // Ocultar las secciones de resultados inicialmente
  document.getElementById("resultados-basico").style.display = "none";
  document.getElementById("resultados-intermedio").style.display = "none";
});