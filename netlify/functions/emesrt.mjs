
import { NetlifyFunctions } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const SOURCES = [
  // GOVERNMENT MANDATES
  {
    jurisdiction: 'South Africa (national)',
    country: 'South Africa',
    category: 'Government mandate',
    level: '9',
    year: 2022,
    vehicles: 'Trackless Mobile Machinery (mining machines)',
    doc: 'DMRE – Chapter 8 MHSA Regulations (Level 9 vehicle intervention) – gazetted 21 Dec 2022',
    source: 'https://im-mining.com/2023/01/11/south-africas-dmre-puts-level-9-vehicle-intervention-for-collision-avoidance-in-mining-into-law/',
    notes: 'Mandates automatic intervention (slow-down/stop) when no action is taken to prevent potential collision, for underground and surface diesel-powered TMMs.'
  },
  // SUB-NATIONAL GUIDANCE (AUSTRALIA)
  {
    jurisdiction: 'Queensland (state)',
    country: 'Australia',
    category: 'Sub-national guidance',
    level: '7–9 (guidance)',
    year: 2024,
    vehicles: 'Light vehicles & mining machines',
    doc: 'RSHQ Guidance Note QGN 27 – Collision Prevention (Rev. Apr 2024)',
    source: 'https://www.rshq.qld.gov.au/__data/assets/pdf_file/0007/1346821/qld-guidance-note-27.pdf',
    notes: 'Covers traffic management systems and collision avoidance technologies; not a Recognised Standard – advisory guidance only.'
  },
  {
    jurisdiction: 'New South Wales (state)',
    country: 'Australia',
    category: 'Sub-national guidance',
    level: '7–9 (guidance)',
    year: 2014,
    vehicles: 'Light vehicles & mining machines',
    doc: 'MDG 2007 – Guideline for selection & implementation of collision management systems',
    source: 'https://www.resources.nsw.gov.au/sites/default/files/documents/mdg-2007-guideline-for-the-selection-and-implementation-of-collision-management-systems-for-mining-2014.pdf',
    notes: 'Foundational guideline for collision management systems.
           See also NSW Resources Regulator compliance priority report (2022) and 2023 discussion paper on vehicle interaction controls.'
  },
  {
    jurisdiction: 'New South Wales (state) – discussion & compliance',
    country: 'Australia',
    category: 'Sub-national guidance',
    level: '7–9 (discussion/guidance)',
    year: 2022,
    vehicles: 'Light vehicles & mining machines',
    doc: 'Compliance priority report – Proximity awareness & collision avoidance (Open Cut Coal)',
    source: 'https://www.resources.nsw.gov.au/sites/default/files/2022-07/Compliance-priorities-report-proximity-awareness-and-collision-avoidance.pdf',
    notes: 'Regulator insights and recommendations; complements MDG 2007 and later discussion paper (2023).'    
  },
  // INDUSTRY FRAMEWORKS
  {
    jurisdiction: 'EMESRT – Vehicle Interaction 9-Layers of Defence',
    country: '—',
    category: 'Industry framework',
    level: '7/8/9 – definitions',
    year: 2025,
    vehicles: 'Light vehicles & mining machines',
    doc: 'EMESRT Vehicle Interaction 9-Layers of Defence Guide (2025)',
    source: 'https://www.emesrt.org/wp-content/uploads/EMESRT_VI_9-LayersOfDefenceGuide.pdf',
    notes: 'Defines levels: L7 Operator awareness; L8 Advisory; L9 Machine intervention.'
  },
  {
    jurisdiction: 'ICMM x EMESRT – Leading Sites / ICSV',
    country: '—',
    category: 'Industry framework',
    level: 'Availability of collision avoidance by 2025 (program goal)',
    year: 2024,
    vehicles: 'Light vehicles & mining machines',
    doc: 'Vehicle Interaction Leading Sites Program (ICMM × EMESRT) – April 2024',
    source: 'https://www.emesrt.org/wp-content/uploads/20240322_ICMM_PrinciplesSuccessFactors.pdf',
    notes: 'Industry partnership to accelerate VI control effectiveness; part of ICMM ICSV initiative.'
  }
];

const EXTRA_NOTES = [
  // NSW discussion paper (linked in notes)
  {
    jurisdiction: 'New South Wales (state) – discussion paper',
    country: 'Australia',
    category: 'Sub-national guidance',
    level: '7–9 (discussion)',
    year: 2023,
    vehicles: 'Light vehicles & mining machines',
    doc: 'Discussion paper: Vehicle interaction controls in NSW mines (July 2023)',
    source: 'https://www.resources.nsw.gov.au/sites/default/files/2023-07/discussion-paper-vehicle-interaction-controls-in-nsw-mines.pdf',
    notes: 'Explores pathways to enhance vehicle interaction controls across NSW mines.'
  }
];

function toCSV(items){
  const header = ['jurisdiction','country','category','level','vehicles','year','doc','source'];
  const lines = [header.join(',')];
  for(const r of items){
    const row = header.map(k=>`"${String(r[k]??'').replaceAll('"','""')}"`).join(',');
    lines.push(row);
  }
  return lines.join('
');
}

function filterItems(items, q){
  return items.filter(r=>{
    if(r.category === 'Government mandate' && q.mandates !== '1') return false;
    if(r.category === 'Sub-national guidance' && q.subnational !== '1') return false;
    if(r.category === 'Industry framework' && q.frameworks !== '1') return false;
    return true;
  });
}

async function collect(){
  // In a real-world extension, you could fetch each source and verify availability/status.
  // Here we return curated, citable facts with URLs for human verification.
  return [...SOURCES, ...EXTRA_NOTES];
}

export const handler = async (event, context) => {
  try {
    const q = Object.fromEntries(new URLSearchParams(event.rawQuery || ''));
    const useCached = q.cached !== '0';
    const store = getStore({ name: 'emesrt-l7l8l9' });
    const blobKey = 'dataset.json';
    const changeKey = 'changelog.txt';

    let items;
    let generated;
    let changelog = '';

    if(useCached){
      const cached = await store.get(blobKey, { type: 'json' });
      if(cached && cached.items){
        items = cached.items;
        generated = cached.generated;
      }
      const ch = await store.get(changeKey, { type: 'text' });
      if(ch) changelog = ch;
    }

    if(!items){
      items = await collect();
      generated = new Date().toISOString();
    }

    const filtered = filterItems(items, {
      mandates: q.mandates || '1',
      subnational: q.subnational || '1',
      frameworks: q.frameworks || '1'
    });

    if((q.format||'json').toLowerCase() === 'csv'){
      const csv = toCSV(filtered);
      return {
        statusCode: 200,
        headers: { 'content-type': 'text/csv; charset=utf-8', 'cache-control': 'no-store' },
        body: csv
      };
    }

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
      body: JSON.stringify({ generated, rows: filtered.length, items: filtered, changelog })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
