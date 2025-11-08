// dp_asignacion.js — versión dinámica con valores predeterminados

// Valores predeterminados (ejercicio original con departamentos)
const DEFAULT_CONFIG = {
  totalSem: 10,
  nDept: 4,
  deptNames: ['Matemáticas', 'Ciencias', 'Sistemas', 'Programación'],
  benefits: [
    [25, 50, 60, 80, 100, 100, 100],
    [20, 70, 90, 100, 100, 100, 100],
    [40, 60, 80, 100, 100, 100, 100],
    [10, 20, 30, 40, 50, 60, 70]
  ],
  title: 'Programación Dinámica — Asignación de Seminarios',
  description: 'Selecciona 10 seminarios entre 4 departamentos diferentes, con al menos un curso de cada uno. Cada departamento tiene una utilidad según la cantidad de cursos asignados. El objetivo es maximizar el conocimiento total usando programación dinámica.',
  labelTotal: 'Total de seminarios',
  labelDept: 'Número de departamentos',
  tableHeader: 'Departamento',
  tableDescription: 'Edita los valores de utilidad (1–100) por departamento y número de cursos asignados:'
};

// Almacenar la configuración actual
let currentConfig = {
  deptNames: [...DEFAULT_CONFIG.deptNames],
  benefits: DEFAULT_CONFIG.benefits.map(row => [...row]),
  title: DEFAULT_CONFIG.title,
  description: DEFAULT_CONFIG.description,
  labelTotal: DEFAULT_CONFIG.labelTotal,
  labelDept: DEFAULT_CONFIG.labelDept,
  tableHeader: DEFAULT_CONFIG.tableHeader,
  tableDescription: DEFAULT_CONFIG.tableDescription
};

let isInitialLoad = true; // Flag para saber si es la carga inicial

// Función para inicializar todo
function init() {
  const calcBtn = document.getElementById('calcBtn');
  const resetBtn = document.getElementById('resetBtn');
  const updateBtn = document.getElementById('updateTableBtn');
  
  // Restaurar textos editables desde la configuración
  restoreEditableTexts();
  
  // Guardar cambios en elementos editables
  setupEditableElements();
  
  if (calcBtn) {
    calcBtn.onclick = runDP;
  }
  if (resetBtn) {
    resetBtn.onclick = resetDefaults;
  }
  if (updateBtn) {
    updateBtn.onclick = function() {
      isInitialLoad = false;
      saveEditableTexts(); // Guardar textos antes de actualizar
      updateTable();
      return false;
    };
  }
  
  // Inicializar tabla con valores predeterminados
  updateTable();
  isInitialLoad = false;
}

// Guardar textos editables
function saveEditableTexts() {
  try {
    const titleEl = document.getElementById('mainTitle');
    const descEl = document.getElementById('problemDescription');
    const labelTotalEl = document.getElementById('labelTotal');
    const labelDeptEl = document.getElementById('labelDept');
    const tableHeaderEl = document.querySelector('#benefTableHead th.editable-header') || document.getElementById('tableHeader');
    const tableDescEl = document.getElementById('tableDescription');
    
    if (titleEl) {
      currentConfig.title = titleEl.textContent || titleEl.innerText || currentConfig.title;
    }
    if (descEl) {
      const p = descEl.querySelector('p');
      if (p) {
        currentConfig.description = p.textContent || p.innerText || currentConfig.description;
      } else {
        currentConfig.description = descEl.textContent || descEl.innerText || currentConfig.description;
      }
    }
    if (labelTotalEl) {
      currentConfig.labelTotal = labelTotalEl.textContent || labelTotalEl.innerText || currentConfig.labelTotal;
    }
    if (labelDeptEl) {
      currentConfig.labelDept = labelDeptEl.textContent || labelDeptEl.innerText || currentConfig.labelDept;
    }
    if (tableHeaderEl) {
      currentConfig.tableHeader = tableHeaderEl.textContent || tableHeaderEl.innerText || currentConfig.tableHeader;
    }
    if (tableDescEl) {
      currentConfig.tableDescription = tableDescEl.textContent || tableDescEl.innerText || currentConfig.tableDescription;
    }
  } catch (e) {
    // Silenciar errores si los elementos no existen aún
  }
}

// Restaurar textos editables
function restoreEditableTexts() {
  const titleEl = document.getElementById('mainTitle');
  const descEl = document.getElementById('problemDescription');
  const labelTotalEl = document.getElementById('labelTotal');
  const labelDeptEl = document.getElementById('labelDept');
  const tableHeaderEl = document.getElementById('tableHeader');
  const tableDescEl = document.getElementById('tableDescription');
  
  if (titleEl && currentConfig.title) titleEl.textContent = currentConfig.title;
  if (descEl && currentConfig.description) {
    const p = descEl.querySelector('p');
    if (p) {
      p.innerHTML = currentConfig.description;
    } else {
      descEl.innerHTML = '<p>' + currentConfig.description + '</p>';
    }
  }
  if (labelTotalEl && currentConfig.labelTotal) labelTotalEl.textContent = currentConfig.labelTotal;
  if (labelDeptEl && currentConfig.labelDept) labelDeptEl.textContent = currentConfig.labelDept;
  if (tableHeaderEl && currentConfig.tableHeader) tableHeaderEl.textContent = currentConfig.tableHeader;
  if (tableDescEl && currentConfig.tableDescription) tableDescEl.textContent = currentConfig.tableDescription;
}

// Configurar elementos editables para guardar cambios
function setupEditableElements() {
  const editableElements = document.querySelectorAll('[contenteditable="true"]');
  editableElements.forEach(el => {
    el.addEventListener('blur', saveEditableTexts);
    el.addEventListener('input', function() {
      // Guardar en tiempo real mientras se edita
      saveEditableTexts();
    });
  });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function updateTable() {
  try {
    const totalInput = document.getElementById('totalSem');
    const nDeptInput = document.getElementById('nDept');
    
    if (!totalInput || !nDeptInput) {
      console.error('No se encontraron los inputs');
      return;
    }
    
    const total = parseInt(totalInput.value, 10) || 10;
    const nDept = parseInt(nDeptInput.value, 10) || 4;
    
    if (total < nDept) {
      const labelTotal = currentConfig.labelTotal || 'recursos';
      const labelDept = currentConfig.labelDept || 'categorías';
      showError(`El total de ${labelTotal.toLowerCase()} debe ser mayor o igual al número de ${labelDept.toLowerCase()}.`);
      return;
    }
    
    // Calcular número máximo de columnas necesarias
    // Máximo de cursos extras que puede tener un departamento = total - nDept
    const rem = total - nDept;
    
    // En la carga inicial, mostrar siempre 7 columnas para el ejercicio predeterminado
    // Después, usar exactamente el mínimo necesario (rem + 1 columnas)
    let numCols;
    if (isInitialLoad) {
      // Carga inicial: mostrar 7 columnas como en el ejercicio original
      numCols = 7;
    } else {
      // Actualización manual: usar exactamente las columnas necesarias
      numCols = rem + 1;
    }
    
    // Actualizar encabezado de la tabla
    const thead = document.getElementById('benefTableHead');
    if (!thead) {
      return;
    }
    
    const headerRow = thead.querySelector('tr');
    if (!headerRow) {
      return;
    }
    
    // Usar el header editable o el predeterminado
    const headerText = currentConfig.tableHeader || 'Categoría';
    headerRow.innerHTML = `<th contenteditable="true" class="editable-header">${headerText}</th>`;
    
    // Reconfigurar el evento del header editable
    const headerTh = headerRow.querySelector('th');
    if (headerTh) {
      headerTh.addEventListener('blur', saveEditableTexts);
      headerTh.addEventListener('input', saveEditableTexts);
    }
    
    // Crear las columnas: simplemente numeradas 1, 2, 3, ..., numCols
    // Sin condiciones especiales de "≥7", solo las columnas que se necesiten
    for (let i = 1; i <= numCols; i++) {
      const th = document.createElement('th');
      th.textContent = i.toString();
      headerRow.appendChild(th);
    }
    
    // Preservar valores existentes ANTES de limpiar la tabla
    const oldData = readTableData();
    const oldNames = getDepartmentNames();
    
    // Actualizar cuerpo de la tabla
    const tbody = document.getElementById('benefTableBody');
    if (!tbody) {
      return;
    }
    
    tbody.innerHTML = '';
    
    // Variable para controlar si debemos usar los nombres de currentConfig (útil para restauración)
    const useConfigNames = isInitialLoad || currentConfig.deptNames.length === nDept;
    
    for (let i = 0; i < nDept; i++) {
      const row = document.createElement('tr');
      
      // Celda de nombre del departamento (editable)
      const nameCell = document.createElement('td');
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'dept-name-input';
      
      // Si es carga inicial o restauración, usar nombres de currentConfig
      // Si no, preservar nombres existentes si están disponibles
      if (useConfigNames && currentConfig.deptNames[i]) {
        nameInput.value = currentConfig.deptNames[i];
      } else if (oldNames[i] && oldNames[i].trim() !== '') {
        nameInput.value = oldNames[i];
      } else if (currentConfig.deptNames[i]) {
        nameInput.value = currentConfig.deptNames[i];
      } else {
        nameInput.value = DEFAULT_CONFIG.deptNames[i] || `Departamento ${i + 1}`;
      }
      
      nameInput.addEventListener('blur', () => {
        currentConfig.deptNames[i] = nameInput.value || DEFAULT_CONFIG.deptNames[i] || `Departamento ${i + 1}`;
      });
      nameCell.appendChild(nameInput);
      row.appendChild(nameCell);
      
      // Celdas de valores de utilidad
      for (let j = 0; j < numCols; j++) {
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.max = '1000';
        
        // Intentar preservar valores existentes o usar predeterminados
        if (oldData[i] && oldData[i][j] !== undefined) {
          input.value = oldData[i][j];
        } else if (currentConfig.benefits[i] && currentConfig.benefits[i][j] !== undefined) {
          input.value = currentConfig.benefits[i][j];
        } else if (currentConfig.benefits[i] && j >= currentConfig.benefits[i].length) {
          // Si excede el tamaño predeterminado, usar el último valor
          const lastVal = currentConfig.benefits[i][currentConfig.benefits[i].length - 1];
          input.value = lastVal || 0;
        } else {
          input.value = 0;
        }
        
        input.addEventListener('input', () => {
          // Actualizar configuración actual
          if (!currentConfig.benefits[i]) {
            currentConfig.benefits[i] = [];
          }
          currentConfig.benefits[i][j] = parseFloat(input.value) || 0;
        });
        
        cell.appendChild(input);
        row.appendChild(cell);
      }
      
      tbody.appendChild(row);
    }
    
    // Actualizar nombres en currentConfig si hay más departamentos
    while (currentConfig.deptNames.length < nDept) {
      currentConfig.deptNames.push(`Departamento ${currentConfig.deptNames.length + 1}`);
    }
    currentConfig.deptNames = currentConfig.deptNames.slice(0, nDept);
    
    // Actualizar beneficios en currentConfig
    while (currentConfig.benefits.length < nDept) {
      currentConfig.benefits.push(Array(numCols).fill(0));
    }
    currentConfig.benefits = currentConfig.benefits.slice(0, nDept);
    
    clearResults();
  } catch (error) {
    console.error('Error al actualizar la tabla:', error);
    showError('Error al actualizar la tabla: ' + error.message);
  }
}

function readTableData() {
  const rows = document.querySelectorAll('#benefTableBody tr');
  const data = [];
  rows.forEach(r => {
    const vals = [];
    // Omitir el primer input (nombre del departamento)
    const inputs = r.querySelectorAll('input[type="number"]');
    inputs.forEach(inp => vals.push(parseFloat(inp.value) || 0));
    data.push(vals);
  });
  return data;
}

function readTable() {
  const rows = document.querySelectorAll('#benefTableBody tr');
  const data = [];
  rows.forEach(r => {
    const vals = [];
    // Omitir el primer input (nombre del departamento)
    const inputs = r.querySelectorAll('input[type="number"]');
    inputs.forEach(inp => vals.push(parseFloat(inp.value) || 0));
    data.push(vals);
  });
  return data;
}

function getDepartmentNames() {
  const rows = document.querySelectorAll('#benefTableBody tr');
  const names = [];
  if (rows.length === 0) {
    return []; // Tabla vacía, retornar array vacío
  }
  rows.forEach(r => {
    const nameInput = r.querySelector('input.dept-name-input');
    names.push(nameInput ? nameInput.value : '');
  });
  return names;
}

// Analizar el texto del problema para extraer condiciones
function analyzeProblemText() {
  const descEl = document.getElementById('problemDescription');
  const text = descEl ? (descEl.textContent || descEl.innerText || '').toLowerCase() : '';
  
  const conditions = {
    minPerCategory: 1, // Por defecto: al menos 1
    maxPerCategory: null,
    exactPerCategory: null,
    totalMin: null,
    totalMax: null,
    mustHaveAll: true // Por defecto: debe tener todas las categorías
  };
  
  // Buscar "al menos", "mínimo", "mínima"
  const minMatch = text.match(/(?:al menos|mínimo|mínima)\s+(\d+)/i);
  if (minMatch) {
    conditions.minPerCategory = parseInt(minMatch[1], 10);
  }
  
  // Buscar "máximo", "máxima", "como máximo"
  const maxMatch = text.match(/(?:máximo|máxima|como máximo)\s+(\d+)/i);
  if (maxMatch) {
    conditions.maxPerCategory = parseInt(maxMatch[1], 10);
  }
  
  // Buscar "exactamente"
  const exactMatch = text.match(/exactamente\s+(\d+)/i);
  if (exactMatch) {
    conditions.exactPerCategory = parseInt(exactMatch[1], 10);
  }
  
  // Buscar "no es necesario" o "no requiere" para indicar que no todas son obligatorias
  if (text.match(/(?:no es necesario|no requiere|opcional)/i)) {
    conditions.mustHaveAll = false;
  }
  
  return conditions;
}

// Almacenar el proceso completo
let processSteps = [];

// Función para formatear números sin decimales innecesarios
function formatNumber(num, maxDecimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  if (num === Infinity || num === -Infinity) return num === Infinity ? '∞' : '−∞';
  
  // Redondear al número de decimales máximo
  const rounded = Math.round(num * Math.pow(10, maxDecimals)) / Math.pow(10, maxDecimals);
  
  // Si es un número entero, no mostrar decimales
  if (rounded % 1 === 0) {
    return rounded.toString();
  }
  
  // Si tiene decimales, mostrar solo los necesarios (sin ceros finales)
  return rounded.toFixed(maxDecimals).replace(/\.?0+$/, '');
}

function runDP() {
  clearResults();
  const total = parseInt(document.getElementById('totalSem').value, 10);
  const nDept = parseInt(document.getElementById('nDept').value, 10);
  const benefits = readTable();
  const deptNames = getDepartmentNames();
  
  // Analizar condiciones del problema
  const conditions = analyzeProblemText();
  
  // Reiniciar proceso
  processSteps = [];
  processSteps.push({
    step: 1,
    title: 'Análisis del problema',
    content: `Se identificaron las siguientes condiciones del problema:
    • Total de recursos disponibles: ${total}
    • Número de categorías: ${nDept}
    • Mínimo por categoría: ${conditions.minPerCategory}
    ${conditions.maxPerCategory ? `• Máximo por categoría: ${conditions.maxPerCategory}` : ''}
    ${conditions.exactPerCategory ? `• Exactamente por categoría: ${conditions.exactPerCategory}` : ''}
    • Objetivo: Maximizar el beneficio total`
  });

  if (total < nDept * conditions.minPerCategory) {
    return showError(`El total debe ser al menos ${nDept * conditions.minPerCategory} (${nDept} categorías × ${conditions.minPerCategory} mínimo cada una).`);
  }

  if (benefits.length !== nDept) {
    return showError('La tabla no coincide con el número de categorías. Actualiza la tabla primero.');
  }

  const rem = total - (nDept * conditions.minPerCategory);
  if (rem < 0) {
    return showError('El total debe ser mayor o igual al número de categorías multiplicado por el mínimo requerido.');
  }

  // Preparar matriz de valores
  processSteps.push({
    step: 2,
    title: 'Preparación de la matriz de beneficios',
    content: `Se calcula la utilidad para cada categoría según la cantidad de recursos asignados (considerando el mínimo de ${conditions.minPerCategory}).`
  });
  
  const val = benefits.map((row, idx) => {
    return Array.from({ length: rem + 1 }, (_, x) => {
      const colIndex = Math.min(x, row.length - 1);
      return row[colIndex] || 0;
    });
  });
  
  // Mostrar matriz de beneficios
  let benefitsTable = '<table class="process-table"><thead><tr><th>Categoría</th>';
  for (let i = 0; i <= Math.min(rem, 6); i++) {
    benefitsTable += `<th>${conditions.minPerCategory + i}</th>`;
  }
  if (rem > 6) benefitsTable += '<th>...</th>';
  benefitsTable += '</tr></thead><tbody>';
  val.forEach((row, idx) => {
    benefitsTable += `<tr><td><strong>${deptNames[idx] || `Cat ${idx + 1}`}</strong></td>`;
    for (let i = 0; i <= Math.min(rem, 6); i++) {
      benefitsTable += `<td>${formatNumber(row[i], 0)}</td>`;
    }
    if (rem > 6) benefitsTable += '<td>...</td>';
    benefitsTable += '</tr>';
  });
  benefitsTable += '</tbody></table>';
  
  processSteps.push({
    step: 3,
    title: 'Matriz de beneficios',
    content: benefitsTable
  });

  // Programación dinámica con seguimiento
  processSteps.push({
    step: 4,
    title: 'Aplicación de Programación Dinámica',
    content: `Se construye la tabla V[i][r] donde:
    • V[i][r] = máximo beneficio al asignar r recursos extras a las categorías desde i hasta el final
    • Se procesa de atrás hacia adelante (de la última categoría a la primera)`
  });

  const V = Array.from({ length: nDept + 1 }, () => Array(rem + 1).fill(-Infinity));
  const D = Array.from({ length: nDept }, () => Array(rem + 1).fill(0));
  V[nDept][0] = 0;
  
  const dpSteps = [];

  for (let i = nDept - 1; i >= 0; i--) {
    const categorySteps = [];
    for (let r = 0; r <= rem; r++) {
      let bestX = 0;
      let bestValue = -Infinity;
      const comparisons = [];
      
      for (let x = 0; x <= r; x++) {
        const currentValue = val[i][x] + V[i + 1][r - x];
        comparisons.push({
          x: x,
          resources: conditions.minPerCategory + x,
          benefit: val[i][x],
          remaining: r - x,
          subproblem: V[i + 1][r - x],
          total: currentValue
        });
        
        if (currentValue > bestValue) {
          bestValue = currentValue;
          bestX = x;
        }
      }
      
      V[i][r] = bestValue;
      D[i][r] = bestX;
      
      if (r <= 5 || r === rem) { // Mostrar algunos casos representativos
        categorySteps.push({
          remaining: r,
          best: bestX,
          value: bestValue,
          comparisons: comparisons
        });
      }
    }
    
    dpSteps.push({
      category: deptNames[i] || `Categoría ${i + 1}`,
      index: i,
      steps: categorySteps
    });
  }
  
  processSteps.push({
    step: 5,
    title: 'Tabla de Programación Dinámica',
    content: generateDPTable(V, D, nDept, rem, deptNames, conditions.minPerCategory),
    details: dpSteps
  });

  // Reconstruir solución
  processSteps.push({
    step: 6,
    title: 'Reconstrucción de la solución óptima',
    content: 'Se reconstruye la solución óptima siguiendo las decisiones almacenadas en la tabla D.'
  });

  const extras = [];
  const solutionSteps = [];
  let r = rem;
  for (let i = 0; i < nDept; i++) {
    const x = D[i][r];
    extras.push(x);
    const totalResources = conditions.minPerCategory + x;
    solutionSteps.push({
      category: deptNames[i] || `Categoría ${i + 1}`,
      extras: x,
      total: totalResources,
      benefit: val[i][x],
      remaining: r
    });
    r -= x;
  }
  
  const totalValue = V[0][rem];

  processSteps.push({
    step: 7,
    title: 'Solución final',
    content: generateSolutionTable(solutionSteps, totalValue, conditions.minPerCategory)
  });

  // Mostrar resultados
  document.getElementById('resultsSection').style.display = 'block';
  document.getElementById('summary').innerHTML = `<b>Valor máximo:</b> ${formatNumber(totalValue)}`;

  const alloc = document.getElementById('allocation');
  alloc.innerHTML = '';
  extras.forEach((x, i) => {
    const name = deptNames[i] || `Cat ${i + 1}`;
    const courses = conditions.minPerCategory + x;
    const value = val[i][x];
    const div = document.createElement('div');
    div.className = 'probability-card';
    div.innerHTML = `<div class='state-name'>${name}</div><div>${courses} recursos</div><div>Beneficio: ${formatNumber(value)}</div>`;
    alloc.appendChild(div);
  });
  
  // Mostrar botón de proceso
  const processBtn = document.getElementById('showProcessBtn');
  if (processBtn) {
    processBtn.style.display = 'flex';
    processBtn.onclick = function() {
      const processSection = document.getElementById('processSection');
      if (processSection.style.display === 'none') {
        processSection.style.display = 'block';
        displayProcess();
        processBtn.innerHTML = '<span class="btn-icon">📊</span><span>Ocultar proceso</span>';
      } else {
        processSection.style.display = 'none';
        processBtn.innerHTML = '<span class="btn-icon">📊</span><span>Ver proceso detallado</span>';
      }
    };
  }
}

// Generar tabla de PD
function generateDPTable(V, D, nDept, rem, deptNames, minPer) {
  let table = '<table class="process-table"><thead><tr><th>Categoría</th>';
  for (let r = 0; r <= Math.min(rem, 8); r++) {
    table += `<th>r=${r}</th>`;
  }
  if (rem > 8) table += '<th>...</th>';
  table += '</tr></thead><tbody>';
  
  for (let i = 0; i < nDept; i++) {
    table += `<tr><td><strong>${deptNames[i] || `Cat ${i + 1}`}</strong></td>`;
    for (let r = 0; r <= Math.min(rem, 8); r++) {
      const value = formatNumber(V[i][r], 1);
      const decision = D[i][r];
      table += `<td title="Decisión: ${decision} extras">${value}<br><small>(${decision})</small></td>`;
    }
    if (rem > 8) table += '<td>...</td>';
    table += '</tr>';
  }
  table += '</tbody></table>';
  table += '<p class="process-note"><small>Nota: Los valores muestran el máximo beneficio. Los números entre paréntesis indican cuántos recursos extras se asignaron.</small></p>';
  return table;
}

// Generar tabla de solución
function generateSolutionTable(solutionSteps, totalValue, minPer) {
  let table = '<table class="process-table"><thead><tr><th>Categoría</th><th>Recursos mínimos</th><th>Recursos extras</th><th>Total recursos</th><th>Beneficio</th></tr></thead><tbody>';
  solutionSteps.forEach(step => {
    table += `<tr>
      <td><strong>${step.category}</strong></td>
      <td>${minPer}</td>
      <td>${step.extras}</td>
      <td><strong>${step.total}</strong></td>
      <td><strong>${formatNumber(step.benefit)}</strong></td>
    </tr>`;
  });
  table += `<tr class="total-row">
    <td colspan="3"><strong>TOTAL</strong></td>
    <td><strong>${solutionSteps.reduce((sum, s) => sum + s.total, 0)}</strong></td>
    <td><strong>${formatNumber(totalValue)}</strong></td>
  </tr>`;
  table += '</tbody></table>';
  return table;
}

// Mostrar el proceso completo
function displayProcess() {
  const content = document.getElementById('processContent');
  if (!content) return;
  
  let html = '';
  processSteps.forEach(step => {
    html += `<div class="process-step">
      <div class="step-header">
        <span class="step-number">Paso ${step.step}</span>
        <h5>${step.title}</h5>
      </div>
      <div class="step-content">${step.content}</div>
    </div>`;
  });
  
  content.innerHTML = html;
}

function clearResults() {
  const resultsSection = document.getElementById('resultsSection');
  const dpError = document.getElementById('dpError');
  const processBtn = document.getElementById('showProcessBtn');
  const processSection = document.getElementById('processSection');
  
  if (resultsSection) resultsSection.style.display = 'none';
  if (dpError) dpError.textContent = '';
  if (processBtn) processBtn.style.display = 'none';
  if (processSection) processSection.style.display = 'none';
  processSteps = [];
}

function showError(msg) {
  const dpError = document.getElementById('dpError');
  if (dpError) {
    dpError.textContent = msg;
  } else {
    console.error('Error:', msg);
  }
}

function resetDefaults() {
  // Restaurar valores predeterminados
  document.getElementById('totalSem').value = DEFAULT_CONFIG.totalSem;
  document.getElementById('nDept').value = DEFAULT_CONFIG.nDept;
  
  // Restaurar configuración actual con los valores originales
  currentConfig = {
    deptNames: [...DEFAULT_CONFIG.deptNames], // Restaurar nombres originales de departamentos
    benefits: DEFAULT_CONFIG.benefits.map(row => [...row]),
    title: DEFAULT_CONFIG.title,
    description: DEFAULT_CONFIG.description,
    labelTotal: DEFAULT_CONFIG.labelTotal,
    labelDept: DEFAULT_CONFIG.labelDept,
    tableHeader: DEFAULT_CONFIG.tableHeader,
    tableDescription: DEFAULT_CONFIG.tableDescription
  };
  
  // Restaurar textos editables
  restoreEditableTexts();
  
  // Restaurar tabla con carga inicial (mostrar 7 columnas)
  // Marcar como carga inicial para forzar el uso de los nombres de currentConfig
  isInitialLoad = true;
  updateTable();
  isInitialLoad = false;
  clearResults();
  
  // Asegurarse de que los nombres en los inputs también se actualicen
  // Esperar un momento para que la tabla se actualice
  setTimeout(() => {
    const rows = document.querySelectorAll('#benefTableBody tr');
    rows.forEach((row, i) => {
      const nameInput = row.querySelector('input.dept-name-input');
      if (nameInput && currentConfig.deptNames[i]) {
        nameInput.value = currentConfig.deptNames[i];
      }
    });
  }, 100);
}
