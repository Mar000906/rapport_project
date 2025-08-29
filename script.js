// script.js - version améliorée avec animations et coloration

(function(){
  const data = window.REPORT_DATA || {};
  const rows = data.rows || [];
  const cols = data.columns || [];
  const tot = data.totaux || {};

  // Afficher totaux avec animation compteur et couleur selon valeur
  function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      obj.innerText = value.toLocaleString();

      // couleur dynamique pour bénéfice
      if(id === 'totalBenefice'){
        obj.style.color = value >= 0 ? '#16a34a' : '#dc2626';
      }

      if(progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }

  animateValue('totalVentes', 0, tot.TotalVentes || 0, 800);
  animateValue('totalDepenses', 0, tot.TotalDepenses || 0, 800);
  animateValue('totalBenefice', 0, tot.TotalBenefice || 0, 800);

  // Remplir select months
  const selectMonth = document.getElementById('selectMonth');
  const monthList = rows.map(r => r[cols[0]]);
  const uniqueMonths = Array.from(new Set(monthList));
  uniqueMonths.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m; opt.text = m;
    selectMonth.appendChild(opt);
  });

  // Build table avec fade-in et coloration des lignes selon bénéfice
  function buildTable(filteredRows){
    const wrap = document.getElementById('tableWrap');
    if(!filteredRows || filteredRows.length === 0){
      wrap.innerHTML = '<div style="padding:12px;color:#334">Aucune donnée</div>';
      wrap.style.opacity = 0;
      setTimeout(() => { wrap.style.transition = "opacity 0.5s ease"; wrap.style.opacity = 1; }, 50);
      return;
    }
    let html = '<table><thead><tr>';
    cols.forEach(c => html += `<th>${c}</th>`);
    html += '</tr></thead><tbody>';
    filteredRows.forEach(r => {
      const benef = Number(r['Benefice'] ?? 0);
      const bgColor = benef > 0 ? '#ecfdf5' : '#fee2e2'; // vert clair / rouge clair
      html += `<tr style="background:${bgColor}">`;
      cols.forEach(c => {
        let cell = r[c];
        if(typeof cell === 'number') cell = Number(cell).toLocaleString();
        html += `<td>${cell ?? ''}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    wrap.innerHTML = html;

    // fade-in animation
    wrap.style.opacity = 0;
    setTimeout(() => { wrap.style.transition = "opacity 0.5s ease"; wrap.style.opacity = 1; }, 50);
  }

  // Prepare series for chart
  function prepareSeries(filteredRows){
    const x = filteredRows.map(r => r[cols[0]]);
    const series = {};
    cols.slice(1).forEach(c => {
      series[c] = filteredRows.map(r => Number(r[c] ?? 0));
    });
    return { x, series };
  }

  // Draw Plotly chart avec fade-in
  function drawChart(filteredRows){
    const { x, series } = prepareSeries(filteredRows);
    const traces = [];
    if(document.getElementById('toggleVentes').checked && series['Ventes']){
      traces.push({
        x, y: series['Ventes'], mode: 'lines+markers', name: 'Ventes', fill: 'tonexty',
        hoverinfo: 'x+y', line: {shape:'spline', width:3, color:'#7c3aed'}
      });
    }
    if(document.getElementById('toggleDepenses').checked && series['Depenses']){
      traces.push({
        x, y: series['Depenses'], mode: 'lines+markers', name: 'Dépenses', line: {dash:'dot', width:3, color:'#06b6d4'}
      });
    }
    if(document.getElementById('toggleBenefice').checked && series['Benefice']){
      traces.push({
        x, y: series['Benefice'], mode: 'lines+markers', name: 'Bénéfice', line: {width:3, color:'#f59e0b'}
      });
    }

    const layout = {
      margin: {t:30, r:20, l:40, b:60},
      hovermode: 'closest',
      legend: {orientation: 'h', x:0, y:1.12, font:{size:12}},
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(255,255,255,0.02)',
      xaxis: {tickangle: -45, showgrid:true, gridcolor:'rgba(255,255,255,0.1)'},
      yaxis: {showgrid:true, gridcolor:'rgba(255,255,255,0.1)'},
      transition: {duration:500, easing:'cubic-in-out'}
    };

    Plotly.newPlot('chart', traces, layout, {responsive:true, displayModeBar:true});

    // fade-in animation for chart
    const chartDiv = document.getElementById('chart');
    chartDiv.style.opacity = 0;
    setTimeout(() => { chartDiv.style.transition = "opacity 0.5s ease"; chartDiv.style.opacity = 1; }, 50);
  }

  // initial render
  buildTable(rows);
  drawChart(rows);

  // Controls: toggles + select + refresh
  document.getElementById('refresh').addEventListener('click', function(){
    const selected = selectMonth.value;
    const filtered = (selected === 'all') ? rows : rows.filter(r => r[cols[0]] === selected);

    // animate totals
    const totFiltered = {TotalVentes:0, TotalDepenses:0, TotalBenefice:0};
    filtered.forEach(r => {
      totFiltered.TotalVentes += Number(r['Ventes'] ?? 0);
      totFiltered.TotalDepenses += Number(r['Depenses'] ?? 0);
      totFiltered.TotalBenefice += Number(r['Benefice'] ?? 0);
    });
    animateValue('totalVentes', 0, totFiltered.TotalVentes, 800);
    animateValue('totalDepenses', 0, totFiltered.TotalDepenses, 800);
    animateValue('totalBenefice', 0, totFiltered.TotalBenefice, 800);

    buildTable(filtered);
    drawChart(filtered);
  });

  ['toggleVentes','toggleDepenses','toggleBenefice'].forEach(id=>{
    document.getElementById(id).addEventListener('change', () => {
      const selected = selectMonth.value;
      const filtered = (selected === 'all') ? rows : rows.filter(r => r[cols[0]] === selected);
      drawChart(filtered);
    });
  });

  // Export / Print
  document.getElementById('exportPdf').addEventListener('click', () => {
    window.print();
  });

  // Quick tooltip for chart: click a point -> show row in table
  const chartDiv = document.getElementById('chart');
  chartDiv.on('plotly_click', function(data){
    const point = data.points && data.points[0];
    if(point){
      const month = point.x;
      selectMonth.value = month;
      document.getElementById('refresh').click();
      setTimeout(()=> {
        const rowsDOM = document.querySelectorAll('#tableWrap tbody tr');
        for(let r of rowsDOM){
          r.style.background = '';
          if(r.children[0].innerText.trim() === month){
            r.style.background = 'linear-gradient(90deg,#fff6cc,#fff)';
            r.scrollIntoView({behavior:'smooth', block:'center'});
          }
        }
      }, 200);
    }
  });

})();
