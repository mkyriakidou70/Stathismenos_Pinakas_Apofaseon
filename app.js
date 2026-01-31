let criteria = [];
let options = [];

function addCriterion(name = '', weight = 1) {
    criteria.push({ name, weight });
    renderCriteria();
    renderOptions();
}

function removeCriterion(index) {
    criteria.splice(index, 1);
    renderCriteria();
    renderOptions();
}

function addOption(name = '') {
    options.push({ name, impacts: Array(criteria.length).fill(1) });
    renderOptions();
}

function removeOption(index) {
    options.splice(index, 1);
    renderOptions();
}

function renderCriteria() {
    const list = document.getElementById('criteria-list');
    list.innerHTML = '';
    criteria.forEach((c, i) => {
        const div = document.createElement('div');
        div.className = 'criterion';
        div.innerHTML = `
            <input type="text" placeholder="Κριτήριο" value="${c.name}" onchange="criteria[${i}].name=this.value; renderOptions();">
            <input type="number" min="1" max="10" value="${c.weight}" onchange="criteria[${i}].weight=this.value; renderOptions();">
            <button type="button" onclick="removeCriterion(${i})">✕</button>
        `;
        list.appendChild(div);
    });
}


function renderOptions() {
    const list = document.getElementById('options-list');
    list.innerHTML = '';
    if (options.length === 0 || criteria.length === 0) return;

    // Table header
    let table = document.createElement('table');
    table.className = 'option-table';
    let thead = document.createElement('thead');
    let tr = document.createElement('tr');
    tr.innerHTML = `<th>Επιλογή</th>` + criteria.map(c => `<th>${c.name || 'Κριτήριο'}</th>`).join('') + `<th></th>`;
    thead.appendChild(tr);
    table.appendChild(thead);

    // Table body
    let tbody = document.createElement('tbody');
    options.forEach((o, i) => {
        let tr = document.createElement('tr');
        let optionCell = `<td><input type="text" placeholder="Επιλογή" value="${o.name}" onchange="options[${i}].name=this.value;"></td>`;
        let impactsCells = criteria.map((c, j) =>
            `<td><input type="number" min="1" max="10" value="${o.impacts[j] || 1}" onchange="options[${i}].impacts[${j}]=this.value;"></td>`
        ).join('');
        let removeCell = `<td><button type="button" onclick="removeOption(${i})">✕</button></td>`;
        tr.innerHTML = optionCell + impactsCells + removeCell;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    list.appendChild(table);
}

function calculateScores() {
    let results = [];
    options.forEach(option => {
        let score = 0;
        criteria.forEach((c, j) => {
            score += (parseFloat(c.weight) || 0) * (parseFloat(option.impacts[j]) || 0);
        });
        results.push({ name: option.name, score });
    });
    results.sort((a, b) => b.score - a.score);
    const resultsDiv = document.getElementById('results');
    if (results.length === 0) {
        resultsDiv.innerHTML = '<em>Δεν υπάρχουν αποτελέσματα.</em>';
        return;
    }
    let html = '<h3>Αποτελέσματα Κατάταξης</h3><ol>';
    results.forEach(r => {
        html += `<li><strong>${r.name || '(χωρίς όνομα)'}</strong>: ${r.score.toFixed(2)}</li>`;
    });
    html += '</ol>';
    resultsDiv.innerHTML = html;
}

// Προσθήκη αρχικών πεδίων για ευκολία
document.addEventListener('DOMContentLoaded', () => {
    addCriterion('Ασφάλεια', '');
    addCriterion('Κοινωνική αναγνώριση', '');
    addCriterion('Οικονομικές απολαβές', '');
    addCriterion('Αυτοέκφραση', '');
    addCriterion('Διαπροσωπικές σχέσεις', '');
    addOption('Επιλογή 1');
    addOption('Επιλογή 2');
});

// --- Αποθήκευση, Εκτύπωση PDF, Προβολή Αποθηκευμένων ---
function saveCurrentState() {
    const state = {
        criteria: JSON.parse(JSON.stringify(criteria)),
        options: JSON.parse(JSON.stringify(options)),
        date: new Date().toLocaleString()
    };
    let saved = JSON.parse(localStorage.getItem('mcda_saved') || '[]');
    saved.push(state);
    localStorage.setItem('mcda_saved', JSON.stringify(saved));
    alert('Η τρέχουσα κατάσταση αποθηκεύτηκε!');
}

function printAsPDF() {
    window.print();
}

function showSavedStates() {
    let saved = JSON.parse(localStorage.getItem('mcda_saved') || '[]');
    if (saved.length === 0) {
        alert('Δεν υπάρχουν αποθηκευμένες καταστάσεις.');
        return;
    }
    let html = '<h3>Αποθηκευμένες Καταστάσεις</h3>';
    html += '<ul style="padding-left:18px;">';
    saved.forEach((s, idx) => {
        html += `<li><b>${s.date}</b> <button onclick="loadSavedState(${idx})">Φόρτωση</button></li>`;
    });
    html += '</ul>';
    const win = window.open('', '', 'width=500,height=600');
    win.document.write('<html><head><title>Αποθηκευμένες Καταστάσεις</title></head><body>' + html + '</body></html>');
    win.loadSavedState = function(idx) {
        window.loadSavedState(idx);
        win.close();
    };
}

window.loadSavedState = function(idx) {
    let saved = JSON.parse(localStorage.getItem('mcda_saved') || '[]');
    if (!saved[idx]) return;
    criteria = JSON.parse(JSON.stringify(saved[idx].criteria));
    options = JSON.parse(JSON.stringify(saved[idx].options));
    renderCriteria();
    renderOptions();
    calculateScores();
}
