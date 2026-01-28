
import { getStore } from '@netlify/blobs';

// Reuse the same curated set from emesrt.mjs by simple duplication to keep functions independent.
const SOURCES = [
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
  {
    jurisdiction: 'Queensland (state)',
    country: 'Australia',
    category: 'Sub-national guidance',
    level: '7–9 (guidance)',
    year: 2024,
    vehicles: 'Light vehicles & mining machines',
    doc: 'RSHQ Guidance Note QGN 27 – Collision Prevention (Rev. Apr 2024)',
    source: 'https://www.rshq.qld.gov.au/__data/assets/pdf_file/0007/1346821/qld-guidance-note-27.pdf',
    notes: 'Advisory guidance covering traffic management systems and collision avoidance technologies.'
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
    notes: 'Foundational guideline; see also NSW compliance report (2022) and discussion paper (2023).'
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
    notes: 'Regulator insights and recommendations; complements MDG 2007 and 2023 discussion paper.'
  },
  {
    jurisdiction: 'EMESRT – Vehicle Interaction 9-Layers of Defence',
    country: '—',
    category: 'Industry framework',
    level: '7/8/9 – definitions',
    year: 2025,
    vehicles: 'Light vehicles & mining machines',
    doc: 'EMESRT Vehicle Interaction 9-Layers of Defence Guide (2025)',
    source: 'https://www.emesrt.org/wp-content/uploads/EMESRT_VI_9-LayersOfDefenceGuide.pdf',
    notes: 'Defines L7/L8/L9.'
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
    notes: 'Industry partnership for VI control improvement.'
  }
];

function diff(oldItems, newItems){
  const key = r=>`${r.jurisdiction}|${r.doc}|${r.source}`;
  const oldSet = new Set((oldItems||[]).map(key));
  const newSet = new Set((newItems||[]).map(key));
  const added = [...newSet].filter(k=>!oldSet.has(k));
  const removed = [...oldSet].filter(k=>!newSet.has(k));
  return {added, removed};
}

export const handler = async () => {
  const store = getStore({ name: 'emesrt-l7l8l9' });
  const blobKey = 'dataset.json';
  const changeKey = 'changelog.txt';

  const existing = await store.get(blobKey, { type: 'json' });
  const items = SOURCES; // would be dynamic fetches in an extended version
  const generated = new Date().toISOString();

  await store.set(blobKey, { items, generated }, {
    metadata: { contentType: 'application/json' }
  });

  const {added, removed} = diff(existing?.items, items);
  let line = `${generated} — refreshed. Added: ${added.length}, Removed: ${removed.length}`;
  if(added.length){ line += `
  + ${added.join('
  + ')}`; }
  if(removed.length){ line += `
  - ${removed.join('
  - ')}`; }
  line += '
';

  const prev = await store.get(changeKey, { type: 'text' });
  const next = (prev? prev + '
' : '') + line;
  await store.set(changeKey, next, { metadata: { contentType: 'text/plain' }});

  return { statusCode: 200, body: JSON.stringify({ ok: true, generated, items: items.length }) };
};
