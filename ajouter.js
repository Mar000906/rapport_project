// ajouter.js - ajouter dynamiquement des entrées

(function(){
  const data = window.REPORT_DATA || {};
  const rows = data.rows || [];
  const cols = data.columns || [];

  const form = document.getElementById('addForm');
  const wrap = document.getElementById('tableWrap');

  function buildTable(rowsToShow){
    if(!rowsToShow || rowsToShow.length===0){
      wrap.innerHTML = '<div style="padding:12px;color:#334">Aucune donnée</div>';
      return;
    }
    let html = '<table><thead><tr>';
    cols.forEach(c => html += `<th>${c}</th>`);
    html += '</tr></thead><tbody>';
    rowsToShow.forEach(r => {
      html += '<tr>';
      cols.forEach(c => {
        let val = r[c];
        if(typeof val==='number') val = val.toLocaleString();
        const bgColor = (c==='Benefice') ? (r[c]>=0 ? '#ecfdf5' : '#fee2e2') : '';
        html += `<td style="background:${bgColor}">${val}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    wrap.innerHTML = html;
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const mois = document.getElementById('inputMois').value.trim();
    const ventes = parseFloat(document.getElementById('inputVentes').value);
    const depenses = parseFloat(document.getElementById('inputDepenses').value);
    const benefice = parseFloat(document.getElementById('inputBenefice').value);

    if(!mois || isNaN(ventes) || isNaN(depenses) || isNaN(benefice)){
      alert('Veuillez remplir tous les champs correctement');
      return;
    }

    const newRow = {Mois: mois, Ventes: ventes, Depenses: depenses, Benefice: benefice};
    rows.push(newRow);
    buildTable(rows);

    // reset form
    form.reset();
    document.getElementById('inputMois').focus();
  });

  // initial render
  buildTable(rows);
})();
