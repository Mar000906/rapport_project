// historique.js - tableau historique interactif

(function(){
  const data = window.REPORT_DATA || {};
  const rows = data.rows || [];
  const cols = data.columns || [];

  const selectMonth = document.getElementById('selectMonth');
  const selectType = document.getElementById('selectType');

  // Remplir le select des mois
  const uniqueMonths = Array.from(new Set(rows.map(r => r['Mois'])));
  uniqueMonths.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m; opt.text = m;
    selectMonth.appendChild(opt);
  });

  function buildTable(filteredRows, type='all'){
    const wrap = document.getElementById('tableWrap');
    if(!filteredRows || filteredRows.length===0){
      wrap.innerHTML = '<div style="padding:12px;color:#334">Aucune donnée</div>';
      return;
    }

    let html = '<table><thead><tr>';
    cols.forEach(c => {
      if(type==='all' || c===type || c==='Mois') html += `<th>${c}</th>`;
    });
    html += '</tr></thead><tbody>';

    filteredRows.forEach(r => {
      html += '<tr>';
      cols.forEach(c => {
        if(type==='all' || c===type || c==='Mois'){
          let val = r[c];
          if(typeof val==='number') val = val.toLocaleString();
          const bgColor = (c==='Benefice') ? (r[c]>=0 ? '#ecfdf5' : '#fee2e2') : '';
          html += `<td style="background:${bgColor}">${val}</td>`;
        }
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    wrap.innerHTML = html;
  }

  function filterAndRender(){
    const month = selectMonth.value;
    const type = selectType.value;
    const filtered = (month==='all') ? rows : rows.filter(r=>r['Mois']===month);
    buildTable(filtered, type);
  }

  selectMonth.addEventListener('change', filterAndRender);
  selectType.addEventListener('change', filterAndRender);

  // Initial render : afficher tout l'historique complet
  buildTable(rows);

  // Export / Print
  document.getElementById('exportPdf').addEventListener('click', ()=>window.print());

})();
