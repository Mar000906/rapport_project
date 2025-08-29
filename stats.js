// stats.js - Statistiques globales et moyennes

(function(){
  const data = window.REPORT_DATA || {};
  const rows = data.rows || [];
  const cols = data.columns || [];

  function animateValue(id, start, end, duration){
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp)=>{
      if(!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp)/duration, 1);
      const value = Math.floor(progress*(end-start)+start);
      obj.innerText = value.toLocaleString();
      if(id==='statTotalBenefice'){
        obj.style.color = value>=0?'#16a34a':'#dc2626';
      }
      if(progress<1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }

  function calculateTotals(rows){
    const totals = {Ventes:0, Depenses:0, Benefice:0};
    rows.forEach(r=>{
      totals.Ventes += Number(r.Ventes || 0);
      totals.Depenses += Number(r.Depenses || 0);
      totals.Benefice += Number(r.Benefice || 0);
    });
    return totals;
  }

  function calculateAverages(rows){
    const monthMap = {};
    rows.forEach(r=>{
      const m = r.Mois;
      if(!monthMap[m]) monthMap[m] = {Ventes:0, Depenses:0, Benefice:0, count:0};
      monthMap[m].Ventes += Number(r.Ventes || 0);
      monthMap[m].Depenses += Number(r.Depenses || 0);
      monthMap[m].Benefice += Number(r.Benefice || 0);
      monthMap[m].count += 1;
    });
    const avgRows = [];
    Object.keys(monthMap).forEach(m=>{
      const val = monthMap[m];
      avgRows.push({
        Mois: m,
        Ventes: Math.round(val.Ventes/val.count),
        Depenses: Math.round(val.Depenses/val.count),
        Benefice: Math.round(val.Benefice/val.count)
      });
    });
    return avgRows.sort((a,b)=>monthOrder(a.Mois)-monthOrder(b.Mois));
  }

  function monthOrder(month){
    const order = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
    return order.indexOf(month);
  }

  function drawChart(avgRows){
    const x = avgRows.map(r=>r.Mois);
    const series = {
      Ventes: avgRows.map(r=>r.Ventes),
      Depenses: avgRows.map(r=>r.Depenses),
      Benefice: avgRows.map(r=>r.Benefice)
    };
    const traces = [];
    if(document.getElementById('toggleMoyVentes').checked) traces.push({x,y:series.Ventes,name:'Ventes',type:'bar',marker:{color:'#7c3aed'}});
    if(document.getElementById('toggleMoyDepenses').checked) traces.push({x,y:series.Depenses,name:'Dépenses',type:'bar',marker:{color:'#06b6d4'}});
    if(document.getElementById('toggleMoyBenefice').checked) traces.push({x,y:series.Benefice,name:'Bénéfice',type:'bar',marker:{color:'#f59e0b'}});
    Plotly.newPlot('chartMoyenne', traces,{
      barmode:'group',
      margin:{t:30,r:20,l:40,b:60},
      paper_bgcolor:'rgba(0,0,0,0)',
      plot_bgcolor:'rgba(255,255,255,0.02)',
      xaxis:{tickangle:-45, showgrid:true, gridcolor:'rgba(255,255,255,0.1)'},
      yaxis:{showgrid:true, gridcolor:'rgba(255,255,255,0.1)'}
    },{responsive:true, displayModeBar:true});
  }

  function renderStats(){
    const totals = calculateTotals(rows);
    animateValue('statTotalVentes',0,totals.Ventes,800);
    animateValue('statTotalDepenses',0,totals.Depenses,800);
    animateValue('statTotalBenefice',0,totals.Benefice,800);
    const avgRows = calculateAverages(rows);
    drawChart(avgRows);
  }

  renderStats();

  document.getElementById('refreshStats').addEventListener('click', renderStats);
  ['toggleMoyVentes','toggleMoyDepenses','toggleMoyBenefice'].forEach(id=>{
    document.getElementById(id).addEventListener('change', renderStats);
  });
})();
