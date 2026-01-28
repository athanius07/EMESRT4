
async function loadData(toCSV){
  const params = new URLSearchParams();
  params.set('mandates', document.getElementById('mandates').checked ? '1' : '0');
  params.set('subnational', document.getElementById('subnational').checked ? '1' : '0');
  params.set('frameworks', document.getElementById('frameworks').checked ? '1' : '0');
  params.set('cached', document.getElementById('cached').checked ? '1' : '0');
  if(toCSV){ params.set('format','csv'); window.location = '/.netlify/functions/emesrt?' + params.toString(); return; }
  const res = await fetch('/.netlify/functions/emesrt?' + params.toString());
  const data = await res.json();
  const tbody = document.getElementById('tbody');
  tbody.innerHTML = '';
  document.getElementById('generated').textContent = data.generated || '—';
  document.getElementById('rows').textContent = data.rows || data.items?.length || 0;
  if(!data.items || !data.items.length){
    tbody.innerHTML = '<tr><td colspan="7" class="nodata">No data</td></tr>';
  } else {
    for(const r of data.items){
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.jurisdiction}</td><td>${r.country}</td><td>${r.category}</td><td>${r.level}</td><td>${r.vehicles}</td><td>${r.year}</td><td><a href="${r.source}" target="_blank" rel="noopener">${r.doc}</a></td>`;
      tbody.appendChild(tr);
    }
  }
  const notesEl = document.getElementById('notes');
  notesEl.innerHTML = (data.items||[]).map(r=>`<p><b>${r.jurisdiction}</b>: ${r.notes||''} <span class="src">(<a href="${r.source}" target="_blank" rel="noopener">source</a>)</span></p>`).join('');
  document.getElementById('changelog').textContent = data.changelog || '';
}

document.getElementById('loadBtn').addEventListener('click', ()=>loadData(false));
document.getElementById('csvBtn').addEventListener('click', ()=>loadData(true));
window.addEventListener('DOMContentLoaded', ()=>loadData(false));
