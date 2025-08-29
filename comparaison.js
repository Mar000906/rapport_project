// comparaison.js - Comparaison des données avec Plotly

(function(){
  const data = window.REPORT_DATA || {};
  const rows = data.rows || [];
  const cols = data.columns || [];

  const selectMonth = document.getElementById('selectMonthCompare');

  // Remplir la liste des mois (unique)
  const monthList = Array.from(new Set(rows.map(r=>r[cols[0]])));
  monthList.forEach(m=>{
    const opt = document.createElement('option');
    opt.value = m;
    opt.text = m;
    selectMonth.appendChild(opt);
  });

  function prepareSeries(filteredRows){
    const x = filteredRows.map(r=>r[cols[0]]);
    const series = {};
    cols.slice(1).forEach(c=>{
      series[c] = filteredRows.map(r=>Number(r[c]??0));
    });
    return {x, series};
  }

  function drawChart(filteredRows){
    const {x, series} = prepareSeries(filteredRows);
    const traces = [];

    if(document.getElementById('toggleVentes').checked && series['Ventes']){
      traces.push({
        x, y: series['Ventes'], mode:'lines+markers', name:'Ventes',
        line:{shape:'spline', width:3, color:'#7c3aed'}
      });
    }
    if(document.getElementById('toggleDepenses').checked && series['Depenses']){
      traces.push({
        x, y: series['Depenses'], mode:'lines+markers', name:'Dépenses',
        line:{dash:'dot', width:3, color:'#06b6d4'}
      });
    }
    if(document.getElementById('toggleBenefice').checked && series['Benefice']){
      traces.push({
        x, y: series['Benefice'], mode:'lines+markers', name:'Bénéfice',
        line:{width:3, color:'#f59e0b'}
      });
    }

    const layout = {
      margin:{t:30,r:20,l:40,b:60},
      hovermode:'closest',
      legend:{orientation:'h', x:0, y:1.12, font:{size:12}},
      paper_bgcolor:'rgba(0,0,0,0)',
      plot_bgcolor:'rgba(255,255,255,0.02)',
      xaxis:{tickangle:-45, showgrid:true, gridcolor:'rgba(255,255,255,0.1)'},
      yaxis:{showgrid:true, gridcolor:'rgba(255,255,255,0.1)'},
      transition:{duration:500, easing:'cubic-in-out'}
    };

    Plotly.newPlot('chartCompare', traces, layout, {responsive:true, displayModeBar:true});
  }

  // Initial chart render
  drawChart(rows);

  // Event listeners
  document.getElementById('refreshCompare').addEventListener('click', ()=>{
    const selectedMonths = Array.from(selectMonth.selectedOptions).map(opt=>opt.value);
    const filtered = selectedMonths.length>0 ? rows.filter(r=>selectedMonths.includes(r[cols[0]])) : rows;
    drawChart(filtered);
  });

  ['toggleVentes','toggleDepenses','toggleBenefice'].forEach(id=>{
    document.getElementById(id).addEventListener('change', ()=>{
      const selectedMonths = Array.from(selectMonth.selectedOptions).map(opt=>opt.value);
      const filtered = selectedMonths.length>0 ? rows.filter(r=>selectedMonths.includes(r[cols[0]])) : rows;
      drawChart(filtered);
    });
  });
})();
