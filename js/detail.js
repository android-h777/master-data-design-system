/* =================================================================
 * Shared URL parameters
 * ================================================================= */
const params = new URLSearchParams(window.location.search);
const pKind = params.get('kind') || 'material';
const isCust = (pKind === 'customer' || pKind === 'vendor');

/* =================================================================
 * Shared utilities (used by both Material and Customer/Vendor branches)
 * ================================================================= */
/* Manual rAF-based smooth scroll — same easing curve everywhere.
   Bypasses CSS / OS reduced-motion overrides. */
function smoothScrollTo(target, offset) {
  if (!target) return;
  const HEADER = offset || 100;
  const startTop = window.pageYOffset || document.documentElement.scrollTop;
  const targetTop = target.getBoundingClientRect().top + startTop - HEADER;
  const distance = targetTop - startTop;
  if (Math.abs(distance) < 2) return;
  /* duration: 거리 비례 (250~450ms) */
  const duration = Math.max(250, Math.min(450, Math.abs(distance) * 0.45));
  const startTime = performance.now();
  /* easeOutCubic — 시작 즉시 빠르게 + 끝에 부드럽게 (즉각 반응 느낌) */
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);
    window.scrollTo(0, startTop + distance * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* Shared section title — same status pill + date treatment for both branches.
   `st` is one of 'done' | 'current' | 'rejected' | 'pending'. */
function buildSectionTitleHtml(icon, titleText, st, dateStr) {
  const stCls = st === 'done' ? 'st-approved'
              : st === 'current' ? 'st-inprogress'
              : st === 'rejected' ? 'st-rejected' : '';
  const stLbl = st === 'done' ? 'Approved'
              : st === 'current' ? 'In Progress'
              : st === 'rejected' ? 'Rejected' : 'Pending';
  const showDate = (st === 'done' || st === 'rejected') && dateStr;
  const pillHtml = stCls
    ? `<span class="mr-status mr-pill-sm ${stCls}">${stLbl}</span>`
    : '';
  const dateHtml = showDate ? `<span class="section-date">${dateStr}</span>` : '';
  return `<h3 class="section-title">
    <span class="section-title-left"><i class="material-icons">${icon}</i>${titleText}</span>
    <span class="title-bar-meta">${pillHtml}${dateHtml}</span>
  </h3>`;
}

/* Shared Process Map vertical-node — same icon / person / date treatment for both branches.
   `st`: 'done' | 'current' | 'rejected' | 'pending'. */
function buildPmNodeHtml(label, st, hlClass, person) {
  const ico = st === 'done' ? 'check_circle'
            : st === 'rejected' ? 'cancel'
            : st === 'current' ? 'play_circle'
            : 'radio_button_unchecked';
  const p = person || {};
  const personHtml = p.name ? `<span class="pm-person">${p.name}</span>` : '';
  const showDate = (st === 'done' || st === 'rejected') && p.date;
  const dateHtml = showDate ? `<span class="pm-date">${p.date}</span>` : '';
  return `<div class="pm-vnode ${st}${hlClass || ''}" data-pm-label="${label}">
    <div class="pm-vnode-content"><span class="pm-vnode-label">${label}</span>${personHtml}${dateHtml}</div>
    <i class="material-icons pm-node-ico">${ico}</i></div>`;
}

/* Shared title-bar builder — Material AND Customer/Vendor both call this.
   Renders identical left (badge + id + desc) and right (status pill + progress + last-mod). */
function applyTitleBar(opts) {
  const { badgeText, idText, descText, status, lastModText } = opts;

  /* Left: badge + h2 (id + desc) */
  const badge = document.querySelector('.detail-type-badge');
  if (badge) badge.textContent = badgeText || '';
  const h2 = document.querySelector('.detail-title-left h2');
  if (h2) {
    h2.innerHTML = '';
    if (idText) {
      const idSpan = document.createElement('span');
      idSpan.className = 'detail-mr-id';
      idSpan.id = 'dHeadId';
      idSpan.textContent = '[' + idText + ']';
      h2.appendChild(idSpan);
    }
    if (descText) {
      const descSpan = document.createElement('span');
      descSpan.className = 'detail-mr-desc';
      descSpan.id = 'dHeadDesc';
      descSpan.textContent = descText;
      h2.appendChild(descSpan);
    }
  }

  /* Right: status pill + progress + last-mod, all in one flex row */
  const right = document.querySelector('.detail-title-right');
  if (right) {
    right.innerHTML = '';
    if (status) {
      const stCls = status === 'approved' ? 'st-approved'
                  : status === 'rejected' ? 'st-rejected'
                  : status === 'inprogress' ? 'st-inprogress' : '';
      const stLbl = status === 'approved' ? 'Approved'
                  : status === 'rejected' ? 'Rejected'
                  : status === 'inprogress' ? 'In Progress' : status;
      const pill = document.createElement('span');
      pill.className = 'mr-status ' + stCls;
      pill.style.cssText = 'font-size:12px; padding:3px 10px; letter-spacing:.05em; text-transform:uppercase; width:auto;';
      pill.textContent = stLbl;
      right.appendChild(pill);
    }
    if (typeof progress === 'number' && !isNaN(progress)) {
      const pg = document.createElement('span');
      pg.className = 'detail-progress';
      pg.style.cssText = 'font-size:13px; font-weight:600; color:var(--c-primary-d);';
      pg.textContent = progress + '%';
      right.appendChild(pg);
    }
    if (lastModText) {
      const lm = document.createElement('span');
      lm.className = 'detail-last-mod';
      lm.id = 'titleLastMod';
      lm.textContent = lastModText;
      right.appendChild(lm);
    }
  }
}

/* =================================================================
 * Stage view/input mode helpers — shared by Material AND Customer/Vendor
 * done: 빈 값 자동 채움 → form-static view, Approve 액션 영역 제거
 * current: 양식 + 값 그대로 (편집 가능)
 * rejected: form-static view + stage-rejected
 * pending: 양식 유지 + 값 비움 + Approve 액션 제거
 * ================================================================= */
function sampleByLabel(label) {
  const l = (label || '').toLowerCase();
  if (/code|sap|smart|id\b|#|number|no\.?$/.test(l)) return 'M-' + Math.floor(100000 + Math.random()*900000);
  if (/date/.test(l)) return '2026-04-29';
  if (/name|description|title/.test(l)) return 'Tetramethyl orthosilicate CFS-845';
  if (/vendor|supplier|partner/.test(l)) return 'Hubei Co-Formula Material Tech Co., Ltd.';
  if (/plant|warehouse|storage|location/.test(l)) return 'WTFD';
  if (/uom|unit/.test(l)) return 'KG';
  if (/qty|quantity|amount|moq|stock|time|days|lead/.test(l)) return '180';
  if (/price|cost|currency|valuation|incoterm/.test(l)) return '14.51';
  if (/email/.test(l)) return 'auto@example.com';
  if (/phone|tel|mobile/.test(l)) return '+82-2-0000-0000';
  if (/country|nation|origin/.test(l)) return 'KR';
  if (/group|category|type|class|status/.test(l)) return 'Standard';
  if (/comment|note|remark|reason|memo|background/.test(l)) return 'Reviewed and validated.';
  if (/address|street|city/.test(l)) return 'Wuhan, Hubei, CN';
  return 'Auto-filled';
}
function inferLabel(el) {
  const fg = el.closest('.form-group, td, label');
  if (!fg) return '';
  if (fg.tagName === 'TD') {
    const tr = fg.closest('tr'); const tbl = fg.closest('table');
    if (tr && tbl) {
      const idx = Array.from(tr.children).indexOf(fg);
      const head = tbl.querySelector('thead tr');
      if (head && head.children[idx]) return head.children[idx].textContent.trim();
    }
  }
  const lb = fg.querySelector ? fg.querySelector('label') : null;
  if (lb) return lb.textContent.trim();
  return '';
}
function autofillEmpty(section) {
  /* placeholder 텍스트가 라벨처럼 들어가는 케이스 차단 — 항상 sampleByLabel 우선 */
  section.querySelectorAll('input').forEach(inp => {
    if (inp.type === 'hidden' || inp.type === 'file' || inp.type === 'checkbox' || inp.type === 'radio') return;
    /* Parent Code # / SKU-code # 는 최종 승인(approved) 후에만 발급되므로 빈 placeholder 유지 */
    if (inp.id === 'parentCodeInput' || inp.classList.contains('cnt-matnum')) return;
    if (!inp.value) inp.value = sampleByLabel(inferLabel(inp));
  });
  section.querySelectorAll('select').forEach(sel => {
    const cur = sel.options[sel.selectedIndex];
    if (!cur || !cur.value || cur.disabled) {
      /* defaultSelected (HTML selected attribute) 가 명시된 옵션 우선 */
      const defaultIdx = Array.from(sel.options).findIndex(o => o.defaultSelected && o.value);
      if (defaultIdx !== -1) {
        sel.selectedIndex = defaultIdx;
      } else {
        for (let i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value && !sel.options[i].disabled) { sel.selectedIndex = i; break; }
        }
      }
    }
  });
  section.querySelectorAll('textarea').forEach(ta => {
    if (!ta.value) ta.value = sampleByLabel(inferLabel(ta));
  });
  /* hoo-table tbody가 비어있으면 sample row 1개 자동 생성 */
  section.querySelectorAll('.hoo-spec-table table.hoo-table > tbody').forEach(tbody => {
    if (tbody.children.length === 0) {
      const head = tbody.parentElement.querySelector('thead tr');
      const cols = head ? head.children.length : 5;
      const tr = document.createElement('tr');
      for (let i = 0; i < cols; i++) {
        const th = head?.children[i];
        const lbl = th ? th.textContent.trim() : '';
        const td = document.createElement('td');
        td.textContent = lbl ? sampleByLabel(lbl) : '—';
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
  });
  /* 모든 체크박스 체크 (승인 완료 상태) */
  section.querySelectorAll('.pm-confirm-card input[type="checkbox"]').forEach(cb => { cb.checked = true; });
}
function elementToStaticText(el) {
  let txt = '';
  if (el.tagName === 'SELECT') {
    const opt = el.options[el.selectedIndex];
    txt = opt && opt.value ? opt.textContent : '';
  } else if (el.type === 'checkbox' || el.type === 'radio') {
    txt = el.checked ? (el.value || 'Yes') : '';
  } else {
    txt = el.value || '';
  }
  const div = document.createElement('div');
  div.className = 'form-static stage-view-text';
  div.textContent = txt || '—';
  return div;
}
function convertSectionToView(section, opts) {
  const empty = !!(opts && opts.empty);
  section.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(el => {
    el.checked = !empty;
    el.disabled = true;
  });
  section.querySelectorAll('select').forEach(sel => {
    const div = empty ? Object.assign(document.createElement('div'), { className:'form-static stage-view-text', textContent:'—' }) : elementToStaticText(sel);
    const wrap = sel.closest('.bi-select-wrap, .select-wrapper');
    (wrap || sel).replaceWith(div);
  });
  section.querySelectorAll('input').forEach(inp => {
    if (inp.type === 'hidden' || inp.type === 'file' || inp.type === 'checkbox' || inp.type === 'radio') return;
    const div = empty ? Object.assign(document.createElement('div'), { className:'form-static stage-view-text', textContent:'—' }) : elementToStaticText(inp);
    const wrap = inp.closest('.aniInput, .input-with-icon, .input-field');
    (wrap || inp).replaceWith(div);
  });
  section.querySelectorAll('textarea').forEach(ta => {
    const div = document.createElement('div');
    div.className = 'form-static stage-view-text stage-view-textarea';
    div.textContent = empty ? '—' : (ta.value || '—');
    const wrap = ta.closest('.input-field');
    (wrap || ta).replaceWith(div);
  });
  /* 도구 / Add row / Upload / Compare / 행 삭제 / dropzone wizard / scope·sub 액션 등 모든 편집 UI 제거 */
  section.querySelectorAll('.hoo-x, .hoo-tool-btn, .bi-block-meta, .bi-add-btn, .hBtn-sm, .hoo-spec-tools, .sub-table-actions, .tax-sub-actions, .scope-add').forEach(el => el.remove());
  /* readonly-val (회색 박스) → form-static 텍스트로 변환 (view 모드 일관성) */
  section.querySelectorAll('.readonly-val').forEach(el => {
    el.className = 'form-static stage-view-text';
  });
  /* doc-verify-inline 제거 시 이전 형제 'AI Document Verification' 헤더도 같이 */
  section.querySelectorAll('.doc-verify-inline').forEach(el => {
    const prev = el.previousElementSibling;
    if (prev && prev.classList.contains('bi-block-title') && /document verification/i.test(prev.textContent)) {
      prev.remove();
    }
    el.remove();
  });
  /* Approve/Reject 액션 영역 제거 (view 모드) */
  section.querySelectorAll('.pm-confirm-actions').forEach(el => el.remove());
  section.classList.add('stage-view');
  if (empty) section.classList.add('stage-empty');
}
/* 모든 detail-section 카드에 마우스 추적 빛 반사 (mr-list-wrap 패턴).
   --ds-gx, --ds-gy 좌표를 mousemove로 갱신. idempotent. */
function initStageCardGlow(root) {
  const scope = root || document;
  scope.querySelectorAll('.detail-section').forEach(card => {
    if (card._glowInit) return;
    card._glowInit = true;
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--ds-gx', ((e.clientX - r.left) / r.width) * 100 + '%');
      card.style.setProperty('--ds-gy', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
  });
}

/* 모든 hoo-table 헤더 라벨 분석:
   - 숫자 컬럼 → .hoo-num (우측 정렬)
   - 날짜 컬럼 → .hoo-date (가운데 정렬)
   idempotent. */
function autoAlignNumericColumns(root) {
  const scope = root || document;
  const dateRe = /(date|valid\s*(from|to)?$|^valid$|expir|effective|deadline)/i;
  const numRe = /(qty|quantity|amount|price|cost|moq|stock|lead|days|seq|number|rate|net|content|account|hours|weight|gross|tare|tax|^#|\s#)/i;
  scope.querySelectorAll('.hoo-table').forEach(tbl => {
    const headers = tbl.querySelectorAll('thead th');
    const numIdx = [], dateIdx = [];
    headers.forEach((th, i) => {
      const txt = th.textContent.trim();
      if (dateRe.test(txt)) dateIdx.push(i);
      else if (th.classList.contains('hoo-th-num') || numRe.test(txt)) numIdx.push(i);
    });
    tbl.querySelectorAll('tbody > tr').forEach(tr => {
      numIdx.forEach(i => { if (tr.children[i]) tr.children[i].classList.add('hoo-num'); });
      dateIdx.forEach(i => { if (tr.children[i]) tr.children[i].classList.add('hoo-date'); });
    });
  });
}
function clearSectionInputs(section) {
  section.querySelectorAll('input:not([readonly])').forEach(el => {
    if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
    else el.value = '';
  });
  section.querySelectorAll('textarea').forEach(el => { el.value = ''; });
  section.querySelectorAll('select').forEach(el => {
    /* HTML 에 명시된 selected attribute (defaultSelected) 가 있으면 우선 — productModel 분기로
       박은 default 값(예: FG 의 Finished Goods)을 보존. 없으면 placeholder 또는 0번 fallback */
    const defaultIdx = Array.from(el.options).findIndex(o => o.defaultSelected);
    if (defaultIdx !== -1) {
      el.selectedIndex = defaultIdx;
      return;
    }
    let resetIdx = 0;
    for (let i = 0; i < el.options.length; i++) {
      if (el.options[i].disabled || !el.options[i].value) { resetIdx = i; break; }
    }
    el.selectedIndex = resetIdx;
  });
  section.querySelectorAll('.hoo-table tbody tr').forEach(r => r.remove());
  if (typeof M !== 'undefined' && M.FormSelect) M.FormSelect.init(section.querySelectorAll('select'));
}

/* =================================================================
 * ██  MATERIAL MODE
 * ================================================================= */
if (!isCust) {
  const pType = params.get('type') || 'Raw Material';
  const pSub = params.get('sub') || 'new';
  const pMtl = params.get('mtl') || '';
  const pStatus = params.get('status') || 'inprogress';
  const pCurrentNode = params.get('currentNode') || '';
  const pId = params.get('id') || '';
  const pPerson = params.get('person') || '';
  const pDate = params.get('date') || '';
  const pDesc = params.get('desc') || '';
  const pDv   = params.get('dv') || '';

  if (pPerson) {
    personMap['Request'] = { name: pPerson, date: pDate || (personMap['Request'] && personMap['Request'].date) };
  }

  const flowStageNames = {
    'new':          ['Dept. Review', 'Compliance'],
    'plant':        ['Dept. Review', 'Evaluation', 'Compliance'],
    'packing':      ['Dept. Review', 'Evaluation', 'Compliance'],
    'reactivation': ['Dept. Review', 'Evaluation', 'Compliance'],
  };
  function buildRoutingData(flow, key) {
    const routing = [];
    const names = flowStageNames[key] || [];
    let rowIdx = 0;
    flow.nodes.forEach(node => {
      if (node.type === 'node') {
        routing.push([node.label, [node.label]]);
      } else if (node.type === 'row') {
        const name = names[rowIdx] || ('Stage ' + (rowIdx + 1));
        routing.push([name, node.items, true]);
        rowIdx++;
      }
    });
    return routing;
  }
  const isFG = (pType === 'Finished Goods' || pType === 'Semi-Finished');

  /* type 별 single source of truth — productModel 은 type 별 default(label / pm / plants 톤)
     + bank 항목(fullName / composition / release 등) 합집합. mr.id 기반 hash 로 bank 항목 pick →
     같은 type 의 다른 MR 들이 풀 안에서 분배되어 mock 다양성 확보 */
  const _bank = isFG ? fgProductBank : matProductBank;
  const _idNum = parseInt(String(pId || '').replace(/\D/g, ''), 10) || 0;
  const _bankItem = _bank[_idNum % _bank.length] || _bank[0];
  const productModel = {
    nameLabel:       isFG ? 'Product Name' : 'Material Name',
    parentCodeLabel: isFG ? 'Parent FG Code' : 'Parent RM Code',
    parentNameLabel: isFG ? 'Parent FG Name' : 'Parent RM Name',
    fullName:        _bankItem.fullName,
    spec:            _bankItem.spec,
    substance:       _bankItem.substance,
    descLine:        _bankItem.descLine || _bankItem.fullName,
    cnt1Name:        _bankItem.fullName + ' / DRUM / 180 KG',
    cnt2Name:        _bankItem.fullName + ' / BULK',
    reasonText:      _bankItem.reasonText,
    composition:     _bankItem.composition,
    pm: isFG ? {
      materialTypeOptionsHtml: '<option>Raw Material</option><option>Semi-Finished</option><option selected>Finished Goods</option>',
      usageLabel: 'Application',
      usageOptionsHtml: '<option selected>Adhesive Primer</option><option>Sealant</option><option>Coating</option><option>Industrial</option>',
      priceLabel: 'Selling price',
      productTextsValue: _bankItem.productTextsValue,
      confirmItems: [
        'Selling price with currency',
        'Update product texts',
        'Application &amp; target customer',
        'Pricing margin reviewed',
        "Validate requestor's tab information",
      ],
    } : {
      materialTypeOptionsHtml: '<option selected>Raw Material</option><option>Semi-Finished</option><option>Finished Goods</option>',
      usageLabel: 'Material Usage',
      usageOptionsHtml: '<option selected>Raw ingredient</option><option>Catalyst</option><option>Solvent</option>',
      priceLabel: 'Purchase price',
      productTextsValue: _bankItem.productTextsValue,
      confirmItems: [
        'ASP with currency',
        'Update product texts',
        'Material usage',
        'Product management data',
        "Validate requestor's tab information",
      ],
    },
    release: {
      parentCode:       _bankItem.release.parentCode,
      manufactureLabel: isFG ? 'Manufacturing Site' : 'Vendor',
      manufactureValue: _bankItem.release.manufactureValue || (isFG ? 'KCC Otha Plant' : 'External Supplier'),
      hsCode:           _bankItem.release.hsCode,
      unNumber:         _bankItem.release.unNumber,
      variants:         _bankItem.release.variants.map(function(v){ return Object.assign({}, v, {
        packPillCls: v.packLabel === 'Bulk' ? 'sc-pack-bulk' : '',
        plants: isFG
          ? [{ code:'OTHA',   loc:'FG-A1 \u00b7 Finished Goods A' }, { code:'GUNSAN', loc:'FG-B1 \u00b7 Finished Goods' }]
          : [{ code:'WTFD',   loc:'RM-A1 \u00b7 Raw Material A'   }, { code:'SVLL',   loc:'RM-B1 \u00b7 Raw Material'     }],
      }); }),
    },
  };
  /* CAS 두 개 강조 표시 (Release stage 의 rel-master-val 에서 사용) */
  const productModelCasList = productModel.composition.slice(0, 2).map(c => c.cas).join(' · ');

  /* SKU helper — variants 를 Basic Info SKU 표 / PM stage Mat#X 행 으로 동적 렌더할 때 사용.
     matName 자동 생성: <fullName> / <containerCode>[ / <netContent> <uom>]. BULK 는 net 생략 */
  productModel.skuList = productModel.release.variants.map(v => {
    const hasNet = v.netContent !== '' && v.netContent != null && v.containerCode !== 'BULK';
    const matName = productModel.fullName
      + ' / ' + (v.containerCode || v.packLabel.toUpperCase())
      + (hasNet ? ' / ' + v.netContent + ' ' + (v.uom || '') : '');
    return Object.assign({}, v, { matName });
  });

  const routingData = {};
  Object.keys(processFlows).forEach(key => {
    routingData[key] = buildRoutingData(isFG ? finishedGoodsFlow : processFlows[key], key);
  });

  function buildProgressStatus(flow, currentNode, status) {
    const steps = [];
    flow.nodes.forEach(n => {
      if (n.type === 'node') steps.push({ type:'node', items:[n.label] });
      else if (n.type === 'row') steps.push({ type:'row', items:[...n.items] });
    });
    if (status === 'approved') {
      const result = {};
      steps.forEach(s => s.items.forEach(label => result[label] = 'done'));
      return result;
    }
    /* currentNode 미지정(신규 진입 등) → 첫 step(Request) current */
    let activeStepIdx = steps.findIndex(s => s.items.includes(currentNode));
    if (activeStepIdx === -1) activeStepIdx = 0;
    const result = {};
    const curState = (status === 'rejected') ? 'rejected' : 'current';
    steps.forEach((step, si) => {
      if (si < activeStepIdx) {
        step.items.forEach(label => result[label] = 'done');
      } else if (si === activeStepIdx) {
        step.items.forEach(label => {
          if (currentNode && label !== currentNode) result[label] = 'done';
          else result[label] = curState;
        });
      } else {
        step.items.forEach(label => result[label] = 'pending');
      }
    });
    return result;
  }
  const currentFlow = isFG ? finishedGoodsFlow : (processFlows[pSub] || processFlows['new']);
  const progressStatus = buildProgressStatus(currentFlow, pCurrentNode, pStatus);

  function renderRouting() {
    const stages = routingData[pSub] || routingData['new'];
    const timeline = document.getElementById('routingTimeline');
    let secIdx = 0;

    timeline.innerHTML = stages.map((stage, si) => {
      const [label, roles, parallel] = stage;
      const roleStatuses = roles.map(r => progressStatus[r] || 'pending');
      const allDone = roleStatuses.every(s => s === 'done');
      const anyRejected = roleStatuses.some(s => s === 'rejected');
      const anyActive = roleStatuses.some(s => s === 'done' || s === 'current');
      let stageState = 'pending';
      if (anyRejected) stageState = 'rejected';
      else if (allDone) stageState = 'done';
      else if (anyActive) stageState = 'active';
      const stageIco = stageState === 'rejected' ? 'cancel'
                     : stageState === 'done' ? 'check_circle'
                     : stageState === 'active' ? 'play_circle'
                     : 'radio_button_unchecked';
      const stageClass = stageState === 'rejected' ? ' rejected'
                       : stageState === 'done' ? ' done'
                       : stageState === 'active' ? ' active'
                       : '';

      function cardHtml(role, secI, showCircle) {
        const p = personMap[role] || { name:'TBD' };
        const st = progressStatus[role] || 'pending';
        const subIco = st === 'rejected' ? 'cancel'
                     : st === 'done' ? 'check_circle'
                     : st === 'current' ? 'play_circle'
                     : 'radio_button_unchecked';
        const subCls = st === 'rejected' ? ' rt-sub-rejected'
                     : st === 'done' ? ' rt-sub-done'
                     : st === 'current' ? ' rt-sub-current'
                     : '';
        if (showCircle) {
          return `<div class="rt-card waves-effect${subCls}" data-section="${secI}">
            <i class="material-icons rt-sub-circle${subCls}">${subIco}</i>
            <div class="rt-card-info"><span class="rt-role">${role}</span><span class="rt-name">${p.name}</span></div></div>`;
        }
        return `<div class="rt-card waves-effect${subCls}" data-section="${secI}">
          <span class="rt-role">${role}</span><span class="rt-name">${p.name}</span></div>`;
      }

      const isSingle = !parallel && roles.length === 1;
      let cardsHtml = '';
      if (stageContent[label]) {
        cardsHtml = cardHtml(roles[0], secIdx, false); secIdx++;
      } else if (parallel && roles.length > 1) {
        cardsHtml = roles.map(role => { const h = cardHtml(role, secIdx, true); secIdx++; return h; }).join('');
      } else {
        cardsHtml = cardHtml(roles[0], secIdx, false); secIdx++;
      }

      const parallelBadge = parallel ? '<span class="rt-parallel"><i class="material-icons">call_split</i>Parallel</span>' : '';
      return `<div class="rt-group${isSingle ? ' rt-group-compact' : ''}">
        <div class="rt-stage"><div class="rt-circle${stageClass}"><i class="material-icons">${stageIco}</i></div>
          <div class="rt-stage-label">${label}${parallelBadge}</div></div>
        <div class="rt-cards${parallel ? ' parallel' : ''}">${cardsHtml}</div></div>`;
    }).join('');
  }

  const subLabels = { 'new':'New Code Creation', 'plant':'Add Plant', 'packing':'Add Packing Size', 'reactivation':'Reactivation' };
  function updateTitle() {
    applyTitleBar({
      badgeText: subLabels[pSub] ? (pType ? pType + ' · ' + subLabels[pSub] : subLabels[pSub]) : pType,
      idText: pId,
      descText: pDesc,
      status: pStatus,
      lastModText: pDate ? 'Last Mod. ' + pDate : '',
    });
  }

  const stageIcons = {
    'Request':'edit_note','Material Master':'admin_panel_settings','Dept. Review':'groups',
    'Evaluation':'checklist','Compliance':'verified_user','Finance':'account_balance',
    'Release':'rocket_launch','Product Management':'category','Quality':'verified',
    'Technologist':'engineering',
    'Supply Chain':'local_shipping','Sourcing':'shopping_cart','Customs(GTC)':'public',
    'EHS':'eco','Logistic':'warehouse','Production':'precision_manufacturing','Repack':'inventory_2',
  };

  const stageContent = {
    'Request': `
      <div class="form-grid col-3">
        <div class="form-group"><label>Request Type</label>
          <div class="form-static">${pType || 'Raw Material'}</div>
        </div>
        <div class="form-group"><label>Requestor</label>
          <div class="form-static">${pPerson || 'Jongho Lee'}</div>
        </div>
        <div class="form-group"><label>Request Date</label>
          <div class="form-static">${pDate || 'Feb 05, 2026'}</div>
        </div>
      </div>

      <h5 class="bi-block-title"><span class="bi-bar"></span>AI Document Verification</h5>
      <div class="doc-verify-inline ai-verify" id="docVerifyInline">
        <span class="ai-aura"></span>
        <div class="dv-inline-intro">
          <div class="dvc-text">
            <span class="ai-badge"><i class="material-icons">bolt</i>AI-Agent</span>
            ${isFG ? `
            <b>Product Code Creation Details</b>
            <span>Please provide technical requirements and the composition file to initiate code registration. Our AI extracts product details and scans Material Master for similar formulations.</span>
            ` : `
            <b>Smart document review &amp; duplicate detection</b>
            <span>Upload TDS / MSDS / Composition — our AI extracts fields, auto-fills the form, and scans Material Master for duplicates.</span>
            `}
          </div>
        </div>

        <!-- Stepper — 2 steps: upload (with parse) → duplicate check -->
        <div class="dv-stepper">
          <div class="dv-step is-active" data-step="1">
            <div class="dv-step-num">1</div>
            <div class="dv-step-label">Upload &amp; Parse</div>
          </div>
          <div class="dv-line"></div>
          <div class="dv-step" data-step="2">
            <div class="dv-step-num">2</div>
            <div class="dv-step-label">Duplicate Check</div>
          </div>
        </div>

        <!-- Sliding panels — only the active panel is shown -->
        <div class="dv-panels">
          <div class="dv-panel is-active" data-panel="1">
            <div class="dz-grid">
              ${isFG ? `
              <div class="dropzone dropzone-textarea" data-kind="Spec">
                <div class="dz-head">
                  <div class="dz-icon">REQ</div>
                  <div>
                    <div class="dz-title">Product Specifications<span class="req">*</span></div>
                    <div class="dz-sub">Customer needs · technical requirements</div>
                  </div>
                </div>
                <div class="dz-body">
                  <textarea class="detail-textarea fg-spec-textarea" id="fgSpecText" placeholder="e.g., Customer Acme Poly needs SILQUEST A-1100 SILANE in TSP 16KG container with ≥99% purity for adhesive primer line. Annual demand ~12 tons, lead time 6 weeks."></textarea>
                </div>
              </div>
              ` : `
              <div class="dropzone" id="dzTds" data-kind="Tds">
                <div class="dz-head">
                  <div class="dz-icon">TDS</div>
                  <div>
                    <div class="dz-title">Technical Data Sheet<span class="req">*</span></div>
                    <div class="dz-sub">Product datasheet · PDF, XLSX</div>
                  </div>
                </div>
                <div class="dz-body">
                  <div class="dz-hint" id="dzTdsHint">
                    <b>Drag &amp; drop file here</b>
                    <span class="dz-or">or click to browse</span>
                  </div>
                </div>
                <input type="file" hidden id="inpTds">
              </div>
              <div class="dropzone" id="dzMsds" data-kind="Msds">
                <div class="dz-head">
                  <div class="dz-icon">MSDS</div>
                  <div>
                    <div class="dz-title">Safety Data Sheet<span class="req">*</span></div>
                    <div class="dz-sub">MSDS / SDS · PDF</div>
                  </div>
                </div>
                <div class="dz-body">
                  <div class="dz-hint" id="dzMsdsHint">
                    <b>Drag &amp; drop file here</b>
                    <span class="dz-or">or click to browse</span>
                  </div>
                </div>
                <input type="file" hidden id="inpMsds">
              </div>
              `}
              <div class="dropzone" id="dzComp" data-kind="Comp">
                <div class="dz-head">
                  <div class="dz-icon">CMP</div>
                  <div>
                    <div class="dz-title">Composition Sheet<span class="req">*</span></div>
                    <div class="dz-sub">Ingredients · XLSX, PDF</div>
                  </div>
                </div>
                <div class="dz-body">
                  <div class="dz-hint" id="dzCompHint">
                    <b>Drag &amp; drop file here</b>
                    <span class="dz-or">or click to browse</span>
                  </div>
                </div>
                <input type="file" hidden id="inpComp">
              </div>
            </div>
            <button class="hBtn hViolet btn-parse" id="parseBtn" disabled><i class="material-icons">auto_awesome</i><span class="label">Parse &amp; Auto-fill</span></button>
            <div class="dv-panel-actions">
              <span class="dv-hint" id="dv1Hint">${isFG ? 'Complete the description and attach the composition sheet to continue' : 'Upload 3 documents and click Parse to continue'}</span>
            </div>
          </div><!-- /panel 1 -->

          <div class="dv-panel" data-panel="2">
            <p class="dv-hint-text">${isFG ? 'Scan existing Material Master for similar finished goods' : 'Scan existing Material Master for similar raw materials'}</p>
            <div id="dupEmpty" class="dup-empty">
              <div class="de-icon"><i class="material-icons icon-sm-32">content_copy</i></div>
              <div class="de-text">
                <b>Duplicate check is waiting for document parsing</b>
                <span>${isFG ? 'Fill the product specifications and attach a Composition Sheet above, then run <i>Parse &amp; Auto-fill</i>. The system will scan Material Master for similar finished goods.' : 'Upload TDS, MSDS and Composition Sheet above and run <i>Parse &amp; Auto-fill</i>. The system will then scan Material Master for candidates similar to this request.'}</span>
              </div>
            </div>
            <div id="dupContent" class="dup-content">
              ${isFG ? `
              <div class="dup-summary">
                <div class="ds-cell">
                  <div class="ds-label">Brand</div>
                  <div class="ds-value" id="dupBrand">—<small>from Composition</small></div>
                </div>
                <div class="ds-cell">
                  <div class="ds-label">${productModel.nameLabel}</div>
                  <div class="ds-value" id="dupProduct">—<small>from Composition</small></div>
                </div>
                <div class="ds-cell">
                  <div class="ds-label">Functional Group</div>
                  <div class="ds-value" id="dupFuncGroup">—<small>chemistry class</small></div>
                </div>
                <div class="ds-cell">
                  <div class="ds-label">Main Component</div>
                  <div class="ds-value" id="dupMainComp">—<small>highest weight %</small></div>
                </div>
              </div>
              <div class="dup-head">
                <span class="h-title">FG Similarity Scan — Description &amp; BOM</span>
                <span class="h-info" id="dupScanInfo">—</span>
              </div>
              <div class="hoo-spec-table dup-spec-table">
                <table class="hoo-table">
                  <colgroup>
                    <col style="width:110px">
                    <col>
                    <col style="width:170px">
                    <col style="width:110px">
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Mat. Code</th>
                      <th>Description</th>
                      <th>Similarity</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody id="dupListFG"></tbody>
                </table>
              </div>
              ` : `
              <div class="dup-summary">
                <div class="ds-cell">
                  <div class="ds-label">Vendor</div>
                  <div class="ds-value" id="dupVendor">—<small>from TDS</small></div>
                </div>
                <div class="ds-cell">
                  <div class="ds-label">Material Name</div>
                  <div class="ds-value" id="dupName">—<small>from TDS</small></div>
                </div>
                <div class="ds-cell">
                  <div class="ds-label">Spec</div>
                  <div class="ds-value" id="dupSpec">—<small>from TDS</small></div>
                </div>
                <div class="ds-cell">
                  <div class="ds-label">CAS #</div>
                  <div class="ds-value" id="dupCas">—<small>from Composition Rate</small></div>
                </div>
              </div>
              <div class="dup-head">
                <span class="h-title">Existing candidates in Material Master</span>
                <span class="h-info" id="dupScanInfo">—</span>
              </div>
              <div class="hoo-spec-table dup-spec-table">
                <table class="hoo-table">
                  <colgroup>
                    <col style="width:120px">
                    <col>
                    <col style="width:220px">
                    <col style="width:170px">
                    <col style="width:110px">
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Parent Code #</th>
                      <th>Name / CAS</th>
                      <th>Similarity</th>
                      <th>Plant · Vendor</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody id="dupList"></tbody>
                </table>
              </div>
              `}
              <div class="dup-confirm" id="dupConfirm">
                <div class="dup-confirm-warn">
                  <i class="material-icons">warning_amber</i>
                  <div class="dcw-text">
                    <b>Creating a new code without proper review causes data fragmentation</b>
                    <span>Once created you will be the <em>responsible owner</em> for this master record. Please confirm each item below before proceeding.</span>
                  </div>
                </div>
                <ul class="dup-confirm-checks">
                  <li><label class="dup-chk"><input type="checkbox" class="chk-confirm" data-confirm="reviewed"><span class="dup-chk-box"></span><span class="dup-chk-label">I have reviewed <b>every candidate</b> in the list above</span></label></li>
                  <li><label class="dup-chk"><input type="checkbox" class="chk-confirm" data-confirm="distinct"><span class="dup-chk-box"></span><span class="dup-chk-label">I confirm <b>none of them</b> represent the same material</span></label></li>
                  <li><label class="dup-chk"><input type="checkbox" class="chk-confirm" data-confirm="responsibility"><span class="dup-chk-box"></span><span class="dup-chk-label">I accept <b>responsibility</b> as the owner of this new master record</span></label></li>
                </ul>
              </div>
            </div>
            <div class="dv-panel-actions">
              <a href="javascript:;" class="hBtn hGrey waves-effect" id="dvBackTo1"><i class="material-icons">arrow_back</i><span class="label">Back</span></a>
              <button class="hBtn hViolet waves-effect" id="btnConfirmDup" disabled><i class="material-icons">arrow_forward</i><span class="label">Proceed</span></button>
            </div>
          </div><!-- /panel 2 (duplicate check) -->
        </div><!-- /dv-panels -->
      </div>

      <!-- Basic Information (revealed after Proceed) -->
      <div id="basicInfoPanel" class="basic-info-panel">
        <h5 class="bi-block-title"><span class="bi-bar"></span>PARENT CODE INFO</h5>

        <div class="parent-code-card">
        <span class="pc-tag"><i class="material-icons">hub</i>PARENT</span>
        <div class="form-grid">
          <div class="form-group">
            <label>${productModel.parentCodeLabel}</label>
            <div class="aniInput"><input type="text" id="parentCodeInput" class="browser-default" value="${pStatus === 'approved' ? productModel.release.parentCode : ''}" placeholder="auto generate" readonly><span class="focus-border"></span></div>
          </div>
          <div class="form-group">
            <label>${productModel.parentNameLabel}</label>
            <div class="aniInput"><input type="text" class="browser-default mat-name-input" value="${productModel.fullName}" placeholder="${isFG ? 'from Composition' : 'from TDS'}"><span class="focus-border"></span></div>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group span-2">
            <label>Reason for Request <span class="req">*</span></label>
            <textarea class="detail-textarea" rows="4">${productModel.reasonText}</textarea>
          </div>
        </div>
        </div><!-- /parent-code-card -->

        <div class="parent-code-children">
          <div class="bi-block-head pcc-head">
            <h5 class="bi-block-title pcc-title"><span class="bi-bar"></span>SKU-CODE<span class="pcc-count" id="skuCodeCount">${productModel.skuList.length}</span></h5>
            <div class="bi-block-meta">
              <a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light" id="biAddContainer"><i class="material-icons">add</i><span class="label">Add row</span></a>
            </div>
          </div>
          <div class="hoo-spec-table">
            <table class="hoo-table" id="biContainerTable">
              <colgroup>
                <col style="width:40px">
                <col style="width:120px">
                <col style="width:110px">
                <col style="width:80px">
                <col style="width:140px">
                <col>
                <col style="width:36px">
              </colgroup>
              <thead>
                <tr>
                  <th>No.</th>
                  <th class="hoo-th-key">Container <span class="hoo-req">*</span></th>
                  <th class="hoo-th-num">Net Content</th>
                  <th>UOM</th>
                  <th>SKU-code #</th>
                  <th>${productModel.nameLabel}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${productModel.skuList.map((sku, i) => {
                  const containerOpts = ['DRUM','BULK','IBC','CAN','CARTRIDGE','PAIL','BAG','BOTTLE','TANK','FIBC'];
                  const uomOpts = ['KG','L','GAL','LB','ml','EA','TON'];
                  const containerHtml = containerOpts.map(c => `<option value="${c}"${c === sku.containerCode ? ' selected' : ''}>${c}</option>`).join('');
                  const uomHtml = uomOpts.map(u => `<option value="${u}"${u === sku.uom ? ' selected' : ''}>${u}</option>`).join('');
                  return `
                <tr>
                  <td class="hoo-no">${i + 1}</td>
                  <td>
                    <div class="bi-select-wrap">
                      <select class="bi-select browser-default cnt-container">
                        <option value="">Select…</option>
                        ${containerHtml}
                      </select>
                    </div>
                  </td>
                  <td><div class="aniInput"><input type="number" min="0" step="0.01" class="browser-default hoo-num cnt-net" value="${sku.netContent}"><span class="focus-border"></span></div></td>
                  <td>
                    <div class="bi-select-wrap">
                      <select class="bi-select browser-default cnt-uom">
                        ${uomHtml}
                      </select>
                    </div>
                  </td>
                  <td><div class="aniInput"><input type="text" class="browser-default cnt-matnum" value="${pStatus === 'approved' ? sku.code : ''}" placeholder="auto generate" readonly><span class="focus-border"></span></div></td>
                  <td><div class="aniInput"><input type="text" class="browser-default cnt-matname" value="${sku.matName}" readonly><span class="focus-border"></span></div></td>
                  <td class="hoo-x"><i class="material-icons">close</i></td>
                </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="bi-block-head">
          <h5 class="bi-block-title"><span class="bi-bar"></span>COMPOSITION RATE</h5>
          <div class="bi-block-meta">
            <a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light" id="compAddRow"><i class="material-icons">add</i><span class="label">Add row</span></a>
          </div>
        </div>
        <div class="hoo-spec-table">
          <table class="hoo-table" id="biCompTable">
            <colgroup>
              <col style="width:40px">
              <col style="width:140px">
              <col>
              <col style="width:200px">
              <col style="width:36px">
            </colgroup>
            <thead>
              <tr>
                <th>No.</th>
                <th class="hoo-th-key">CAS Number <span class="hoo-req">*</span></th>
                <th>Chemical Name</th>
                <th>Rate</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${productModel.composition.map((c, i) => `
              <tr>
                <td class="hoo-no">${i + 1}</td>
                <td><div class="aniInput"><input type="text" class="browser-default comp-cas-input" value="${c.cas}"><span class="focus-border"></span></div></td>
                <td class="comp-chem">${c.chem}</td>
                <td>
                  <div class="hoo-bar-cell">
                    <span class="comp-bar"><span class="comp-fill" style="width:${c.pct}%"></span></span>
                    <div class="comp-pct-input-wrap">
                      <input type="number" min="0" max="100" step="0.1" class="browser-default comp-pct-input" value="${c.pct}">
                      <span class="comp-pct-suffix">%</span>
                    </div>
                  </div>
                </td>
                <td class="hoo-x"><i class="material-icons">close</i></td>
              </tr>`).join('')}
            </tbody>
            <tfoot>
              <tr class="hoo-tfoot-row">
                <td colspan="3" class="hoo-tfoot-label">TOTAL</td>
                <td class="hoo-tfoot-value"><b id="compTotal">100%</b></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="bi-block-head">
          <h5 class="bi-block-title"><span class="bi-bar"></span>PROCUREMENT PLANT &amp; WAREHOUSE</h5>
          <div class="bi-block-meta">
            <a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light" id="biAddPlant"><i class="material-icons">add</i><span class="label">Add row</span></a>
          </div>
        </div>
        <div class="hoo-spec-table">
          <table class="hoo-table" id="biPlantTable">
            <colgroup>
              <col style="width:40px">
              <col>
              <col>
              <col style="width:170px">
              <col style="width:36px">
            </colgroup>
            <thead>
              <tr>
                <th>No.</th>
                <th class="hoo-th-key">Procurement Plant <span class="hoo-req">*</span></th>
                <th class="hoo-th-key">Warehouse <span class="hoo-req">*</span></th>
                <th>Purchasing Org</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="hoo-no">1</td>
                <td>
                  <div class="bi-select-wrap">
                    <select class="bi-select browser-default">
                      <option value="WTFD" selected>WTFD — Waterford</option>
                      <option value="SVLL">SVLL — Sistersville</option>
                      <option value="GART">GART — Gart</option>
                    </select>
                  </div>
                </td>
                <td>
                  <div class="bi-select-wrap">
                    <select class="bi-select browser-default">
                      <option value="WTFD" selected>WTFD — Waterford</option>
                      <option value="SVLL">SVLL — Sistersville</option>
                      <option value="GART">GART — Gart</option>
                    </select>
                  </div>
                </td>
                <td><div class="bi-readonly"><i class="material-icons bi-readonly-ico">lock</i><span class="bi-readonly-text">AM01 — America</span></div></td>
                <td class="hoo-x"><i class="material-icons">close</i></td>
              </tr>
              <tr>
                <td class="hoo-no">2</td>
                <td>
                  <div class="bi-select-wrap">
                    <select class="bi-select browser-default">
                      <option value="WTFD">WTFD — Waterford</option>
                      <option value="SVLL" selected>SVLL — Sistersville</option>
                      <option value="GART">GART — Gart</option>
                    </select>
                  </div>
                </td>
                <td>
                  <div class="bi-select-wrap">
                    <select class="bi-select browser-default">
                      <option value="WTFD">WTFD — Waterford</option>
                      <option value="SVLL" selected>SVLL — Sistersville</option>
                      <option value="GART">GART — Gart</option>
                    </select>
                  </div>
                </td>
                <td><div class="bi-readonly"><i class="material-icons bi-readonly-ico">lock</i><span class="bi-readonly-text">AM01 — America</span></div></td>
                <td class="hoo-x"><i class="material-icons">close</i></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Confirmation -->
        <div class="pm-confirm-card">
          <div class="pm-confirm-head">
            <i class="material-icons">fact_check</i>
            <div>
              <div class="pm-confirm-title">Submit Request</div>
              <div class="pm-confirm-sub">All Basic Information must be verified before submission.</div>
            </div>
          </div>
          <ul class="pm-check-list">
            <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">AI document verification completed</span></label></li>
            <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Parent Code Info fields are complete</span></label></li>
            <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Composition Rate adds up to 100%</span></label></li>
            <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Procurement plant &amp; container defined</span></label></li>
          </ul>
          <div class="pm-confirm-actions">
            <button class="hBtn hGrey waves-effect"><i class="material-icons">close</i><span class="label">Reject</span></button>
            <button class="hBtn hViolet waves-effect pm-approve" disabled><i class="material-icons">check</i><span class="label">Approve</span></button>
          </div>
        </div>
      </div>`,
    'Material Master': `
      <div class="form-grid col-3">
        <div class="form-group"><label>Product Information <span class="req">*</span></label>
          <select><option value="" disabled>Select</option><option selected>New Product (NPI)</option><option>Existing Product</option></select>
        </div>
        <div class="form-group"><label>Similar Substance</label>
          <div class="aniInput input-with-icon"><input type="text" class="browser-default" value="182441"><span class="focus-border"></span><i class="material-icons input-icon">search</i></div>
        </div>
        <div class="form-group"><label>Identical Substance</label>
          <div class="aniInput input-with-icon"><input type="text" class="browser-default" value="—" placeholder="None found"><span class="focus-border"></span><i class="material-icons input-icon">search</i></div>
        </div>
        <div class="form-group"><label>${productModel.nameLabel}</label>
          <div class="aniInput"><input type="text" class="browser-default" value="${productModel.descLine}"><span class="focus-border"></span></div>
        </div>
      </div>
      <h5 class="bi-block-title"><span class="bi-bar"></span>Production and Target Plant Matrix</h5>
      <div class="form-grid col-3">
        <div class="form-group"><label>Material</label><div class="aniInput"><input type="text" class="browser-default" value="—" placeholder="Auto-assigned on save"><span class="focus-border"></span></div></div>
        <div class="form-group"><label>Description</label><div class="aniInput"><input type="text" class="browser-default" value="${productModel.substance}"><span class="focus-border"></span></div></div>
        <div class="form-group"><label>Substance Name</label><div class="aniInput"><input type="text" class="browser-default" value="${productModel.spec}"><span class="focus-border"></span></div></div>
      </div>
      <div class="form-grid col-6 form-grid--gap">
        <div class="form-group"><label>Container</label><select><option value="" disabled>Select</option><option selected>Drum</option><option>Bag</option><option>IBC</option></select></div>
        <div class="form-group"><label>Net Contents</label><div class="aniInput"><input type="text" class="browser-default" value="180"><span class="focus-border"></span></div></div>
        <div class="form-group"><label>UOM</label><select><option selected>kg</option><option>L</option><option>ea</option></select></div>
        <div class="form-group"><label>Prod. Plant</label><select><option value="" disabled selected>Select</option><option selected>Otha</option><option>Gunsan</option></select></div>
        <div class="form-group"><label>Prod. Area</label><select><option value="" disabled selected>Select</option><option selected>OT01</option><option>OT02</option></select></div>
        <div class="form-group"><label>MRP Group</label><select><option value="" disabled selected>Select</option><option selected>MTO</option><option>MTS</option></select></div>
      </div>`,
    'Product Management': `
      <!-- MASTER (parent-code level, common) -->
      <h5 class="bi-block-title"><span class="bi-bar"></span>MASTER</h5>
      <div class="form-grid col-4 pm-grid">
        <div class="form-group">
          <label>Material Type by usage</label>
          <div class="pm-input-wrap">
            <select>${productModel.pm.materialTypeOptionsHtml}</select>
          </div>
        </div>
        <div class="form-group">
          <label>${productModel.pm.usageLabel}</label>
          <div class="pm-input-wrap">
            <select>${productModel.pm.usageOptionsHtml}</select>
          </div>
        </div>
        <div class="form-group">
          <label>Allowed for sample</label>
          <div class="pm-input-wrap">
            <select><option selected>NO</option><option>YES</option></select>
          </div>
        </div>
        <div class="form-group">
          <label>ASP <span class="pm-curr">USD</span></label>
          <div class="pm-input-wrap">
            <div class="aniInput"><input type="text" class="browser-default" value="22.50"><span class="focus-border"></span></div>
          </div>
        </div>
        <div class="form-group span-2">
          <label>Product Texts (master memo)</label>
          <textarea class="detail-textarea" rows="2" placeholder="Internal product description shared across all sizes...">${productModel.pm.productTextsValue}</textarea>
        </div>
      </div>

      <!-- Per-spec table -->
      <h5 class="bi-block-title"><span class="bi-bar"></span>ITEM LEVEL</h5>
      <div class="hoo-spec-table">
      <table class="hoo-table">
        <colgroup>
          <col>
          <col style="width:120px">
          <col style="width:90px">
          <col style="width:110px">
          <col style="width:90px">
          <col style="width:110px">
          <col style="width:170px">
        </colgroup>
        <thead>
          <tr>
            <th>${productModel.nameLabel}</th>
            <th>MRP Group</th>
            <th>MOQ</th>
            <th>Delivery UOM</th>
            <th>Lead time<br><span class="hoo-th-sub">(days)</span></th>
            <th>Safety stock</th>
            <th>${productModel.pm.priceLabel}<br><span class="hoo-th-sub">(per UOM)</span></th>
          </tr>
        </thead>
        <tbody>
          ${productModel.skuList.map((sku, i) => {
            /* MOQ / leadTime / safetyStock / 가격 = bank 에 없으면 합리적 default 생성 */
            const moqDefault = sku.netContent && typeof sku.netContent === 'number' ? sku.netContent : (i === 0 ? 180 : 5000);
            const leadDefault = i === 0 ? 14 : (i === 1 ? 21 : 28);
            const safetyDefault = i === 0 ? 540 : (i === 1 ? 15000 : 9000);
            /* 가격: stdCost 의 숫자만 추출 */
            const costMatch = (sku.stdCost || '').match(/[\d,.]+/);
            const priceNum = costMatch ? costMatch[0] : '—';
            const priceCurr = isFG ? 'KRW' : 'RMB';
            const mrpDefault = i === 0 ? 'MTO' : 'MTS';
            return `
          <tr>
            <td class="pm-spec-name">
              <span class="pm-mat-pill">Mat#${i + 1}</span>
              <span class="pm-mat-text">${sku.matName}</span>
            </td>
            <td><div class="bi-select-wrap"><select class="bi-select browser-default"><option${mrpDefault === 'MTO' ? ' selected' : ''}>MTO</option><option${mrpDefault === 'MTS' ? ' selected' : ''}>MTS</option></select></div></td>
            <td><div class="aniInput"><input type="text" class="browser-default" value="${moqDefault}"><span class="focus-border"></span></div></td>
            <td><div class="bi-select-wrap"><select class="bi-select browser-default"><option${sku.uom === 'KG' ? ' selected' : ''}>KG</option><option${sku.uom === 'L' ? ' selected' : ''}>L</option><option${sku.uom === 'ml' ? ' selected' : ''}>ml</option><option${sku.uom === 'EA' ? ' selected' : ''}>EA</option><option${sku.uom === 'TON' ? ' selected' : ''}>TON</option></select></div></td>
            <td><div class="aniInput"><input type="text" class="browser-default" value="${leadDefault}"><span class="focus-border"></span></div></td>
            <td><div class="aniInput"><input type="text" class="browser-default" value="${safetyDefault}"><span class="focus-border"></span></div></td>
            <td class="pm-spec-price">
              <div class="aniInput"><input type="text" class="browser-default pm-price-num" value="${priceNum}"><span class="focus-border"></span></div>
              <div class="bi-select-wrap"><select class="bi-select browser-default pm-price-curr"><option${priceCurr === 'RMB' ? ' selected' : ''}>RMB</option><option${priceCurr === 'USD' ? ' selected' : ''}>USD</option><option${priceCurr === 'KRW' ? ' selected' : ''}>KRW</option><option>EUR</option></select></div>
            </td>
          </tr>`;
          }).join('')}
        </tbody>
      </table>
      </div>

      <!-- Confirmation -->
      <div class="pm-confirm-card">
        <div class="pm-confirm-head">
          <i class="material-icons">fact_check</i>
          <div>
            <div class="pm-confirm-title">Confirmation Checklist</div>
            <div class="pm-confirm-sub">All items below must be verified before approval.</div>
          </div>
        </div>
        <ul class="pm-check-list">
          ${productModel.pm.confirmItems.map(item =>
            `<li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">${item}</span></label></li>`
          ).join('')}
        </ul>
        <div class="pm-confirm-actions">
          <button class="hBtn hGrey waves-effect"><i class="material-icons">close</i><span class="label">Reject</span></button>
          <button class="hBtn hViolet waves-effect pm-approve" disabled><i class="material-icons">check</i><span class="label">Approve</span></button>
        </div>
      </div>`,

    'Quality': `
      <!-- Spec header row -->
      <div class="hoo-spec-head">
        <h5 class="bi-block-title"><span class="bi-bar"></span>Inspection Specs</h5>
        <div class="hoo-spec-tools">
          <a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light"><i class="material-icons">file_copy</i><span class="label">Copy from similar</span></a>
          <a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light"><i class="material-icons">add</i><span class="label">Add row</span></a>
        </div>
      </div>

      <div class="hoo-spec-table">
        <table class="hoo-table">
          <colgroup>
            <col style="width:40px">
            <col style="width:200px">
            <col style="width:140px">
            <col style="width:90px">
            <col style="width:1fr">
            <col style="width:90px">
            <col style="width:90px">
            <col style="width:90px">
            <col style="width:36px">
          </colgroup>
          <thead>
            <tr>
              <th>No.</th>
              <th class="hoo-th-key">Item <span class="hoo-req">*</span></th>
              <th>Condition</th>
              <th>Unit</th>
              <th>Range</th>
              <th class="hoo-th-num">Min</th>
              <th class="hoo-th-num hoo-th-target">Target</th>
              <th class="hoo-th-num">Max</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="hoo-no">1</td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="EGC"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="—"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="mmol/kg"><span class="focus-border"></span></div></td>
              <td class="hoo-range">5263 ~ 5376 mmol/kg</td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="5263"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num hoo-target" value="5319.5"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="5376"><span class="focus-border"></span></div></td>
              <td class="hoo-x"><i class="material-icons">close</i></td>
            </tr>
            <tr>
              <td class="hoo-no">2</td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="Equivalent Weight"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="EPOXY"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="g/eq"><span class="focus-border"></span></div></td>
              <td class="hoo-range">186 ~ 190 g/eq</td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="186"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num hoo-target" value="188"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="190"><span class="focus-border"></span></div></td>
              <td class="hoo-x"><i class="material-icons">close</i></td>
            </tr>
            <tr>
              <td class="hoo-no">3</td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="Color"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="APHA"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="APHA"><span class="focus-border"></span></div></td>
              <td class="hoo-range">MAX. 35 APHA</td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="—" disabled><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num hoo-target" value="—" disabled><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="35"><span class="focus-border"></span></div></td>
              <td class="hoo-x"><i class="material-icons">close</i></td>
            </tr>
            <tr>
              <td class="hoo-no">4</td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="Moisture"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="—"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="mg/kg"><span class="focus-border"></span></div></td>
              <td class="hoo-range hoo-range-ref">Reference</td>
              <td class="hoo-num-na">—</td>
              <td class="hoo-num-na">—</td>
              <td class="hoo-num-na">—</td>
              <td class="hoo-x"><i class="material-icons">close</i></td>
            </tr>
            <tr>
              <td class="hoo-no">5</td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="Viscosity"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="25℃"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="Pa·s"><span class="focus-border"></span></div></td>
              <td class="hoo-range">11.5 ~ 13.5 Pa·s</td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="11.5"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num hoo-target" value="12.5"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="13.5"><span class="focus-border"></span></div></td>
              <td class="hoo-x"><i class="material-icons">close</i></td>
            </tr>
            <tr>
              <td class="hoo-no">6</td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="Hydrolyzable Chloride"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="—"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="ppm"><span class="focus-border"></span></div></td>
              <td class="hoo-range">MAX. 300 ppm</td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="0"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num hoo-target" value="—" disabled><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="300"><span class="focus-border"></span></div></td>
              <td class="hoo-x"><i class="material-icons">close</i></td>
            </tr>
            <tr>
              <td class="hoo-no">7</td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="CoA Document Review"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="Tampering check"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default" value="—"><span class="focus-border"></span></div></td>
              <td class="hoo-range hoo-range-ref">No tampering confirmed</td>
              <td class="hoo-num-na">—</td>
              <td class="hoo-num-na">—</td>
              <td class="hoo-num-na">—</td>
              <td class="hoo-x"><i class="material-icons">close</i></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Confirmation -->
      <div class="pm-confirm-card">
        <div class="pm-confirm-head">
          <i class="material-icons">fact_check</i>
          <div>
            <div class="pm-confirm-title">Quality Confirmation</div>
            <div class="pm-confirm-sub">Confirm specs are aligned with the supplier CoA before approval.</div>
          </div>
        </div>
        <ul class="pm-check-list">
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">All inspection items captured</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Range &amp; unit consistency verified</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Min · Target · Max values aligned</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">CoA &amp; MSDS reviewed</span></label></li>
        </ul>
        <div class="pm-confirm-actions">
          <button class="hBtn hGrey waves-effect"><i class="material-icons">close</i><span class="label">Reject</span></button>
          <button class="hBtn hViolet waves-effect pm-approve" disabled><i class="material-icons">check</i><span class="label">Approve</span></button>
        </div>
      </div>`,

    'Technologist': `
      <!-- TECHNICAL DATA VALIDATION — NPI 기술검토 단계 (FG / SemiFG 만 노출).
           Document Status (3 dropzones) → Technical Specs → Temp → Feasibility → Notes → Approval -->

      <!-- Document Status — dropzone 패턴 그대로 (DV step 1 과 동일), 3개 문서:
           BOM (Sales Request 자동 첨부), Recipe (필수), QM Inspection Plan (필수) -->
      <div class="bi-block-head">
        <h5 class="bi-block-title"><span class="bi-bar"></span>DOCUMENT STATUS</h5>
        <div class="bi-block-meta">
          <span class="bi-meta-text">3 documents required for technical review</span>
        </div>
      </div>
      <div class="dz-grid">
        <div class="dropzone has-file is-readonly" id="dzBom" data-kind="Bom">
          <div class="dz-head">
            <div class="dz-icon">BOM</div>
            <div>
              <div class="dz-title">BOM Data Sheet</div>
              <div class="dz-sub">Auto-attached from Sales Request</div>
            </div>
          </div>
          <div class="dz-body">
            <div class="dz-file"><span class="f-mark"><i class="material-icons icon-sm-16">check</i></span><span class="f-name">SILQUEST_GAMMA_BOM.xlsx</span><span class="f-meta">42.1 KB</span></div>
          </div>
        </div>
        <div class="dropzone has-file is-readonly" id="dzRecipe" data-kind="Recipe">
          <div class="dz-head">
            <div class="dz-icon">RCP</div>
            <div>
              <div class="dz-title">Recipe Data Sheet</div>
              <div class="dz-sub">Verified for formula validation</div>
            </div>
          </div>
          <div class="dz-body">
            <div class="dz-file"><span class="f-mark"><i class="material-icons icon-sm-16">check</i></span><span class="f-name">SILQUEST_GAMMA_RECIPE_v3.xlsx</span><span class="f-meta">38.7 KB</span></div>
          </div>
        </div>
        <div class="dropzone has-file is-readonly" id="dzQm" data-kind="Qm">
          <div class="dz-head">
            <div class="dz-icon">QM</div>
            <div>
              <div class="dz-title">QM Inspection Plan</div>
              <div class="dz-sub">Approved by QM team</div>
            </div>
          </div>
          <div class="dz-body">
            <div class="dz-file"><span class="f-mark"><i class="material-icons icon-sm-16">check</i></span><span class="f-name">SILQUEST_GAMMA_QM_PLAN.pdf</span><span class="f-meta">52.3 KB</span></div>
          </div>
        </div>
      </div>

      <!-- Technical Specifications -->
      <div class="bi-block-head">
        <h5 class="bi-block-title"><span class="bi-bar"></span>TECHNICAL SPECIFICATIONS</h5>
      </div>
      <div class="form-grid col-4">
        <div class="form-group">
          <label>NPI Tracking #</label>
          <div class="aniInput"><input type="text" class="browser-default" value="NPI-2026-0042"><span class="focus-border"></span></div>
        </div>
        <div class="form-group">
          <label>CAS # (Main Component)</label>
          <div class="aniInput"><input type="text" class="browser-default" value="${productModel.composition[0].cas}"><span class="focus-border"></span></div>
        </div>
        <div class="form-group">
          <label>Total Shelf Life</label>
          <div class="aniInput"><input type="text" class="browser-default" value="12 Months"><span class="focus-border"></span></div>
        </div>
        <div class="form-group">
          <label>Product Lifer</label>
          <div class="aniInput"><input type="text" class="browser-default" value="Multi-Stage"><span class="focus-border"></span></div>
        </div>
      </div>

      <!-- Temperature Control -->
      <div class="bi-block-head">
        <h5 class="bi-block-title"><span class="bi-bar"></span>TEMPERATURE CONTROL (°C)</h5>
      </div>
      <div class="form-grid col-3">
        <div class="form-group">
          <label>Warehouse</label>
          <div class="aniInput"><input type="text" class="browser-default" value="15 ~ 25"><span class="focus-border"></span></div>
        </div>
        <div class="form-group">
          <label>Shipment</label>
          <div class="aniInput"><input type="text" class="browser-default" value="10 ~ 35"><span class="focus-border"></span></div>
        </div>
        <div class="form-group">
          <label>Customer Storage</label>
          <div class="aniInput"><input type="text" class="browser-default" value="20 ~ 25"><span class="focus-border"></span></div>
        </div>
      </div>

      <!-- Review Notes -->
      <div class="form-grid">
        <div class="form-group span-2">
          <label>Review Notes</label>
          <textarea class="detail-textarea" rows="4" placeholder="Enter technical details, concerns, or follow-up items..."></textarea>
        </div>
      </div>

      <!-- Feasibility Checklist — Confirmation Checklist / Technical Approval 과 같은 카드 패턴 -->
      <div class="pm-confirm-card">
        <div class="pm-confirm-head">
          <i class="material-icons">rule</i>
          <div>
            <div class="pm-confirm-title">Feasibility Checklist</div>
            <div class="pm-confirm-sub">Confirm overall feasibility before submitting to Product Management.</div>
          </div>
        </div>
        <ul class="pm-check-list">
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Formula Stability</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Regulatory Compliance</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Facility Compatibility</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Logistics Safety</span></label></li>
        </ul>
      </div>`,

    'Supply Chain': `
      <!-- Per-plant planning table -->
      <div class="hoo-spec-head">
        <h5 class="bi-block-title"><span class="bi-bar"></span>Plant Planning</h5>
        <div class="hoo-spec-tools">
          <a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light"><i class="material-icons">file_copy</i><span class="label">Copy across plants</span></a>
          <a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light"><i class="material-icons">add</i><span class="label">Add plant</span></a>
        </div>
      </div>

      <div class="hoo-spec-table">
        <table class="hoo-table sc-table">
          <colgroup>
            <col style="width:80px">
            <col style="width:90px">
            <col style="width:160px">
            <col style="width:110px">
            <col style="width:110px">
            <col style="width:100px">
            <col style="width:100px">
            <col style="width:90px">
            <col style="width:36px">
          </colgroup>
          <thead>
            <tr>
              <th>Plant</th>
              <th>Packing</th>
              <th>Storage Loc.</th>
              <th>MRP Group</th>
              <th class="hoo-th-num">Lot Size</th>
              <th class="hoo-th-num">Safety Stock</th>
              <th class="hoo-th-num">MOQ</th>
              <th class="hoo-th-num">Lead Time (d)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="sc-plant-pill">WTFD</span></td>
              <td><span class="sc-pack-pill">Drum</span></td>
              <td>
                <select class="browser-default hoo-type sc-loc">
                  <option selected>RM-A1 · Raw Liquid A</option>
                  <option>RM-A2 · Raw Liquid B</option>
                  <option>RM-A3 · Bulk Tank A</option>
                  <option>RM-A4 · QC Hold</option>
                </select>
              </td>
              <td><select class="browser-default hoo-type"><option>MTO</option><option selected>MTS</option></select></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="5,000"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="1,200"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="1,000"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="21"><span class="focus-border"></span></div></td>
              <td class="hoo-x"><i class="material-icons">close</i></td>
            </tr>
            <tr>
              <td><span class="sc-plant-pill">WTFD</span></td>
              <td><span class="sc-pack-pill sc-pack-bulk">Bulk</span></td>
              <td>
                <select class="browser-default hoo-type sc-loc">
                  <option>RM-A1 · Raw Liquid A</option>
                  <option>RM-A2 · Raw Liquid B</option>
                  <option selected>RM-A3 · Bulk Tank A</option>
                  <option>RM-A4 · QC Hold</option>
                </select>
              </td>
              <td><select class="browser-default hoo-type"><option>MTO</option><option selected>MTS</option></select></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="20,000"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="5,000"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="10,000"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="28"><span class="focus-border"></span></div></td>
              <td class="hoo-x"><i class="material-icons">close</i></td>
            </tr>
            <tr>
              <td><span class="sc-plant-pill">SVLL</span></td>
              <td><span class="sc-pack-pill">Drum</span></td>
              <td>
                <select class="browser-default hoo-type sc-loc">
                  <option selected>RM-B1 · Raw Liquid</option>
                  <option>RM-B2 · Bulk Tank</option>
                  <option>RM-B3 · QC Hold</option>
                </select>
              </td>
              <td><select class="browser-default hoo-type"><option selected>MTO</option><option>MTS</option></select></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="3,000"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="800"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="500"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="28"><span class="focus-border"></span></div></td>
              <td class="hoo-x"><i class="material-icons">close</i></td>
            </tr>
            <tr>
              <td><span class="sc-plant-pill">SVLL</span></td>
              <td><span class="sc-pack-pill sc-pack-bulk">Bulk</span></td>
              <td>
                <select class="browser-default hoo-type sc-loc">
                  <option>RM-B1 · Raw Liquid</option>
                  <option selected>RM-B2 · Bulk Tank</option>
                  <option>RM-B3 · QC Hold</option>
                </select>
              </td>
              <td><select class="browser-default hoo-type"><option selected>MTO</option><option>MTS</option></select></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="15,000"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="3,500"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="8,000"><span class="focus-border"></span></div></td>
              <td><div class="aniInput"><input type="text" class="browser-default hoo-num" value="35"><span class="focus-border"></span></div></td>
              <td class="hoo-x"><i class="material-icons">close</i></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Storage / handling -->
      <div class="hoo-spec-head hoo-spec-head--gap">
        <h5 class="bi-block-title"><span class="bi-bar"></span>Storage &amp; Handling</h5>
      </div>
      <div class="form-grid col-4 pm-grid">
        <div class="form-group">
          <label>Storage Condition</label>
          <div class="pm-input-wrap">
            <select><option selected>Cool &amp; dry</option><option>Refrigerated</option><option>Ambient</option><option>Hazardous-rated</option></select>
          </div>
        </div>
        <div class="form-group">
          <label>Shelf Life (months)</label>
          <div class="pm-input-wrap">
            <div class="aniInput"><input type="text" class="browser-default" value="12"><span class="focus-border"></span></div>
          </div>
        </div>
      </div>

      <!-- Confirmation -->
      <div class="pm-confirm-card">
        <div class="pm-confirm-head">
          <i class="material-icons">fact_check</i>
          <div>
            <div class="pm-confirm-title">Supply Chain Confirmation</div>
            <div class="pm-confirm-sub">Verify planning parameters before releasing the material to MRP.</div>
          </div>
        </div>
        <ul class="pm-check-list">
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">All plants assigned with valid storage location</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">MRP group consistent with usage</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Lot size · safety stock · MOQ aligned</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Lead time confirmed with sourcing</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Storage &amp; handling code reviewed</span></label></li>
        </ul>
        <div class="pm-confirm-actions">
          <button class="hBtn hGrey waves-effect"><i class="material-icons">close</i><span class="label">Reject</span></button>
          <button class="hBtn hViolet waves-effect pm-approve" disabled><i class="material-icons">check</i><span class="label">Approve</span></button>
        </div>
      </div>`,

    'Sourcing': `
      <!-- Vendor info -->
      <div class="hoo-spec-head">
        <h5 class="bi-block-title"><span class="bi-bar"></span>Vendor Master</h5>
      </div>
      <div class="src-grid">
        <!-- Vendor number with company -->
        <div class="form-group src-vendor">
          <label>Vendor Number</label>
          <div class="src-vendor-row">
            <div class="aniInput src-vendor-num"><input type="text" class="browser-default" value="70413"><span class="focus-border"></span></div>
            <a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light src-search-btn" title="Search vendor"><i class="material-icons">search</i></a>
            <span class="src-vendor-name">Hubei Co-Formula Material Tech Co., Ltd.</span>
          </div>
        </div>

        <div class="form-grid col-4 pm-grid form-grid--gap">
          <div class="form-group">
            <label>Country of Origin</label>
            <div class="pm-input-wrap">
              <select>
                <option selected>CN · China</option>
                <option>KR · Korea</option>
                <option>JP · Japan</option>
                <option>DE · Germany</option>
                <option>US · United States</option>
                <option>VN · Vietnam</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Purchasing Group</label>
            <div class="pm-input-wrap">
              <select>
                <option selected>517 · CM Y. Shen — J03</option>
                <option>510 · CM J. Park — J01</option>
                <option>520 · CM L. Kim — J05</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Business Material Chem Group</label>
            <div class="pm-input-wrap">
              <div class="aniInput"><input type="text" class="browser-default" value="1"><span class="focus-border"></span></div>
            </div>
          </div>
          <div class="form-group">
            <label>Comm./Imp. Code</label>
            <div class="pm-input-wrap">
              <div class="aniInput"><input type="text" class="browser-default" value="IMP-2920"><span class="focus-border"></span></div>
            </div>
          </div>

          <div class="form-group">
            <label>Total Shelf Life</label>
            <div class="src-pair">
              <div class="aniInput"><input type="text" class="browser-default hoo-num" value="12"><span class="focus-border"></span></div>
              <select class="src-period"><option selected>M · Month</option><option>D · Day</option><option>Y · Year</option></select>
            </div>
          </div>
          <div class="form-group">
            <label>Lead Time</label>
            <div class="src-pair">
              <div class="aniInput"><input type="text" class="browser-default hoo-num" value="7"><span class="focus-border"></span></div>
              <select class="src-period"><option>M · Month</option><option selected>D · Day</option><option>Y · Year</option></select>
            </div>
          </div>
          <div class="form-group">
            <label>Default Currency</label>
            <div class="pm-input-wrap">
              <select><option selected>RMB</option><option>USD</option><option>KRW</option><option>EUR</option></select>
            </div>
          </div>
          <div class="form-group">
            <label>Default UOM</label>
            <div class="pm-input-wrap">
              <select><option selected>KG</option><option>L</option><option>EA</option><option>TON</option></select>
            </div>
          </div>
        </div>
      </div>

      <!-- Required attachments checklist -->
      <div class="src-checklist">
        <div class="pm-confirm-head">
          <i class="material-icons">attach_file</i>
          <div>
            <div class="pm-confirm-title">Required Attachments</div>
            <div class="pm-confirm-sub">Please attach required items listed below.</div>
          </div>
        </div>
        <ul class="pm-check-list src-attach-list">
          <li>
            <label class="pm-check"><input type="checkbox" checked><span class="pm-check-box"></span><span class="pm-check-label">Supplier SDS <small>(local language)</small></span></label>
            <a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light"><i class="material-icons">upload_file</i><span class="label">Upload</span></a>
          </li>
          <li>
            <label class="pm-check"><input type="checkbox" checked><span class="pm-check-box"></span><span class="pm-check-label">CoA / Specification</span></label>
            <a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light"><i class="material-icons">upload_file</i><span class="label">Upload</span></a>
          </li>
          <li>
            <label class="pm-check"><input type="checkbox" checked><span class="pm-check-box"></span><span class="pm-check-label">SPRQ <small>(Sections 1–4 mandatory)</small></span></label>
            <a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light"><i class="material-icons">upload_file</i><span class="label">Upload</span></a>
          </li>
          <li>
            <label class="pm-check"><input type="checkbox" checked><span class="pm-check-box"></span><span class="pm-check-label">Technical Data Sheet</span></label>
            <a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light"><i class="material-icons">upload_file</i><span class="label">Upload</span></a>
          </li>
          <li>
            <label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Purchase Agreement</span></label>
            <a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light"><i class="material-icons">upload_file</i><span class="label">Upload</span></a>
          </li>
        </ul>
      </div>

      <!-- Confirmation -->
      <div class="pm-confirm-card">
        <div class="pm-confirm-head">
          <i class="material-icons">fact_check</i>
          <div>
            <div class="pm-confirm-title">Sourcing Confirmation</div>
            <div class="pm-confirm-sub">Vendor master &amp; required documents verified before approval.</div>
          </div>
        </div>
        <ul class="pm-check-list">
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Vendor master record validated</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Country of origin &amp; purch. group correct</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Item-level prices &amp; UOM aligned</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">All required attachments uploaded</span></label></li>
        </ul>
        <div class="pm-confirm-actions">
          <button class="hBtn hGrey waves-effect"><i class="material-icons">close</i><span class="label">Reject</span></button>
          <button class="hBtn hViolet waves-effect pm-approve" disabled><i class="material-icons">check</i><span class="label">Approve</span></button>
        </div>
      </div>`,

    'Customs(GTC)': `
      <!-- Origin & FTA -->
      <div class="hoo-spec-head">
        <h5 class="bi-block-title"><span class="bi-bar"></span>Origin &amp; FTA</h5>
      </div>
      <div class="form-grid col-4 pm-grid">
        <div class="form-group">
          <label>Country of Origin</label>
          <div class="pm-input-wrap">
            <select>
              <option selected>CN · China</option>
              <option>KR · Korea</option>
              <option>JP · Japan</option>
              <option>DE · Germany</option>
              <option>US · United States</option>
              <option>VN · Vietnam</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>FTA Applicable</label>
          <div class="gtc-toggle-row">
            <label class="gtc-radio"><input type="radio" name="ftaApp" checked><span>Yes</span></label>
            <label class="gtc-radio"><input type="radio" name="ftaApp"><span>No</span></label>
          </div>
        </div>
        <div class="form-group">
          <label>FTA Agreement</label>
          <div class="pm-input-wrap">
            <select>
              <option selected>RCEP</option>
              <option>KR–CN FTA</option>
              <option>KR–EU FTA</option>
              <option>KR–US FTA</option>
              <option>KR–ASEAN</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Origin Certificate</label>
          <div class="pm-input-wrap">
            <select>
              <option selected>Form RCEP</option>
              <option>Form AK</option>
              <option>Form E</option>
              <option>Self-Declaration</option>
            </select>
          </div>
        </div>
      </div>

      <!-- HS classification -->
      <div class="hoo-spec-head hoo-spec-head--gap">
        <h5 class="bi-block-title"><span class="bi-bar"></span>HS Classification &amp; Duty</h5>
        <div class="hoo-spec-tools">
          <a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light"><i class="material-icons">search</i><span class="label">Lookup HS</span></a>
        </div>
      </div>
      <div class="form-grid col-4 pm-grid">
        <div class="form-group span-2">
          <label>HS Code (10-digit)</label>
          <div class="gtc-hs-row">
            <div class="aniInput gtc-hs"><input type="text" class="browser-default" value="2920.90-9000"><span class="focus-border"></span></div>
            <span class="gtc-hs-tag">Verified</span>
          </div>
        </div>
        <div class="form-group span-2">
          <label>HS Description</label>
          <div class="pm-input-wrap">
            <div class="aniInput"><input type="text" class="browser-default" value="Esters of inorganic acids of non-metals — orthosilicate"><span class="focus-border"></span></div>
          </div>
        </div>
        <div class="form-group">
          <label>Base Duty Rate</label>
          <div class="gtc-rate gtc-rate-base">6.5%</div>
        </div>
        <div class="form-group">
          <label>FTA Duty Rate</label>
          <div class="gtc-rate gtc-rate-fta">0.0%</div>
        </div>
        <div class="form-group">
          <label>Applied Rate</label>
          <div class="gtc-rate gtc-rate-applied">0.0% <small>(FTA)</small></div>
        </div>
        <div class="form-group">
          <label>VAT</label>
          <div class="gtc-rate">10.0%</div>
        </div>
      </div>

      <!-- Restrictions -->
      <div class="hoo-spec-head hoo-spec-head--gap">
        <h5 class="bi-block-title"><span class="bi-bar"></span>Trade Restrictions</h5>
      </div>
      <div class="gtc-flags">
        <label class="gtc-flag"><input type="checkbox"><span class="pm-check-box"></span><span>Strategic Item</span></label>
        <label class="gtc-flag"><input type="checkbox"><span class="pm-check-box"></span><span>Dual-Use</span></label>
        <label class="gtc-flag"><input type="checkbox"><span class="pm-check-box"></span><span>CITES / Wildlife</span></label>
        <label class="gtc-flag"><input type="checkbox" checked><span class="pm-check-box"></span><span>Hazardous Material</span></label>
        <label class="gtc-flag"><input type="checkbox"><span class="pm-check-box"></span><span>Embargo Country Risk</span></label>
        <label class="gtc-flag"><input type="checkbox"><span class="pm-check-box"></span><span>Anti-Dumping Subject</span></label>
      </div>

      <!-- Confirmation -->
      <div class="pm-confirm-card">
        <div class="pm-confirm-head">
          <i class="material-icons">fact_check</i>
          <div>
            <div class="pm-confirm-title">Customs (GTC) Confirmation</div>
            <div class="pm-confirm-sub">Tariff classification &amp; FTA eligibility verified before approval.</div>
          </div>
        </div>
        <ul class="pm-check-list">
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">HS code &amp; description verified</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Country of origin documented</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">FTA eligibility &amp; certificate type confirmed</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Trade-restriction flags reviewed</span></label></li>
        </ul>
        <div class="pm-confirm-actions">
          <button class="hBtn hGrey waves-effect"><i class="material-icons">close</i><span class="label">Reject</span></button>
          <button class="hBtn hViolet waves-effect pm-approve" disabled><i class="material-icons">check</i><span class="label">Approve</span></button>
        </div>
      </div>`,

    'EHS': `
      <!-- GHS hazard classification -->
      <div class="hoo-spec-head">
        <h5 class="bi-block-title"><span class="bi-bar"></span>GHS Classification</h5>
        <div class="hoo-spec-tools">
          <a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light"><i class="material-icons">picture_as_pdf</i><span class="label">Open SDS</span></a>
        </div>
      </div>
      <div class="ehs-ghs-grid">
        <div class="ehs-pictos" id="ehsPictos">
          <div class="ehs-picto ehs-picto-on" data-pic="flame" title="Flammable — click to toggle">
            <svg viewBox="0 0 64 64" aria-hidden="true"><polygon points="32,4 60,32 32,60 4,32" fill="#fff" stroke="currentColor" stroke-width="3"/><path d="M32 16c-2 6-8 8-8 16 0 6 4 12 10 12 7 0 12-6 10-13-1-4-5-5-4-10-3 2-4 6-3 9-2-1-4-6-3-10 0-2 0-3-2-4z" fill="currentColor"/></svg>
            <span>Flame</span>
          </div>
          <div class="ehs-picto ehs-picto-on" data-pic="health" title="Health hazard — click to toggle">
            <svg viewBox="0 0 64 64" aria-hidden="true"><polygon points="32,4 60,32 32,60 4,32" fill="#fff" stroke="currentColor" stroke-width="3"/><circle cx="32" cy="22" r="6" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M22 30h20l-4 22h-12z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M22 36h20" stroke="currentColor" stroke-width="2.5"/></svg>
            <span>Health</span>
          </div>
          <div class="ehs-picto ehs-picto-on" data-pic="exclamation" title="Irritant — click to toggle">
            <svg viewBox="0 0 64 64" aria-hidden="true"><polygon points="32,4 60,32 32,60 4,32" fill="#fff" stroke="currentColor" stroke-width="3"/><text x="32" y="42" text-anchor="middle" font-size="28" font-weight="700" fill="currentColor">!</text></svg>
            <span>Irritant</span>
          </div>
          <div class="ehs-picto" data-pic="environment" title="Environment — click to toggle">
            <svg viewBox="0 0 64 64" aria-hidden="true"><polygon points="32,4 60,32 32,60 4,32" fill="#fff" stroke="currentColor" stroke-width="3"/><path d="M16 44h32" stroke="currentColor" stroke-width="2.5"/><path d="M22 38c4-2 6-6 4-12 4 2 8 2 12-2-2 6 0 10 4 12-6 0-10 4-12 8-2-4-4-6-8-6z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
            <span>Environ.</span>
          </div>
          <div class="ehs-picto" data-pic="corrosive" title="Corrosive — click to toggle">
            <svg viewBox="0 0 64 64" aria-hidden="true"><polygon points="32,4 60,32 32,60 4,32" fill="#fff" stroke="currentColor" stroke-width="3"/><path d="M14 26l8-2 4 6-2 6-8 2z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M44 22l8 2-2 6-6 4-4-4z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
            <span>Corrosive</span>
          </div>
        </div>
        <div class="form-grid col-3 pm-grid ehs-form">
          <div class="form-group">
            <label>Signal Word</label>
            <div class="pm-input-wrap">
              <select id="ehsSignal"><option>Warning</option><option selected>Danger</option></select>
            </div>
          </div>
          <div class="form-group">
            <label>Storage Class (TRGS 510)</label>
            <div class="pm-input-wrap">
              <select id="ehsStorageClass">
                <option>2A · Compressed gas</option>
                <option selected>3 · Flammable liquid</option>
                <option>4.1 · Flammable solid</option>
                <option>6.1 · Toxic</option>
                <option>8 · Corrosive</option>
                <option>10 · Combustible liquid</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Water Hazard Class (WGK)</label>
            <div class="pm-input-wrap">
              <select id="ehsWgk"><option>1 · Slight</option><option selected>2 · Hazard</option><option>3 · Severe</option></select>
            </div>
          </div>
          <div class="form-group">
            <label>UN Number</label>
            <div class="pm-input-wrap">
              <div class="aniInput"><input type="text" class="browser-default" value="UN 2920"><span class="focus-border"></span></div>
            </div>
          </div>
          <div class="form-group">
            <label>UN Class / Packing Group</label>
            <div class="pm-input-wrap">
              <div class="aniInput"><input type="text" class="browser-default" value="3 / II"><span class="focus-border"></span></div>
            </div>
          </div>
          <div class="form-group">
            <label>Flash Point (°C)</label>
            <div class="pm-input-wrap">
              <div class="aniInput"><input type="text" class="browser-default" value="38"><span class="focus-border"></span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- H/P codes -->
      <div class="hoo-spec-head hoo-spec-head--gap">
        <h5 class="bi-block-title"><span class="bi-bar"></span>Hazard &amp; Precautionary Statements</h5>
        <div class="hoo-spec-tools">
          <a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light" id="ehsHpReset"><i class="material-icons">refresh</i><span class="label">Reset from picto</span></a>
        </div>
      </div>
      <div class="ehs-codes">
        <div class="ehs-codes-col">
          <div class="ehs-codes-label">Hazard (H)</div>
          <div class="ehs-chips" id="ehsHChips" data-kind="h">
            <span class="ehs-chip ehs-chip-h" data-code="H226">H226 · Flammable liquid &amp; vapour<button class="ehs-chip-x" aria-label="Remove">×</button></span>
            <span class="ehs-chip ehs-chip-h" data-code="H315">H315 · Causes skin irritation<button class="ehs-chip-x" aria-label="Remove">×</button></span>
            <span class="ehs-chip ehs-chip-h" data-code="H319">H319 · Causes serious eye irritation<button class="ehs-chip-x" aria-label="Remove">×</button></span>
            <span class="ehs-chip ehs-chip-h" data-code="H335">H335 · May cause respiratory irritation<button class="ehs-chip-x" aria-label="Remove">×</button></span>
            <a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light ehs-chip-add" data-add-for="h"><i class="material-icons">add</i><span class="label">Add H-code</span></a>
          </div>
        </div>
        <div class="ehs-codes-col">
          <div class="ehs-codes-label">Precautionary (P)</div>
          <div class="ehs-chips" id="ehsPChips" data-kind="p">
            <span class="ehs-chip ehs-chip-p" data-code="P210">P210 · Keep away from heat<button class="ehs-chip-x" aria-label="Remove">×</button></span>
            <span class="ehs-chip ehs-chip-p" data-code="P233">P233 · Keep container tightly closed<button class="ehs-chip-x" aria-label="Remove">×</button></span>
            <span class="ehs-chip ehs-chip-p" data-code="P280">P280 · Wear protective gloves / eye protection<button class="ehs-chip-x" aria-label="Remove">×</button></span>
            <span class="ehs-chip ehs-chip-p" data-code="P303+P361+P353">P303+P361+P353 · IF ON SKIN: rinse with water<button class="ehs-chip-x" aria-label="Remove">×</button></span>
            <span class="ehs-chip ehs-chip-p" data-code="P403+P235">P403+P235 · Store cool &amp; well-ventilated<button class="ehs-chip-x" aria-label="Remove">×</button></span>
            <a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light ehs-chip-add" data-add-for="p"><i class="material-icons">add</i><span class="label">Add P-code</span></a>
          </div>
        </div>
      </div>

      <!-- PPE -->
      <div class="hoo-spec-head hoo-spec-head--gap">
        <h5 class="bi-block-title"><span class="bi-bar"></span>Required PPE</h5>
      </div>
      <div class="ehs-ppe-row" id="ehsPpeRow">
        <button type="button" class="ehs-ppe ehs-ppe-on" data-ppe="goggles"><i class="material-icons">visibility</i><span>Safety goggles</span></button>
        <button type="button" class="ehs-ppe ehs-ppe-on" data-ppe="gloves"><i class="material-icons">back_hand</i><span>Nitrile gloves</span></button>
        <button type="button" class="ehs-ppe ehs-ppe-on" data-ppe="coat"><i class="material-icons">checkroom</i><span>Lab coat</span></button>
        <button type="button" class="ehs-ppe ehs-ppe-on" data-ppe="respirator"><i class="material-icons">masks</i><span>Respirator (organic vapor)</span></button>
        <button type="button" class="ehs-ppe" data-ppe="faceshield"><i class="material-icons">hardware</i><span>Face shield</span></button>
        <button type="button" class="ehs-ppe" data-ppe="apron"><i class="material-icons">do_not_step</i><span>Chemical apron</span></button>
        <button type="button" class="ehs-ppe" data-ppe="boots"><i class="material-icons">snowshoeing</i><span>Chemical boots</span></button>
        <button type="button" class="ehs-ppe" data-ppe="hardhat"><i class="material-icons">construction</i><span>Hard hat</span></button>
      </div>

      <!-- Spill / Disposal -->
      <div class="hoo-spec-head hoo-spec-head--gap">
        <h5 class="bi-block-title"><span class="bi-bar"></span>Spill &amp; Waste Handling</h5>
      </div>
      <div class="form-grid col-2 pm-grid">
        <div class="form-group">
          <label>Spill Response</label>
          <textarea class="detail-textarea" rows="3">Eliminate ignition sources. Absorb with inert material (vermiculite, sand). Collect in closed metal container. Ventilate area. Avoid release to drains / waterways.</textarea>
        </div>
        <div class="form-group">
          <label>Waste Code &amp; Disposal Route</label>
          <textarea class="detail-textarea" rows="3">EWC 07 01 04* · Other organic solvents. Incinerate at licensed hazardous-waste facility. Do not dispose with general waste.</textarea>
        </div>
      </div>

      <!-- Confirmation -->
      <div class="pm-confirm-card">
        <div class="pm-confirm-head">
          <i class="material-icons">verified_user</i>
          <div>
            <div class="pm-confirm-title">EHS Confirmation</div>
            <div class="pm-confirm-sub">Hazard classification, regulatory inventory &amp; PPE verified before release.</div>
          </div>
        </div>
        <ul class="pm-check-list">
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">SDS reviewed &amp; GHS classification confirmed</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Storage class &amp; segregation rules acceptable</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">PPE &amp; spill response communicated to site</span></label></li>
        </ul>
        <div class="pm-confirm-actions">
          <button class="hBtn hGrey waves-effect"><i class="material-icons">close</i><span class="label">Reject</span></button>
          <button class="hBtn hViolet waves-effect pm-approve" disabled><i class="material-icons">check</i><span class="label">Approve</span></button>
        </div>
      </div>`,

    'Logistic': `
      <!-- INCOTERM -->
      <div class="hoo-spec-head">
        <h5 class="bi-block-title"><span class="bi-bar"></span>INCOTERM 2020</h5>
      </div>
      <div class="log-incoterm-row">
        <label class="log-incoterm">
          <input type="radio" name="incoterm" hidden>
          <div class="log-incoterm-code">EXW</div>
          <div class="log-incoterm-name">Ex Works · buyer takes all</div>
        </label>
        <label class="log-incoterm">
          <input type="radio" name="incoterm" hidden>
          <div class="log-incoterm-code">FOB</div>
          <div class="log-incoterm-name">Free On Board · port of loading</div>
        </label>
        <label class="log-incoterm log-incoterm-on">
          <input type="radio" name="incoterm" hidden checked>
          <div class="log-incoterm-code">CIF</div>
          <div class="log-incoterm-name">Cost · Insurance · Freight</div>
        </label>
        <label class="log-incoterm">
          <input type="radio" name="incoterm" hidden>
          <div class="log-incoterm-code">DDP</div>
          <div class="log-incoterm-name">Delivered Duty Paid</div>
        </label>
      </div>

      <!-- Transport mode + route -->
      <div class="hoo-spec-head hoo-spec-head--gap">
        <h5 class="bi-block-title"><span class="bi-bar"></span>Transport Plan</h5>
      </div>
      <div class="form-grid col-4 pm-grid">
        <div class="form-group">
          <label>Mode</label>
          <div class="pm-input-wrap">
            <select><option selected>Ocean · FCL</option><option>Ocean · LCL</option><option>Air</option><option>Truck</option><option>Rail</option></select>
          </div>
        </div>
        <div class="form-group">
          <label>Carrier</label>
          <div class="pm-input-wrap">
            <select><option selected>HMM</option><option>Maersk</option><option>ONE</option><option>Evergreen</option><option>CMA CGM</option></select>
          </div>
        </div>
        <div class="form-group">
          <label>Container Type</label>
          <div class="pm-input-wrap">
            <select><option>20'GP</option><option selected>20'ISO Tank</option><option>40'GP</option><option>40'HC</option></select>
          </div>
        </div>
        <div class="form-group">
          <label>Transit Time (days)</label>
          <div class="pm-input-wrap">
            <div class="aniInput"><input type="text" class="browser-default" value="14"><span class="focus-border"></span></div>
          </div>
        </div>
      </div>

      <!-- Route diagram -->
      <div class="log-route log-route--gap">
        <div class="log-route-node">
          <i class="material-icons">factory</i>
          <div class="log-route-node-label">Origin</div>
          <div class="log-route-node-val">Hubei, CN</div>
        </div>
        <div class="log-route-arrow"><i class="material-icons">east</i></div>
        <div class="log-route-node">
          <i class="material-icons">directions_boat</i>
          <div class="log-route-node-label">Port of Loading</div>
          <div class="log-route-node-val">Shanghai (CNSHA)</div>
        </div>
        <div class="log-route-arrow"><i class="material-icons">east</i></div>
        <div class="log-route-node">
          <i class="material-icons">anchor</i>
          <div class="log-route-node-label">Port of Discharge</div>
          <div class="log-route-node-val">Port of Albany (USALB)</div>
        </div>
        <div class="log-route-arrow"><i class="material-icons">east</i></div>
        <div class="log-route-node">
          <i class="material-icons">warehouse</i>
          <div class="log-route-node-label">Destination</div>
          <div class="log-route-node-val">WTFD · Waterford, NY</div>
        </div>
      </div>

      <!-- Packing & weight (per material variant) -->
      <div class="hoo-spec-head hoo-spec-head--gap">
        <h5 class="bi-block-title"><span class="bi-bar"></span>Packing &amp; Weight</h5>
      </div>
      <div class="hoo-spec-table">
        <table class="hoo-table log-pack-table">
          <colgroup>
            <col style="width:80px">
            <col style="width:90px">
            <col style="width:170px">
            <col style="width:110px">
            <col>
            <col>
            <col>
          </colgroup>
          <thead>
            <tr>
              <th>Plant</th>
              <th>Packing</th>
              <th>Pack Unit</th>
              <th class="hoo-th-num">MOQ</th>
              <th class="hoo-th-num">Net Wt. (kg)</th>
              <th class="hoo-th-num">Packing (kg)</th>
              <th class="hoo-th-num">Gross Wt. (kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="sc-plant-pill">WTFD</span></td>
              <td><span class="sc-pack-pill">Drum</span></td>
              <td>200L Steel Drum</td>
              <td class="hoo-num-cell">80 drums</td>
              <td class="hoo-num-cell">16,000</td>
              <td class="hoo-num-cell">1,800</td>
              <td class="hoo-num-cell"><b>17,800</b></td>
            </tr>
            <tr>
              <td><span class="sc-plant-pill">WTFD</span></td>
              <td><span class="sc-pack-pill sc-pack-bulk">Bulk</span></td>
              <td>20' ISO Tank</td>
              <td class="hoo-num-cell">1 tank</td>
              <td class="hoo-num-cell">21,000</td>
              <td class="hoo-num-cell">3,400</td>
              <td class="hoo-num-cell"><b>24,400</b></td>
            </tr>
            <tr>
              <td><span class="sc-plant-pill">SVLL</span></td>
              <td><span class="sc-pack-pill">Drum</span></td>
              <td>200L Steel Drum</td>
              <td class="hoo-num-cell">80 drums</td>
              <td class="hoo-num-cell">16,000</td>
              <td class="hoo-num-cell">1,800</td>
              <td class="hoo-num-cell"><b>17,800</b></td>
            </tr>
            <tr>
              <td><span class="sc-plant-pill">SVLL</span></td>
              <td><span class="sc-pack-pill sc-pack-bulk">Bulk</span></td>
              <td>1,000L IBC</td>
              <td class="hoo-num-cell">20 IBC</td>
              <td class="hoo-num-cell">20,000</td>
              <td class="hoo-num-cell">1,200</td>
              <td class="hoo-num-cell"><b>21,200</b></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Landed cost -->
      <div class="hoo-spec-head hoo-spec-head--gap">
        <h5 class="bi-block-title"><span class="bi-bar"></span>Landed Cost</h5>
      </div>
      <div class="log-cost-grid">
        <div class="log-cost">
          <div class="log-cost-label">FOB</div>
          <div class="log-cost-val">$3.42</div>
          <div class="log-cost-sub">Material + packing</div>
        </div>
        <div class="log-cost">
          <div class="log-cost-label">Freight</div>
          <div class="log-cost-val">$0.28</div>
          <div class="log-cost-sub">Ocean · CIF Busan</div>
        </div>
        <div class="log-cost">
          <div class="log-cost-label">Duty + VAT</div>
          <div class="log-cost-val">$0.00</div>
          <div class="log-cost-sub">FTA applied</div>
        </div>
        <div class="log-cost log-cost-total">
          <div class="log-cost-label">Landed (DDP)</div>
          <div class="log-cost-val">$3.78</div>
          <div class="log-cost-sub">Inland to WTFD incl.</div>
        </div>
      </div>

      <!-- Confirmation -->
      <div class="pm-confirm-card">
        <div class="pm-confirm-head">
          <i class="material-icons">local_shipping</i>
          <div>
            <div class="pm-confirm-title">Logistic Confirmation</div>
            <div class="pm-confirm-sub">INCOTERM, route &amp; landed cost validated before approval.</div>
          </div>
        </div>
        <ul class="pm-check-list">
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">INCOTERM &amp; risk transfer point agreed</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Carrier &amp; transit time confirmed</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Packing / weight matches plant intake</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Landed-cost assumptions reviewed</span></label></li>
        </ul>
        <div class="pm-confirm-actions">
          <button class="hBtn hGrey waves-effect"><i class="material-icons">close</i><span class="label">Reject</span></button>
          <button class="hBtn hViolet waves-effect pm-approve" disabled><i class="material-icons">check</i><span class="label">Approve</span></button>
        </div>
      </div>`,

    'Finance': `
      <!-- Valuation -->
      <div class="hoo-spec-head">
        <h5 class="bi-block-title"><span class="bi-bar"></span>Valuation</h5>
      </div>
      <div class="form-grid col-4 pm-grid">
        <div class="form-group">
          <label>Valuation Class</label>
          <div class="pm-input-wrap">
            <select><option selected>3000 · Raw materials</option><option>3030 · Operating supplies</option><option>7900 · Semi-finished</option></select>
          </div>
        </div>
        <div class="form-group">
          <label>Price Control</label>
          <div class="pm-input-wrap">
            <select><option selected>S · Standard price</option><option>V · Moving avg.</option></select>
          </div>
        </div>
        <div class="form-group">
          <label>Standard Cost (USD/kg)</label>
          <div class="pm-input-wrap">
            <div class="aniInput"><input type="text" class="browser-default" value="3.78"><span class="focus-border"></span></div>
          </div>
        </div>
        <div class="form-group">
          <label>Price Unit</label>
          <div class="pm-input-wrap">
            <div class="aniInput"><input type="text" class="browser-default" value="1 KG"><span class="focus-border"></span></div>
          </div>
        </div>
        <div class="form-group">
          <label>Currency</label>
          <div class="pm-input-wrap">
            <select><option selected>USD</option><option>KRW</option><option>CNY</option><option>EUR</option></select>
          </div>
        </div>
        <div class="form-group">
          <label>Profit Center</label>
          <div class="pm-input-wrap">
            <select><option selected>PC-2200 · Specialty Chem</option><option>PC-2100 · Coating</option><option>PC-3000 · OEM</option></select>
          </div>
        </div>
        <div class="form-group">
          <label>Tax Code (Input)</label>
          <div class="pm-input-wrap">
            <select><option selected>V0 · Import (no VAT)</option><option>V1 · Domestic 10%</option></select>
          </div>
        </div>
        <div class="form-group">
          <label>Tax Code (Output)</label>
          <div class="pm-input-wrap">
            <select><option selected>A1 · Sales 10%</option><option>A0 · Zero rated</option></select>
          </div>
        </div>
      </div>

      <!-- G/L mapping -->
      <div class="hoo-spec-head hoo-spec-head--gap">
        <h5 class="bi-block-title"><span class="bi-bar"></span>G/L Account Mapping</h5>
      </div>
      <div class="hoo-spec-table">
        <table class="hoo-table">
          <colgroup>
            <col style="width:200px">
            <col style="width:160px">
            <col>
          </colgroup>
          <thead>
            <tr><th>Posting Key</th><th>G/L Account</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><b>Inventory</b></td>
              <td><span class="fin-acct-code">130000</span></td>
              <td>Raw materials inventory</td>
            </tr>
            <tr>
              <td><b>Goods Receipt Clearing</b></td>
              <td><span class="fin-acct-code">191100</span></td>
              <td>Goods receipt / invoice receipt</td>
            </tr>
            <tr>
              <td><b>Price Difference</b></td>
              <td><span class="fin-acct-code">231500</span></td>
              <td>Price variance</td>
            </tr>
            <tr>
              <td><b>Consumption</b></td>
              <td><span class="fin-acct-code">400100</span></td>
              <td>Raw material consumption</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cost center (REQUIRED) -->
      <div class="hoo-spec-head hoo-spec-head--gap">
        <h5 class="bi-block-title"><span class="bi-bar"></span>Cost Center Assignment</h5>
      </div>
      <div class="form-grid col-2 pm-grid">
        <div class="form-group">
          <label>Cost Center <span class="fin-required-tag">Required</span></label>
          <div class="pm-input-wrap fin-required-empty" id="finCcWrap">
            <select id="finCostCenter" required>
              <option value="" disabled>— Select cost center —</option>
              <option value="CC-2210">CC-2210 · Specialty Chem · R&amp;D</option>
              <option value="CC-2220" selected>CC-2220 · Specialty Chem · Production</option>
              <option value="CC-2230">CC-2230 · Specialty Chem · QA</option>
              <option value="CC-3100">CC-3100 · Coating · Production</option>
              <option value="CC-9000">CC-9000 · Shared Services</option>
            </select>
          </div>
          <div class="fin-required-helper" id="finCcHelper">
            <i class="material-icons">error_outline</i>
            <span>Cost Center is required to post the material master.</span>
          </div>
        </div>
        <div class="form-group">
          <label>Internal Order (optional)</label>
          <div class="pm-input-wrap">
            <select><option value="" selected>— None —</option><option>IO-450012 · NPI Trial Run</option><option>IO-450033 · OEM Sample</option></select>
          </div>
        </div>
      </div>

      <!-- Cost summary KPIs -->
      <div class="hoo-spec-head hoo-spec-head--gap">
        <h5 class="bi-block-title"><span class="bi-bar"></span>Cost Summary</h5>
      </div>
      <div class="fin-kpi-grid">
        <div class="fin-kpi">
          <div class="fin-kpi-label">Material</div>
          <div class="fin-kpi-val">$3.42</div>
          <div class="fin-kpi-sub">FOB Hubei</div>
        </div>
        <div class="fin-kpi">
          <div class="fin-kpi-label">Logistics</div>
          <div class="fin-kpi-val">$0.36</div>
          <div class="fin-kpi-sub">Freight + inland</div>
        </div>
        <div class="fin-kpi">
          <div class="fin-kpi-label">Overhead</div>
          <div class="fin-kpi-val">$0.18</div>
          <div class="fin-kpi-sub">Allocated</div>
        </div>
        <div class="fin-kpi fin-kpi-accent">
          <div class="fin-kpi-label">Standard cost</div>
          <div class="fin-kpi-val">$3.96</div>
          <div class="fin-kpi-sub">Posted to BSX</div>
        </div>
      </div>

      <!-- Confirmation -->
      <div class="pm-confirm-card">
        <div class="pm-confirm-head">
          <i class="material-icons">account_balance</i>
          <div>
            <div class="pm-confirm-title">Finance Confirmation</div>
            <div class="pm-confirm-sub">Valuation, G/L mapping &amp; cost center verified before posting.</div>
          </div>
        </div>
        <ul class="pm-check-list">
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Valuation class &amp; price control aligned</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">G/L account mapping verified</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Cost center assigned &amp; budget available</span></label></li>
          <li><label class="pm-check"><input type="checkbox"><span class="pm-check-box"></span><span class="pm-check-label">Standard cost matches landed-cost build</span></label></li>
        </ul>
        <div class="pm-confirm-actions">
          <button class="hBtn hGrey waves-effect"><i class="material-icons">close</i><span class="label">Reject</span></button>
          <button class="hBtn hViolet waves-effect pm-approve" disabled><i class="material-icons">check</i><span class="label">Approve</span></button>
        </div>
      </div>`,

    'Release': `
      <!-- Approval trace — progressStatus 기반 동적 상태 표시 (done / current(진행중) / pending / rejected) -->
      <div class="hoo-spec-head">
        <h5 class="bi-block-title"><span class="bi-bar"></span>Approval Trace</h5>
      </div>
      <div class="rel-trace">
        ${(() => {
          const traceRoles = isFG
            ? ['Product Management', 'Technologist', 'Supply Chain', 'Customs(GTC)', 'EHS', 'Logistic', 'Finance']
            : ['Quality', 'Product Management', 'Supply Chain', 'Sourcing', 'Customs(GTC)', 'EHS', 'Logistic', 'Finance'];
          const stateClass = { done:'rel-trace-done', current:'rel-trace-inprogress', pending:'rel-trace-pending', rejected:'rel-trace-rejected' };
          const displayName = role => role === 'Customs(GTC)' ? 'Customs (GTC)' : role;
          return traceRoles.map(role => {
            const state = progressStatus[role] || 'pending';
            const cls = stateClass[state] || 'rel-trace-pending';
            const icon = state === 'rejected' ? 'cancel' : (stageIcons[role] || 'check_circle');
            const p = personMap[role] || { name:'—', date:'' };
            const meta = state === 'done'    ? `${p.name} · ${p.date}`
                       : state === 'current' ? `${p.name} · in progress`
                       : state === 'rejected' ? `${p.name} · rejected`
                       : 'pending';
            return `<div class="rel-trace-item ${cls}"><i class="material-icons">${icon}</i><div><b>${displayName(role)}</b><small>${meta}</small></div></div>`;
          }).join('');
        })()}
      </div>

      ${pStatus === 'approved' ? `
      <!-- Parent Code Info — Basic Info PARENT CODE INFO 와 매칭 -->
      <div class="hoo-spec-head hoo-spec-head--gap">
        <h5 class="bi-block-title"><span class="bi-bar"></span>Parent Code Info</h5>
        <div class="hoo-spec-tools">
          <span class="rel-status rel-status-ready">Ready for posting</span>
        </div>
      </div>
      <div class="rel-master-card">
        <div class="rel-master-row">
          <div class="rel-master-cell">
            <div class="rel-master-label">${productModel.parentCodeLabel}</div>
            <div class="rel-master-code">${productModel.release.parentCode}</div>
          </div>
          <div class="rel-master-cell rel-master-name">
            <div class="rel-master-label">${productModel.parentNameLabel}</div>
            <div class="rel-master-val">${productModel.descLine}</div>
          </div>
          <div class="rel-master-cell">
            <div class="rel-master-label">Material Type</div>
            <div class="rel-master-val">${isFG ? 'FERT · Finished Goods' : 'ROH · Raw Material'}</div>
          </div>
          <div class="rel-master-cell">
            <div class="rel-master-label">Substance</div>
            <div class="rel-master-val">${productModel.spec}</div>
          </div>
        </div>
        <div class="rel-master-row rel-master-row-2">
          <div class="rel-master-cell">
            <div class="rel-master-label">CAS</div>
            <div class="rel-master-val">${productModelCasList}</div>
          </div>
          <div class="rel-master-cell">
            <div class="rel-master-label">${productModel.release.manufactureLabel}</div>
            <div class="rel-master-val">${productModel.release.manufactureValue}</div>
          </div>
          <div class="rel-master-cell">
            <div class="rel-master-label">HS Code</div>
            <div class="rel-master-val">${productModel.release.hsCode}</div>
          </div>
          <div class="rel-master-cell">
            <div class="rel-master-label">UN Number</div>
            <div class="rel-master-val">${productModel.release.unNumber}</div>
          </div>
        </div>
      </div>

      <!-- SKU Codes — Parent Code Info 직속 child. Basic Info 의 parent-code-children
           패턴 그대로 (vertical rail + node dot + 그라데이션 배경 으로 hierarchy 시각화) -->
      <div class="parent-code-children">
        <div class="bi-block-head pcc-head">
          <h5 class="bi-block-title pcc-title"><span class="bi-bar"></span>SKU CODES<span class="pcc-count">${productModel.release.variants.length}</span></h5>
          <div class="bi-block-meta">
            <span class="rel-meta">${productModel.release.variants[0].plants.length} plants</span>
          </div>
        </div>
        <div class="rel-variant-grid">
          ${productModel.release.variants.map(v => `
          <div class="rel-variant">
            <div class="rel-variant-head">
              <span class="sc-pack-pill ${v.packPillCls}">${v.packLabel}</span>
              <span class="rel-variant-status rel-variant-status-new">NEW</span>
            </div>
            <div class="rel-variant-code">${v.code}</div>
            <ul class="rel-variant-meta">
              <li><span>Pack Unit</span><b>${v.packUnit}</b></li>
              <li><span>Net / Gross</span><b>${v.netGross}</b></li>
              <li><span>MOQ</span><b>${v.moq}</b></li>
              <li><span>Std. Cost</span><b>${v.stdCost}</b></li>
            </ul>
            <div class="rel-variant-plants">
              <div class="rel-variant-plants-label">Extended to plants</div>
              <div class="rel-variant-plants-row">
                ${v.plants.map(p => `
                <div class="rel-variant-plant">
                  <span class="sc-plant-pill">${p.code}</span>
                  <span class="rel-variant-plant-loc">${p.loc}</span>
                </div>`).join('')}
              </div>
            </div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Composition — Basic Info COMPOSITION RATE 와 같은 hoo-table 패턴 (read-only) -->
      <div class="bi-block-head">
        <h5 class="bi-block-title"><span class="bi-bar"></span>COMPOSITION</h5>
        <div class="bi-block-meta">
          <span class="rel-meta">${productModel.composition.length} substances · sums to 100%</span>
        </div>
      </div>
      <div class="hoo-spec-table">
        <table class="hoo-table">
          <colgroup>
            <col style="width:40px">
            <col style="width:140px">
            <col>
            <col style="width:200px">
          </colgroup>
          <thead>
            <tr>
              <th>No.</th>
              <th>CAS Number</th>
              <th>Chemical Name</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            ${productModel.composition.map((c, i) => `
            <tr>
              <td class="hoo-no">${i + 1}</td>
              <td>${c.cas}</td>
              <td class="comp-chem">${c.chem}</td>
              <td>
                <div class="hoo-bar-cell">
                  <span class="comp-bar"><span class="comp-fill" style="width:${c.pct}%"></span></span>
                  <b class="comp-pct-readonly">${c.pct}%</b>
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
          <tfoot>
            <tr class="hoo-tfoot-row">
              <td colspan="3" class="hoo-tfoot-label">TOTAL</td>
              <td class="hoo-tfoot-value"><b>100%</b></td>
            </tr>
          </tfoot>
        </table>
      </div>
      ` : `
      <!-- Skeleton — 모든 승인 완료 전엔 master record 미발급. Approval Trace 만 노출 -->
      <div class="rel-skeleton">
        <div class="rel-skeleton-icon"><i class="material-icons">hourglass_empty</i></div>
        <div class="rel-skeleton-title">Master record awaits final approval</div>
        <div class="rel-skeleton-sub">All approval steps must be complete before the master record is generated.</div>
      </div>
      `}`,
  };

  function singleApprovalContent(role) {
    const p = personMap[role] || { name:'TBD' };
    return `<div class="approval-row">
        <div class="approval-person"><i class="material-icons">person</i><span>${role}</span><span class="approval-name">${p.name}</span></div>
        <div class="approval-actions"><select><option value="" disabled selected>Pending</option><option>Approved</option><option>Rejected</option><option>On Hold</option></select></div>
      </div>
      <div class="form-group form-group--gap"><label>Comments</label><textarea class="detail-textarea" rows="2" placeholder="Add comments..."></textarea></div>`;
  }

  let sectionIdx = 0;
  function sectionTitleHtml(icon, titleText, role) {
    const p = personMap[role] || {};
    const st = progressStatus[role] || 'pending';
    return buildSectionTitleHtml(icon, titleText, st, p.date);
  }

  /* Basic Information autofill — 처음엔 행 제거 + 입력값 비우고, OCR 모달 Proceed 후 원본 HTML 복원 */
  let biOriginalHTML = null;
  function captureBasicInfo() {
    const biPanel = document.getElementById('basicInfoPanel');
    if (!biPanel) return;
    biOriginalHTML = biPanel.innerHTML;
  }
  function clearBasicInfo() {
    const biPanel = document.getElementById('basicInfoPanel');
    if (!biPanel) return;
    /* productModel 기반으로 마크업에 박힌 값 (mat-name-input, Reason textarea) 은 보존.
       Composition / SKU 표는 productModel 동적 렌더라 행 자체도 유지 (BulkInfo 의 옛 reset 의도는
       사용자 직접 입력 흐름이었지만, 지금 mock 은 항상 진행 중 상태라 빈 form 시점이 없음) */
    biPanel.querySelectorAll('input:not([readonly]):not(.mat-name-input)').forEach(el => { el.value = ''; });
    /* select 는 우리 productModel 마크업이 selected 박은 것 보존 (selectedIndex 0 reset 하지 않음).
       defaultSelected attribute 가 우리 마크업의 sku.containerCode / uom 매칭 옵션에 박혀있음 */
    M.FormSelect.init(biPanel.querySelectorAll('select'));
  }
  function fillBasicInfo() {
    const biPanel = document.getElementById('basicInfoPanel');
    if (!biPanel || !biOriginalHTML) return;
    biPanel.innerHTML = biOriginalHTML;
    M.FormSelect.init(biPanel.querySelectorAll('select'));
    /* tbody innerHTML 갱신됐으니 글래스 행 호버 overlay 재등록 */
    if (window.initAllHooTableOverlays) window.initAllHooTableOverlays(biPanel);
    autoAlignNumericColumns(biPanel);
    initStageCardGlow(biPanel);
    syncAllContainerRows();
    /* Request stage 안 새 pm-confirm-card에 체크박스 listener 등록 (idempotent) */
    initPMConfirmation();
  }

  /* ===== Basic Information 동적 행 (Add row / 삭제 / Composition % 갱신) ===== */
  function renumberQaRows(tbody) {
    tbody.querySelectorAll('tr').forEach((tr, i) => {
      const noCell = tr.querySelector('.hoo-no');
      if (noCell) noCell.textContent = i + 1;
    });
  }
  function updateCompositionTotal() {
    const tbl = document.getElementById('biCompTable');
    if (!tbl) return;
    let total = 0;
    tbl.querySelectorAll('tbody tr').forEach(tr => {
      const inp = tr.querySelector('.comp-pct-input');
      const v = parseFloat(inp && inp.value);
      const safe = isNaN(v) ? 0 : Math.max(0, Math.min(100, v));
      total += safe;
      const fill = tr.querySelector('.comp-fill');
      if (fill) fill.style.width = safe + '%';
    });
    const totalEl = document.getElementById('compTotal');
    if (totalEl) totalEl.textContent = (Math.round(total * 100) / 100) + '%';
  }
  function addCompRow() {
    const tbl = document.getElementById('biCompTable');
    if (!tbl) return;
    const tbody = tbl.querySelector('tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="hoo-no"></td>
      <td><div class="aniInput"><input type="text" class="browser-default comp-cas-input" placeholder="CAS #"><span class="focus-border"></span></div></td>
      <td class="comp-chem">—</td>
      <td>
        <div class="hoo-bar-cell">
          <span class="comp-bar"><span class="comp-fill" style="width:0%"></span></span>
          <div class="comp-pct-input-wrap">
            <input type="number" min="0" max="100" step="0.1" class="browser-default comp-pct-input" value="">
            <span class="comp-pct-suffix">%</span>
          </div>
        </div>
      </td>
      <td class="hoo-x"><i class="material-icons">close</i></td>`;
    tbody.appendChild(tr);
    renumberQaRows(tbody);
    updateCompositionTotal();
  }
  function addPlantRow() {
    const tbl = document.getElementById('biPlantTable');
    if (!tbl) return;
    const tbody = tbl.querySelector('tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="hoo-no"></td>
      <td>
        <div class="bi-select-wrap">
          <select class="bi-select browser-default">
            <option value="" disabled selected>Select…</option>
            <option value="WTFD">WTFD — Waterford</option>
            <option value="SVLL">SVLL — Sistersville</option>
            <option value="GART">GART — Gart</option>
          </select>
        </div>
      </td>
      <td>
        <div class="bi-select-wrap">
          <select class="bi-select browser-default">
            <option value="" disabled selected>Select…</option>
            <option value="WTFD">WTFD — Waterford</option>
            <option value="SVLL">SVLL — Sistersville</option>
            <option value="GART">GART — Gart</option>
          </select>
        </div>
      </td>
      <td><div class="bi-readonly"><i class="material-icons bi-readonly-ico">lock</i><span class="bi-readonly-text">—</span></div></td>
      <td class="hoo-x"><i class="material-icons">close</i></td>`;
    tbody.appendChild(tr);
    renumberQaRows(tbody);
    M.FormSelect.init(tr.querySelectorAll('select'));
  }
  function addContainerRow() {
    const tbl = document.getElementById('biContainerTable');
    if (!tbl) return;
    const tbody = tbl.querySelector('tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="hoo-no"></td>
      <td>
        <div class="bi-select-wrap">
          <select class="bi-select browser-default cnt-container">
            <option value="" disabled selected>Select…</option>
            <option value="BULK">BULK</option>
            <option value="DRUM">DRUM</option>
            <option value="IBC">IBC</option>
            <option value="CAN">CAN</option>
          </select>
        </div>
      </td>
      <td><div class="aniInput"><input type="number" min="0" step="0.01" class="browser-default hoo-num cnt-net" value=""><span class="focus-border"></span></div></td>
      <td>
        <div class="bi-select-wrap">
          <select class="bi-select browser-default cnt-uom">
            <option value="KG" selected>KG</option>
            <option value="L">L</option>
            <option value="GAL">GAL</option>
            <option value="LB">LB</option>
          </select>
        </div>
      </td>
      <td><div class="aniInput"><input type="text" class="browser-default cnt-matnum" placeholder="auto generate" readonly><span class="focus-border"></span></div></td>
      <td><div class="aniInput"><input type="text" class="browser-default cnt-matname" readonly><span class="focus-border"></span></div></td>
      <td class="hoo-x"><i class="material-icons">close</i></td>`;
    tbody.appendChild(tr);
    renumberQaRows(tbody);
    M.FormSelect.init(tr.querySelectorAll('select'));
    syncContainerRow(tr);
    updateSkuCodeCount();
  }

  /* CONTAINER & NET CONTENT — Container 따라 Net/UOM 활성화 + Material Name 자동 생성 */
  function syncContainerRow(tr) {
    if (!tr) return;
    const containerSel = tr.querySelector('.cnt-container');
    const netInput = tr.querySelector('.cnt-net');
    const uomSel = tr.querySelector('.cnt-uom');
    const matNameInp = tr.querySelector('.cnt-matname');
    if (!containerSel || !matNameInp) return;
    const container = containerSel.value;
    const isBulk = container === 'BULK';

    /* Net Content / UOM 셀 — BULK면 hide */
    const netCell = netInput && netInput.closest('td');
    const uomCell = uomSel && uomSel.closest('td');
    if (netCell) netCell.classList.toggle('cnt-cell-hidden', isBulk);
    if (uomCell) uomCell.classList.toggle('cnt-cell-hidden', isBulk);
    if (isBulk && netInput) netInput.value = '';

    /* Material Name 자동 생성: <PARENT CODE INFO Material Name> / <Container> [/ <Net> <UOM>] */
    const matBaseInp = document.querySelector('#basicInfoPanel .mat-name-input');
    const matBase = matBaseInp ? matBaseInp.value.trim() : '';
    const net = netInput ? netInput.value.trim() : '';
    const uom = uomSel ? uomSel.value.trim() : '';
    let composed = matBase || '';
    if (container) composed += (composed ? ' / ' : '') + container;
    if (!isBulk && net && uom) composed += ' / ' + net + ' ' + uom;
    matNameInp.value = composed;
  }
  function syncAllContainerRows() {
    document.querySelectorAll('#biContainerTable tbody tr').forEach(syncContainerRow);
    updateSkuCodeCount();
  }
  function updateSkuCodeCount() {
    const el = document.getElementById('skuCodeCount');
    if (!el) return;
    el.textContent = document.querySelectorAll('#biContainerTable tbody tr').length;
  }
  /* Container/Net/UOM 변경 → 해당 행 갱신, Parent Code Material Name 변경 → 모든 행 갱신 */
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (!t || !t.classList) return;
    if (t.classList.contains('cnt-container') || t.classList.contains('cnt-uom')) {
      const tr = t.closest('tr'); if (tr) syncContainerRow(tr);
    }
  });
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (!t || !t.classList) return;
    if (t.classList.contains('cnt-net')) {
      const tr = t.closest('tr'); if (tr) syncContainerRow(tr);
    }
    if (t.classList.contains('mat-name-input')) syncAllContainerRows();
  });

  /* 이벤트 위임 — 정적/동적 행 모두 대응 */
  document.addEventListener('click', (e) => {
    if (e.target.closest('#compAddRow'))     { addCompRow();      return; }
    if (e.target.closest('#biAddPlant'))     { addPlantRow();     return; }
    if (e.target.closest('#biAddContainer')) { addContainerRow(); return; }
    const xCell = e.target.closest('#basicInfoPanel .hoo-table .hoo-x');
    if (xCell) {
      const tr = xCell.closest('tr');
      if (!tr) return;
      const tbody = tr.parentElement;
      const tbl = tbody.closest('table');
      tr.remove();
      renumberQaRows(tbody);
      if (tbl && tbl.id === 'biCompTable') updateCompositionTotal();
      if (tbl && tbl.id === 'biContainerTable') updateSkuCodeCount();
    }
  });
  document.addEventListener('input', (e) => {
    if (e.target.classList.contains('comp-pct-input')) updateCompositionTotal();
  });

  function renderStageSections() {
    const stages = routingData[pSub] || routingData['new'];
    const container = document.getElementById('stageSections');
    let html = '';
    sectionIdx = 0;
    stages.forEach((stage, si) => {
      const [label, roles, parallel] = stage;
      if (stageContent[label]) {
        const icon = stageIcons[label] || 'task';
        html += `<div class="detail-section glass-panel stage-section" id="stage-${sectionIdx}" data-stage="${si}" data-role="${roles[0]}" data-roles="${roles.join(',')}">${sectionTitleHtml(icon, label, roles[0])}${stageContent[label]}</div>`;
        sectionIdx++;
      } else if (parallel && roles.length > 1) {
        roles.forEach(role => {
          const icon = stageIcons[role] || stageIcons[label] || 'task';
          const body = stageContent[role] ? stageContent[role] : singleApprovalContent(role);
          html += `<div class="detail-section glass-panel stage-section" id="stage-${sectionIdx}" data-stage="${si}" data-role="${role}" data-roles="${role}">${sectionTitleHtml(icon, role, role)}${body}</div>`;
          sectionIdx++;
        });
      } else {
        const icon = stageIcons[label] || 'task';
        const body = stageContent[roles[0]] ? stageContent[roles[0]] : singleApprovalContent(roles[0]);
        html += `<div class="detail-section glass-panel stage-section" id="stage-${sectionIdx}" data-stage="${si}" data-role="${roles[0]}" data-roles="${roles.join(',')}">${sectionTitleHtml(icon, label, roles[0])}${body}</div>`;
        sectionIdx++;
      }
    });
    container.innerHTML = html;
    M.FormSelect.init(container.querySelectorAll('select'));
    if (window.initAllHooTableOverlays) window.initAllHooTableOverlays();
    autoAlignNumericColumns();
    initStageCardGlow();
  }

  /* AI Document Verification 게이팅 — 신규 + 진행 중인 케이스에만 적용
     · sub !== 'new' (다른 진입)
     · status === 'approved' / 'rejected' (이미 결재 끝난 케이스)
     · Request stage가 done (verification 이미 거친 historical view)
     이 셋 중 하나면 게이팅 안 하고 verification 영역도 hide */
  function applyVerifyGate() {
    const inline = document.getElementById('docVerifyInline');
    const reqState = progressStatus['Request'] || 'pending';
    const alreadyDone = pStatus === 'approved' || pStatus === 'rejected' || reqState === 'done';
    if (pSub !== 'new' || alreadyDone) {
      /* verification 영역 hide, Basic Info는 항상 표시 */
      if (inline) {
        inline.classList.add('dv-inline-hidden');
        const header = inline.previousElementSibling;
        if (header && header.classList.contains('bi-block-title')) {
          header.classList.add('dv-inline-hidden');
        }
      }
      const biPanel = document.getElementById('basicInfoPanel');
      if (biPanel) biPanel.classList.add('bi-reveal');
      return;
    }
    /* 진짜 신규 진입 — Request 외 stage 잠그기. Basic Info는 verification 완료 시 reveal */
    document.querySelectorAll('#stageSections .stage-section').forEach(sec => {
      if (sec.dataset.stage !== '0') sec.classList.add('stage-locked');
    });
  }
  function revealStagesAfterVerify() {
    const locked = document.querySelectorAll('#stageSections .stage-section.stage-locked');
    locked.forEach((sec, i) => {
      setTimeout(() => {
        sec.classList.remove('stage-locked');
        sec.classList.add('stage-revealing');
        setTimeout(() => sec.classList.remove('stage-revealing'), 600);
      }, i * 80);
    });
  }

  /* DV Step 2 (Duplicate Check) 데이터 채우기 — Material 모드 / FG·SemiFG 모드 분기.
     append=true 이면 기존 행에 덧붙임 (runAutofill 흐름), false 이면 비어있을 때만 채움 (presetDvVerified 흐름) */
  function fillDupData(isFGMode, append) {
    const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
    const info = document.getElementById('dupScanInfo');

    if (isFGMode) {
      set('dupBrand',     'SILQUEST<small>from Composition</small>');
      set('dupProduct',   'GAMMA-MPS SILANE<small>from Composition</small>');
      set('dupFuncGroup', 'Mercapto Silane<small>chemistry class</small>');
      set('dupMainComp',  '3-MPTMS <em class="cas-pct">75%</em><small>highest weight %</small>');
      if (info) info.textContent = 'Scanned 4,820 parent FG codes · 4 closest candidates · all below 60% similarity';

      const compareBtn = `<a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light"><i class="material-icons">compare_arrows</i><span class="label">Compare</span></a>`;
      const simCls = sim => sim >= 80 ? 'high' : sim >= 50 ? 'mid' : 'low';
      const fgRows = `
        <tr>
          <td class="d-code">182501</td>
          <td class="d-name">SILQUEST A-1100 SILANE<small>same brand · different functional group (amino)</small></td>
          <td><div class="d-sim ${simCls(58)}"><div class="d-sim-bar"><div class="d-sim-fill" style="width:58%"></div></div><span class="d-sim-pct">58%</span></div></td>
          <td>${compareBtn}</td>
        </tr>
        <tr>
          <td class="d-code">182610</td>
          <td class="d-name">DOWSIL Z-6020 SILANE<small>different brand · diamine functional group</small></td>
          <td><div class="d-sim ${simCls(54)}"><div class="d-sim-bar"><div class="d-sim-fill" style="width:54%"></div></div><span class="d-sim-pct">54%</span></div></td>
          <td>${compareBtn}</td>
        </tr>
        <tr>
          <td class="d-code">182700</td>
          <td class="d-name">SILQUEST A-1110 SILANE<small>same brand · phenyl-amino variant</small></td>
          <td><div class="d-sim ${simCls(48)}"><div class="d-sim-bar"><div class="d-sim-fill" style="width:48%"></div></div><span class="d-sim-pct">48%</span></div></td>
          <td>${compareBtn}</td>
        </tr>
        <tr>
          <td class="d-code">182611</td>
          <td class="d-name">KCC SILANE Pre-mix<small>PDMS-based · BOM partial overlap</small></td>
          <td><div class="d-sim ${simCls(42)}"><div class="d-sim-bar"><div class="d-sim-fill" style="width:42%"></div></div><span class="d-sim-pct">42%</span></div></td>
          <td>${compareBtn}</td>
        </tr>`;
      const fgEl = document.getElementById('dupListFG');
      if (fgEl && (append || !fgEl.children.length)) fgEl.innerHTML = fgRows;
      return;
    }

    /* Material mode (기존) */
    set('dupVendor', 'Hubei Co-Formula Material Tech Co., Ltd.<small>from TDS</small>');
    set('dupName',   'Tetramethyl orthosilicate<small>from TDS</small>');
    set('dupSpec',   'CFS-845<small>from TDS</small>');
    set('dupCas',    '541-05-9 <em class="cas-pct">98%</em><br>556-67-2 <em class="cas-pct">2%</em><small>from Composition Rate</small>');
    if (info) info.textContent = 'Scanned 2,847 materials · 2 candidates found';

    const matRows = `
      <tr>
        <td class="d-code">182441</td>
        <td class="d-name">Tetramethyl orthosilicate CFS-820<small>CAS 681-84-5</small></td>
        <td><div class="d-sim mid"><div class="d-sim-bar"><div class="d-sim-fill" style="width:65%"></div></div><span class="d-sim-pct">65%</span></div></td>
        <td>WTFD · CFS Korea</td>
        <td><a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light"><i class="material-icons">compare_arrows</i><span class="label">Compare</span></a></td>
      </tr>
      <tr>
        <td class="d-code">183207</td>
        <td class="d-name">Tetramethyl orthosilicate CFS-1200<small>CAS 681-84-5</small></td>
        <td><div class="d-sim low"><div class="d-sim-bar"><div class="d-sim-fill" style="width:58%"></div></div><span class="d-sim-pct">58%</span></div></td>
        <td>SVLL · CFS Korea</td>
        <td><a href="javascript:;" class="hBtn hBtn-sm hOrange waves-effect waves-light"><i class="material-icons">compare_arrows</i><span class="label">Compare</span></a></td>
      </tr>`;
    const dupList = document.getElementById('dupList');
    if (!dupList) return;
    if (append) {
      dupList.innerHTML += matRows;
    } else if (!dupList.children.length) {
      dupList.innerHTML = matRows;
    }
  }

  /* ?dv=verified — AI Document Verification 단계를 모두 마친 상태로 부팅
     (3개 파일 업로드 → Parse 완료 → Duplicate Check confirm → Proceed 클릭) */
  function presetDvVerified() {
    const inline = document.getElementById('docVerifyInline');
    if (!inline || inline.classList.contains('dv-inline-hidden')) return;
    if (inline.classList.contains('is-verified')) return;

    const mockFiles = isFG ? {
      Comp: { name: 'SILQUEST_A-1100_SILANE_Composition.xlsx', size: 92400 },
    } : {
      Tds:  { name: 'TETRAMETHYL_ORTHOSILICATE_CFS-845_TDS.pdf',          size: 248700 },
      Msds: { name: 'TETRAMETHYL_ORTHOSILICATE_CFS-845_MSDS.pdf',         size: 312400 },
      Comp: { name: 'TETRAMETHYL_ORTHOSILICATE_CFS-845_Composition.xlsx', size:  84200 },
    };
    Object.keys(mockFiles).forEach(kind => {
      const f = mockFiles[kind];
      uploadState[kind] = f;
      const dz = document.getElementById('dz' + kind);
      if (!dz) return;
      dz.classList.add('has-file', 'parsed');
      const body = dz.querySelector('.dz-body');
      if (body) body.innerHTML =
        `<div class="dz-file"><span class="f-mark"><i class="material-icons icon-sm-16">check</i></span>` +
        `<span class="f-name">${f.name}</span><span class="f-meta">${(f.size / 1024).toFixed(1)} KB</span>` +
        `<button class="f-rm" onclick="removeFile('${kind}', event)"><i class="material-icons icon-sm-16">close</i></button></div>`;
    });
    if (isFG) {
      const specEl = document.getElementById('fgSpecText');
      if (specEl) specEl.value = 'Customer Acme Poly needs SILQUEST A-1100 SILANE in TSP 16KG container with ≥99% purity for adhesive primer line. Equivalent to existing A-1100 family but new spec variant. Annual demand ~12 tons, lead time 6 weeks.';
    }

    const parseBtn = document.getElementById('parseBtn');
    if (parseBtn) {
      parseBtn.disabled = true;
      parseBtn.classList.add('is-done');
      const lbl = parseBtn.querySelector('.label') || parseBtn;
      lbl.textContent = 'Done ✓';
    }
    const dupEmpty = document.getElementById('dupEmpty');
    const dupContent = document.getElementById('dupContent');
    if (dupEmpty) dupEmpty.style.display = 'none';
    if (dupContent) {
      dupContent.style.display = 'block';
      fillDupData(isFG);
    }

    document.querySelectorAll('#dupConfirm .chk-confirm').forEach(c => { c.checked = true; });
    const dupConfirm = document.getElementById('dupConfirm');
    if (dupConfirm) dupConfirm.classList.add('is-confirmed');
    const btnConfirmDup = document.getElementById('btnConfirmDup');
    if (btnConfirmDup) btnConfirmDup.disabled = false;

    setDvStep(null, [1, 2]);
    inline.classList.add('is-verified');
    const biPanel = document.getElementById('basicInfoPanel');
    if (biPanel && !biPanel.classList.contains('bi-reveal')) biPanel.classList.add('bi-reveal');
    fillBasicInfo();
    revealStagesAfterVerify();
  }

  /* Material stage 모드 적용 — outer scope 헬퍼 사용
     Request(=Basic Info) stage 특별 처리: 신규(sub=new) 외에는 fillBasicInfo로 복원 후 일반 처리 */
  function applyStageModes() {
    const sections = document.querySelectorAll('#stageSections .stage-section');
    sections.forEach(sec => {
      const role = sec.dataset.role || '';
      const st = progressStatus[role] || 'pending';
      const isBasicInfo = role === 'Request';
      const restoreReq = () => { if (isBasicInfo && pSub !== 'new') fillBasicInfo(); };
      if (st === 'done') {
        restoreReq();
        autofillEmpty(sec);
        convertSectionToView(sec, { empty:false });
      } else if (st === 'current') {
        restoreReq();
        if (!isBasicInfo) sec.classList.add('stage-current');
      } else if (st === 'rejected') {
        restoreReq();
        autofillEmpty(sec);
        convertSectionToView(sec, { empty:false });
        sec.classList.add('stage-rejected');
      } else {
        /* pending — 양식 유지 + 값 비움 + Approve 액션 제거 (아직 차례 아님) */
        if (!isBasicInfo) {
          clearSectionInputs(sec);
          sec.querySelectorAll('.pm-confirm-actions').forEach(el => el.remove());
          sec.classList.add('stage-pending');
        }
      }
    });
    /* tbody innerHTML 갱신(fillBasicInfo, autofill의 sample row 등) 후 글래스 overlay 재등록 */
    if (window.initAllHooTableOverlays) window.initAllHooTableOverlays();
    autoAlignNumericColumns();
    initStageCardGlow();
  }

  function initScrollSpy() {
    const sections = document.querySelectorAll('.stage-section');
    const allCards = document.querySelectorAll('.rt-card[data-section]');
    function updateSpy() {
      let activeSecIdx = 0;
      const offset = 150;
      sections.forEach((sec, i) => {
        /* hidden stage(stage-locked, display:none)는 spy 계산에서 제외 */
        if (sec.offsetParent === null) return;
        const rect = sec.getBoundingClientRect();
        if (rect.top <= offset) activeSecIdx = i;
      });
      allCards.forEach(card => { card.classList.toggle('spy-active', parseInt(card.dataset.section) === activeSecIdx); });
    }
    window.addEventListener('scroll', updateSpy);
    updateSpy();
  }

  function initRouteClick() {
    document.querySelectorAll('.rt-card[data-section]').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        smoothScrollTo(document.getElementById('stage-' + card.dataset.section));
      });
    });
  }

  window.addEventListener('scroll', () => {
    document.querySelector('.app-header').classList.toggle('scrolled', window.scrollY > 10);
  });

  document.addEventListener('DOMContentLoaded', () => {
    renderRouting();
    renderStageSections();
    captureBasicInfo();
    /* clearBasicInfo() 는 "진짜 신규 등록 + DV 미완료" 시점에만 — 그 외엔 productModel 마크업 보존
       (이미 진행 중인 MR 진입 시 form 이 빈 채로 보이지 않도록) */
    {
      const reqState0 = progressStatus['Request'] || 'pending';
      const alreadyDone0 = pStatus === 'approved' || pStatus === 'rejected' || reqState0 === 'done';
      if (pSub === 'new' && !alreadyDone0) clearBasicInfo();
    }
    applyStageModes();
    applyVerifyGate();
    if (pDv === 'verified') presetDvVerified();
    updateTitle();
    initScrollSpy();
    initRouteClick();
    initRtCardGlass();
    initPMConfirmation();
    /* 진행 중인 케이스 — currentNode stage 로 자동 스크롤
       완료(approved) 케이스 — 결과 요약인 Release stage 로 자동 스크롤 */
    if (pStatus === 'inprogress' && pCurrentNode) {
      const target = document.querySelector(`#stageSections .stage-section[data-role="${pCurrentNode}"]`)
                   || document.querySelector(`#stageSections .stage-section[data-roles*="${pCurrentNode}"]`);
      if (target) setTimeout(() => smoothScrollTo(target), 120);
    } else if (pStatus === 'approved') {
      const target = document.querySelector(`#stageSections .stage-section[data-role="Release"]`);
      if (target) setTimeout(() => smoothScrollTo(target), 120);
    }
  });

  /* Product Management — Confirmation checklist toggles the Approve button */
  function initPMConfirmation() {
    document.querySelectorAll('.pm-confirm-card').forEach(root => {
      if (root._pmConfirmInit) return;
      root._pmConfirmInit = true;
      const boxes = root.querySelectorAll('.pm-check input[type="checkbox"]');
      const approve = root.querySelector('.pm-approve');
      if (!approve) return;
      const sync = () => {
        const allChecked = Array.from(boxes).every(b => b.checked);
        approve.disabled = !allChecked;
      };
      boxes.forEach(b => b.addEventListener('change', sync));
      sync();
    });
  }

  function initRtCardGlass() {
    document.querySelectorAll('.rt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--rt-gx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
        card.style.setProperty('--rt-gy', ((e.clientY - rect.top) / rect.height) * 100 + '%');
      });
    });
  }

  /* Process Map (Material) */
  function getNodeState(label) { return progressStatus[label] || 'pending'; }
  function pmNodeHtml(label, st, hlClass) {
    const p = personMap[label] || personMap[label.replace(' Admin','')] || {};
    return buildPmNodeHtml(label, st, hlClass, p);
  }

  function renderProcessMap() {
    const flow = currentFlow;
    const body = document.getElementById('pmBody');
    let html = `<h4 class="pm-process-title">${flow.title} Process</h4><div class="pm-flow-vertical">`;
    flow.nodes.forEach(node => {
      if (node.type === 'arrow') html += '<div class="pm-varrow"><i class="material-icons">arrow_downward</i></div>';
      else if (node.type === 'node') { const st = getNodeState(node.label); html += pmNodeHtml(node.label, st, (node.hl && st === 'done') ? ' pm-hl' : ''); }
      else if (node.type === 'row') { html += '<div class="pm-vrow">'; node.items.forEach(item => { html += pmNodeHtml(item, progressStatus[item] || 'pending'); }); html += '</div>'; }
    });
    html += '</div>';
    body.innerHTML = html;
    body.querySelectorAll('.pm-vnode').forEach(node => {
      node.addEventListener('mousemove', (e) => { const rect = node.getBoundingClientRect(); node.style.setProperty('--pm-gx', ((e.clientX - rect.left) / rect.width) * 100 + '%'); node.style.setProperty('--pm-gy', ((e.clientY - rect.top) / rect.height) * 100 + '%'); });
    });
    body.querySelectorAll('.pm-vnode[data-pm-label]').forEach(node => {
      node.addEventListener('click', () => {
        const label = node.dataset.pmLabel;
        const sections = document.querySelectorAll('.stage-section');
        let target = null;
        sections.forEach(sec => { const title = sec.querySelector('.section-title'); if (title && title.textContent.trim().includes(label)) target = sec; });
        if (target) { pmInstance.close(); setTimeout(() => smoothScrollTo(target), 300); }
      });
    });
  }

  const pmModalEl = document.getElementById('pmModal');
  const pmInstance = M.Modal.init(pmModalEl, {
    onOpenStart() { document.querySelector('.app-header').classList.add('content-blur'); document.querySelector('.detail-layout').classList.add('content-blur'); },
    onCloseEnd() { document.querySelector('.app-header').classList.remove('content-blur'); document.querySelector('.detail-layout').classList.remove('content-blur'); }
  });
  document.getElementById('btnProcessMap').addEventListener('click', () => { renderProcessMap(); pmInstance.open(); });

  /* Clear All */
  document.getElementById('btnClearAll').addEventListener('click', () => {
    document.querySelectorAll('.detail-right input[type="text"]:not([readonly])').forEach(inp => inp.value = '');
    document.querySelectorAll('.detail-right textarea').forEach(ta => ta.value = '');
    M.toast({html: 'All fields cleared'});
  });

  /* Save / Request */
  document.getElementById('btnSave').addEventListener('click', () => M.toast({html: 'Draft saved successfully'}));
  document.getElementById('btnRequest').addEventListener('click', () => M.toast({html: 'Request submitted for approval'}));

  /* Dropzone */
  const uploadState = { Tds: null, Msds: null, Comp: null };
  function initDropzones() {
    document.querySelectorAll('.dropzone').forEach(dz => {
      if (dz.classList.contains('dropzone-textarea')) return;
      if (dz.classList.contains('is-readonly')) return;
      const kind = dz.dataset.kind; if (!kind) return;
      const inp = dz.querySelector('input[type="file"]');
      dz.addEventListener('click', () => inp && inp.click());
      dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
      dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
      dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('drag-over'); if (e.dataTransfer.files.length) handleFile(kind, e.dataTransfer.files[0]); });
      if (inp) inp.addEventListener('change', () => { if (inp.files.length) handleFile(kind, inp.files[0]); });
    });
  }
  function handleFile(kind, file) {
    uploadState[kind] = file;
    const dz = document.getElementById('dz' + kind); dz.classList.add('has-file');
    dz.querySelector('.dz-body').innerHTML = `<div class="dz-file"><span class="f-mark"><i class="material-icons icon-sm-16">check</i></span><span class="f-name">${file.name}</span><span class="f-meta">${(file.size / 1024).toFixed(1)} KB</span><button class="f-rm" onclick="removeFile('${kind}', event)"><i class="material-icons icon-sm-16">close</i></button></div>`;
    checkParseReady();
  }
  window.removeFile = function(kind, e) {
    e.stopPropagation(); uploadState[kind] = null;
    const dz = document.getElementById('dz' + kind); dz.classList.remove('has-file');
    dz.querySelector('.dz-body').innerHTML = `<div class="dz-hint" id="dz${kind}Hint"><b>Drag &amp; drop file here</b><span class="dz-or">or click to browse</span></div>`;
    checkParseReady();
  };
  function checkParseReady() {
    const btn = document.getElementById('parseBtn'); if (!btn) return;
    let allReady;
    if (isFG) {
      const specEl = document.getElementById('fgSpecText');
      const hasSpec = !!(specEl && specEl.value.trim().length > 0);
      const hasComp = !!uploadState.Comp;
      allReady = hasSpec && hasComp;
      const hint = document.getElementById('dv1Hint');
      if (hint && !btn.classList.contains('is-done')) {
        hint.textContent = allReady
          ? 'Ready — click Parse & Auto-fill to extract product details'
          : (!hasSpec && !hasComp ? 'Complete the description and attach the composition sheet to continue'
             : !hasSpec ? 'Add product specifications to continue'
             : 'Attach composition sheet to continue');
      }
    } else {
      allReady = uploadState.Tds && uploadState.Msds && uploadState.Comp;
    }
    const wasDisabled = btn.disabled;
    btn.disabled = !allReady;
    /* 막 활성화된 시점에만 튀어오르기 애니메이션 (활성 상태 유지 동안 재시작 X) */
    if (wasDisabled && allReady && !btn.classList.contains('is-done')) {
      btn.classList.add('btn-just-ready');
      setTimeout(() => btn.classList.remove('btn-just-ready'), 600);
    }
  }
  /* FG textarea 입력 변화 트리거 */
  document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'fgSpecText') checkParseReady();
  });
  /* Sync the modal stepper visual + active panel.
     activeStep: which step gets is-active. doneSteps: array of step numbers marked is-done. */
  function setDvStep(activeStep, doneSteps) {
    const steps = document.querySelectorAll('.dv-stepper .dv-step');
    steps.forEach(s => {
      const n = Number(s.dataset.step);
      s.classList.toggle('is-active', n === activeStep);
      s.classList.toggle('is-done', (doneSteps || []).indexOf(n) !== -1);
    });
  }
  /* Switch the visible sliding panel and keep stepper in sync (2-step flow) */
  function switchDvPanel(n) {
    document.querySelectorAll('.dv-panel').forEach(p => {
      p.classList.toggle('is-active', Number(p.dataset.panel) === n);
    });
    const doneArr = n === 1 ? [] : n === 2 ? [1] : [1, 2];
    setDvStep(n, doneArr);
  }
  window.runAutofill = function() {
    const btn = document.getElementById('parseBtn'); btn.disabled = true;
    const lbl = btn.querySelector('.label') || btn;
    /* 4단계 분석 — TDS → MSDS → Composition → Cross-validation */
    const stages = [
      { kind: 'Tds',  label: 'Reading TDS…' },
      { kind: 'Msds', label: 'Reading MSDS…' },
      { kind: 'Comp', label: 'Reading Composition…' },
      { kind: 'all',  label: 'Cross-validating…' },
    ];
    const stepDur = 600;
    let idx = 0;
    function tick() {
      /* 이전 활성 dropzone 정리, 처리된 건 .parsed 표시 */
      document.querySelectorAll('.dropzone.parsing').forEach(dz => {
        dz.classList.remove('parsing');
        if (dz.id !== 'dz' + (stages[idx] && stages[idx].kind)) dz.classList.add('parsed');
      });
      if (idx < stages.length) {
        const s = stages[idx];
        lbl.textContent = s.label;
        if (s.kind === 'all') {
          document.querySelectorAll('.dropzone').forEach(dz => dz.classList.add('parsing'));
        } else {
          const dz = document.getElementById('dz' + s.kind);
          if (dz) dz.classList.add('parsing');
        }
        idx++;
        setTimeout(tick, stepDur);
      } else {
        finish();
      }
    }
    function finish() {
      document.querySelectorAll('.dropzone.parsing').forEach(dz => {
        dz.classList.remove('parsing');
        dz.classList.add('parsed');
      });
      lbl.textContent = 'Done ✓';
      btn.classList.add('is-done');
      const dupEmpty = document.getElementById('dupEmpty'); const dupContent = document.getElementById('dupContent');
      if (dupEmpty) dupEmpty.style.display = 'none';
      if (dupContent) {
        dupContent.style.display = 'block';
        fillDupData(isFG, /*append=*/true);
      }
      /* Auto-advance to Duplicate Check panel after parsing */
      setTimeout(() => switchDvPanel(2), 500);
      M.toast({html: 'AI parsing complete — fields auto-filled'});
    }
    tick();
  };
  document.addEventListener('change', (e) => {
    if (e.target.classList && e.target.classList.contains('chk-confirm')) {
      const all = document.querySelectorAll('#dupConfirm .chk-confirm');
      const allChecked = Array.from(all).every(c => c.checked);
      const btn = document.getElementById('btnConfirmDup');
      if (btn) {
        const wasDisabled = btn.disabled;
        btn.disabled = !allChecked;
        if (wasDisabled && allChecked) {
          btn.classList.add('btn-just-ready');
          setTimeout(() => btn.classList.remove('btn-just-ready'), 600);
        }
      }
      const wrap = document.getElementById('dupConfirm');
      if (wrap) wrap.classList.toggle('is-confirmed', allChecked);
    }
  });
  document.addEventListener('click', (e) => {
    if ((e.target.id === 'parseBtn' || e.target.closest('#parseBtn')) && !document.getElementById('parseBtn').disabled) runAutofill();
    if ((e.target.id === 'btnConfirmDup' || e.target.closest('#btnConfirmDup')) && !document.getElementById('btnConfirmDup').disabled) {
      setDvStep(null, [1, 2]);
      M.toast({html: 'No duplicate confirmed — proceeding with new material creation'});
      const inline = document.getElementById('docVerifyInline');
      if (inline) inline.classList.add('is-verified');
      const biPanel = document.getElementById('basicInfoPanel');
      if (biPanel && !biPanel.classList.contains('bi-reveal')) biPanel.classList.add('bi-reveal');
      fillBasicInfo();
      if (typeof revealStagesAfterVerify === 'function') revealStagesAfterVerify();
    }
  });
  /* ===== Compare (Duplicate) Modal — dup-row 의 "Compare" 버튼에서 열림 ===== */
  const REQUEST_MATERIAL = {
    code: '— (new)',
    name: 'Tetramethyl orthosilicate CFS-845',
    vendor: 'Hubei Co-Formula Material Tech Co., Ltd.',
    plant: '—',
    composition: [
      { cas: '541-05-9', name: 'Hexamethylcyclotrisiloxane (D3)', pct: 98 },
      { cas: '556-67-2', name: 'Octamethylcyclotetrasiloxane (D4)', pct: 2 },
    ],
  };
  const COMPARE_DATA = {
    '182441': {
      code: '182441',
      name: 'Tetramethyl orthosilicate CFS-820',
      vendor: 'CFS Korea',
      plant: 'WTFD',
      similarity: 65,
      composition: [
        { cas: '541-05-9', name: 'Hexamethylcyclotrisiloxane (D3)', pct: 82 },
        { cas: '556-67-2', name: 'Octamethylcyclotetrasiloxane (D4)', pct: 15 },
        { cas: '107-46-0', name: 'Hexamethyldisiloxane',            pct: 3  },
      ],
    },
    '183207': {
      code: '183207',
      name: 'Tetramethyl orthosilicate CFS-1200',
      vendor: 'CFS Korea',
      plant: 'SVLL',
      similarity: 58,
      composition: [
        { cas: '541-05-9', name: 'Hexamethylcyclotrisiloxane (D3)', pct: 70 },
        { cas: '556-67-2', name: 'Octamethylcyclotetrasiloxane (D4)', pct: 25 },
        { cas: '540-97-6', name: 'Dodecamethylcyclohexasiloxane (D6)', pct: 5 },
      ],
    },
  };
  /* FG 비교 데이터 — Parent FG Code 기준 (SKU 단위 Container/Spec 정보 제외).
     신규 등록 시나리오 (가장 가까운 후보도 60% 미만), 실리콘/실란 chemistry 기반 mock.
     NEW REQUEST = 3-MPTMS (mercapto) 계열, EXISTING 후보들은 다른 functional group 의
     실란 또는 PDMS pre-mix — composition 약 절반만 겹쳐 자연스럽게 50%대 유사도 */
  const REQUEST_FG = {
    code: '— (new)',
    description: 'SILQUEST GAMMA-MPS SILANE',
    brand: 'SILQUEST', product: 'GAMMA-MPS SILANE',
    functionalGroup: 'Mercapto Silane',
    mainComponent: '3-MPTMS · 75%',
    composition: [
      { cas:'4420-74-0',    name:'3-Mercaptopropyltrimethoxysilane (3-MPTMS)', pct:75 },
      { cas:'112945-52-5',  name:'Fumed silica',                                pct:8 },
      { cas:'67-56-1',      name:'Methanol',                                    pct:5 },
      { cas:'78-10-4',      name:'Tetraethyl orthosilicate (TEOS)',             pct:3 },
      { cas:'471-34-1',     name:'Calcium carbonate (CaCO3)',                   pct:2 },
      { cas:'556-67-2',     name:'Octamethylcyclotetrasiloxane (D4)',           pct:2 },
      { cas:'1185-55-3',    name:'Methyltrimethoxysilane (MTMS)',               pct:2 },
      { cas:'128-37-0',     name:'2,6-Di-tert-butyl-p-cresol (BHT)',            pct:1 },
      { cas:'77-58-7',      name:'Dibutyltin dilaurate (DBTDL)',                pct:1 },
      { cas:'63148-62-9',   name:'Polydimethylsiloxane (PDMS)',                 pct:1 },
    ],
  };
  /* SILQUEST A-1100 (3-APTES amino-functional silane) */
  const _A1100_COMP = [
    { cas:'919-30-2',     name:'3-Aminopropyltriethoxysilane (3-APTES)',      pct:80 },
    { cas:'112945-52-5',  name:'Fumed silica',                                pct:6 },
    { cas:'64-17-5',      name:'Ethanol',                                     pct:4 },
    { cas:'78-10-4',      name:'Tetraethyl orthosilicate (TEOS)',             pct:3 },
    { cas:'471-34-1',     name:'Calcium carbonate (CaCO3)',                   pct:2 },
    { cas:'107-46-0',     name:'Hexamethyldisiloxane',                        pct:2 },
    { cas:'556-67-2',     name:'Octamethylcyclotetrasiloxane (D4)',           pct:1.5 },
    { cas:'78-08-0',      name:'Vinyltriethoxysilane',                        pct:1 },
    { cas:'128-37-0',     name:'2,6-Di-tert-butyl-p-cresol (BHT)',            pct:0.5 },
  ];
  /* SILQUEST A-1110 (Phenyl-amino silane variant) */
  const _A1110_COMP = [
    { cas:'3068-76-6',    name:'N-Phenyl-3-aminopropyltrimethoxysilane',      pct:78 },
    { cas:'112945-52-5',  name:'Fumed silica',                                pct:7 },
    { cas:'67-56-1',      name:'Methanol',                                    pct:4 },
    { cas:'78-10-4',      name:'Tetraethyl orthosilicate (TEOS)',             pct:3 },
    { cas:'471-34-1',     name:'Calcium carbonate (CaCO3)',                   pct:2 },
    { cas:'107-46-0',     name:'Hexamethyldisiloxane',                        pct:2 },
    { cas:'556-67-2',     name:'Octamethylcyclotetrasiloxane (D4)',           pct:2 },
    { cas:'1185-55-3',    name:'Methyltrimethoxysilane (MTMS)',               pct:1.5 },
    { cas:'128-37-0',     name:'2,6-Di-tert-butyl-p-cresol (BHT)',            pct:0.5 },
  ];
  /* DOWSIL Z-6020 (diamine-functional silane) */
  const _DOWSIL_COMP = [
    { cas:'1760-24-3',    name:'N-(2-Aminoethyl)-3-aminopropyltrimethoxysilane', pct:78 },
    { cas:'112945-52-5',  name:'Fumed silica',                                pct:7 },
    { cas:'67-56-1',      name:'Methanol',                                    pct:5 },
    { cas:'78-10-4',      name:'Tetraethyl orthosilicate (TEOS)',             pct:3 },
    { cas:'1185-55-3',    name:'Methyltrimethoxysilane (MTMS)',               pct:2 },
    { cas:'556-67-2',     name:'Octamethylcyclotetrasiloxane (D4)',           pct:2 },
    { cas:'471-34-1',     name:'Calcium carbonate (CaCO3)',                   pct:1.5 },
    { cas:'77-58-7',      name:'Dibutyltin dilaurate (DBTDL)',                pct:1 },
    { cas:'128-37-0',     name:'2,6-Di-tert-butyl-p-cresol (BHT)',            pct:0.5 },
  ];
  /* KCC SILANE Pre-mix (PDMS-based pre-mix, 다른 카테고리 — RTV silicone 베이스) */
  const _PREMIX_COMP = [
    { cas:'63148-62-9',   name:'Polydimethylsiloxane (PDMS)',                 pct:60 },
    { cas:'112945-52-5',  name:'Fumed silica',                                pct:15 },
    { cas:'471-34-1',     name:'Calcium carbonate (CaCO3)',                   pct:10 },
    { cas:'556-67-2',     name:'Octamethylcyclotetrasiloxane (D4)',           pct:5 },
    { cas:'78-10-4',      name:'Tetraethyl orthosilicate (TEOS)',             pct:3 },
    { cas:'1185-55-3',    name:'Methyltrimethoxysilane (MTMS)',               pct:2 },
    { cas:'77-58-7',      name:'Dibutyltin dilaurate (DBTDL)',                pct:2 },
    { cas:'67-56-1',      name:'Methanol',                                    pct:1 },
    { cas:'128-37-0',     name:'2,6-Di-tert-butyl-p-cresol (BHT)',            pct:1 },
    { cas:'56-81-5',      name:'Glycerol',                                    pct:1 },
  ];
  const COMPARE_DATA_FG = {
    '182501': { code:'182501', description:'SILQUEST A-1100 SILANE',  brand:'SILQUEST', product:'A-1100 SILANE',  functionalGroup:'Amino Silane',         mainComponent:'3-APTES · 80%', similarity:58, composition:_A1100_COMP },
    '182610': { code:'182610', description:'DOWSIL Z-6020 SILANE',    brand:'DOWSIL',   product:'Z-6020 SILANE',  functionalGroup:'Diamine Silane',       mainComponent:'AEAPTMS · 78%', similarity:54, composition:_DOWSIL_COMP },
    '182700': { code:'182700', description:'SILQUEST A-1110 SILANE',  brand:'SILQUEST', product:'A-1110 SILANE',  functionalGroup:'Phenyl-Amino Silane',  mainComponent:'PAPTMS · 78%',  similarity:48, composition:_A1110_COMP },
    '182611': { code:'182611', description:'KCC SILANE Pre-mix',      brand:'KCC',      product:'SILANE Pre-mix', functionalGroup:'PDMS-based',           mainComponent:'PDMS · 60%',    similarity:42, composition:_PREMIX_COMP },
  };
  function openCompareModalFG(code) {
    const target = COMPARE_DATA_FG[code];
    if (!target) return;
    const body = document.getElementById('cmpBody');

    /* Composition 비교 (Material 패턴 그대로 — CAS 기준 합집합) */
    const reqMap = new Map(REQUEST_FG.composition.map(c => [c.cas, c]));
    const tgtMap = new Map(target.composition.map(c => [c.cas, c]));
    const allCas = [...new Set([...reqMap.keys(), ...tgtMap.keys()])];
    const stats = { eq: 0, mn: 0, df: 0, missing: 0 };
    const compRows = allCas.map(cas => {
      const a = reqMap.get(cas);
      const b = tgtMap.get(cas);
      const aPct = a?.pct ?? 0;
      const bPct = b?.pct ?? 0;
      const name = a?.name || b?.name || '';
      const diff = Math.abs(aPct - bPct);
      let diffCls = 'eq';
      if (!a || !b) diffCls = 'missing';
      else if (diff > 5) diffCls = 'df';
      else if (diff > 0) diffCls = 'mn';
      stats[diffCls]++;
      const diffIcon = !a || !b ? 'remove_circle_outline'
                     : diff === 0 ? 'check_circle'
                     : diff > 5 ? 'priority_high'
                     : 'info';
      const diffLabel = !a ? 'only existing'
                       : !b ? 'only request'
                       : diff === 0 ? 'match'
                       : `Δ ${diff.toFixed(1)}%`;
      return `
        <div class="cmp2-row ${diffCls}">
          <div class="cmp2-cas">
            <span class="cmp2-cas-num">${cas}</span>
            <span class="cmp2-cas-name">${name}</span>
          </div>
          <div class="cmp2-side cmp2-left">
            <span class="cmp2-bar"><span class="cmp2-fill" style="width:${aPct}%"></span></span>
            <b class="cmp2-pct">${a ? aPct + '%' : '—'}</b>
          </div>
          <div class="cmp2-delta"><span><i class="material-icons">${diffIcon}</i>${diffLabel}</span></div>
          <div class="cmp2-side cmp2-right">
            <b class="cmp2-pct">${b ? bPct + '%' : '—'}</b>
            <span class="cmp2-bar"><span class="cmp2-fill" style="width:${bPct}%"></span></span>
          </div>
        </div>`;
    }).join('');

    const sim = target.similarity;
    const verdictTone = sim >= 80 ? 'high' : sim >= 50 ? 'mid' : 'low';
    const verdictIcon = sim >= 80 ? 'warning_amber' : sim >= 50 ? 'info' : 'check_circle';
    const verdictMsg = sim >= 80 ? 'Highly similar — review carefully before creating new'
                     : sim >= 50 ? 'Partial overlap — composition shares some components'
                     : 'Distinct product — composition differs significantly';
    const r = 38, c = 2 * Math.PI * r;
    const dash = (sim / 100) * c;

    /* 헤드 카드 안 토큰 strip — Parent FG Code 기준 (Container/Spec 같은 SKU-level 정보 제외).
       NEW 는 회색(기준), EXISTING 만 비교 컬러 */
    const newTokens = `
      <div class="cmp2-head-tokens">
        <span class="cmp2-tok-chip">${REQUEST_FG.brand}</span>
        <span class="cmp2-tok-chip">${REQUEST_FG.product}</span>
        <span class="cmp2-tok-chip">${REQUEST_FG.functionalGroup}</span>
        <span class="cmp2-tok-chip">${REQUEST_FG.mainComponent}</span>
      </div>`;
    const tcls = (a, b) => a === b ? 'eq' : 'df';
    const ticon = (a, b) => a === b ? 'check' : 'close';
    const existTokens = `
      <div class="cmp2-head-tokens">
        <span class="cmp2-tok-chip ${tcls(REQUEST_FG.brand, target.brand)}"><i class="material-icons">${ticon(REQUEST_FG.brand, target.brand)}</i>${target.brand}</span>
        <span class="cmp2-tok-chip ${tcls(REQUEST_FG.product, target.product)}"><i class="material-icons">${ticon(REQUEST_FG.product, target.product)}</i>${target.product}</span>
        <span class="cmp2-tok-chip ${tcls(REQUEST_FG.functionalGroup, target.functionalGroup)}"><i class="material-icons">${ticon(REQUEST_FG.functionalGroup, target.functionalGroup)}</i>${target.functionalGroup}</span>
        <span class="cmp2-tok-chip ${tcls(REQUEST_FG.mainComponent, target.mainComponent)}"><i class="material-icons">${ticon(REQUEST_FG.mainComponent, target.mainComponent)}</i>${target.mainComponent}</span>
      </div>`;

    body.innerHTML = `
      <div class="cmp2-summary">
        <div class="cmp2-sum-donut" data-tone="${verdictTone}">
          <svg viewBox="0 0 100 100">
            <circle class="cmp2-donut-track" cx="50" cy="50" r="${r}"></circle>
            <circle class="cmp2-donut-fill" cx="50" cy="50" r="${r}" stroke-dasharray="${dash} ${c}" transform="rotate(-90 50 50)"></circle>
          </svg>
          <div class="cmp2-donut-label">
            <span class="cmp2-sum-pct">${sim}<small>%</small></span>
            <span class="cmp2-sum-cap">similarity</span>
          </div>
        </div>
        <div class="cmp2-sum-detail">
          <div class="cmp2-sum-verdict ${verdictTone}">
            <i class="material-icons">${verdictIcon}</i>
            <span>${verdictMsg}</span>
          </div>
          <div class="cmp2-sum-stats">
            <span class="cs-stat eq"><b>${stats.eq}</b><small>match</small></span>
            <span class="cs-stat mn"><b>${stats.mn}</b><small>minor</small></span>
            <span class="cs-stat df"><b>${stats.df}</b><small>different</small></span>
            <span class="cs-stat missing"><b>${stats.missing}</b><small>only one side</small></span>
          </div>
        </div>
      </div>
      <div class="cmp2-headrow">
        <div class="cmp2-head-cas">CAS / Component</div>
        <div class="cmp2-head-side">
          <div class="cmp2-head-card req">
            <span class="cmp2-head-tag req"><i class="material-icons">fiber_new</i>NEW REQUEST</span>
            <span class="cmp2-head-name">${REQUEST_FG.description}</span>
            ${newTokens}
          </div>
        </div>
        <div class="cmp2-head-delta">vs</div>
        <div class="cmp2-head-side">
          <div class="cmp2-head-card exist">
            <span class="cmp2-head-tag exist"><i class="material-icons">inventory_2</i>EXISTING #${target.code}</span>
            <span class="cmp2-head-name">${target.description}</span>
            ${existTokens}
          </div>
        </div>
      </div>
      <div class="cmp2-body">${compRows}</div>
      <div class="cmp2-foot">
        <button class="hBtn hGrey waves-effect modal-close"><i class="material-icons">close</i><span class="label">Close</span></button>
      </div>`;
    M.Modal.getInstance(document.getElementById('cmpModal')).open();
  }
  function openCompareModal(code, isFGCmp) {
    if (isFGCmp) return openCompareModalFG(code);
    const target = COMPARE_DATA[code];
    if (!target) return;
    const body = document.getElementById('cmpBody');
    /* 두 후보의 성분 합집합 (CAS 기준) */
    const reqMap = new Map(REQUEST_MATERIAL.composition.map(c => [c.cas, c]));
    const tgtMap = new Map(target.composition.map(c => [c.cas, c]));
    const allCas = [...new Set([...reqMap.keys(), ...tgtMap.keys()])];
    const stats = { eq: 0, mn: 0, df: 0, missing: 0 };
    const compRows = allCas.map(cas => {
      const a = reqMap.get(cas);
      const b = tgtMap.get(cas);
      const aPct = a?.pct ?? 0;
      const bPct = b?.pct ?? 0;
      const name = a?.name || b?.name || '';
      const diff = Math.abs(aPct - bPct);
      let diffCls = 'eq';
      if (!a || !b) diffCls = 'missing';
      else if (diff > 5) diffCls = 'df';
      else if (diff > 0) diffCls = 'mn';
      stats[diffCls]++;
      const diffIcon = !a || !b ? 'remove_circle_outline'
                     : diff === 0 ? 'check_circle'
                     : diff > 5 ? 'priority_high'
                     : 'info';
      const diffLabel = !a ? 'only existing'
                       : !b ? 'only request'
                       : diff === 0 ? 'match'
                       : `Δ ${diff.toFixed(0)}%`;
      return `
        <div class="cmp2-row ${diffCls}">
          <div class="cmp2-cas">
            <span class="cmp2-cas-num">${cas}</span>
            <span class="cmp2-cas-name">${name}</span>
          </div>
          <div class="cmp2-side cmp2-left">
            <span class="cmp2-bar"><span class="cmp2-fill" style="width:${aPct}%"></span></span>
            <b class="cmp2-pct">${a ? aPct + '%' : '—'}</b>
          </div>
          <div class="cmp2-delta"><span><i class="material-icons">${diffIcon}</i>${diffLabel}</span></div>
          <div class="cmp2-side cmp2-right">
            <b class="cmp2-pct">${b ? bPct + '%' : '—'}</b>
            <span class="cmp2-bar"><span class="cmp2-fill" style="width:${bPct}%"></span></span>
          </div>
        </div>`;
    }).join('');
    const sim = target.similarity;
    const verdictTone = sim >= 80 ? 'high' : sim >= 50 ? 'mid' : 'low';
    const verdictIcon = sim >= 80 ? 'warning_amber' : sim >= 50 ? 'info' : 'check_circle';
    const verdictMsg = sim >= 80 ? 'Highly similar — review carefully before creating new'
                     : sim >= 50 ? 'Partial match — composition differs but ingredients overlap'
                     : 'Different material — composition does not match';
    /* 도넛 차트 — SVG circle stroke-dasharray */
    const r = 38, c = 2 * Math.PI * r;
    const dash = (sim / 100) * c;
    body.innerHTML = `
      <div class="cmp2-summary">
        <div class="cmp2-sum-donut" data-tone="${verdictTone}">
          <svg viewBox="0 0 100 100">
            <circle class="cmp2-donut-track" cx="50" cy="50" r="${r}"></circle>
            <circle class="cmp2-donut-fill" cx="50" cy="50" r="${r}" stroke-dasharray="${dash} ${c}" transform="rotate(-90 50 50)"></circle>
          </svg>
          <div class="cmp2-donut-label">
            <span class="cmp2-sum-pct">${sim}<small>%</small></span>
            <span class="cmp2-sum-cap">similarity</span>
          </div>
        </div>
        <div class="cmp2-sum-detail">
          <div class="cmp2-sum-verdict ${verdictTone}">
            <i class="material-icons">${verdictIcon}</i>
            <span>${verdictMsg}</span>
          </div>
          <div class="cmp2-sum-stats">
            <span class="cs-stat eq"><b>${stats.eq}</b><small>match</small></span>
            <span class="cs-stat mn"><b>${stats.mn}</b><small>minor</small></span>
            <span class="cs-stat df"><b>${stats.df}</b><small>different</small></span>
            <span class="cs-stat missing"><b>${stats.missing}</b><small>only one side</small></span>
          </div>
        </div>
      </div>
      <div class="cmp2-headrow">
        <div class="cmp2-head-cas">CAS / Component</div>
        <div class="cmp2-head-side">
          <div class="cmp2-head-card req">
            <span class="cmp2-head-tag req"><i class="material-icons">fiber_new</i>NEW REQUEST</span>
            <span class="cmp2-head-name">${REQUEST_MATERIAL.name}</span>
          </div>
        </div>
        <div class="cmp2-head-delta">vs</div>
        <div class="cmp2-head-side">
          <div class="cmp2-head-card exist">
            <span class="cmp2-head-tag exist"><i class="material-icons">inventory_2</i>EXISTING #${target.code}</span>
            <span class="cmp2-head-name">${target.name}</span>
          </div>
        </div>
      </div>
      <div class="cmp2-body">${compRows}</div>
      <div class="cmp2-foot">
        <button class="hBtn hGrey waves-effect modal-close"><i class="material-icons">close</i><span class="label">Close</span></button>
      </div>`;
    M.Modal.getInstance(document.getElementById('cmpModal')).open();
  }
  /* dup 테이블 행의 Compare 버튼 클릭 위임 — Material(#dupList), FG(#dupListFG) 둘 다 처리 */
  document.addEventListener('click', (e) => {
    const cmpBtn = e.target.closest('#dupList .hBtn, #dupListFG .hBtn');
    if (cmpBtn) {
      const row = cmpBtn.closest('tr');
      const code = row?.querySelector('.d-code')?.textContent.trim();
      const tableId = cmpBtn.closest('tbody')?.id;
      if (code) openCompareModal(code, tableId === 'dupListFG');
    }
  });

  /* EHS pictogram / PPE 토글 — 클릭 시 활성/비활성 토글 (그레이 ↔ 레드) */
  document.addEventListener('click', (e) => {
    const picto = e.target.closest('.ehs-pictos .ehs-picto');
    if (picto) picto.classList.toggle('ehs-picto-on');
    const ppe = e.target.closest('.ehs-ppe-row .ehs-ppe');
    if (ppe) ppe.classList.toggle('ehs-ppe-on');
  });

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initDropzones, 100);
    /* Back button inside the verification inline wizard — duplicate check → upload */
    const back1 = document.getElementById('dvBackTo1'); if (back1) back1.addEventListener('click', () => switchDvPanel(1));
    /* Compare modal init — startingTop/endingTop 옵션으로 위로 올림.
       composition 12+ 행이 들어가는 큰 모달이라 top 4% 로 내려서 height 확보 */
    const cmpModalEl = document.getElementById('cmpModal');
    if (cmpModalEl) M.Modal.init(cmpModalEl, {
      startingTop: '4%',
      endingTop: '4%',
      onOpenStart() { document.querySelector('.app-header')?.classList.add('content-blur'); document.querySelector('.detail-layout')?.classList.add('content-blur'); },
      onCloseStart() { document.querySelector('.app-header')?.classList.remove('content-blur'); document.querySelector('.detail-layout')?.classList.remove('content-blur'); },
    });
    /* hBtn glass + tilt + waves — common.js handles all .hBtn (covers
       dynamically rendered ones inside stageContent / cust-section as well). */
    if (window.initHBtnGlass) window.initHBtnGlass();
    /* hoo-table 행 호버 글래스 오버레이 일괄 적용 */
    if (window.initAllHooTableOverlays) window.initAllHooTableOverlays();
    autoAlignNumericColumns();
    initStageCardGlow();
  });
}

/* =================================================================
 * ██  CUSTOMER / VENDOR MODE
 * ================================================================= */
if (isCust) {
  const pType   = params.get('type') || 'Customer';
  const pSub    = params.get('sub')  || 'newCust';
  const pAreas  = params.get('areas') ? params.get('areas').split(',') : [];
  const pParty  = params.get('party') || '';
  const pCat    = params.get('cat') || '';
  const pId     = params.get('id') || 'CR-NEW';

  /* crList lookup — sync status / person / date / desc / currentNode */
  const crItem = (typeof crList !== 'undefined') ? crList.find(x => x.id === pId) : null;
  const pStatus      = params.get('status') || (crItem ? crItem.status : 'inprogress');
  const pCurrentNode = params.get('currentNode') || (crItem ? (crItem.currentNode || '') : '');
  const pPerson   = params.get('person') || (crItem ? crItem.person : '');
  const pDate     = params.get('date')   || (crItem ? crItem.date   : '');
  const pDesc     = params.get('desc')   || (crItem ? crItem.desc   : '');

  const cust = JSON.parse(JSON.stringify(customerMaster));
  /* Per-request General overrides — picks the company data tied to this request id */
  if (typeof customerOverrides !== 'undefined' && customerOverrides[pId]) {
    Object.assign(cust.general, customerOverrides[pId]);
  }
  /* Request author syncs from crList */
  if (pPerson) {
    customerPersonMap['Request'] = Object.assign({}, customerPersonMap['Request'], { name: pPerson, date: pDate || customerPersonMap['Request'].date });
  }
  const scopeIdx = {};

  /* Area-nav definition */
  const areaNavMap = [
    { key:'general', icon:'person',                  label:'General',          areaKey:'General' },
    { key:'sales',   icon:'handshake',               label:'Sales Area',       areaKey:'Sales Area',      countKey:'salesAreas' },
    { key:'company', icon:'account_balance',         label:'Company Code',     areaKey:'Company Code',    countKey:'companies' },
    { key:'partner', icon:'group',                   label:'Partner Func',     areaKey:'Partner Func',    countKey:'partners' },
    { key:'contact', icon:'contacts',                label:'Contact Persons',  areaKey:'Contact Persons', countKey:'contactPersons' },
    { key:'bank',    icon:'account_balance_wallet',   label:'Bank',            areaKey:'Bank',            countKey:'banks' },
    { key:'tax',     icon:'request_quote',           label:'Tax ID',           areaKey:'Tax ID',          countKey:'taxIds' },
    { key:'vat',     icon:'receipt',                 label:'VAT Reg',          areaKey:'VAT Reg',         countKey:'vatRegs' },
    { key:'legal',   icon:'gavel',                   label:'Legal Ctrl',       areaKey:'Legal Ctrl',      countKey:'legalCtrls' },
    { key:'unload',  icon:'warehouse',               label:'Unload',           areaKey:'Unload',          countKey:'unloadPoints' },
  ];

  function getVisibleItems() {
    if (pSub === 'newCust') return areaNavMap;
    if (pSub === 'tradingBlock') return [];
    return areaNavMap.filter(t => pAreas.includes(t.areaKey));
  }
  const visibleItems = getVisibleItems();
  let currentNav = visibleItems.length ? visibleItems[0].key : 'request';

  /* Title */
  const kindLabel = pKind === 'vendor' ? 'Vendor' : 'Customer';
  const subLabelsMap = { newCust:'New Registration', custChange:'Change', tradingBlock:'Trading Block' };

  function updateCustTitle() {
    const descText = (subLabelsMap[pSub] || pSub) + (pParty ? ' [' + pParty + ']' : '');
    applyTitleBar({
      badgeText: kindLabel,
      idText: pId !== 'CR-NEW' ? pId : '',
      descText: descText,
      status: pStatus,
      lastModText: pId === 'CR-NEW' ? 'New draft' : 'Last Mod. ' + (cust.general.changedOn || '—'),
    });
  }

  /* Workflow */
  const flowKey = pSub === 'tradingBlock' ? 'blockUnblock' : (pSub === 'custChange' ? 'newCust' : pSub);
  const currentFlow = customerFlows[flowKey] || customerFlows['newCust'];

  function buildCustStages(flow) {
    const stages = [];
    flow.nodes.forEach(node => {
      if (node.type === 'node') stages.push({ label:node.label, roles:[node.label] });
      else if (node.type === 'row') stages.push({ label:node.items.join(' / '), roles:node.items, parallel:true });
    });
    return stages;
  }

  function renderRouting() {
    const stages = buildCustStages(currentFlow);
    /* CR-NEW이거나 currentNode 미지정 → 첫 stage(Request) active */
    let activeStepIdx = stages.findIndex(s => s.roles.includes(pCurrentNode));
    if (activeStepIdx === -1) activeStepIdx = 0;
    const timelineEl = document.getElementById('routingTimeline');
    let html = '';

    stages.forEach((stage, si) => {
      let stageState;
      if (pStatus === 'approved') stageState = 'done';
      else if (si < activeStepIdx) stageState = 'done';
      else if (si === activeStepIdx) stageState = (pStatus === 'rejected') ? 'rejected' : 'active';
      else stageState = 'pending';
      const ico = stageState === 'done' ? 'check_circle' : stageState === 'rejected' ? 'cancel' : stageState === 'active' ? 'play_circle' : 'radio_button_unchecked';
      const cls = stageState === 'done' ? ' done' : stageState === 'rejected' ? ' rejected' : stageState === 'active' ? ' active' : '';

      const cards = stage.roles.map(role => {
        const p = customerPersonMap[role] || { name:'TBD', dept:'' };
        let st;
        if (pStatus === 'approved') st = 'done';
        else if (si < activeStepIdx) st = 'done';
        else if (si === activeStepIdx) {
          /* row 안에서 currentNode만 current/rejected, 나머지는 done. currentNode 없으면 active step 전체가 current */
          if (!pCurrentNode || role === pCurrentNode) st = (pStatus === 'rejected') ? 'rejected' : 'current';
          else st = 'done';
        }
        else st = 'pending';
        const subIco = st === 'done' ? 'check_circle' : st === 'rejected' ? 'cancel' : st === 'current' ? 'play_circle' : 'radio_button_unchecked';
        const subCls = st === 'done' ? ' rt-sub-done' : st === 'rejected' ? ' rt-sub-rejected' : st === 'current' ? ' rt-sub-current' : '';
        if (stage.parallel) {
          return `<div class="rt-card${subCls}" data-role="${role}"><i class="material-icons rt-sub-circle${subCls}">${subIco}</i>
            <div class="rt-card-info"><span class="rt-role">${role}</span><span class="rt-name">${p.name}</span></div></div>`;
        }
        return `<div class="rt-card${subCls}" data-role="${role}"><span class="rt-role">${role}</span><span class="rt-name">${p.name}</span></div>`;
      }).join('');

      const parallelBadge = stage.parallel ? '<span class="rt-parallel"><i class="material-icons">call_split</i>Parallel</span>' : '';
      const isRequest = (si === 0);
      const areaOnly = isRequest ? visibleItems : [];
      const hasAreas = areaOnly.length > 0;

      if (isRequest && hasAreas) {
        /* Sub area-nav icons/classes follow Request stage state (data-driven, not scroll-driven) */
        const areaIco = stageState === 'done' ? 'check_circle' : stageState === 'rejected' ? 'cancel' : stageState === 'active' ? 'play_circle' : 'radio_button_unchecked';
        const areaCls = stageState === 'done' ? ' rt-sub-done' : stageState === 'rejected' ? ' rt-sub-rejected' : stageState === 'active' ? ' rt-sub-current' : '';
        let areaCards = '';
        areaOnly.forEach((t, ti) => {
          areaCards += `<div class="rt-card area-nav${areaCls}" data-nav="${t.key}" data-section="${ti}">
            <i class="material-icons rt-sub-circle${areaCls}">${areaIco}</i>
            <div class="rt-card-info"><span class="rt-role">${t.label}</span></div></div>`;
        });
        const reqPerson = customerPersonMap['Request'] || {name:'TBD'};
        html += `<div class="rt-group">
          <div class="rt-stage"><div class="rt-circle${cls}"><i class="material-icons">${ico}</i></div>
            <div class="rt-stage-label">Request · ${reqPerson.name}</div></div>
          <div class="rt-cards">${areaCards}</div></div>`;
      } else {
        html += `<div class="rt-group${!stage.parallel ? ' rt-group-compact' : ''}">
          <div class="rt-stage"><div class="rt-circle${cls}"><i class="material-icons">${ico}</i></div>
            <div class="rt-stage-label">${stage.label}${parallelBadge}</div></div>
          <div class="rt-cards${stage.parallel ? ' parallel' : ''}">${cards}</div></div>`;
      }
    });
    timelineEl.innerHTML = html;
  }

  /* area-nav click → scroll to its section */
  function bindAreaNav() {
    document.querySelectorAll('.area-nav[data-nav]').forEach(item => {
      item.addEventListener('click', () => {
        smoothScrollTo(document.getElementById('cust-section-' + item.dataset.nav));
      });
    });
  }

  /* Stage card helpers (Raw Material singleApprovalContent pattern + original dept / status label) */
  const stageIconsCust = {
    'MDM Analyst':'admin_panel_settings',
    'Sales Ops':'handshake', 'Pricing':'paid',
    'Credit Analyst':'credit_score', 'Tax':'request_quote', 'Trade Compliance':'verified_user',
    'AR Accounting':'account_balance', 'Finance Controller':'analytics', 'MDM Release':'rocket_launch',
  };

  function roleSlug(role) { return role.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase(); }

  function sectionTitleHtmlCust(icon, titleText, role) {
    const p = customerPersonMap[role] || {};
    const st = getCustNodeState(role);
    return buildSectionTitleHtml(icon, titleText, st, p.date);
  }

  /* Area cards (General / Sales / Company / ...) all live under the Request stage,
     so they share the Request stage's state + author date. */
  function areaSectionTitle(icon, titleText) {
    const reqState = getCustNodeState('Request');
    const reqDate = (customerPersonMap['Request'] || {}).date;
    return buildSectionTitleHtml(icon, titleText, reqState, reqDate);
  }

  function singleApprovalContentCust(role) {
    const p = customerPersonMap[role] || { name:'TBD', dept:'' };
    const st = getCustNodeState(role);
    const dateLine = (st === 'done' && p.date) ? `<span class="rt-date">${p.date}</span>` : '';
    return `<div class="approval-row">
        <div class="approval-person"><i class="material-icons">person</i><span>${role}</span><span class="approval-name">${p.name}</span><span class="approval-dept">${p.dept || 'Dept. TBD'}</span>${dateLine}</div>
        <div class="approval-actions"><select><option ${st === 'pending' ? 'selected' : ''}>Pending</option><option ${st === 'done' ? 'selected' : ''}>Approved</option><option ${st === 'rejected' ? 'selected' : ''}>Rejected</option><option>On Hold</option><option>Delegate</option></select></div>
      </div>
      <div class="form-group form-group--gap"><label>Comments</label><textarea class="detail-textarea" rows="2" placeholder="Add comments..."></textarea></div>`;
  }

  /* 우측 전체 섹션 카드 렌더 (visibleItems → stage 본문 순서대로 stack) */
  function renderAllCustSections() {
    const container = document.getElementById('contentBody');
    container.innerHTML = '';
    visibleItems.forEach(item => {
      const wrap = document.createElement('div');
      wrap.id = 'cust-section-' + item.key;
      wrap.className = 'cust-section-block';
      container.appendChild(wrap);
      const renderer = tabRenderers[item.key];
      if (renderer) renderer(wrap);
      else wrap.innerHTML = '<div class="glass-panel placeholder">Content: <b>' + item.key + '</b></div>';
    });

    /* Request 외 stage 본문 (MDM Analyst부터) */
    const stages = buildCustStages(currentFlow);
    const renderRoleCard = (role, label) => {
      const wrap = document.createElement('div');
      wrap.id = 'cust-stage-' + roleSlug(role);
      wrap.className = 'cust-section-block detail-section glass-panel';
      wrap.dataset.role = role;
      const icon = stageIconsCust[role] || stageIconsCust[label] || 'task';
      wrap.innerHTML = sectionTitleHtmlCust(icon, label, role) + singleApprovalContentCust(role);
      container.appendChild(wrap);
    };
    stages.forEach((stage, si) => {
      if (si === 0) return;
      if (stage.parallel && stage.roles.length > 1) stage.roles.forEach(role => renderRoleCard(role, role));
      else renderRoleCard(stage.roles[0], stage.label);
    });

    M.FormSelect.init(container.querySelectorAll('select'));
    if (window.initAllHooTableOverlays) window.initAllHooTableOverlays();
    autoAlignNumericColumns();
    initStageCardGlow();
  }

  /* Customer/Vendor stage 모드 적용 — Material 분기와 동일 룰
     · area 카드 (#cust-section-...) → Request stage 상태 따라 처리
     · stage 카드 (#cust-stage-..., [data-role]) → 각자 상태 따라 처리 */
  function applyStageModesCust() {
    const reqState = getCustNodeState('Request');
    /* area 카드 — Request 종속. 진짜 콘텐츠는 cust-section-block 안 자식 .detail-section */
    document.querySelectorAll('#contentBody > .cust-section-block:not([data-role])').forEach(wrap => {
      const target = wrap.querySelector('.detail-section') || wrap;
      if (reqState === 'done') {
        autofillEmpty(target);
        convertSectionToView(target, { empty:false });
      } else if (reqState === 'rejected') {
        autofillEmpty(target);
        convertSectionToView(target, { empty:false });
        target.classList.add('stage-rejected');
      } else if (reqState === 'current') {
        target.classList.add('stage-current');
      } else {
        clearSectionInputs(target);
        target.classList.add('stage-pending');
      }
    });
    /* stage 카드 — 각자 상태 (cust-section-block 자체가 .detail-section 클래스 가짐) */
    document.querySelectorAll('#contentBody > .cust-section-block[data-role]').forEach(sec => {
      const role = sec.dataset.role;
      const st = getCustNodeState(role);
      if (st === 'done') {
        autofillEmpty(sec);
        sec.querySelectorAll('.approval-actions select').forEach(s => {
          for (let i = 0; i < s.options.length; i++) {
            if (/approved/i.test(s.options[i].textContent)) { s.selectedIndex = i; break; }
          }
          s.disabled = true;
        });
        convertSectionToView(sec, { empty:false });
      } else if (st === 'rejected') {
        autofillEmpty(sec);
        sec.querySelectorAll('.approval-actions select').forEach(s => {
          for (let i = 0; i < s.options.length; i++) {
            if (/rejected/i.test(s.options[i].textContent)) { s.selectedIndex = i; break; }
          }
          s.disabled = true;
        });
        convertSectionToView(sec, { empty:false });
        sec.classList.add('stage-rejected');
      } else if (st === 'current') {
        sec.classList.add('stage-current');
      } else {
        clearSectionInputs(sec);
        sec.classList.add('stage-pending');
      }
    });
    if (window.initAllHooTableOverlays) window.initAllHooTableOverlays();
    autoAlignNumericColumns();
    initStageCardGlow();
  }

  /* 좌측 워크플로우 stage rt-card 클릭 → 해당 우측 본문으로 스크롤 */
  function bindStageRoleClick() {
    document.querySelectorAll('.rt-card[data-role]').forEach(card => {
      card.addEventListener('click', () => {
        smoothScrollTo(document.getElementById('cust-stage-' + roleSlug(card.dataset.role)));
      });
    });
  }

  /* 단일 섹션 in-place 재렌더 (scope-tab / add·remove 액션에서 호출) */
  function switchContent(key) {
    const wrap = document.getElementById('cust-section-' + key);
    if (!wrap) { renderAllCustSections(); applyStageModesCust(); return; }
    wrap.innerHTML = '';
    const renderer = tabRenderers[key];
    if (renderer) renderer(wrap);
    M.FormSelect.init(wrap.querySelectorAll('select'));
    /* 재렌더 후에도 stage 상태 유지 (done이면 view 모드, pending이면 빈 양식) */
    applyStageModesCust();
    if (window.initAllHooTableOverlays) window.initAllHooTableOverlays(wrap);
    autoAlignNumericColumns(wrap);
    initStageCardGlow(wrap);
  }

  /* 스크롤 스파이 — Raw Material과 동일 패턴 (spy-active만 토글, 상태 아이콘은 건드리지 않음) */
  function initCustScrollSpy() {
    const sections = visibleItems.map(it => document.getElementById('cust-section-' + it.key)).filter(Boolean);
    const allCards = document.querySelectorAll('.rt-card[data-section]');
    function updateSpy() {
      let activeIdx = 0;
      const offset = 150;
      sections.forEach((sec, i) => { if (sec.getBoundingClientRect().top <= offset) activeIdx = i; });
      allCards.forEach(card => { card.classList.toggle('spy-active', parseInt(card.dataset.section) === activeIdx); });
      const activeKey = visibleItems[activeIdx] ? visibleItems[activeIdx].key : null;
      if (activeKey) currentNav = activeKey;
    }
    window.addEventListener('scroll', updateSpy, { passive: true });
    updateSpy();
  }

  /* area-nav 클릭 인터랙션 (rt-card 글래스 색수차 효과) */
  function initCustRtCardGlass() {
    document.querySelectorAll('.rt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--rt-gx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
        card.style.setProperty('--rt-gy', ((e.clientY - rect.top) / rect.height) * 100 + '%');
      });
    });
  }

  /* Field helpers */
  function esc(s) { return (s == null ? '' : String(s)).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function fldText(label, value, opts) {
    opts = opts || {}; const ro = opts.readonly ? 'readonly' : ''; const span = opts.span ? ' span-' + opts.span : '';
    const req = opts.required ? ' <span class="req">*</span>' : ''; const ph = opts.placeholder ? ` placeholder="${esc(opts.placeholder)}"` : '';
    return `<div class="form-group${span}"><label>${label}${req}</label><div class="aniInput"><input type="text" class="browser-default" value="${esc(value)}"${ph} ${ro}><span class="focus-border"></span></div></div>`;
  }
  function fldReadonly(label, value) { return `<div class="form-group"><label>${label}</label><div class="readonly-val">${esc(value || '—')}</div></div>`; }
  function fldSelect(label, value, options, opts) {
    opts = opts || {}; const req = opts.required ? ' <span class="req">*</span>' : '';
    return `<div class="form-group"><label>${label}${req}</label><select>${options.map(o => `<option${o === value ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></div>`;
  }
  function fldCheckbox(label, checked, id) { return `<label><input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>${label}</label>`; }
  function fldTextarea(label, value, rows, opts) {
    opts = opts || {}; const req = opts.required ? ' <span class="req">*</span>' : '';
    return `<div class="form-group span-${opts.span || 2}"><label>${label}${req}</label><textarea class="detail-textarea" rows="${rows || 3}">${esc(value)}</textarea></div>`;
  }
  function scopeBarHtml(tabKey, items, labelFn, addLabel, activeIdx) {
    if (!items || !items.length) return `<div class="scope-bar"><span class="scope-label">Scope</span><span class="scope-empty">No data yet</span>${addLabel ? '<span class="scope-add" data-scope-add="'+tabKey+'"><i class="material-icons">add</i>'+addLabel+'</span>' : ''}</div>`;
    const tabs = items.map((it, i) => `<span class="scope-tab${i === activeIdx ? ' on' : ''}" data-scope-idx="${i}">${esc(labelFn(it))}</span>`).join('');
    return `<div class="scope-bar"><span class="scope-label">Scope</span>${tabs}${addLabel ? '<span class="scope-add" data-scope-add="'+tabKey+'"><i class="material-icons">add</i>'+addLabel+'</span>' : ''}</div>`;
  }

  /* ── Tab Renderers ── */
  const tabRenderers = {};

  /* Reason text generator — picks a sub-type-specific narrative when no explicit reason is provided */
  function defaultReasonForRequest() {
    const company = (cust.general && cust.general.name1) || 'this customer';
    const reasons = {
      newCust:      `New customer setup required for ${company}. Annual volume forecast and credit pre-screening completed; ready for downstream review.`,
      extendSales:  `Extend Sales Area for ${company} to support additional distribution channel / division coverage based on confirmed business growth.`,
      extendComp:   `Extend ${company} to an additional Company Code for cross-entity invoicing and AR account separation.`,
      creditChange: `Credit limit adjustment for ${company} based on annual review and updated risk grade.`,
      blockUnblock: `Block / Unblock action requested for ${company} due to compliance / credit-risk evaluation.`,
      reactivation: `Reactivate dormant account ${company} for renewed business; re-screening of compliance & credit required.`,
      tradingBlock: `Trading block requested for ${company} pending compliance investigation.`,
      custChange:   `Change request for selected master sections of ${company}; downstream owners to review only the impacted areas.`,
    };
    return reasons[pSub] || reasons.newCust;
  }
  function priorityFromContext() {
    if (pStatus === 'rejected') return 'High';
    if (pSub === 'creditChange' || pSub === 'blockUnblock') return 'High';
    if (pSub === 'reactivation') return 'Normal';
    return 'Normal';
  }
  function dueDateFromContext() {
    /* Mock: 14 days after request date */
    if (!pDate) return 'TBD';
    let d = new Date(pDate); /* parses 'Apr 18, 2026' natively */
    if (isNaN(d.getTime())) {
      const m = pDate.match(/^(\d{2})-(\d{2})-(\d{4})/); /* falls back to DD-MM-YYYY */
      if (m) d = new Date(`${m[3]}-${m[2]}-${m[1]}`);
    }
    if (isNaN(d.getTime())) return 'TBD';
    d.setDate(d.getDate() + 14);
    return d.toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' });
  }

  tabRenderers.request = function(body) {
    const accountGroupOpts = ['0001 - Sold-to (Domestic)','0001 - Sold-to (Overseas)','0002 - Ship-to','0003 - Bill-to','0004 - Payer','0006 - One-time','ZIC - Intercompany'];
    const requestType = subLabelsMap[pSub] || (typeof subLabels !== 'undefined' ? subLabels[pSub] : null) || pSub;
    const reqPerson = pPerson || (customerPersonMap['Request'] && customerPersonMap['Request'].name) || 'TBD';
    const reqDate = pDate || (customerPersonMap['Request'] && customerPersonMap['Request'].date) || 'TBD';
    const accountGroup = (cust.general && cust.general.accountGroup) || (pCat === 'Domestic' ? '0001 - Sold-to (Domestic)' : '0001 - Sold-to (Overseas)');
    body.innerHTML = `<div class="detail-section glass-panel">
      ${areaSectionTitle('edit_note', 'Request')}
      <h5 class="bi-block-title"><span class="bi-bar"></span>Request Meta</h5>
      <div class="form-grid col-3">
        ${fldSelect('Account Group', accountGroup, accountGroupOpts, { required:true })}
        ${fldText('Request Type', requestType, { readonly:true })}
        ${fldSelect('Priority', priorityFromContext(), ['Low','Normal','High','Urgent'])}
      </div>
      <h5 class="bi-block-title"><span class="bi-bar"></span>Submitter</h5>
      <div class="form-grid col-3">
        ${fldText('Requester', reqPerson, { required:true })}
        ${fldText('Request Date', reqDate, { readonly:true })}
        ${fldText('Target Activation', dueDateFromContext())}
      </div>
      <h5 class="bi-block-title"><span class="bi-bar"></span>Background</h5>
      ${fldTextarea('Reason for Request', defaultReasonForRequest(), 3, { required:true })}
      <h5 class="bi-block-title"><span class="bi-bar"></span>Attached Evidence</h5>
      <div class="form-grid col-3">
        ${fldText('Business Registration', 'biz_reg.pdf · 1.2 MB', { readonly:true })}
        ${fldText('Tax Certificate', 'vat_cert.pdf · 0.8 MB', { readonly:true })}
        ${fldText('Bank Account Proof', 'bank_proof.pdf · 0.6 MB', { readonly:true })}
      </div>
    </div>`;
  };

  tabRenderers.general = function(body) {
    const g = cust.general;
    body.innerHTML = `<div class="detail-section glass-panel">
      ${areaSectionTitle('person', 'General Data')}
      <h5 class="bi-block-title"><span class="bi-bar"></span>Identification</h5>
      <div class="form-grid col-3">${fldText('Customer #', g.cust, {readonly:true, placeholder:'Auto-assigned on save'})}${fldSelect('Account Group', g.accountGroup, ['0001 - Sold-to','0002 - Ship-to','0003 - Bill-to','0004 - Payer','0006 - One-time','ZIC - Intercompany'], {required:true})}${fldText('Vendor # (if same entity)', g.vendorNo, {placeholder:'Optional'})}</div>
      <h5 class="bi-block-title"><span class="bi-bar"></span>Name &amp; Search</h5>
      <div class="form-grid col-3">${fldText('Name 1 / Trade Name', g.name1, {required:true})}${fldText('Name 2 / English Name', g.name2)}${fldText('Title', g.title)}${fldText('Search Term 1', g.searchTerm1, {required:true})}${fldText('Search Term 2', g.searchTerm2)}${fldSelect('Language', g.language, ['KO - Korean','EN - English','JA - Japanese','ZH - Chinese','DE - German','TH - Thai'])}</div>
      <h5 class="bi-block-title"><span class="bi-bar"></span>Address &amp; Contact</h5>
      <div class="form-grid col-3">${fldText('Country', g.country, {required:true})}${fldText('Region', g.region)}${fldText('Address #', g.addrNo, {required:true})}</div>
      <div class="form-grid">${fldReadonly('Address Preview', g.addrPreview)}</div>
      <div class="form-grid col-3">${fldText('Phone', g.phone)}${fldText('Mobile', g.mobile)}${fldText('Email', g.email)}</div>
      <h5 class="bi-block-title"><span class="bi-bar"></span>Tax &amp; Regulatory</h5>
      <div class="form-grid col-3">${fldText('Business Reg #', g.bizRegNo, {required:true})}${fldText('Industry Code', g.industryCode)}${fldText('Transport Zone', g.transpZone)}</div>
      <h5 class="bi-block-title"><span class="bi-bar"></span>Classification</h5>
      <div class="form-grid col-3">${fldSelect('Customer Group', g.custGrp, ['Z001 - Domestic','Z002 - Overseas','Z003 - Partner','Z004 - Intercompany'])}${fldSelect('Customer Class', g.custClass, ['A - Key Account','B - Regular','C - Small'])}${fldText('Authorization Group', g.authGrp)}</div>
      <h5 class="bi-block-title"><span class="bi-bar"></span>Audit</h5>
      <div class="form-grid col-4">${fldReadonly('Created By', g.createdBy)}${fldReadonly('Created On', g.createdOn)}${fldReadonly('Changed By', g.changedBy)}${fldReadonly('Changed On', g.changedOn)}</div>
    </div>`;
  };

  tabRenderers.sales = function(body) {
    const items = cust.salesAreas || []; const i = scopeIdx['sales'] || 0; const s = items[i] || {};
    if (!items.length) { body.innerHTML = `<div class="detail-section glass-panel">${areaSectionTitle('handshake', 'Sales Area Data')}${scopeBarHtml('sales', items, it => it.scopeKey, 'Add Sales Area', i)}</div>`; return; }
    body.innerHTML = `<div class="detail-section glass-panel">
      ${areaSectionTitle('handshake', 'Sales Area — ' + esc(s.scopeKey))}
      ${scopeBarHtml('sales', items, it => it.scopeKey, 'Add Sales Area', i)}
      <h5 class="bi-block-title"><span class="bi-bar"></span>Sales Area</h5>
      <div class="form-grid col-3">${fldReadonly('Sales Org', s.salesOrg + ' — ' + s.salesOrgName)}${fldReadonly('Distribution Channel', s.distChannel + ' — ' + s.distChannelName)}${fldReadonly('Division', s.division + ' — ' + s.divisionName)}</div>
      <h5 class="bi-block-title"><span class="bi-bar"></span>Orders</h5>
      <div class="form-grid col-3">${fldText('Currency', s.currency)}${fldText('Sales District', s.salesDistrict)}${fldText('Sales Office', s.salesOffice)}${fldText('Sales Group', s.salesGroup)}${fldText('Order Probability (%)', s.orderProbability)}${fldSelect('Delivery Priority', s.deliveryPriority, ['01 - High','02 - Normal','03 - Low'])}</div>
      <h5 class="bi-block-title"><span class="bi-bar"></span>Shipping</h5>
      <div class="form-grid col-3">${fldSelect('Shipping Condition', s.shippingCondition, ['01 - Standard','02 - Distributor','03 - Express'])}${fldText('Delivery Plant', s.deliveryPlant)}${fldText('Max Partial Delivery', s.maxPartialDelivery)}</div>
      <div class="chk-row">${fldCheckbox('Order Combination Allowed', s.orderCombination, 'chkOrdComb_' + i)}</div>
      <h5 class="bi-block-title"><span class="bi-bar"></span>Billing / Pricing</h5>
      <div class="form-grid col-3">${fldText('Incoterms', s.incoterms)}${fldText('Incoterms Location', s.incotermsLoc)}${fldText('Payment Term', s.paymentTerm)}${fldText('Price Group', s.priceGrp)}${fldText('Price List', s.priceList)}${fldText('Pricing Procedure', s.pricingProc)}${fldSelect('Tax Classification', s.taxClassification, ['1 - Taxable','0 - Tax Exempt'])}${fldText('Account Assignment Group', s.accountAssGrp)}${fldText('Delivery Block', s.deliveryBlock || '')}${fldText('Billing Block', s.billingBlock || '')}</div>
      <h5 class="bi-block-title"><span class="bi-bar"></span>Customer Group 1-5</h5>
      <div class="form-grid col-5">${fldText('Group 1', s.customerGrp1)}${fldText('Group 2', s.customerGrp2)}${fldText('Group 3', s.customerGrp3)}${fldText('Group 4', s.customerGrp4)}${fldText('Group 5', s.customerGrp5)}</div>
    </div>`;
    body.querySelectorAll('[data-scope-idx]').forEach(el => { el.addEventListener('click', () => { scopeIdx['sales'] = Number(el.dataset.scopeIdx); switchContent('sales'); }); });
  };

  tabRenderers.company = function(body) {
    const items = cust.companies || []; const i = scopeIdx['company'] || 0; const c = items[i] || {};
    if (!items.length) { body.innerHTML = `<div class="detail-section glass-panel">${areaSectionTitle('account_balance', 'Company Code Data')}${scopeBarHtml('company', items, it => it.compCode, 'Add Company Code', i)}</div>`; return; }
    body.innerHTML = `<div class="detail-section glass-panel">
      ${areaSectionTitle('account_balance', 'Company Code — ' + esc(c.compCode) + ' (' + esc(c.compName) + ')')}
      ${scopeBarHtml('company', items, it => it.compCode + ' - ' + it.compName, 'Add Company Code', i)}
      <h5 class="bi-block-title"><span class="bi-bar"></span>Account Management</h5>
      <div class="form-grid col-3">${fldReadonly('Company Code', c.compCode + ' — ' + c.compName)}${fldText('Reconciliation Account', c.reconAccount, {required:true})}${fldText('Alternative Payer', c.alternPayer)}${fldText('Sort Key', c.sortKey)}${fldText('Cash Mgmt Group', c.cashMgmtGrp)}${fldText('Planning Group', c.planningGrp)}</div>
      <h5 class="bi-block-title"><span class="bi-bar"></span>Payment Transactions</h5>
      <div class="form-grid col-3">${fldText('Payment Term', c.paymentTerm)}${fldSelect('Payment Method', c.paymentMethod, ['B - Bank Transfer','W - Wire','C - Cheque','K - Credit Card'])}${fldText('Payment Block', c.paymentBlock || '')}${fldText('House Bank', c.houseBank)}${fldText('Account Clerk', c.accountClerk)}${fldText('Head Office', c.headOffice)}</div>
      <h5 class="bi-block-title"><span class="bi-bar"></span>Correspondence / Dunning</h5>
      <div class="form-grid col-3">${fldReadonly('Dunning Procedure', c.dunningProc)}${fldReadonly('Dunning Clerk', c.dunningClerk)}${fldReadonly('Dunning Block', c.dunningBlock || '-')}${fldReadonly('Interest Indicator', c.interestIndic)}</div>
      <h5 class="bi-block-title"><span class="bi-bar"></span>Tax</h5>
      <div class="form-grid col-3">${fldText('Tax Code', c.taxCode)}${fldText('Currency', c.currency)}</div>
      <div class="chk-row">${fldCheckbox('Withholding Tax', c.withholdingTax, 'chkWht_' + i)}</div>
    </div>`;
    body.querySelectorAll('[data-scope-idx]').forEach(el => { el.addEventListener('click', () => { scopeIdx['company'] = Number(el.dataset.scopeIdx); switchContent('company'); }); });
  };

  tabRenderers.partner = function(body) {
    const salesScopes = (cust.salesAreas || []).map(s => s.scopeKey); const sIdx = scopeIdx['partner_sales'] || 0;
    const salesScope = salesScopes[sIdx] || salesScopes[0]; const partners = (cust.partners || []).filter(p => p.salesArea === salesScope);
    const scopeTabs = salesScopes.map((k, i) => `<span class="scope-tab${i === sIdx ? ' on' : ''}" data-scope-idx="${i}">${esc(k)}</span>`).join('');
    body.innerHTML = `<div class="detail-section glass-panel">
      ${areaSectionTitle('group', 'Partner Functions — ' + esc(salesScope || '—'))}
      <div class="scope-bar"><span class="scope-label">Sales Area</span>${scopeTabs}</div>
      <div class="hoo-spec-table"><table class="hoo-table"><thead><tr><th style="width:60px;">Func</th><th style="width:120px;">Name</th><th style="width:50px;">Seq</th><th style="width:120px;">Partner #</th><th>Partner Name</th><th style="width:70px;">Default</th><th style="width:40px;"></th></tr></thead>
      <tbody>${partners.map((p, pi) => `<tr><td><b>${esc(p.partnerFunc)}</b></td><td>${esc(p.partnerFuncName)}</td><td>${esc(p.partnerSeq)}</td><td class="cell-partner-no">${esc(p.partnerNo)}</td><td>${esc(p.partnerName)}</td><td>${p.defaultFlag ? '<i class="material-icons icon-default-flag">check_circle</i>' : '—'}</td><td><button class="btn-sm-rm" data-rm-partner="${pi}"><i class="material-icons icon-sm-16">close</i></button></td></tr>`).join('')}
      ${!partners.length ? '<tr><td colspan="7" class="empty-cell">No partner functions</td></tr>' : ''}</tbody></table></div>
      <div class="sub-table-actions"><span class="scope-add" id="btnAddPartner"><i class="material-icons">add</i>Add Partner Function</span></div>
    </div>`;
    body.querySelectorAll('[data-scope-idx]').forEach(el => { el.addEventListener('click', () => { scopeIdx['partner_sales'] = Number(el.dataset.scopeIdx); switchContent('partner'); }); });
    body.querySelectorAll('[data-rm-partner]').forEach(btn => { btn.addEventListener('click', () => { const all = cust.partners.filter(p => p.salesArea === salesScope); const gi = cust.partners.indexOf(all[Number(btn.dataset.rmPartner)]); if (gi >= 0) { cust.partners.splice(gi, 1); switchContent('partner'); M.toast({html:'Partner removed'}); } }); });
    const addBtn = document.getElementById('btnAddPartner');
    if (addBtn) addBtn.addEventListener('click', () => { if (!salesScope) { M.toast({html:'Add a Sales Area first'}); return; } cust.partners.push({ scopeKey:salesScope, salesArea:salesScope, partnerFunc:'SH', partnerFuncName:'Ship-to', partnerSeq:'99', partnerNo:cust.general.cust||'0010000000', partnerName:cust.general.name1||'New Partner', defaultFlag:false }); switchContent('partner'); M.toast({html:'Partner added'}); });
  };

  tabRenderers.contact = function(body) {
    const items = cust.contactPersons || [];
    body.innerHTML = `<div class="detail-section glass-panel">
      ${areaSectionTitle('contacts', 'Contact Persons')}
      <div class="hoo-spec-table"><table class="hoo-table"><thead><tr><th style="width:50px;">Seq</th><th>Name</th><th>Dept</th><th>Title</th><th>Function</th><th>Phone</th><th>Email</th><th style="width:70px;">Default</th><th style="width:40px;"></th></tr></thead>
      <tbody>${items.map((p, i) => `<tr><td><b>${esc(p.seq)}</b></td><td>${esc(p.fullName)}<br><span class="contact-secondary">${esc(p.lastName)} ${esc(p.firstName)}</span></td><td>${esc(p.dept)}</td><td>${esc(p.title)}</td><td>${esc(p.function)}</td><td>${esc(p.phone)}<br><span class="contact-secondary">${esc(p.mobile)}</span></td><td>${esc(p.email)}</td><td>${p.defaultFlag ? '<i class="material-icons icon-default-flag">check_circle</i>' : '—'}</td><td><button class="btn-sm-rm" data-rm-contact="${i}"><i class="material-icons icon-sm-16">close</i></button></td></tr>`).join('')}
      ${!items.length ? '<tr><td colspan="9" class="empty-cell">No contact persons</td></tr>' : ''}</tbody></table></div>
      <div class="sub-table-actions"><span class="scope-add" id="btnAddContact"><i class="material-icons">person_add</i>Add Contact Person</span></div>
    </div>`;
    body.querySelectorAll('[data-rm-contact]').forEach(btn => { btn.addEventListener('click', () => { cust.contactPersons.splice(Number(btn.dataset.rmContact), 1); switchContent('contact'); M.toast({html:'Contact removed'}); }); });
    const addBtn = document.getElementById('btnAddContact');
    if (addBtn) addBtn.addEventListener('click', () => { const next = String((cust.contactPersons.length + 1)).padStart(2, '0'); cust.contactPersons.push({ seq:next, lastName:'', firstName:'', fullName:'New Contact', dept:'', title:'', function:'Buyer', language:'KO', phone:'', mobile:'', fax:'', email:'', addrNo:cust.general.addrNo, vendor:'', defaultFlag:false, status:'Active' }); switchContent('contact'); M.toast({html:'Contact added'}); });
  };

  tabRenderers.bank = function(body) {
    const items = cust.banks || [];
    body.innerHTML = `<div class="detail-section glass-panel">
      ${areaSectionTitle('account_balance_wallet', 'Bank Accounts')}
      <div class="hoo-spec-table"><table class="hoo-table"><thead><tr><th>Nation</th><th>Bank Key</th><th>Bank Name</th><th>Account #</th><th>Holder</th><th>SWIFT</th><th>Ref.</th><th></th></tr></thead>
      <tbody>${items.map((b, i) => `<tr><td>${esc(b.bankNation)}</td><td>${esc(b.bankKey)}</td><td>${esc(b.bankKeyName)}</td><td><b>${esc(b.bankAccount)}</b></td><td>${esc(b.accountHolder)}</td><td>${esc(b.swiftCode)}</td><td>${esc(b.reference)}</td><td><button class="btn-sm-rm" data-rm-bank="${i}"><i class="material-icons icon-sm-16">close</i></button></td></tr>`).join('')}
      ${!items.length ? '<tr><td colspan="8" class="empty-cell">No bank accounts</td></tr>' : ''}</tbody></table></div>
      <div class="sub-table-actions"><span class="scope-add" id="btnAddBank"><i class="material-icons">add</i>Add Bank Account</span></div>
    </div>`;
    body.querySelectorAll('[data-rm-bank]').forEach(btn => { btn.addEventListener('click', () => { cust.banks.splice(Number(btn.dataset.rmBank), 1); switchContent('bank'); M.toast({html:'Bank removed'}); }); });
    const addBtn = document.getElementById('btnAddBank');
    if (addBtn) addBtn.addEventListener('click', () => { cust.banks.push({ scopeKey:'KR/000/00000-00-000000', bankNation:'KR', bankKey:'000', bankKeyName:'New Bank', bankAccount:'00000-00-000000', accountHolder:cust.general.name1||'Holder', iban:'', swiftCode:'', reference:'New', controlKey:'' }); switchContent('bank'); M.toast({html:'Bank added'}); });
  };

  tabRenderers.tax = function(body) {
    const items = cust.taxIds || [];
    body.innerHTML = `<div class="detail-section glass-panel">
      ${areaSectionTitle('request_quote', 'Tax ID / License')}
      ${items.map((t, i) => `<div class="tax-card"><div class="tax-card-head"><h4 class="tax-card-title"><i class="material-icons">flag</i> ${esc(t.nation)} — ${esc(t.taxCategory)}</h4><button class="btn-sm-rm" data-rm-tax="${i}"><i class="material-icons icon-sm-18">delete_outline</i></button></div><div class="form-grid col-3">${fldReadonly('Nation', t.nation + ' — ' + t.nationName)}${fldReadonly('Tax Category', t.taxCategory)}${fldText('Tax Number', t.taxNumber)}</div><h5 class="tax-sub-title">Sub Licenses</h5><div class="hoo-spec-table"><table class="hoo-table"><thead><tr><th>License #</th><th>Valid From</th><th>Valid To</th><th>Exempt Reason</th><th></th></tr></thead><tbody>${(t.subs || []).map((s, si) => `<tr><td><b>${esc(s.license)}</b></td><td>${esc(s.validFrom)}</td><td>${esc(s.validTo)}</td><td>${esc(s.exemptReason || '—')}</td><td><button class="btn-sm-rm" data-rm-sub="${i}/${si}"><i class="material-icons icon-sm-16">close</i></button></td></tr>`).join('')}${!(t.subs && t.subs.length) ? '<tr><td colspan="5" class="empty-cell-sm">No sub-licenses</td></tr>' : ''}</tbody></table></div><div class="tax-sub-actions"><span class="scope-add" data-add-sub="${i}"><i class="material-icons">add</i>Add License</span></div></div>`).join('')}
      <div class="sub-table-actions"><span class="scope-add" id="btnAddTax"><i class="material-icons">add</i>Add Tax ID</span></div>
    </div>`;
    body.querySelectorAll('[data-rm-tax]').forEach(btn => { btn.addEventListener('click', () => { cust.taxIds.splice(Number(btn.dataset.rmTax), 1); switchContent('tax'); }); });
    body.querySelectorAll('[data-rm-sub]').forEach(btn => { btn.addEventListener('click', () => { const [ti, si] = btn.dataset.rmSub.split('/').map(Number); cust.taxIds[ti].subs.splice(si, 1); switchContent('tax'); }); });
    body.querySelectorAll('[data-add-sub]').forEach(btn => { btn.addEventListener('click', () => { const ti = Number(btn.dataset.addSub); if (!cust.taxIds[ti].subs) cust.taxIds[ti].subs = []; cust.taxIds[ti].subs.push({ license:'LIC-NEW', validFrom:'—', validTo:'—', exemptReason:'' }); switchContent('tax'); }); });
    const addBtn = document.getElementById('btnAddTax');
    if (addBtn) addBtn.addEventListener('click', () => { cust.taxIds.push({ scopeKey:'XX/XX1', nation:'XX', nationName:'New Country', taxCategory:'XX1 - New Category', taxNumber:'', subs:[] }); switchContent('tax'); });
  };

  tabRenderers.vat = function(body) {
    const items = cust.vatRegs || [];
    body.innerHTML = `<div class="detail-section glass-panel">
      ${areaSectionTitle('receipt', 'VAT Registration')}
      <div class="hoo-spec-table"><table class="hoo-table"><thead><tr><th>Nation</th><th>Nation Name</th><th>VAT Number</th><th>Valid From</th><th>Status</th><th></th></tr></thead>
      <tbody>${items.map((v, i) => `<tr><td>${esc(v.nation)}</td><td>${esc(v.nationName)}</td><td><b>${esc(v.vatNumber)}</b></td><td>${esc(v.validFrom)}</td><td><span class="mr-status mr-pill-sm st-approved">${esc(v.status)}</span></td><td><button class="btn-sm-rm" data-rm-vat="${i}"><i class="material-icons icon-sm-16">close</i></button></td></tr>`).join('')}
      ${!items.length ? '<tr><td colspan="6" class="empty-cell">No VAT registrations</td></tr>' : ''}</tbody></table></div>
      <div class="sub-table-actions"><span class="scope-add" id="btnAddVat"><i class="material-icons">add</i>Add VAT Reg</span></div>
    </div>`;
    body.querySelectorAll('[data-rm-vat]').forEach(btn => { btn.addEventListener('click', () => { cust.vatRegs.splice(Number(btn.dataset.rmVat), 1); switchContent('vat'); }); });
    const addBtn = document.getElementById('btnAddVat');
    if (addBtn) addBtn.addEventListener('click', () => { cust.vatRegs.push({ scopeKey:'XX', nation:'XX', nationName:'New', vatNumber:'', validFrom:'—', status:'Active' }); switchContent('vat'); });
  };

  tabRenderers.legal = function(body) {
    const items = cust.legalCtrls || []; const i = scopeIdx['legal'] || 0; const l = items[i];
    if (!items.length) { body.innerHTML = `<div class="detail-section glass-panel">${areaSectionTitle('gavel', 'Legal / Export Control')}${scopeBarHtml('legal', items, it => it.nation, 'Add Country', 0)}</div>`; return; }
    const pill = (v) => { const cls = v === 'Clear' ? 'st-approved' : v === 'Hit' ? 'st-rejected' : 'st-inprogress'; return `<span class="mr-status mr-pill-sm ${cls}">${esc(v)}</span>`; };
    body.innerHTML = `<div class="detail-section glass-panel">
      ${areaSectionTitle('gavel', 'Legal Control — ' + esc(l.nation) + ' (' + esc(l.nationName) + ')')}
      ${scopeBarHtml('legal', items, it => it.nation, 'Add Country', i)}
      <h5 class="bi-block-title"><span class="bi-bar"></span>Screening Results</h5>
      <div class="form-grid col-3"><div class="form-group"><label>SDN Screening</label><div class="readonly-val">${pill(l.sdnStatus)}</div></div><div class="form-group"><label>Boycott Screening</label><div class="readonly-val">${pill(l.boycottStatus)}</div></div><div class="form-group"><label>Denial List</label><div class="readonly-val">${pill(l.denialStatus)}</div></div></div>
      <h5 class="bi-block-title"><span class="bi-bar"></span>Scan Metadata</h5>
      <div class="form-grid col-3">${fldReadonly('Last Scan Ref', l.lastScanRef)}${fldReadonly('Screened By', l.screenedBy)}${fldReadonly('Screened On', l.screenedOn)}${fldReadonly('Next Screening Due', l.nextScreenDue)}</div>
      <h5 class="bi-block-title"><span class="bi-bar"></span>Export License</h5>
      <div class="form-grid col-3">${fldText('License #', l.exportLicense)}${fldText('License Type', l.licenseType)}${fldText('Valid From', l.validFrom)}${fldText('Valid To', l.validTo)}</div>
      <h5 class="bi-block-title"><span class="bi-bar"></span>Risk Flags</h5>
      <div class="chk-row">${fldCheckbox('Dangerous Goods Receiver', l.dgReceiver, 'lcDg_' + i)}${fldCheckbox('Military End-Use', l.militaryUse, 'lcMil_' + i)}${fldCheckbox('Dual-Use Goods', l.dualUse, 'lcDu_' + i)}</div>
      ${fldTextarea('Remark', l.remark || '', 2)}
    </div>`;
    body.querySelectorAll('[data-scope-idx]').forEach(el => { el.addEventListener('click', () => { scopeIdx['legal'] = Number(el.dataset.scopeIdx); switchContent('legal'); }); });
  };

  tabRenderers.unload = function(body) {
    const items = cust.unloadPoints || []; const i = scopeIdx['unload'] || 0; const u = items[i];
    if (!items.length) { body.innerHTML = `<div class="detail-section glass-panel">${areaSectionTitle('warehouse', 'Unloading Points')}${scopeBarHtml('unload', items, it => it.unloadPoint, 'Add Unloading Point', 0)}</div>`; return; }
    body.innerHTML = `<div class="detail-section glass-panel">
      ${areaSectionTitle('warehouse', 'Unloading Point — ' + esc(u.unloadPoint))}
      ${scopeBarHtml('unload', items, it => it.unloadPoint, 'Add Unloading Point', i)}
      <h5 class="bi-block-title"><span class="bi-bar"></span>Point</h5>
      <div class="form-grid col-3">${fldText('Unloading Point', u.unloadPoint)}${fldText('Name', u.unloadPointName)}${fldText('Factory Calendar', u.factoryCalendar)}</div>
      ${fldTextarea('Address', u.addr, 2)}${fldTextarea('Instructions', u.unloadingInstr, 2)}
      <h5 class="bi-block-title"><span class="bi-bar"></span>Receiving Hours</h5>
      <div class="form-grid col-4">${fldText('Mon', u.recvHoursMon)}${fldText('Tue', u.recvHoursTue)}${fldText('Wed', u.recvHoursWed)}${fldText('Thu', u.recvHoursThu)}${fldText('Fri', u.recvHoursFri)}${fldText('Sat', u.recvHoursSat)}${fldText('Sun', u.recvHoursSun)}</div>
    </div>`;
    body.querySelectorAll('[data-scope-idx]').forEach(el => { el.addEventListener('click', () => { scopeIdx['unload'] = Number(el.dataset.scopeIdx); switchContent('unload'); }); });
  };

  /* Process Map Modal (Customer) — Raw Material과 동일한 vertical 패턴 */
  function getCustNodeState(label) {
    if (pStatus === 'approved') return 'done';
    const stages = buildCustStages(currentFlow);
    let activeStepIdx = stages.findIndex(s => s.roles.includes(pCurrentNode));
    if (activeStepIdx === -1) activeStepIdx = 0;
    const idx = stages.findIndex(s => s.roles.includes(label));
    if (idx === -1) return 'pending';
    if (idx < activeStepIdx) return 'done';
    if (idx === activeStepIdx) {
      if (!pCurrentNode || label === pCurrentNode) return (pStatus === 'rejected') ? 'rejected' : 'current';
      return 'done';
    }
    return 'pending';
  }

  function pmNodeHtmlCust(label, st, hlClass) {
    return buildPmNodeHtml(label, st, hlClass, customerPersonMap[label] || {});
  }

  function renderCustProcessMap() {
    document.getElementById('pmTitle').textContent = 'MDM Approval Flow';
    const body = document.getElementById('pmBody');
    const subTitle = (subLabelsMap[pSub] || pSub);
    let html = `<h4 class="pm-process-title">${kindLabel} · ${subTitle} Process</h4><div class="pm-flow-vertical">`;
    currentFlow.nodes.forEach(node => {
      if (node.type === 'arrow') html += '<div class="pm-varrow"><i class="material-icons">arrow_downward</i></div>';
      else if (node.type === 'node') { const st = getCustNodeState(node.label); html += pmNodeHtmlCust(node.label, st, (node.hl && st === 'done') ? ' pm-hl' : ''); }
      else if (node.type === 'row') { html += '<div class="pm-vrow">'; node.items.forEach(item => { html += pmNodeHtmlCust(item, getCustNodeState(item)); }); html += '</div>'; }
    });
    html += '</div>';
    body.innerHTML = html;
    body.querySelectorAll('.pm-vnode').forEach(node => {
      node.addEventListener('mousemove', (e) => {
        const rect = node.getBoundingClientRect();
        node.style.setProperty('--pm-gx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
        node.style.setProperty('--pm-gy', ((e.clientY - rect.top) / rect.height) * 100 + '%');
      });
    });
    body.querySelectorAll('.pm-vnode[data-pm-label]').forEach(node => {
      node.addEventListener('click', () => {
        const label = node.dataset.pmLabel;
        if (label === 'Request' && visibleItems.length) {
          const target = document.getElementById('cust-section-' + visibleItems[0].key);
          if (target) { pmInstance.close(); setTimeout(() => smoothScrollTo(target), 300); }
        }
      });
    });
  }

  /* Customer Init */
  document.getElementById('stageSections').style.display = 'none';
  document.getElementById('btnClearAll').style.display = 'none';

  const pmModalEl = document.getElementById('pmModal');
  const pmInstance = M.Modal.init(pmModalEl, {
    onOpenStart() { document.querySelector('.app-header').classList.add('content-blur'); document.querySelector('.detail-layout').classList.add('content-blur'); },
    onCloseEnd() { document.querySelector('.app-header').classList.remove('content-blur'); document.querySelector('.detail-layout').classList.remove('content-blur'); }
  });
  document.getElementById('btnProcessMap').addEventListener('click', () => { renderCustProcessMap(); pmInstance.open(); });

  document.getElementById('btnSave').addEventListener('click', () => M.toast({html:'Saved (mockup)'}));
  document.getElementById('btnRequest').addEventListener('click', () => M.toast({html:'Request submitted (mockup)'}));

  document.addEventListener('DOMContentLoaded', () => {
    updateCustTitle();
    renderRouting();
    renderAllCustSections();
    applyStageModesCust();
    bindAreaNav();
    bindStageRoleClick();
    initCustScrollSpy();
    initCustRtCardGlass();
    if (window.initHBtnGlass) window.initHBtnGlass();
    /* hoo-table 행 호버 글래스 오버레이 일괄 적용 */
    if (window.initAllHooTableOverlays) window.initAllHooTableOverlays();
    autoAlignNumericColumns();
    initStageCardGlow();
    /* 진행 중인 케이스 — currentNode stage 로 자동 스크롤 */
    if (pStatus === 'inprogress' && pCurrentNode) {
      const target = document.getElementById('cust-stage-' + roleSlug(pCurrentNode));
      if (target) setTimeout(() => smoothScrollTo(target), 120);
    }
  });
}

/* hBtn glass / tilt / waves are now handled by initHBtnGlass() in js/common.js.
   Kept this stub so the closing bracket below stays balanced for now — but
   we no longer need the inline duplicate. */
(function noopRemovedHBtnHandler() {
});
