/* ===== 샘플 데이터 ===== */

const materials = [
  { code: 'H101', name: 'H-Polymer 1000cSt',  cat: 'H-Polymer',  sup: 'Dow',       price: 12500, stock: 320, status: 'active'   },
  { code: 'H102', name: 'H-Polymer 5000cSt',  cat: 'H-Polymer',  sup: 'Dow',       price: 14800, stock: 180, status: 'active'   },
  { code: 'H103', name: 'H-Polymer 10000cSt', cat: 'H-Polymer',  sup: 'Wacker',    price: 17200, stock:  65, status: 'active'   },
  { code: 'V201', name: 'Vi-Polymer 100K',    cat: 'Vi-Polymer', sup: 'Shin-Etsu', price: 22000, stock:  95, status: 'active'   },
  { code: 'V202', name: 'Vi-Polymer 500K',    cat: 'Vi-Polymer', sup: 'Shin-Etsu', price: 28500, stock:  40, status: 'active'   },
  { code: 'C301', name: 'Pt Catalyst 2%',     cat: 'Catalyst',   sup: 'Wacker',    price: 98000, stock:  12, status: 'warn'     },
  { code: 'C302', name: 'Pt Catalyst 5%',     cat: 'Catalyst',   sup: 'Wacker',    price:142000, stock:   8, status: 'warn'     },
  { code: 'B401', name: 'Base Oil M50',       cat: 'Base Oil',   sup: 'KCC',       price:  3800, stock: 540, status: 'active'   },
  { code: 'B402', name: 'Base Oil M350',      cat: 'Base Oil',   sup: 'KCC',       price:  4500, stock: 280, status: 'active'   },
  { code: 'A501', name: 'Additive AD-01',     cat: 'Additive',   sup: 'Momentive', price:  8200, stock:   0, status: 'inactive' },
  { code: 'A502', name: 'Additive AD-07',     cat: 'Additive',   sup: 'Momentive', price:  9600, stock: 120, status: 'active'   },
  { code: 'R601', name: 'Retarder RT-1',      cat: 'Retarder',   sup: 'Dow',       price: 15400, stock:  45, status: 'active'   },
];

const products = [
  { code: 'P001', name: 'KCC SilFlex 200',    cat: 'Silicone', spec: '20kg/box',  price:  45000, status: 'active'   },
  { code: 'P002', name: 'KCC SilFlex 500',    cat: 'Silicone', spec: '20kg/box',  price:  58000, status: 'active'   },
  { code: 'P003', name: 'KCC SilFlex 1000',   cat: 'Silicone', spec: '20kg/box',  price:  72000, status: 'active'   },
  { code: 'P101', name: 'UltraCoat 3000',     cat: 'Paint',    spec: '18L',       price: 128000, status: 'active'   },
  { code: 'P102', name: 'UltraCoat 5000',     cat: 'Paint',    spec: '18L',       price: 165000, status: 'active'   },
  { code: 'P201', name: 'BondMax Pro',        cat: 'Adhesive', spec: '300ml',     price:  12800, status: 'warn'     },
  { code: 'P202', name: 'BondMax Industrial', cat: 'Adhesive', spec: '5kg/can',   price:  89000, status: 'inactive' },
];

const partners = [
  { code: 'S001', name: 'Dow Korea',         type: 'Supplier', biz: '123-45-67890', pic: 'Younghoon Kim', status: 'active' },
  { code: 'S002', name: 'Shin-Etsu Korea',   type: 'Supplier', biz: '234-56-78901', pic: 'Jimin Park',    status: 'active' },
  { code: 'S003', name: 'Wacker Chemicals',  type: 'Supplier', biz: '345-67-89012', pic: 'James L.',      status: 'active' },
  { code: 'S004', name: 'Momentive Korea',   type: 'Supplier', biz: '456-78-90123', pic: 'Seoyeon Lee',   status: 'active' },
  { code: 'C001', name: 'Hyundai Motor',     type: 'Customer', biz: '101-81-12345', pic: 'Suhyun Lee',    status: 'active' },
  { code: 'C002', name: 'LG Electronics',    type: 'Customer', biz: '107-86-12345', pic: 'Minjae Choi',   status: 'active' },
  { code: 'C003', name: 'Samsung SDI',       type: 'Customer', biz: '108-87-23456', pic: 'Jihoon Han',    status: 'active' },
  { code: 'P001', name: 'Samjin Logistics',  type: 'Partner',  biz: '321-45-67890', pic: 'Yujin Jeong',   status: 'warn'   },
];

/* ===== MR (Material Request) 샘플 데이터 =====
 * 각 상태별 (총 53건)
 * - approved   : 24건  (currentNode 불필요 — status로 전부 done 처리)
 * - inprogress : 24건  (currentNode = 현재 처리 중인 워크플로우 노드)
 * - rejected   : 5건   (currentNode = 거절된 노드)
 *
 * Steps     : Raw Material / Packaging / Finished Goods / Semi-Finished
 * Subtypes  : new / plant / packing / reactivation
 */
const mrList = [
  /* ---------- APPROVED (24건) ---------- */
  { id:'MR-1022501', desc:'DESC-L-054/DRUM/254KG', step:'Finished Goods', sub:'new',          status:'approved', person:'Jongho Lee',       date:'Nov 05, 2025' },
  { id:'MR-1022503', desc:'POL-Y-018/BAG/25KG',    step:'Raw Material',      sub:'plant',        status:'approved', person:'Hunhui Cho',       date:'Nov 08, 2025' },
  { id:'MR-1022507', desc:'ACID-K-300/DRUM/200KG', step:'Packaging',         sub:'packing',      status:'approved', person:'Elena Rodriguez',  date:'Nov 12, 2025' },
  { id:'MR-1022510', desc:'SOLV-S-900/TANK/5000L', step:'Semi-Finished',     sub:'new',          status:'approved', person:'Changmoo Jeong',    date:'Nov 18, 2025' },
  { id:'MR-1022514', desc:'CHEM-X-101/IBC/1000L',  step:'Finished Goods', sub:'reactivation', status:'approved', person:'Daniel Park',      date:'Nov 22, 2025' },
  { id:'MR-1022518', desc:'POL-Y-022/BAG/25KG',    step:'Raw Material',      sub:'new',          status:'approved', person:'Changmoo Jeong',    date:'Nov 28, 2025' },
  { id:'MR-1022521', desc:'DESC-L-061/DRUM/254KG', step:'Packaging',         sub:'plant',        status:'approved', person:'Sophia Chen',      date:'Dec 02, 2025' },
  { id:'MR-1022524', desc:'ACID-K-302/DRUM/200KG', step:'Finished Goods', sub:'new',          status:'approved',  person:'Hunhui Cho',       date:'Dec 05, 2025' },
  { id:'MR-1022528', desc:'SOLV-S-905/TANK/5000L', step:'Semi-Finished',     sub:'packing',      status:'approved', person:'Elena Rodriguez',  date:'Dec 10, 2025' },
  { id:'MR-1022532', desc:'POL-Y-024/BAG/25KG',    step:'Raw Material',      sub:'plant',        status:'approved', person:'Changmoo Jeong',    date:'Dec 15, 2025' },
  { id:'MR-1022536', desc:'CHEM-X-108/IBC/1000L',  step:'Packaging',         sub:'new',          status:'approved', person:'Jongho Lee',       date:'Dec 18, 2025' },
  { id:'MR-1022539', desc:'DESC-L-058/DRUM/254KG', step:'Finished Goods', sub:'plant',        status:'approved',  person:'Changmoo Jeong',    date:'Dec 22, 2025' },
  { id:'MR-1022542', desc:'ACID-K-305/DRUM/200KG', step:'Semi-Finished',     sub:'reactivation', status:'approved', person:'Sophia Chen',      date:'Dec 24, 2025' },
  { id:'MR-1022545', desc:'POL-Y-026/BAG/25KG',    step:'Raw Material',      sub:'packing',      status:'approved',  person:'Hunhui Cho',       date:'Dec 28, 2025' },
  { id:'MR-1022548', desc:'SOLV-S-908/TANK/5000L', step:'Packaging',         sub:'new',          status:'approved', person:'Elena Rodriguez',  date:'Jan 02, 2026' },
  { id:'MR-1022551', desc:'CHEM-X-112/IBC/1000L',  step:'Finished Goods', sub:'plant',        status:'approved',  person:'Changmoo Jeong',    date:'Jan 06, 2026' },
  { id:'MR-1022555', desc:'DESC-L-064/DRUM/254KG', step:'Semi-Finished',     sub:'new',          status:'approved', person:'Daniel Park',      date:'Jan 09, 2026' },
  { id:'MR-1022559', desc:'ACID-K-308/DRUM/200KG', step:'Raw Material',      sub:'reactivation', status:'approved', person:'Sophia Chen',      date:'Jan 13, 2026' },
  { id:'MR-1022563', desc:'POL-Y-029/BAG/25KG',    step:'Packaging',         sub:'packing',      status:'approved',  person:'Hunhui Cho',       date:'Jan 17, 2026' },
  { id:'MR-1022567', desc:'SOLV-S-911/TANK/5000L', step:'Finished Goods', sub:'new',          status:'approved', person:'Changmoo Jeong',    date:'Jan 21, 2026' },
  { id:'MR-1022571', desc:'CHEM-X-115/IBC/1000L',  step:'Semi-Finished',     sub:'plant',        status:'approved', person:'Jongho Lee',       date:'Jan 25, 2026' },
  { id:'MR-1022575', desc:'DESC-L-067/DRUM/254KG', step:'Raw Material',      sub:'new',          status:'approved',  person:'Daniel Park',      date:'Jan 29, 2026' },
  { id:'MR-1022579', desc:'ACID-K-311/DRUM/200KG', step:'Packaging',         sub:'reactivation', status:'approved', person:'Sophia Chen',      date:'Feb 02, 2026' },
  { id:'MR-1022583', desc:'POL-Y-031/BAG/25KG',    step:'Finished Goods', sub:'packing',      status:'approved',  person:'Changmoo Jeong',    date:'Feb 06, 2026' },

  /* ---------- IN PROGRESS (24건) ---------- */
  { id:'MR-1022612', desc:'POL-Y-022/BAG/25KG',    step:'Finished Goods', sub:'packing',      status:'inprogress',  person:'Hunhui Cho',       date:'Jan 05, 2026', currentNode:'Quality' },
  { id:'MR-1022614', desc:'DESC-L-054/DRUM/254KG', step:'Raw Material',      sub:'new',          status:'inprogress',  person:'Elena Rodriguez',  date:'Jan 15, 2026', currentNode:'Quality' },
  { id:'MR-1022618', desc:'SOLV-S-900/TANK/5000L', step:'Packaging',         sub:'new',          status:'inprogress',  person:'Changmoo Jeong',    date:'Feb 03, 2026', currentNode:'Quality' },
  { id:'MR-1022622', desc:'ACID-K-300/DRUM/200KG', step:'Packaging',         sub:'packing',      status:'inprogress',  person:'Changmoo Jeong',    date:'Feb 15, 2026', currentNode:'Quality' },
  { id:'MR-1022631', desc:'CHEM-X-103/IBC/1000L',  step:'Finished Goods', sub:'plant',        status:'inprogress',  person:'Daniel Park',      date:'Feb 18, 2026', currentNode:'Product Management' },
  { id:'MR-1022634', desc:'POL-Y-027/BAG/25KG',    step:'Semi-Finished',     sub:'reactivation', status:'inprogress',  person:'Sophia Chen',      date:'Feb 20, 2026', currentNode:'Product Management' },
  { id:'MR-1022637', desc:'DESC-L-055/DRUM/254KG', step:'Raw Material',      sub:'plant',        status:'inprogress',  person:'Hunhui Cho',       date:'Feb 22, 2026', currentNode:'Sourcing' },
  { id:'MR-1022641', desc:'ACID-K-303/DRUM/200KG', step:'Packaging',         sub:'reactivation', status:'inprogress',  person:'Elena Rodriguez',  date:'Feb 24, 2026', currentNode:'Sourcing' },
  { id:'MR-1022644', desc:'SOLV-S-902/TANK/5000L', step:'Finished Goods', sub:'new',          status:'inprogress',  person:'Jongho Lee',       date:'Feb 26, 2026', currentNode:'Sourcing' },
  { id:'MR-1022647', desc:'CHEM-X-105/IBC/1000L',  step:'Semi-Finished',     sub:'packing',      status:'inprogress',  person:'Daniel Park',      date:'Feb 28, 2026', currentNode:'Supply Chain' },
  { id:'MR-1022650', desc:'POL-Y-030/BAG/25KG',    step:'Raw Material',      sub:'new',          status:'inprogress',  person:'Sophia Chen',      date:'Mar 02, 2026', currentNode:'Supply Chain' },
  { id:'MR-1022653', desc:'DESC-L-059/DRUM/254KG', step:'Packaging',         sub:'plant',        status:'inprogress',  person:'Hunhui Cho',       date:'Mar 04, 2026', currentNode:'Customs(GTC)' },
  { id:'MR-1022656', desc:'ACID-K-306/DRUM/200KG', step:'Finished Goods', sub:'packing',      status:'inprogress',  person:'Elena Rodriguez',  date:'Mar 06, 2026', currentNode:'EHS' },
  { id:'MR-1022659', desc:'SOLV-S-906/TANK/5000L', step:'Semi-Finished',     sub:'new',          status:'inprogress',  person:'Changmoo Jeong',    date:'Mar 08, 2026', currentNode:'EHS' },
  { id:'MR-1022662', desc:'CHEM-X-110/IBC/1000L',  step:'Raw Material',      sub:'reactivation', status:'inprogress',  person:'Daniel Park',      date:'Mar 10, 2026', currentNode:'EHS' },
  { id:'MR-1022665', desc:'POL-Y-033/BAG/25KG',    step:'Packaging',         sub:'new',          status:'inprogress',  person:'Sophia Chen',      date:'Mar 12, 2026', currentNode:'Logistic' },
  { id:'MR-1022668', desc:'DESC-L-062/DRUM/254KG', step:'Finished Goods', sub:'reactivation', status:'inprogress',  person:'Hunhui Cho',       date:'Mar 14, 2026', currentNode:'Logistic' },
  { id:'MR-1022671', desc:'ACID-K-309/DRUM/200KG', step:'Semi-Finished',     sub:'plant',        status:'inprogress',  person:'Jongho Lee',       date:'Mar 16, 2026', currentNode:'Logistic' },
  { id:'MR-1022674', desc:'SOLV-S-913/TANK/5000L', step:'Raw Material',      sub:'packing',      status:'inprogress',  person:'Changmoo Jeong',    date:'Mar 18, 2026', currentNode:'Finance' },
  { id:'MR-1022677', desc:'CHEM-X-114/IBC/1000L',  step:'Packaging',         sub:'reactivation', status:'inprogress',  person:'Daniel Park',      date:'Mar 20, 2026', currentNode:'Finance' },
  { id:'MR-1022680', desc:'POL-Y-036/BAG/25KG',    step:'Finished Goods', sub:'plant',        status:'inprogress',  person:'Sophia Chen',      date:'Mar 22, 2026', currentNode:'Release' },
  { id:'MR-1022683', desc:'DESC-L-066/DRUM/254KG', step:'Semi-Finished',     sub:'packing',      status:'inprogress',  person:'Hunhui Cho',       date:'Mar 24, 2026', currentNode:'Release' },
  { id:'MR-1022686', desc:'ACID-K-312/DRUM/200KG', step:'Raw Material',      sub:'new',          status:'inprogress',  person:'Elena Rodriguez',  date:'Mar 26, 2026', currentNode:'Release' },
  { id:'MR-1022689', desc:'SOLV-S-918/TANK/5000L', step:'Packaging',         sub:'plant',        status:'inprogress',  person:'Jongho Lee',       date:'Mar 28, 2026', currentNode:'Request' },

  /* ---------- REJECTED (5건) ---------- */
  { id:'MR-1022613', desc:'CHEM-X-101/IBC/1000L',  step:'Finished Goods', sub:'reactivation', status:'rejected',  person:'Jongho Lee',       date:'Jan 10, 2026', currentNode:'Quality' },
  { id:'MR-1022619', desc:'POL-Y-022/BAG/25KG',    step:'Packaging',         sub:'reactivation', status:'rejected',  person:'Hunhui Cho',       date:'Feb 05, 2026', currentNode:'Sourcing' },
  { id:'MR-1022625', desc:'SOLV-S-900/TANK/5000L', step:'Semi-Finished',     sub:'new',          status:'rejected',   person:'Changmoo Jeong',    date:'Feb 22, 2026', currentNode:'Customs(GTC)' },
  { id:'MR-1022702', desc:'DESC-L-070/DRUM/254KG', step:'Raw Material',      sub:'new',          status:'rejected',  person:'Daniel Park',      date:'Nov 15, 2025', currentNode:'EHS' },
  { id:'MR-1022705', desc:'ACID-K-315/DRUM/200KG', step:'Packaging',         sub:'plant',        status:'rejected',  person:'Sophia Chen',      date:'Nov 21, 2025', currentNode:'Finance' },
];

/* ===== Process Flow =====
 * Raw Material 4 sub-types (new / plant / packing / reactivation) all share
 * the same New Code Creation flow. The sub label still differentiates the
 * request reason in the list / header, but the workflow shape is unified.
 */
const newCodeCreationFlow = {
  title: 'New Code Creation',
  nodes: [
    { type:'node', label:'Request', hl: true },
    { type:'arrow' },
    { type:'row', items:['Product Management','Quality','Supply Chain','Sourcing'] },
    { type:'arrow' },
    { type:'row', items:['Customs(GTC)','EHS','Logistic'] },
    { type:'arrow' },
    { type:'node', label:'Finance' },
    { type:'arrow' },
    { type:'node', label:'Release', hl: true },
  ]
};
const processFlows = {
  'new':          newCodeCreationFlow,
  'plant':        newCodeCreationFlow,
  'packing':      newCodeCreationFlow,
  'reactivation': newCodeCreationFlow,
};

/* ===== 담당자 매핑 ===== */
const personMap = {
  'Request': { name:'Jongho Lee', date:'Feb 05, 2026' },
  'Product Manager': { name:'Douglas Ashford', date:'Mar 13, 2026' },
  'Product Management': { name:'Olivia Adams', date:'Feb 14, 2026' },
  'Quality': { name:'Lucas Foster', date:'Feb 14, 2026' },
  'Supply Chain': { name:'Mia Campbell', date:'Feb 18, 2026' },
  'Sourcing': { name:'Elliot Granville', date:'Feb 18, 2026' },
  'Customs(GTC)': { name:'James Lee', date:'Feb 25, 2026' },
  'EHS': { name:'Jongho Lee', date:'Feb 25, 2026' },
  'Logistic': { name:'Ethan Brooks', date:'Feb 27, 2026' },
  'Finance': { name:'Jongho Lee', date:'Mar 05, 2026' },
  'Release': { name:'System', date:'Mar 13, 2026' },
  'Production': { name:'Noah Kim', date:'Mar 13, 2026' },
  'Packaging': { name:'Evan Albright', date:'Feb 20, 2026' },
  'Repack': { name:'Evan Albright', date:'Feb 20, 2026' },
};

/* ===== 헬퍼 ===== */
function money(n){ return n.toLocaleString('en-US') + ' KRW'; }
function badge(status){
  const label = { active:'Active', inactive:'Inactive', warn:'Warning', danger:'Critical' }[status] || status;
  return `<span class="badge ${status}">${label}</span>`;
}
