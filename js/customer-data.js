/* ============================================================
 * Customer Master — Mock Data
 * Screen-only mockup. Not connected to real DB / API.
 *
 * Approval workflow (customerFlows) follows real-world MDM
 * (Master Data Management) practices of global chemical /
 * manufacturing companies:
 *   Request → MDM Analyst → (Sales Ops · Pricing)
 *           → (Credit · Tax · Trade Compliance) [parallel risk / reg review]
 *           → AR Accounting → Finance Controller → MDM Release
 * ============================================================ */

/* ===== Customer Request List (left list) =====
   `areas` drives the Request sub-area cards on detail.html (areaNavMap).
   `newCust` ignores `areas` (shows all) — leave undefined for those rows. */
const crList = [
  { id:'CR-20260401', desc:'Hyundai Motor Co., Ltd. / Domestic Sold-to',  cat:'Domestic',     sub:'newCust',      status:'approved', person:'Jisu Han',       date:'01-04-2026 09:15 AM' },
  { id:'CR-20260402', desc:'LG Electronics Co., Ltd. / Extend Sales Area',cat:'Domestic',     sub:'extendSales',  status:'approved', person:'Mia Campbell',   date:'02-04-2026 10:30 AM', areas:['Sales Area','Partner Func','Tax ID'] },
  { id:'CR-20260403', desc:'Toyota Motor Corp. / Credit Limit ↑',         cat:'Overseas',     sub:'creditChange', status:'inprogress',  person:'Daniel Park',    date:'05-04-2026 02:45 PM', areas:['General'], currentNode:'Sales Ops' },
  { id:'CR-20260404', desc:'Apple Inc. / New Customer',                   cat:'Overseas',     sub:'newCust',      status:'inprogress',  person:'Olivia Adams',   date:'08-04-2026 11:20 AM', currentNode:'MDM Analyst' },
  { id:'CR-20260405', desc:'Samsung SDI Co., Ltd. / Block (Credit Risk)', cat:'Domestic',     sub:'blockUnblock', status:'rejected',  person:'Lucas Foster',   date:'10-04-2026 04:10 PM', areas:['General','Legal Ctrl'], currentNode:'Credit Analyst' },
  { id:'CR-20260406', desc:'Sony Corp. / Extend Company Code 2000',       cat:'Overseas',     sub:'extendComp',   status:'inprogress',  person:'Jisu Han',       date:'12-04-2026 09:50 AM', areas:['Company Code','Bank','VAT Reg'], currentNode:'Tax' },
  { id:'CR-20260407', desc:'Momentive SG Pte / Intercompany',             cat:'Intercompany', sub:'newCust',      status:'approved', person:'Elena Rodriguez',date:'14-04-2026 01:05 PM' },
  { id:'CR-20260408', desc:'Volkswagen AG / Ship-to Only',                cat:'PartnerOnly',  sub:'newCust',      status:'inprogress',  person:'Noah Kim',       date:'16-04-2026 10:40 AM', currentNode:'Pricing' },
  { id:'CR-20260409', desc:'BYD Auto Co., Ltd. / Reactivation',           cat:'Overseas',     sub:'reactivation', status:'rejected',  person:'James Lee',      date:'18-04-2026 03:25 PM', areas:['General','Tax ID','Legal Ctrl'], currentNode:'Tax' },
  { id:'CR-20260410', desc:'Hyundai Mobis Co., Ltd. / Change Payment Term',cat:'Domestic',    sub:'extendSales',  status:'inprogress',  person:'Mia Campbell',   date:'20-04-2026 09:00 AM', areas:['General','Sales Area','Partner Func'], currentNode:'Sales Ops' },
  { id:'CR-20260411', desc:'Kia Corp. / Credit Limit ↓ (Risk review)',    cat:'Domestic',     sub:'creditChange', status:'approved', person:'Daniel Park',    date:'21-04-2026 02:10 PM', areas:['General'] },
  { id:'CR-20260412', desc:'Reliance Industries / New Customer (IN)',     cat:'Overseas',     sub:'newCust',      status:'inprogress',  person:'Priya Nair',     date:'22-04-2026 11:55 AM', currentNode:'AR Accounting' },
  { id:'CR-20260413', desc:'SCG Chemicals / New Customer (TH)',           cat:'Overseas',     sub:'newCust',      status:'inprogress',  person:'Somchai W.',     date:'23-04-2026 10:20 AM', currentNode:'Request' },
];

/* ==================================================================
 * Per-request General field overrides
 *   detail.html performs `Object.assign(cust.general, customerOverrides[pId])`
 *   so that picking different request shows different company data.
 * ================================================================= */
const customerOverrides = {
  'CR-20260401': { cust:'0010001234', name1:'Hyundai Motor Co., Ltd.', name2:'Hyundai Motor Corporation', searchTerm1:'Hyundai',     searchTerm2:'HMC',  title:'Corporation', country:'KR - Korea, Republic of', region:'11 - Seoul',         language:'KO - Korean',    addrNo:'ADDR-0000123', addrPreview:'12 Heolleung-ro, Seocho-gu, Seoul 06797',        phone:'+82-2-3464-1114',  email:'md@hyundai.com',     bizRegNo:'101-81-12345',     industryCode:'3010 - Automotive Mfg',  custGrp:'Z001 - Domestic',     custClass:'A - Key Account',  authGrp:'KR01', transpZone:'KR-SEOUL' },
  'CR-20260402': { cust:'0010002345', name1:'LG Electronics Co., Ltd.', name2:'LG Electronics Inc.',     searchTerm1:'LGE',         searchTerm2:'LG',   title:'Corporation', country:'KR - Korea, Republic of', region:'11 - Seoul',         language:'KO - Korean',    addrNo:'ADDR-0000234', addrPreview:'161 Magokjungang-ro, Gangseo-gu, Seoul 07795',   phone:'+82-2-3777-1114',  email:'md@lge.com',         bizRegNo:'107-86-12345',     industryCode:'2620 - Electronics Mfg', custGrp:'Z001 - Domestic',     custClass:'A - Key Account',  authGrp:'KR01', transpZone:'KR-SEOUL' },
  'CR-20260403': { cust:'0020001111', name1:'Toyota Motor Corp.',       name2:'Toyota Jidosha K.K.',     searchTerm1:'Toyota',      searchTerm2:'TMC',  title:'Corporation', country:'JP - Japan',              region:'13 - Tokyo',         language:'JA - Japanese',  addrNo:'ADDR-0000345', addrPreview:'1-1-1 Marunouchi, Chiyoda-ku, Tokyo 100-8280',   phone:'+81-3-3211-3000',  email:'mdm@toyota.co.jp',   bizRegNo:'JP-12345',         industryCode:'3010 - Automotive Mfg',  custGrp:'Z002 - Overseas',     custClass:'A - Key Account',  authGrp:'JP01', transpZone:'JP-TOKYO' },
  'CR-20260404': { cust:'0030001111', name1:'Apple Inc.',               name2:'Apple Computer, Inc.',    searchTerm1:'Apple',       searchTerm2:'AAPL', title:'Corporation', country:'US - United States',      region:'CA - California',    language:'EN - English',   addrNo:'ADDR-0000456', addrPreview:'One Apple Park Way, Cupertino, CA 95014',        phone:'+1-408-996-1010',  email:'mdm@apple.com',      bizRegNo:'US-94-1234567',    industryCode:'3340 - Computer Mfg',    custGrp:'Z002 - Overseas',     custClass:'A - Key Account',  authGrp:'US01', transpZone:'US-WEST'  },
  'CR-20260405': { cust:'0010003456', name1:'Samsung SDI Co., Ltd.',    name2:'Samsung SDI Inc.',        searchTerm1:'SamsungSDI',  searchTerm2:'SDI',  title:'Corporation', country:'KR - Korea, Republic of', region:'41 - Gyeonggi-do',   language:'KO - Korean',    addrNo:'ADDR-0000567', addrPreview:'150 Gongse-ro, Giheung-gu, Yongin-si 17084',     phone:'+82-31-8006-3114', email:'md@samsungsdi.com',  bizRegNo:'108-87-23456',     industryCode:'2710 - Battery Mfg',     custGrp:'Z001 - Domestic',     custClass:'B - Regular',      authGrp:'KR01', transpZone:'KR-GYNGGI' },
  'CR-20260406': { cust:'0020002222', name1:'Sony Corp.',               name2:'Sony Group Corporation',  searchTerm1:'Sony',        searchTerm2:'SNY',  title:'Corporation', country:'JP - Japan',              region:'13 - Tokyo',         language:'JA - Japanese',  addrNo:'ADDR-0000678', addrPreview:'1-7-1 Konan, Minato-ku, Tokyo 108-0075',         phone:'+81-3-6748-2111',  email:'mdm@sony.co.jp',     bizRegNo:'JP-67890',         industryCode:'2620 - Electronics Mfg', custGrp:'Z002 - Overseas',     custClass:'A - Key Account',  authGrp:'JP01', transpZone:'JP-TOKYO' },
  'CR-20260407': { cust:'0060001111', name1:'Momentive Singapore Pte Ltd', name2:'Momentive SG',         searchTerm1:'MomentiveSG', searchTerm2:'MSG',  title:'Corporation', country:'SG - Singapore',          region:'01 - Central',       language:'EN - English',   addrNo:'ADDR-0000800', addrPreview:'80 Robinson Road, #14-02, Singapore 068898',     phone:'+65-6532-1818',    email:'mdm@momentive.com',  bizRegNo:'SG-202300001K',    industryCode:'2050 - Chemical Mfg',    custGrp:'Z004 - Intercompany', custClass:'A - Key Account',  authGrp:'SG01', transpZone:'SG-CTL'   },
  'CR-20260408': { cust:'0050001111', name1:'Volkswagen AG',            name2:'VW AG',                   searchTerm1:'VW',          searchTerm2:'VAG',  title:'Aktiengesellschaft', country:'DE - Germany',     region:'NI - Lower Saxony',  language:'DE - German',    addrNo:'ADDR-0000900', addrPreview:'Berliner Ring 2, 38440 Wolfsburg',               phone:'+49-5361-90',      email:'mdm@volkswagen.de',  bizRegNo:'DE-14111-VW',      industryCode:'3010 - Automotive Mfg',  custGrp:'Z003 - Partner',      custClass:'B - Regular',      authGrp:'DE01', transpZone:'DE-NDS'   },
  'CR-20260409': { cust:'0040001111', name1:'BYD Auto Co., Ltd.',       name2:'BYD Auto Industry',       searchTerm1:'BYD',         searchTerm2:'BYDA', title:'Corporation', country:'CN - China',              region:'GD - Guangdong',     language:'ZH - Chinese',   addrNo:'ADDR-0000A01', addrPreview:'No.3009 BYD Road, Pingshan District, Shenzhen 518118', phone:'+86-755-8988-8888', email:'mdm@byd.com',     bizRegNo:'CN-91440300',      industryCode:'3010 - Automotive Mfg',  custGrp:'Z002 - Overseas',     custClass:'B - Regular',      authGrp:'CN01', transpZone:'CN-GD'    },
  'CR-20260410': { cust:'0010004567', name1:'Hyundai Mobis Co., Ltd.',  name2:'Hyundai Mobis',           searchTerm1:'Mobis',       searchTerm2:'HMC',  title:'Corporation', country:'KR - Korea, Republic of', region:'11 - Seoul',         language:'KO - Korean',    addrNo:'ADDR-0000B01', addrPreview:'203 Teheran-ro, Gangnam-gu, Seoul 06141',        phone:'+82-2-2018-5114',  email:'md@mobis.co.kr',     bizRegNo:'134-81-00000',     industryCode:'3020 - Auto Parts Mfg',  custGrp:'Z001 - Domestic',     custClass:'A - Key Account',  authGrp:'KR01', transpZone:'KR-SEOUL' },
  'CR-20260411': { cust:'0010005678', name1:'Kia Corp.',                name2:'Kia Motors Corporation',  searchTerm1:'Kia',         searchTerm2:'KMC',  title:'Corporation', country:'KR - Korea, Republic of', region:'11 - Seoul',         language:'KO - Korean',    addrNo:'ADDR-0000C01', addrPreview:'12 Heolleung-ro, Seocho-gu, Seoul 06797',        phone:'+82-2-3464-1114',  email:'md@kia.com',         bizRegNo:'119-81-02994',     industryCode:'3010 - Automotive Mfg',  custGrp:'Z001 - Domestic',     custClass:'A - Key Account',  authGrp:'KR01', transpZone:'KR-SEOUL' },
  'CR-20260412': { cust:'0070001111', name1:'Reliance Industries Ltd.', name2:'Reliance Industries',     searchTerm1:'Reliance',    searchTerm2:'RIL',  title:'Corporation', country:'IN - India',              region:'MH - Maharashtra',   language:'EN - English',   addrNo:'ADDR-0000D01', addrPreview:'Maker Chambers IV, Nariman Point, Mumbai 400021',phone:'+91-22-3555-5000', email:'mdm@ril.com',        bizRegNo:'IN-AAACR5055K',    industryCode:'2050 - Chemical Mfg',    custGrp:'Z002 - Overseas',     custClass:'A - Key Account',  authGrp:'IN01', transpZone:'IN-MH'    },
  'CR-20260413': { cust:'0080001111', name1:'SCG Chemicals Co., Ltd.',  name2:'SCG Chemicals',           searchTerm1:'SCG',         searchTerm2:'SCGC', title:'Corporation', country:'TH - Thailand',           region:'10 - Bangkok',       language:'EN - English',   addrNo:'ADDR-0000E01', addrPreview:'1 Siam Cement Road, Bangsue, Bangkok 10800',     phone:'+66-2-586-1111',   email:'mdm@scgchemicals.com',bizRegNo:'TH-0107547000478', industryCode:'2050 - Chemical Mfg',    custGrp:'Z002 - Overseas',     custClass:'B - Regular',      authGrp:'TH01', transpZone:'TH-BKK'   },
};

/* ==================================================================
 * Customer Process Flow (real-world MDM practice)
 *
 * Standard stages run by MDM teams in large enterprises:
 *   1) Request        — Sales / Account Manager submits the request
 *   2) MDM Analyst    — Master data team: dedup, drafting, integrity check
 *   3) Department review (parallel):
 *        Sales Ops   — Validate sales conditions
 *        Pricing     — Approve pricing / promotion (newCust / extendSales only)
 *   4) Risk / Regulatory review (parallel):
 *        Credit Analyst     — Limit calculation / risk grade
 *        Tax                — VAT / Tax ID / Withholding tax
 *        Trade Compliance   — SDN / Boycott / Export Denial screening
 *   5) AR Accounting  — Receivables setup (Recon / Payment terms / Dunning)
 *   6) Finance Controller — Final approval by finance owner
 *   7) MDM Release    — MDM team activates master (clears delete flag, etc.)
 *
 * Some stages are skipped depending on request type:
 *   - extendSales : Skips Accounting / Tax (Sales-area extension only)
 *   - extendComp  : Skips Sales (AR / Tax responsible)
 *   - creditChange: Credit-limit-only flow
 *   - blockUnblock: Minimal review, fast execution
 *   - reactivation: Compliance re-screening emphasized
 * ================================================================= */
const customerFlows = {
  'newCust': {
    title: 'New Customer',
    nodes: [
      { type:'node', label:'Request', hl:true },
      { type:'arrow' },
      { type:'node', label:'MDM Analyst' },
      { type:'arrow' },
      { type:'row', items:['Sales Ops','Pricing'] },
      { type:'arrow' },
      { type:'row', items:['Credit Analyst','Tax','Trade Compliance'] },
      { type:'arrow' },
      { type:'node', label:'AR Accounting' },
      { type:'arrow' },
      { type:'node', label:'Finance Controller' },
      { type:'arrow' },
      { type:'node', label:'MDM Release', hl:true },
    ]
  },
  'extendSales': {
    title: 'Extend to Sales Area',
    nodes: [
      { type:'node', label:'Request', hl:true },
      { type:'arrow' },
      { type:'node', label:'MDM Analyst' },
      { type:'arrow' },
      { type:'row', items:['Sales Ops','Pricing'] },
      { type:'arrow' },
      { type:'node', label:'Credit Analyst' },
      { type:'arrow' },
      { type:'node', label:'MDM Release', hl:true },
    ]
  },
  'extendComp': {
    title: 'Extend to Company Code',
    nodes: [
      { type:'node', label:'Request', hl:true },
      { type:'arrow' },
      { type:'node', label:'MDM Analyst' },
      { type:'arrow' },
      { type:'row', items:['AR Accounting','Tax'] },
      { type:'arrow' },
      { type:'node', label:'Finance Controller' },
      { type:'arrow' },
      { type:'node', label:'MDM Release', hl:true },
    ]
  },
  'creditChange': {
    title: 'Change Credit Limit',
    nodes: [
      { type:'node', label:'Request', hl:true },
      { type:'arrow' },
      { type:'node', label:'Credit Analyst' },
      { type:'arrow' },
      { type:'node', label:'Sales Ops' },
      { type:'arrow' },
      { type:'node', label:'Finance Controller' },
      { type:'arrow' },
      { type:'node', label:'MDM Release', hl:true },
    ]
  },
  'blockUnblock': {
    title: 'Block / Unblock',
    nodes: [
      { type:'node', label:'Request', hl:true },
      { type:'arrow' },
      { type:'row', items:['Credit Analyst','Sales Ops','AR Accounting'] },
      { type:'arrow' },
      { type:'node', label:'MDM Release', hl:true },
    ]
  },
  'reactivation': {
    title: 'Reactivation',
    nodes: [
      { type:'node', label:'Request', hl:true },
      { type:'arrow' },
      { type:'node', label:'MDM Analyst' },
      { type:'arrow' },
      { type:'row', items:['Credit Analyst','Tax','Trade Compliance'] },
      { type:'arrow' },
      { type:'node', label:'AR Accounting' },
      { type:'arrow' },
      { type:'node', label:'Finance Controller' },
      { type:'arrow' },
      { type:'node', label:'MDM Release', hl:true },
    ]
  }
};

/* ==================================================================
 * Person mapping — representative + department per role
 * ================================================================= */
const customerPersonMap = {
  'Request':            { name:'Jisu Han',      date:'Mar 20, 2026', dept:'Sales / Account Mgmt' },
  'MDM Analyst':        { name:'Haeun Seo',     date:'Mar 21, 2026', dept:'Master Data Mgmt' },
  'Sales Ops':          { name:'Mia Campbell',  date:'Mar 22, 2026', dept:'Sales Operations' },
  'Pricing':            { name:'Ethan Brooks',  date:'Mar 22, 2026', dept:'Pricing / Commercial' },
  'Credit Analyst':     { name:'Daniel Park',   date:'Mar 23, 2026', dept:'Credit & Collections' },
  'Tax':                { name:'Olivia Adams',  date:'Mar 23, 2026', dept:'Tax' },
  'Trade Compliance':   { name:'James Lee',     date:'Mar 24, 2026', dept:'Global Trade Compliance' },
  'AR Accounting':      { name:'Lucas Foster',  date:'Mar 25, 2026', dept:'AR Accounting' },
  'Finance Controller': { name:'Sarah Park',    date:'Mar 28, 2026', dept:'Finance Controlling' },
  'MDM Release':        { name:'Haeun Seo',     date:'Apr 01, 2026', dept:'Master Data Mgmt' },
};

/* ==================================================================
 * Customer master data (default example for the detail screen)
 *   The General fields are overridden per-request via customerOverrides.
 * ================================================================= */
const customerMaster = {
  /* === General === */
  general: {
    cust:         '0010001234',
    accountGroup: '0001 - Sold-to',
    name1:        'Hyundai Motor Co., Ltd.',
    name2:        'Hyundai Motor Corporation',
    searchTerm1:  'Hyundai',
    searchTerm2:  'HMC',
    title:        'Corporation',
    country:      'KR - Korea, Republic of',
    region:       '11 - Seoul',
    language:     'KO - Korean',
    addrNo:       'ADDR-0000123',
    addrPreview:  '12 Heolleung-ro, Seocho-gu, Seoul 06797',
    phone:        '+82-2-3464-1114',
    mobile:       '+82-10-0000-0000',
    email:        'md@hyundai.com',
    bizRegNo:     '101-81-12345',
    industryCode: '3010 - Automotive Mfg',
    custGrp:      'Z001 - Domestic',
    custClass:    'A - Key Account',
    authGrp:      'KR01',
    vendorNo:     '',
    transpZone:   'KR-SEOUL',
    createdBy:    'Jisu Han',
    createdOn:    'Mar 20, 2026',
    changedBy:    'Haeun Seo',
    changedOn:    'Mar 21, 2026 10:22',
  },

  /* === Sales Areas: CUST + SALES_ORG + DIST_CHANNEL + DIVISION === */
  salesAreas: [
    { scopeKey:'KR01/10/00', salesOrg:'KR01', salesOrgName:'Momentive Korea',
      distChannel:'10', distChannelName:'Direct',
      division:'00', divisionName:'Common',
      currency:'KRW', salesDistrict:'KR001 - Seoul Metro', salesOffice:'KR0001', salesGroup:'K01',
      customerGrp1:'ZA', customerGrp2:'Z1', customerGrp3:'', customerGrp4:'', customerGrp5:'',
      priceGrp:'01 - Standard', priceList:'01 - Domestic KRW', pricingProc:'ZKR1',
      orderProbability:'100', incoterms:'DAP', incotermsLoc:'Seoul',
      paymentTerm:'NT30', taxClassification:'1 - Taxable', accountAssGrp:'01 - Domestic Rev',
      deliveryPriority:'01 - High', shippingCondition:'01 - Standard',
      deliveryPlant:'KR01 - Otha', maxPartialDelivery:'9', orderCombination:true,
      deliveryBlock:'', billingBlock:'', status:'Active' },
    { scopeKey:'KR01/20/00', salesOrg:'KR01', salesOrgName:'Momentive Korea',
      distChannel:'20', distChannelName:'Distributor',
      division:'00', divisionName:'Common',
      currency:'KRW', salesDistrict:'KR002 - Nationwide', salesOffice:'KR0002', salesGroup:'K02',
      customerGrp1:'ZA', customerGrp2:'Z2', customerGrp3:'', customerGrp4:'', customerGrp5:'',
      priceGrp:'02 - Distributor', priceList:'02 - Dist. KRW', pricingProc:'ZKR2',
      orderProbability:'90', incoterms:'FOB', incotermsLoc:'Busan',
      paymentTerm:'NT60', taxClassification:'1 - Taxable', accountAssGrp:'01 - Domestic Rev',
      deliveryPriority:'02 - Normal', shippingCondition:'02 - Distributor',
      deliveryPlant:'KR02 - Gunsan', maxPartialDelivery:'9', orderCombination:false,
      deliveryBlock:'', billingBlock:'', status:'Active' },
  ],

  /* === Company codes: CUST + COMP_CODE === */
  companies: [
    { scopeKey:'1000', compCode:'1000', compName:'Momentive Korea Co., Ltd',
      reconAccount:'121000 - Trade Receivables', alternPayer:'', sortKey:'031 - Doc No.',
      cashMgmtGrp:'E1', planningGrp:'E1',
      paymentTerm:'NT30', paymentMethod:'B - Bank Transfer', paymentBlock:'',
      houseBank:'KB01', dunningProc:'0001 - Standard', dunningClerk:'KR01', dunningBlock:'',
      accountClerk:'KR01', headOffice:'', interestIndic:'01',
      taxCode:'V0', withholdingTax:false, currency:'KRW', status:'Active' },
    { scopeKey:'2000', compCode:'2000', compName:'Momentive Japan KK',
      reconAccount:'121000 - Trade Receivables', alternPayer:'', sortKey:'031 - Doc No.',
      cashMgmtGrp:'E2', planningGrp:'E2',
      paymentTerm:'NT60', paymentMethod:'W - Wire', paymentBlock:'',
      houseBank:'SMBC', dunningProc:'0002 - International', dunningClerk:'JP01', dunningBlock:'',
      accountClerk:'JP01', headOffice:'', interestIndic:'01',
      taxCode:'J0', withholdingTax:false, currency:'JPY', status:'Active' },
  ],

  /* === Credits: CUST + CREDIT_CTRL_AREA ===
     (Removed from main screen; managed in the Credit Master screen.) */
  credits: [
    { scopeKey:'1000', creditCtrlArea:'1000', creditCtrlAreaName:'Korea Credit',
      currency:'KRW', creditLimit:'5,000,000,000', creditLimitUsed:'1,240,350,000',
      creditLimitUsedPct:'24.8', riskCategory:'B01 - Standard', creditRep:'KR-CRD-01',
      creditHorizon:'90', lastReview:'Dec 15, 2025', nextReview:'Jun 15, 2026',
      creditLimitRef:'', blockedByCredit:false, paymentHistory:'A - Excellent',
      dsoDays:'32', insurance:'Export Credit Insurance', insuranceAmt:'3,500,000,000',
      insuranceLead:'6', insuranceNo:'ECI-2026-KR-001', status:'Active' },
  ],

  /* === Dunnings: CUST + COMP_CODE + DUNNING_AREA === */
  dunnings: [
    { scopeKey:'1000/01', compCode:'1000', compName:'Momentive Korea',
      dunningArea:'01', dunningAreaName:'Domestic',
      dunningProc:'0001 - Standard', dunningLevel:'0 - Not dunned', dunningBlock:'',
      dunningKey:'', lastDunned:'', lastDunnedLevel:'', legalDunningProc:'' },
  ],

  /* === Partners: CUST + SALES scope + PARTNER_FUNC + SEQ === */
  partners: [
    { scopeKey:'KR01/10/00', salesArea:'KR01/10/00', partnerFunc:'SP', partnerFuncName:'Sold-to',  partnerSeq:'01', partnerNo:'0010001234', partnerName:'Hyundai Motor Co., Ltd.',     defaultFlag:true  },
    { scopeKey:'KR01/10/00', salesArea:'KR01/10/00', partnerFunc:'SH', partnerFuncName:'Ship-to',  partnerSeq:'01', partnerNo:'0010001299', partnerName:'Hyundai Motor Asan Plant',    defaultFlag:true  },
    { scopeKey:'KR01/10/00', salesArea:'KR01/10/00', partnerFunc:'SH', partnerFuncName:'Ship-to',  partnerSeq:'02', partnerNo:'0010001298', partnerName:'Hyundai Motor Ulsan Plant',   defaultFlag:false },
    { scopeKey:'KR01/10/00', salesArea:'KR01/10/00', partnerFunc:'BP', partnerFuncName:'Bill-to',  partnerSeq:'01', partnerNo:'0010001234', partnerName:'Hyundai Motor Co., Ltd.',     defaultFlag:true  },
    { scopeKey:'KR01/10/00', salesArea:'KR01/10/00', partnerFunc:'PY', partnerFuncName:'Payer',    partnerSeq:'01', partnerNo:'0010001234', partnerName:'Hyundai Motor Co., Ltd.',     defaultFlag:true  },
  ],

  /* === Contact Persons: CUST + PARTNER === */
  contactPersons: [
    { seq:'01', lastName:'Kim', firstName:'Taeyoung', fullName:'Taeyoung Kim',
      dept:'Procurement', title:'General Manager', function:'Buyer', language:'EN',
      phone:'+82-2-3464-2001', mobile:'+82-10-1111-2222', fax:'+82-2-3464-2099',
      email:'ty.kim@hyundai.com', addrNo:'ADDR-0000123', vendor:'', defaultFlag:true, status:'Active' },
    { seq:'02', lastName:'Lee', firstName:'Suhyun', fullName:'Suhyun Lee',
      dept:'Quality Assurance', title:'Deputy Manager', function:'Quality', language:'EN',
      phone:'+82-2-3464-2010', mobile:'+82-10-3333-4444', fax:'',
      email:'sh.lee@hyundai.com', addrNo:'ADDR-0000123', vendor:'', defaultFlag:false, status:'Active' },
    { seq:'03', lastName:'Park', firstName:'Jungmin', fullName:'Jungmin Park',
      dept:'Finance', title:'Manager', function:'Accounting', language:'EN',
      phone:'+82-2-3464-2020', mobile:'+82-10-5555-6666', fax:'',
      email:'jm.park@hyundai.com', addrNo:'ADDR-0000123', vendor:'', defaultFlag:false, status:'Active' },
  ],

  /* === Banks: CUST + BANK_NATION + KEY + ACCOUNT === */
  banks: [
    { scopeKey:'KR/011/12345-01-678910', bankNation:'KR', bankKey:'011', bankKeyName:'KB Kookmin Bank',
      bankAccount:'12345-01-678910', accountHolder:'Hyundai Motor Co., Ltd.',
      iban:'', swiftCode:'CZNBKRSE', reference:'Primary', controlKey:'' },
    { scopeKey:'KR/020/98765-43-210987', bankNation:'KR', bankKey:'020', bankKeyName:'Woori Bank',
      bankAccount:'98765-43-210987', accountHolder:'Hyundai Motor Co., Ltd.',
      iban:'', swiftCode:'HVBKKRSE', reference:'Secondary', controlKey:'' },
  ],

  /* === Tax IDs / Sub-licenses: CUST + NATION + CATEGORY === */
  taxIds: [
    { scopeKey:'KR/KR1', nation:'KR', nationName:'Korea', taxCategory:'KR1 - Business Registration No.',
      taxNumber:'101-81-12345',
      subs: [{ license:'LIC-2026-001', validFrom:'Jan 01, 2026', validTo:'Dec 31, 2026', exemptReason:'' }] },
    { scopeKey:'KR/KR2', nation:'KR', nationName:'Korea', taxCategory:'KR2 - Corporate Registration No.',
      taxNumber:'110111-0123456', subs: [] },
  ],

  /* === VAT registrations: CUST + NATION === */
  vatRegs: [
    { scopeKey:'KR', nation:'KR', nationName:'Korea', vatNumber:'101-81-12345',
      validFrom:'Jan 01, 2026', status:'Active' },
  ],

  /* === Legal control: CUST + NATION ===
     Export-control (Denial) / SDN / Boycott screening per country */
  legalCtrls: [
    { scopeKey:'KR', nation:'KR', nationName:'Korea',
      denialStatus:'Clear', sdnStatus:'Clear', boycottStatus:'Clear',
      exportLicense:'', licenseType:'', validFrom:'2026-01-01', validTo:'2026-12-31',
      screenedBy:'James Lee', screenedOn:'Mar 20, 2026 14:25',
      lastScanRef:'SCR-2026-03-20-00178', nextScreenDue:'Sep 20, 2026',
      dgReceiver:false, militaryUse:false, dualUse:false, remark:'Clean record' },
    { scopeKey:'US', nation:'US', nationName:'United States',
      denialStatus:'Clear', sdnStatus:'Clear', boycottStatus:'Clear',
      exportLicense:'NLR', licenseType:'No License Required', validFrom:'2026-01-01', validTo:'',
      screenedBy:'James Lee', screenedOn:'Mar 20, 2026 14:26',
      lastScanRef:'SCR-2026-03-20-00179', nextScreenDue:'Sep 20, 2026',
      dgReceiver:false, militaryUse:false, dualUse:false, remark:'' },
  ],

  /* === Unloading Points: CUST + UNLOAD_POINT ===
     (auxiliary screen) */
  unloadPoints: [
    { scopeKey:'ASAN01', unloadPoint:'ASAN01', unloadPointName:'Asan Plant Dock 1',
      addr:'700 Hyundai-ro, Inju-myeon, Asan-si, Chungcheongnam-do', factoryCalendar:'KR',
      unloadingInstr:'Forklift required · Lunch break 1-2 PM',
      recvHoursMon:'09:00-17:00', recvHoursTue:'09:00-17:00', recvHoursWed:'09:00-17:00',
      recvHoursThu:'09:00-17:00', recvHoursFri:'09:00-17:00',
      recvHoursSat:'closed', recvHoursSun:'closed' },
  ],

  /* === Tax Excise: CUST (India CIN/PAN/GST) ===
     Conditional screen — only when country = IN */
  taxExcise: {
    ecc:          'AAAAA1111BCD001',    /* Excise Control Code */
    panNo:        'ABCDE1234F',          /* Permanent Account Number */
    panRefNo:     'PAN-REF-2026-KR-001',
    gstIn:        '27ABCDE1234F1Z5',    /* GST Identification Number */
    gstRegDate:   '2017-07-01',
    gstRegType:   'Regular',
    serviceTaxNo: 'AAAAA1111BSD001',
    vatTIN:       '27123456789',
    cstTIN:       '27123456789C',
    excRegNo:     'EXC-MH-2026-0001',
    excRegDate:   '2026-01-15',
    exciseRange:  'Mumbai-I',
    exciseDiv:    'Division-III',
    exciseComm:   'Mumbai',
    eccRegime:    'Mfg',
    tdsApplicable: true,
    sscComment:   'Standard GST filer · monthly',
  },

  /* === TH branches: CUST + TYPE + BRANCH_CODE ===
     Conditional screen — only when country = TH */
  thBranches: [
    { scopeKey:'HQ/00000', type:'HQ', typeName:'Head Office',
      branchCode:'00000', branchName:'Bangkok Head Office',
      addrNo:'ADDR-0000800', taxId:'0-1055-12345-67-8', phone:'+66-2-555-0100' },
  ],

  /* === Mail report recipients: RPT_TYPE + USER_ID + CUST + SALES_ORG ===
     Auto-distribution recipients */
  mailReports: [
    { rptType:'INV_ISS', rptTypeName:'Tax Invoice Issuance',
      userId:'U-KR-001', userName:'Taeyoung Kim (Hyundai)',
      salesOrg:'KR01', email:'ty.kim@hyundai.com',
      format:'PDF', schedule:'Per Invoice', language:'EN', active:true },
    { rptType:'MONTHLY_STMT', rptTypeName:'Monthly Statement',
      userId:'U-KR-003', userName:'Jungmin Park (Hyundai)',
      salesOrg:'KR01', email:'jm.park@hyundai.com',
      format:'PDF', schedule:'Monthly 1st', language:'EN', active:true },
  ],

  /* === TAN exemptions: COMP_CODE + ACCT_TYPE + ACCNO ===
     India TAN withholding-tax exemption (ACCT_TYPE='D' = Customer)
     Only when country = IN */
  tanExemptions: [
    { compCode:'7000', compName:'Momentive India Pvt Ltd',
      acctType:'D', acctTypeName:'Customer',
      accNo:'0010001234',
      tanNo:'AAAAA12345A', section:'194J',
      exemptRate:'0.00', defaultRate:'10.00',
      validFrom:'2026-04-01', validTo:'2027-03-31',
      certificateNo:'LDC-2026-0001', issuedBy:'Income Tax Dept, Mumbai',
      status:'Active' },
  ],
};

/* ==================================================================
 * Customer Hierarchy — separate screen
 * CUST_HIER_TYPE + CUST + SALES_ORG + DIST_CHANNEL + DIVISION + FROM_DATE
 * ================================================================= */
const mockHierarchy = [
  { hierType:'A', hierTypeName:'Account Hierarchy',
    cust:'0010001234', name:'Hyundai Motor Co., Ltd.',
    parentCust:'', parentName:'(Top)',
    salesOrg:'KR01', distChannel:'10', division:'00',
    fromDate:'2026-01-01', toDate:'9999-12-31', level:1, status:'Active' },
  { hierType:'A', hierTypeName:'Account Hierarchy',
    cust:'0010001299', name:'Hyundai Motor Asan Plant',
    parentCust:'0010001234', parentName:'Hyundai Motor Co., Ltd.',
    salesOrg:'KR01', distChannel:'10', division:'00',
    fromDate:'2026-01-01', toDate:'9999-12-31', level:2, status:'Active' },
  { hierType:'A', hierTypeName:'Account Hierarchy',
    cust:'0010001298', name:'Hyundai Motor Ulsan Plant',
    parentCust:'0010001234', parentName:'Hyundai Motor Co., Ltd.',
    salesOrg:'KR01', distChannel:'10', division:'00',
    fromDate:'2026-01-01', toDate:'9999-12-31', level:2, status:'Active' },
  { hierType:'A', hierTypeName:'Account Hierarchy',
    cust:'0010004567', name:'Hyundai Mobis Co., Ltd.',
    parentCust:'0010001234', parentName:'Hyundai Motor Co., Ltd.',
    salesOrg:'KR01', distChannel:'10', division:'00',
    fromDate:'2026-01-01', toDate:'9999-12-31', level:2, status:'Active' },
  { hierType:'A', hierTypeName:'Account Hierarchy',
    cust:'0010005678', name:'Kia Corp.',
    parentCust:'0010001234', parentName:'Hyundai Motor Co., Ltd.',
    salesOrg:'KR01', distChannel:'10', division:'00',
    fromDate:'2026-01-01', toDate:'9999-12-31', level:2, status:'Active' },
  { hierType:'P', hierTypeName:'Pricing Hierarchy',
    cust:'0010001234', name:'Hyundai Motor Co., Ltd.',
    parentCust:'', parentName:'(Top — Pricing Group)',
    salesOrg:'KR01', distChannel:'10', division:'00',
    fromDate:'2026-01-01', toDate:'9999-12-31', level:1, status:'Active' },
];

/* ==================================================================
 * Customer-Material Info — separate screen
 * SALES_ORG + DIST_CHANNEL + CUST + MAT
 * ================================================================= */
const mockCustMat = [
  { salesOrg:'KR01', distChannel:'10', cust:'0010001234', custName:'Hyundai Motor Co., Ltd.',
    mat:'171870', matDesc:'H-Polymer 1000cSt',
    custMat:'HMC-SIL-1000', custMatDesc:'Silicone Oil 1000',
    uom:'KG', minOrderQty:'200', deliveryTime:'14', priceAgreed:'12,500',
    priceUnit:'1 KG', currency:'KRW', incotermsOverride:'', paymentTermOverride:'',
    status:'Active', validFrom:'2026-01-01', validTo:'2026-12-31', remark:'Annual Contract' },
  { salesOrg:'KR01', distChannel:'10', cust:'0010001234', custName:'Hyundai Motor Co., Ltd.',
    mat:'183204', matDesc:'PDM Silicone 1000',
    custMat:'HMC-PDM-1000', custMatDesc:'Silicone PDM',
    uom:'KG', minOrderQty:'500', deliveryTime:'21', priceAgreed:'14,800',
    priceUnit:'1 KG', currency:'KRW', incotermsOverride:'', paymentTermOverride:'',
    status:'Active', validFrom:'2026-01-01', validTo:'2026-12-31', remark:'' },
  { salesOrg:'KR01', distChannel:'20', cust:'0010001234', custName:'Hyundai Motor Co., Ltd.',
    mat:'171870', matDesc:'H-Polymer 1000cSt',
    custMat:'HMC-DIST-SIL', custMatDesc:'Silicone for Distribution',
    uom:'KG', minOrderQty:'1000', deliveryTime:'7', priceAgreed:'13,200',
    priceUnit:'1 KG', currency:'KRW', incotermsOverride:'FCA', paymentTermOverride:'NT60',
    status:'Active', validFrom:'2026-01-01', validTo:'', remark:'' },
];

/* ==================================================================
 * Partner Determination Procedure (config) — separate screen
 * SAP SD Partner Determination rule metadata
 * ================================================================= */
const mockPartnerProcedures = [
  {
    procedureCode:'TA',
    procedureName:'Standard Sold-to',
    description:'Standard procedure for Sold-to account group (0001)',
    objectType:'Customer Master',
    active:true,
    partnerFunctions: [
      { func:'SP', name:'Sold-to',  mandatory:true,  notChangeable:true,  unique:true,  source:'Customer Master' },
      { func:'SH', name:'Ship-to',  mandatory:true,  notChangeable:false, unique:false, source:'SP → default SH' },
      { func:'BP', name:'Bill-to',  mandatory:true,  notChangeable:false, unique:false, source:'SP → default BP' },
      { func:'PY', name:'Payer',    mandatory:true,  notChangeable:false, unique:false, source:'SP → default PY' },
      { func:'SE', name:'Sales Emp',mandatory:false, notChangeable:false, unique:false, source:'Manual' },
    ]
  },
  {
    procedureCode:'TAN',
    procedureName:'One-time Customer',
    description:'One-time (CPD) customer procedure — 0006 account group',
    objectType:'Customer Master',
    active:true,
    partnerFunctions: [
      { func:'SP', name:'Sold-to',  mandatory:true,  notChangeable:true,  unique:true,  source:'Customer Master (CPD)' },
      { func:'SH', name:'Ship-to',  mandatory:true,  notChangeable:false, unique:true,  source:'Manual' },
      { func:'BP', name:'Bill-to',  mandatory:false, notChangeable:false, unique:true,  source:'Default from SP' },
      { func:'PY', name:'Payer',    mandatory:true,  notChangeable:false, unique:true,  source:'Manual' },
    ]
  },
  {
    procedureCode:'FK',
    procedureName:'Intercompany',
    description:'Intercompany billing procedure — ZIC account group',
    objectType:'Customer Master',
    active:true,
    partnerFunctions: [
      { func:'SP', name:'Sold-to',  mandatory:true,  notChangeable:true,  unique:true,  source:'IC Customer' },
      { func:'PY', name:'Payer',    mandatory:true,  notChangeable:true,  unique:true,  source:'IC Company Code' },
    ]
  },
  {
    procedureCode:'ZPARTNER',
    procedureName:'Momentive Custom',
    description:'Custom procedure with DG/Insurance partners',
    objectType:'Customer Master',
    active:false,
    partnerFunctions: [
      { func:'SP', name:'Sold-to',  mandatory:true,  notChangeable:true,  unique:true,  source:'Customer Master' },
      { func:'SH', name:'Ship-to',  mandatory:true,  notChangeable:false, unique:false, source:'SP → default' },
      { func:'DG', name:'DG Recipient', mandatory:false, notChangeable:false, unique:false, source:'Manual (DG only)' },
      { func:'IN', name:'Insurance',mandatory:false, notChangeable:false, unique:false, source:'Manual' },
    ]
  },
];

/* ==================================================================
 * Common lookup mocks — Address / Company Code / Sales Org / DC / Division
 * ================================================================= */
const mockAddresses = [
  { addrNo:'ADDR-0000123', country:'KR', postCode:'06797', addr1:'12 Heolleung-ro, Seocho-gu, Seoul',           city:'Seoul', region:'Seocho-gu',  recipient:'Hyundai Motor Co., Ltd.' },
  { addrNo:'ADDR-0000124', country:'KR', postCode:'31454', addr1:'700 Hyundai-ro, Inju-myeon, Asan-si',         city:'Asan',  region:'Inju-myeon', recipient:'Hyundai Motor Asan Plant' },
  { addrNo:'ADDR-0000125', country:'KR', postCode:'44711', addr1:'700 Myeongchon-dong, Buk-gu, Ulsan',          city:'Ulsan', region:'Buk-gu',     recipient:'Hyundai Motor Ulsan Plant' },
  { addrNo:'ADDR-0000234', country:'KR', postCode:'07795', addr1:'161 Magokjungang-ro, Gangseo-gu, Seoul',      city:'Seoul', region:'Gangseo-gu', recipient:'LG Electronics Co., Ltd.' },
  { addrNo:'ADDR-0000345', country:'JP', postCode:'100-8280', addr1:'Tokyo, Chiyoda-ku, Marunouchi 1-1-1',      city:'Tokyo', region:'Chiyoda-ku', recipient:'Toyota Motor Corp.' },
  { addrNo:'ADDR-0000456', country:'US', postCode:'95014',    addr1:'One Apple Park Way, Cupertino, CA',        city:'Cupertino', region:'CA',     recipient:'Apple Inc.' },
  { addrNo:'ADDR-0000567', country:'KR', postCode:'17084',    addr1:'150 Gongse-ro, Giheung-gu, Yongin-si',     city:'Yongin', region:'Giheung-gu', recipient:'Samsung SDI Co., Ltd.' },
  { addrNo:'ADDR-0000678', country:'JP', postCode:'108-0075', addr1:'1-7-1 Konan, Minato-ku, Tokyo',            city:'Tokyo', region:'Minato-ku',  recipient:'Sony Corp.' },
  { addrNo:'ADDR-0000800', country:'SG', postCode:'068898',   addr1:'80 Robinson Road, #14-02, Singapore',      city:'Singapore', region:'Central', recipient:'Momentive Singapore Pte Ltd' },
  { addrNo:'ADDR-0000900', country:'DE', postCode:'38440',    addr1:'Berliner Ring 2, Wolfsburg',               city:'Wolfsburg', region:'Lower Saxony', recipient:'Volkswagen AG' },
  { addrNo:'ADDR-0000A01', country:'CN', postCode:'518118',   addr1:'No.3009 BYD Road, Pingshan District, Shenzhen', city:'Shenzhen', region:'Guangdong', recipient:'BYD Auto Co., Ltd.' },
  { addrNo:'ADDR-0000B01', country:'KR', postCode:'06141',    addr1:'203 Teheran-ro, Gangnam-gu, Seoul',        city:'Seoul', region:'Gangnam-gu', recipient:'Hyundai Mobis Co., Ltd.' },
  { addrNo:'ADDR-0000C01', country:'KR', postCode:'06797',    addr1:'12 Heolleung-ro, Seocho-gu, Seoul',        city:'Seoul', region:'Seocho-gu',  recipient:'Kia Corp.' },
  { addrNo:'ADDR-0000D01', country:'IN', postCode:'400021',   addr1:'Maker Chambers IV, Nariman Point, Mumbai', city:'Mumbai', region:'MH',        recipient:'Reliance Industries Ltd.' },
  { addrNo:'ADDR-0000E01', country:'TH', postCode:'10800',    addr1:'1 Siam Cement Road, Bangsue, Bangkok',     city:'Bangkok', region:'Bangsue',  recipient:'SCG Chemicals Co., Ltd.' },
];

const mockCompanies = [
  { compCode:'1000', name:'Momentive Korea Co., Ltd',              country:'KR', currency:'KRW', taxProc:'TAXKR' },
  { compCode:'2000', name:'Momentive Japan KK',                    country:'JP', currency:'JPY', taxProc:'TAXJP' },
  { compCode:'3000', name:'Momentive Performance Materials Inc',   country:'US', currency:'USD', taxProc:'TAXUS' },
  { compCode:'4000', name:'Momentive Shanghai Trading Co., Ltd',   country:'CN', currency:'CNY', taxProc:'TAXCN' },
  { compCode:'5000', name:'Momentive Performance Materials GmbH',  country:'DE', currency:'EUR', taxProc:'TAXDE' },
  { compCode:'6000', name:'Momentive Singapore Pte. Ltd',          country:'SG', currency:'SGD', taxProc:'TAXSG' },
  { compCode:'7000', name:'Momentive India Pvt Ltd',               country:'IN', currency:'INR', taxProc:'TAXIN' },
  { compCode:'8000', name:'Momentive (Thailand) Co., Ltd',         country:'TH', currency:'THB', taxProc:'TAXTH' },
];

const mockSalesOrgs = [
  { code:'KR01', name:'Momentive Korea',    country:'KR', currency:'KRW' },
  { code:'JP01', name:'Momentive Japan',    country:'JP', currency:'JPY' },
  { code:'US01', name:'Momentive USA',      country:'US', currency:'USD' },
  { code:'CN01', name:'Momentive China',    country:'CN', currency:'CNY' },
  { code:'DE01', name:'Momentive Germany',  country:'DE', currency:'EUR' },
];
const mockDistChannels = [
  { code:'10', name:'Direct' },
  { code:'20', name:'Distributor' },
  { code:'30', name:'OEM' },
  { code:'40', name:'Intercompany' },
  { code:'50', name:'Service' },
];
const mockDivisions = [
  { code:'00', name:'Common' },
  { code:'10', name:'Automotive' },
  { code:'20', name:'Electronics' },
  { code:'30', name:'Construction' },
  { code:'40', name:'Personal Care' },
];
const mockCreditCtrlAreas = [
  { code:'1000', name:'Korea Credit',    currency:'KRW' },
  { code:'2000', name:'Japan Credit',    currency:'JPY' },
  { code:'3000', name:'Global USD',      currency:'USD' },
];

const mockDuplicates = [
  { cust:'0010001234', name:'Hyundai Motor Co., Ltd.',    country:'KR', bizNo:'101-81-12345', similarity:92, salesOrg:'KR01', status:'Active' },
  { cust:'0010009999', name:'Hyundai Motor Asan Corp.',   country:'KR', bizNo:'101-81-12345', similarity:78, salesOrg:'KR01', status:'Active' },
  { cust:'0010007777', name:'Hyundai Capital Co., Ltd.',  country:'KR', bizNo:'101-81-55555', similarity:41, salesOrg:'KR01', status:'Active' },
];

const baseCustomers = [
  { cust:'0010001234', name:'Hyundai Motor Co., Ltd.',       country:'KR', bizNo:'101-81-12345', custGrp:'Z001 - Domestic' },
  { cust:'0010002345', name:'LG Electronics Co., Ltd.',      country:'KR', bizNo:'107-86-12345', custGrp:'Z001 - Domestic' },
  { cust:'0010003456', name:'Samsung SDI Co., Ltd.',         country:'KR', bizNo:'108-87-23456', custGrp:'Z001 - Domestic' },
  { cust:'0010004567', name:'Hyundai Mobis Co., Ltd.',       country:'KR', bizNo:'134-81-00000', custGrp:'Z001 - Domestic' },
  { cust:'0010005678', name:'Kia Corp.',                     country:'KR', bizNo:'119-81-02994', custGrp:'Z001 - Domestic' },
  { cust:'0020001111', name:'Toyota Motor Corp.',            country:'JP', bizNo:'JP-12345',     custGrp:'Z002 - Overseas' },
  { cust:'0020002222', name:'Sony Corp.',                    country:'JP', bizNo:'JP-67890',     custGrp:'Z002 - Overseas' },
  { cust:'0030001111', name:'Apple Inc.',                    country:'US', bizNo:'US-94-1234567',custGrp:'Z002 - Overseas' },
  { cust:'0030002222', name:'Tesla, Inc.',                   country:'US', bizNo:'US-91-2197729',custGrp:'Z002 - Overseas' },
  { cust:'0040001111', name:'BYD Auto Co., Ltd.',            country:'CN', bizNo:'CN-91440300',  custGrp:'Z002 - Overseas' },
  { cust:'0050001111', name:'Volkswagen AG',                 country:'DE', bizNo:'DE-14111-VW',  custGrp:'Z002 - Overseas' },
  { cust:'0060001111', name:'Momentive Singapore Pte Ltd',   country:'SG', bizNo:'SG-202300001K',custGrp:'Z004 - Intercompany' },
];

/* ==================================================================
 * Category / sub-type label maps
 * ================================================================= */
const catLabels = {
  Domestic:     'Domestic Customer',
  Overseas:     'Overseas Customer',
  PartnerOnly:  'Ship-to / Bill-to / Payer Only',
  Intercompany: 'Intercompany',
};
const subLabels = {
  newCust:      'New Customer',
  extendSales:  'Extend to Sales Area',
  extendComp:   'Extend to Company Code',
  creditChange: 'Change Credit Limit',
  blockUnblock: 'Block / Unblock',
  reactivation: 'Reactivation',
};

/* Legacy data.js compatibility — disabled in master-data integrated environment.
const processFlows = customerFlows;
const personMap    = customerPersonMap;
*/
