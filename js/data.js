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

/* KCC FG mock — Parent FG Code 단위 (SKU variants 는 별도 master 에서 관리).
   신규 요청(Add Packing Size / Add Plant / Reactivation) 시 검색은 Parent 기준 */
const products = [
  { code: '60842', name: 'SILQUEST GAMMA-MPS SILANE', cat: 'Silane',   sku: 2, status: 'active'   },
  { code: '50820', name: 'SILQUEST A-1100 SILANE',    cat: 'Silane',   sku: 4, status: 'active'   },
  { code: '97170', name: 'SILSOFT A-1100 FLUID',      cat: 'Silane',   sku: 1, status: 'active'   },
  { code: '18800', name: 'DOWSIL Z-6020 SILANE',      cat: 'Silane',   sku: 2, status: 'active'   },
  { code: '70210', name: 'KCC SilFlex',               cat: 'Silicone', sku: 3, status: 'active'   },
  { code: '70220', name: 'UltraCoat',                 cat: 'Paint',    sku: 2, status: 'active'   },
  { code: '70230', name: 'BondMax',                   cat: 'Adhesive', sku: 2, status: 'warn'     },
  { code: '70250', name: 'KCC NeoSeal',               cat: 'Sealant',  sku: 2, status: 'active'   },
];

/* ===== Product Bank — detail page 의 productModel 동적 매핑용 풀.
   mr.id (또는 직접 진입 시 default 첫 항목) hash 로 한 항목 pick. 같은 type 의 다른 MR 들이
   이 풀 안에서 분배되어 mock 다양성 확보 ===== */
const fgProductBank = [
  {
    fullName:'SILQUEST GAMMA-MPS SILANE', spec:'GAMMA-MPS', substance:'SILQUEST',
    reasonText:'New finished good required for adhesive primer line. Customer Acme Poly qualified; composition sheet received with full BOM.',
    productTextsValue:'Mercapto-functional silane coupling agent for adhesion promotion. Formulated for ambient-cure adhesive systems. Store in cool, dry, well-ventilated area.',
    composition:[
      { cas:'4420-74-0',   chem:'3-MERCAPTOPROPYLTRIMETHOXYSILANE',           pct:75 },
      { cas:'112945-52-5', chem:'FUMED SILICA',                                pct:8 },
      { cas:'67-56-1',     chem:'METHANOL',                                    pct:5 },
      { cas:'78-10-4',     chem:'TETRAETHYL ORTHOSILICATE',                    pct:3 },
      { cas:'471-34-1',     chem:'CALCIUM CARBONATE',                          pct:2 },
      { cas:'556-67-2',    chem:'OCTAMETHYLCYCLOTETRASILOXANE',                pct:2 },
      { cas:'1185-55-3',   chem:'METHYLTRIMETHOXYSILANE',                      pct:2 },
      { cas:'128-37-0',    chem:'2,6-DI-TERT-BUTYL-P-CRESOL',                  pct:1 },
      { cas:'77-58-7',     chem:'DIBUTYLTIN DILAURATE',                        pct:1 },
      { cas:'63148-62-9',  chem:'POLYDIMETHYLSILOXANE',                        pct:1 },
    ],
    release:{
      parentCode:'60842', hsCode:'3824.99-9930', unNumber:'Non-hazardous',
      variants:[
        { packLabel:'Drum', containerCode:'DRUM', netContent:200, uom:'L',  code:'60843', packUnit:'200L Steel Drum', netGross:'16,000 / 17,800 kg', moq:'80 drums',     stdCost:'$8.50 / kg' },
        { packLabel:'Bulk', containerCode:'BULK', netContent:'',  uom:'KG', code:'60844', packUnit:'ISO Tank / IBC',  netGross:'20,000 / 24,400 kg', moq:'1 tank / 20 IBC', stdCost:'$8.20 / kg' },
      ],
    },
  },
  {
    fullName:'SILQUEST A-1100 SILANE', spec:'A-1100', substance:'SILQUEST',
    reasonText:'New finished good required for fiberglass sizing application. Customer GlassPoly qualified; technical spec sheet received.',
    productTextsValue:'Amino-functional silane coupling agent. Promotes adhesion between inorganic substrates and organic polymers. Use within 12 months of opening.',
    composition:[
      { cas:'919-30-2',    chem:'3-AMINOPROPYLTRIETHOXYSILANE (3-APTES)',     pct:80 },
      { cas:'112945-52-5', chem:'FUMED SILICA',                                pct:6 },
      { cas:'64-17-5',     chem:'ETHANOL',                                     pct:4 },
      { cas:'78-10-4',     chem:'TETRAETHYL ORTHOSILICATE',                    pct:3 },
      { cas:'471-34-1',    chem:'CALCIUM CARBONATE',                           pct:2 },
      { cas:'107-46-0',    chem:'HEXAMETHYLDISILOXANE',                        pct:2 },
      { cas:'556-67-2',    chem:'OCTAMETHYLCYCLOTETRASILOXANE',                pct:1.5 },
      { cas:'78-08-0',     chem:'VINYLTRIETHOXYSILANE',                        pct:1 },
      { cas:'128-37-0',    chem:'2,6-DI-TERT-BUTYL-P-CRESOL',                  pct:0.5 },
    ],
    release:{
      parentCode:'50820', hsCode:'2931.59-9000', unNumber:'UN 2924 · Class 3 / III',
      variants:[
        { packLabel:'Drum', containerCode:'DRUM', netContent:200,  uom:'L',  code:'50825', packUnit:'200L Steel Drum', netGross:'16,000 / 17,800 kg', moq:'80 drums', stdCost:'$9.40 / kg' },
        { packLabel:'IBC',  containerCode:'IBC',  netContent:1000, uom:'L',  code:'50826', packUnit:'IBC 1000L',         netGross:'18,000 / 21,500 kg', moq:'18 IBCs',  stdCost:'$9.20 / kg' },
        { packLabel:'Bulk', containerCode:'BULK', netContent:'',   uom:'KG', code:'50846', packUnit:'ISO Tank',           netGross:'22,000 / 26,400 kg', moq:'1 tank',   stdCost:'$9.10 / kg' },
      ],
    },
  },
  {
    fullName:'DOWSIL Z-6020 SILANE', spec:'Z-6020', substance:'DOWSIL',
    reasonText:'New finished good for primer/sealant adhesion enhancer. Diamine functional silane sourced under partnership with Dow.',
    productTextsValue:'Diamine-functional silane. Enhanced bonding to acidic substrates. Reactive with epoxy and isocyanate systems.',
    composition:[
      { cas:'1760-24-3',   chem:'N-(2-AMINOETHYL)-3-AMINOPROPYLTRIMETHOXYSILANE', pct:78 },
      { cas:'112945-52-5', chem:'FUMED SILICA',                                pct:7 },
      { cas:'67-56-1',     chem:'METHANOL',                                    pct:5 },
      { cas:'78-10-4',     chem:'TETRAETHYL ORTHOSILICATE',                    pct:3 },
      { cas:'1185-55-3',   chem:'METHYLTRIMETHOXYSILANE',                      pct:2 },
      { cas:'556-67-2',    chem:'OCTAMETHYLCYCLOTETRASILOXANE',                pct:2 },
      { cas:'471-34-1',    chem:'CALCIUM CARBONATE',                           pct:1.5 },
      { cas:'77-58-7',     chem:'DIBUTYLTIN DILAURATE',                        pct:1 },
      { cas:'128-37-0',    chem:'2,6-DI-TERT-BUTYL-P-CRESOL',                  pct:0.5 },
    ],
    release:{
      parentCode:'18800', hsCode:'3824.99-9930', unNumber:'Non-hazardous',
      variants:[
        { packLabel:'Drum', containerCode:'DRUM', netContent:200, uom:'L',  code:'18801', packUnit:'200L Steel Drum', netGross:'15,000 / 16,800 kg', moq:'75 drums', stdCost:'$11.20 / kg' },
        { packLabel:'Bulk', containerCode:'BULK', netContent:'',  uom:'KG', code:'18802', packUnit:'ISO Tank',         netGross:'20,000 / 24,400 kg', moq:'1 tank',   stdCost:'$10.80 / kg' },
      ],
    },
  },
  {
    fullName:'KCC SilFlex 200', spec:'SF-200', substance:'KCC SilFlex',
    reasonText:'New silicone sealant grade for industrial expansion joints. Targets 250% elongation at break with weather resistance.',
    productTextsValue:'Single-component RTV silicone sealant. Cures by atmospheric moisture. Excellent UV / ozone resistance for outdoor use.',
    composition:[
      { cas:'63148-62-9',  chem:'POLYDIMETHYLSILOXANE',                        pct:60 },
      { cas:'112945-52-5', chem:'FUMED SILICA',                                pct:15 },
      { cas:'471-34-1',    chem:'CALCIUM CARBONATE',                           pct:10 },
      { cas:'556-67-2',    chem:'OCTAMETHYLCYCLOTETRASILOXANE',                pct:5 },
      { cas:'78-10-4',     chem:'TETRAETHYL ORTHOSILICATE',                    pct:3 },
      { cas:'1185-55-3',   chem:'METHYLTRIMETHOXYSILANE',                      pct:2 },
      { cas:'77-58-7',     chem:'DIBUTYLTIN DILAURATE',                        pct:2 },
      { cas:'67-56-1',     chem:'METHANOL',                                    pct:1 },
      { cas:'128-37-0',    chem:'2,6-DI-TERT-BUTYL-P-CRESOL',                  pct:1 },
      { cas:'56-81-5',     chem:'GLYCEROL',                                    pct:1 },
    ],
    release:{
      parentCode:'70210', hsCode:'3214.10-1000', unNumber:'Non-hazardous',
      variants:[
        { packLabel:'Cartridge', containerCode:'CARTRIDGE', netContent:300, uom:'ml', code:'70211', packUnit:'300ml cartridge', netGross:'7,200 / 9,000 kg',   moq:'2,400 cartridges', stdCost:'$5.90 / kg' },
        { packLabel:'Pail',      containerCode:'PAIL',      netContent:20,  uom:'KG', code:'70212', packUnit:'20kg metal pail',  netGross:'18,000 / 21,000 kg', moq:'900 pails',        stdCost:'$5.40 / kg' },
        { packLabel:'Drum',      containerCode:'DRUM',      netContent:200, uom:'KG', code:'70213', packUnit:'200kg metal drum', netGross:'20,000 / 22,500 kg', moq:'100 drums',        stdCost:'$5.20 / kg' },
      ],
    },
  },
  {
    fullName:'UltraCoat 3000', spec:'UC-3000', substance:'UltraCoat',
    reasonText:'New acrylic protective coating for steel structures. Customer Hyundai Construction qualified; meets KS M ISO 12944 C5.',
    productTextsValue:'Two-component water-based acrylic topcoat. Excellent weatherability and color retention. Recommended for steel and concrete substrates.',
    composition:[
      { cas:'9003-01-4',   chem:'ACRYLIC POLYMER EMULSION',                    pct:45 },
      { cas:'13463-67-7',  chem:'TITANIUM DIOXIDE',                            pct:18 },
      { cas:'7732-18-5',   chem:'WATER',                                       pct:15 },
      { cas:'1317-65-3',   chem:'CALCIUM CARBONATE',                           pct:8 },
      { cas:'14807-96-6',  chem:'TALC',                                        pct:6 },
      { cas:'107-98-2',    chem:'PROPYLENE GLYCOL MONOMETHYL ETHER',           pct:4 },
      { cas:'77-92-9',     chem:'CITRIC ACID (pH adjuster)',                   pct:2 },
      { cas:'9003-39-8',   chem:'POLYVINYLPYRROLIDONE',                        pct:2 },
    ],
    release:{
      parentCode:'70220', hsCode:'3209.10-0000', unNumber:'Non-hazardous',
      variants:[
        { packLabel:'Pail', containerCode:'PAIL', netContent:18,  uom:'L',  code:'70221', packUnit:'18L metal pail', netGross:'14,400 / 16,800 kg', moq:'800 pails', stdCost:'$3.20 / L' },
        { packLabel:'Drum', containerCode:'DRUM', netContent:200, uom:'L',  code:'70222', packUnit:'200L drum',       netGross:'18,000 / 20,500 kg', moq:'90 drums',  stdCost:'$2.95 / L' },
      ],
    },
  },
  {
    fullName:'BondMax Pro', spec:'BMP', substance:'BondMax',
    reasonText:'New high-strength epoxy adhesive for automotive structural bonding. Targets 25 MPa lap shear strength on aluminum.',
    productTextsValue:'Two-part epoxy structural adhesive. Designed for high-load bonding of metals and composites. Cures at room temperature in 24h.',
    composition:[
      { cas:'25068-38-6',  chem:'BISPHENOL-A EPICHLOROHYDRIN EPOXY RESIN',     pct:55 },
      { cas:'68410-23-1',  chem:'TRIETHYLENETETRAMINE (CURING AGENT)',         pct:18 },
      { cas:'1317-65-3',   chem:'CALCIUM CARBONATE',                           pct:10 },
      { cas:'112945-52-5', chem:'FUMED SILICA',                                pct:6 },
      { cas:'13463-67-7',  chem:'TITANIUM DIOXIDE',                            pct:5 },
      { cas:'2855-13-2',   chem:'ISOPHORONEDIAMINE',                           pct:3 },
      { cas:'141-43-5',    chem:'ETHANOLAMINE',                                pct:2 },
      { cas:'128-37-0',    chem:'2,6-DI-TERT-BUTYL-P-CRESOL',                  pct:1 },
    ],
    release:{
      parentCode:'70230', hsCode:'3506.91-0000', unNumber:'UN 3082 · Class 9',
      variants:[
        { packLabel:'Cartridge', containerCode:'CARTRIDGE', netContent:400, uom:'ml', code:'70231', packUnit:'400ml dual-cartridge', netGross:'9,600 / 12,000 kg',  moq:'2,000 cartridges', stdCost:'$14.50 / kg' },
        { packLabel:'Pail',      containerCode:'PAIL',      netContent:10,  uom:'KG', code:'70232', packUnit:'10kg pail set',         netGross:'12,000 / 14,200 kg', moq:'600 pails',        stdCost:'$13.20 / kg' },
      ],
    },
  },
];

const matProductBank = [
  {
    fullName:'TETRAMETHYL ORTHOSILICATE CFS-845', spec:'CFS-845', substance:'Tetramethyl orthosilicate',
    descLine:'Tetramethyl orthosilicate CFS-845',
    reasonText:'New raw material required for GS3723(A) formulation. Supplier qualified; TDS/MSDS/composition received.',
    productTextsValue:'High-purity orthosilicate ester. Use within 6 months of opening. Store in cool, dry, well-ventilated area.',
    composition:[
      { cas:'541-05-9', chem:'HEXAMETHYLCYCLOTRISILOXANE',  pct:98 },
      { cas:'556-67-2', chem:'OCTAMETHYLCYCLOTETRASILOXANE', pct:2  },
    ],
    release:{
      parentCode:'45118', hsCode:'2920.90-9000', unNumber:'UN 2920 · Class 3 / II', manufactureValue:'Hubei Co-Formula Material Tech Co., Ltd.',
      variants:[
        { packLabel:'Drum', containerCode:'DRUM', netContent:200, uom:'L',  code:'45119', packUnit:'200L Steel Drum', netGross:'16,000 / 17,800 kg', moq:'80 drums', stdCost:'$3.78 / kg' },
        { packLabel:'Bulk', containerCode:'BULK', netContent:'',  uom:'KG', code:'45120', packUnit:'ISO Tank / IBC',  netGross:'20,000 / 24,400 kg', moq:'1 tank',   stdCost:'$3.62 / kg' },
      ],
    },
  },
  {
    fullName:'H-POLYMER 1000cSt', spec:'H1000', substance:'H-Polymer',
    descLine:'Hydroxyl-terminated polydimethylsiloxane',
    reasonText:'New silicone polymer base for sealant production. Dow supplier qualified; lot-to-lot variation within ±2% spec.',
    productTextsValue:'Hydroxyl-terminated PDMS, 1,000 cSt grade. Polymer base for moisture-cure RTV silicone formulations.',
    composition:[
      { cas:'70131-67-8', chem:'HYDROXYL-TERMINATED POLYDIMETHYLSILOXANE',    pct:96 },
      { cas:'556-67-2',   chem:'OCTAMETHYLCYCLOTETRASILOXANE',                pct:3 },
      { cas:'541-02-6',   chem:'DECAMETHYLCYCLOPENTASILOXANE',                pct:1 },
    ],
    release:{
      parentCode:'45200', hsCode:'3910.00-9000', unNumber:'Non-hazardous', manufactureValue:'Dow Chemical Korea',
      variants:[
        { packLabel:'Drum', containerCode:'DRUM', netContent:200, uom:'L',  code:'45201', packUnit:'200L Steel Drum', netGross:'18,000 / 19,800 kg', moq:'90 drums', stdCost:'$5.20 / kg' },
        { packLabel:'Bulk', containerCode:'BULK', netContent:'',  uom:'KG', code:'45202', packUnit:'ISO Tank',         netGross:'22,000 / 26,400 kg', moq:'1 tank',   stdCost:'$5.00 / kg' },
      ],
    },
  },
  {
    fullName:'VI-POLYMER 100K', spec:'V100K', substance:'Vi-Polymer',
    descLine:'Vinyl-terminated polydimethylsiloxane (100,000 cSt)',
    reasonText:'New high-viscosity vinyl-terminated PDMS for addition-cure silicone systems. Shin-Etsu single-source supply.',
    productTextsValue:'Vinyl-terminated PDMS, 100,000 cSt grade. Reacts with hydride crosslinkers via Pt-catalyzed hydrosilylation.',
    composition:[
      { cas:'68083-19-2', chem:'VINYL-TERMINATED POLYDIMETHYLSILOXANE',       pct:97 },
      { cas:'556-67-2',   chem:'OCTAMETHYLCYCLOTETRASILOXANE',                pct:2 },
      { cas:'541-02-6',   chem:'DECAMETHYLCYCLOPENTASILOXANE',                pct:1 },
    ],
    release:{
      parentCode:'45350', hsCode:'3910.00-9000', unNumber:'Non-hazardous', manufactureValue:'Shin-Etsu Chemical Korea',
      variants:[
        { packLabel:'Drum', containerCode:'DRUM', netContent:200,  uom:'L', code:'45351', packUnit:'200L Steel Drum', netGross:'17,500 / 19,200 kg', moq:'85 drums', stdCost:'$8.40 / kg' },
        { packLabel:'IBC',  containerCode:'IBC',  netContent:1000, uom:'L', code:'45352', packUnit:'IBC 1000L',        netGross:'18,000 / 21,000 kg', moq:'18 IBCs',  stdCost:'$8.10 / kg' },
      ],
    },
  },
  {
    fullName:'PT CATALYST 2%', spec:'Pt-2', substance:'Platinum catalyst',
    descLine:'Karstedt platinum catalyst (2% Pt in vinyl-PDMS)',
    reasonText:'New Pt catalyst for addition-cure silicone (limited supply). Wacker single-source; needs cold-chain qualification.',
    productTextsValue:'Karstedt-type platinum catalyst diluted in vinyl-PDMS. Highly active. Store at <8°C, away from amines.',
    composition:[
      { cas:'68584-83-8', chem:'PLATINUM-1,3-DIVINYL-1,1,3,3-TETRAMETHYLDISILOXANE COMPLEX', pct:2 },
      { cas:'68083-19-2', chem:'VINYL-TERMINATED POLYDIMETHYLSILOXANE',       pct:96 },
      { cas:'556-67-2',   chem:'OCTAMETHYLCYCLOTETRASILOXANE',                pct:2 },
    ],
    release:{
      parentCode:'45470', hsCode:'3815.12-0000', unNumber:'Non-hazardous (cold-chain)', manufactureValue:'Wacker Chemicals Korea',
      variants:[
        { packLabel:'Bottle', containerCode:'BOTTLE', netContent:1,  uom:'KG', code:'45471', packUnit:'1kg HDPE bottle', netGross:'120 / 145 kg', moq:'120 bottles', stdCost:'$2,800 / kg' },
        { packLabel:'Drum',   containerCode:'DRUM',   netContent:25, uom:'KG', code:'45472', packUnit:'25kg drum',        netGross:'750 / 880 kg',  moq:'30 drums',    stdCost:'$2,650 / kg' },
      ],
    },
  },
  {
    fullName:'BASE OIL M50', spec:'M50', substance:'Base oil',
    descLine:'Mineral base oil, KCC M50 grade',
    reasonText:'New base oil grade replacing legacy M40. Internal KCC oil refinery; targets 5% cost reduction over imported equivalent.',
    productTextsValue:'Group II mineral base oil. Solvent-refined paraffinic stock. Used as carrier in greases / lubricant blends.',
    composition:[
      { cas:'64742-52-5', chem:'HYDROTREATED HEAVY NAPHTHENIC DISTILLATE',    pct:99 },
      { cas:'64742-65-0', chem:'HYDROTREATED HEAVY PARAFFINIC DISTILLATE',    pct:1 },
    ],
    release:{
      parentCode:'45520', hsCode:'2710.19-9000', unNumber:'Non-hazardous', manufactureValue:'KCC Refinery (internal)',
      variants:[
        { packLabel:'Drum',  containerCode:'DRUM', netContent:200,   uom:'L', code:'45521', packUnit:'200L Steel Drum', netGross:'17,200 / 18,400 kg', moq:'86 drums',  stdCost:'$1.20 / L' },
        { packLabel:'IBC',   containerCode:'IBC',  netContent:1000,  uom:'L', code:'45523', packUnit:'IBC 1000L',        netGross:'18,000 / 19,500 kg', moq:'18 IBCs',   stdCost:'$1.15 / L' },
        { packLabel:'Tank',  containerCode:'TANK', netContent:20000, uom:'L', code:'45522', packUnit:'Tank trailer',     netGross:'17,200 / 19,800 kg', moq:'1 trailer', stdCost:'$1.10 / L' },
      ],
    },
  },
  {
    fullName:'CARBON BLACK N330', spec:'N330', substance:'Carbon black',
    descLine:'Carbon black, ASTM N330 grade',
    reasonText:'New reinforcing filler for tire rubber compounds. Cabot single-source supply qualified.',
    productTextsValue:'High-abrasion furnace carbon black. Reinforcing filler for tread rubber compounds. Particle size 26-30 nm.',
    composition:[
      { cas:'1333-86-4',  chem:'CARBON BLACK',                                pct:99.5 },
      { cas:'7727-43-7',  chem:'BARIUM SULFATE (TRACE)',                      pct:0.3 },
      { cas:'14808-60-7', chem:'SILICON DIOXIDE (CRYSTALLINE TRACE)',         pct:0.2 },
    ],
    release:{
      parentCode:'45680', hsCode:'2803.00-1000', unNumber:'UN 1361 · Class 4.2 / III', manufactureValue:'Cabot Korea',
      variants:[
        { packLabel:'Bag',  containerCode:'BAG',  netContent:25,  uom:'KG', code:'45681', packUnit:'25kg paper bag',  netGross:'24,000 / 25,200 kg', moq:'960 bags', stdCost:'$1.45 / kg' },
        { packLabel:'FIBC', containerCode:'FIBC', netContent:500, uom:'KG', code:'45682', packUnit:'500kg bulk bag',   netGross:'18,000 / 18,500 kg', moq:'18 bags',  stdCost:'$1.35 / kg' },
      ],
    },
  },
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
  { id:'MR-1022612', desc:'POL-Y-022/BAG/25KG',    step:'Finished Goods', sub:'packing',      status:'inprogress',  person:'Hunhui Cho',       date:'Jan 05, 2026', currentNode:'Technologist' },
  { id:'MR-1022614', desc:'DESC-L-054/DRUM/254KG', step:'Raw Material',      sub:'new',          status:'inprogress',  person:'Elena Rodriguez',  date:'Jan 15, 2026', currentNode:'Quality' },
  { id:'MR-1022618', desc:'SOLV-S-900/TANK/5000L', step:'Packaging',         sub:'new',          status:'inprogress',  person:'Changmoo Jeong',    date:'Feb 03, 2026', currentNode:'Quality' },
  { id:'MR-1022622', desc:'ACID-K-300/DRUM/200KG', step:'Packaging',         sub:'packing',      status:'inprogress',  person:'Changmoo Jeong',    date:'Feb 15, 2026', currentNode:'Quality' },
  { id:'MR-1022631', desc:'CHEM-X-103/IBC/1000L',  step:'Finished Goods', sub:'plant',        status:'inprogress',  person:'Daniel Park',      date:'Feb 18, 2026', currentNode:'Product Management' },
  { id:'MR-1022634', desc:'POL-Y-027/BAG/25KG',    step:'Semi-Finished',     sub:'reactivation', status:'inprogress',  person:'Sophia Chen',      date:'Feb 20, 2026', currentNode:'Product Management' },
  { id:'MR-1022637', desc:'DESC-L-055/DRUM/254KG', step:'Raw Material',      sub:'plant',        status:'inprogress',  person:'Hunhui Cho',       date:'Feb 22, 2026', currentNode:'Sourcing' },
  { id:'MR-1022641', desc:'ACID-K-303/DRUM/200KG', step:'Packaging',         sub:'reactivation', status:'inprogress',  person:'Elena Rodriguez',  date:'Feb 24, 2026', currentNode:'Sourcing' },
  { id:'MR-1022644', desc:'SOLV-S-902/TANK/5000L', step:'Finished Goods', sub:'new',          status:'inprogress',  person:'Jongho Lee',       date:'Feb 26, 2026', currentNode:'Technologist' },
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
  { id:'MR-1022613', desc:'CHEM-X-101/IBC/1000L',  step:'Finished Goods', sub:'reactivation', status:'rejected',  person:'Jongho Lee',       date:'Jan 10, 2026', currentNode:'Technologist' },
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

/* Finished Goods / Semi-Finished flow — Dept. Review 가 Material 과 다름:
   - Quality / Sourcing 빠짐 (FG 는 화학분석/구매 단계 무관)
   - Technologist 추가 (NPI 기술검토 단계) */
const finishedGoodsFlow = {
  ...newCodeCreationFlow,
  nodes: newCodeCreationFlow.nodes.map(n =>
    (n.type === 'row' && n.items.includes('Product Management') && n.items.includes('Quality'))
      ? { ...n, items: ['Product Management', 'Technologist', 'Supply Chain'] }
      : n
  )
};

/* ===== 담당자 매핑 ===== */
const personMap = {
  'Request': { name:'Jongho Lee', date:'Feb 05, 2026' },
  'Product Manager': { name:'Douglas Ashford', date:'Mar 13, 2026' },
  'Product Management': { name:'Olivia Adams', date:'Feb 14, 2026' },
  'Quality': { name:'Lucas Foster', date:'Feb 14, 2026' },
  'Technologist': { name:'Marcus Chen', date:'Feb 11, 2026' },
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
