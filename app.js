// 🚀 牛人影音志 v1.3.0 - 满血云端漫游版

// 🌟 1. 唤醒 Supabase 云端心脏
const SUPABASE_URL = 'https://ytyioshanxbamrgahdgu.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_gf0ESfEYeYLZ9lXKTIDcsQ_TfHHEeFv'; 
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================= 全局状态管理 =================
let currentMainFilter = 'all';
let currentSubFilter = 'all'; 
let currentSort = 'update_desc';
let currentEditingId = null; 
let activeScores = {}; 
let radarChartInstance = null;

let isRecordDirty = false;
let isSchemaDirty = false;

// 初始先从本地读，随后 init() 会用云端配置覆盖它们
let activeSchemas = JSON.parse(localStorage.getItem('CustomSchemas_v2')) || JSON.parse(JSON.stringify(defaultSchemas_v2));
let customStatuses = JSON.parse(localStorage.getItem('CustomStatuses_v2')) || [...defaultStatuses];
const defaultVoteReasons = { approve: ['白月光 / 童年滤镜', '核心诡计太惊艳'], veto: ['严重触碰三观底线', '喂屎烂尾 / 涉嫌欺诈'] };
let customVoteReasons = JSON.parse(localStorage.getItem('CustomVoteReasons_v2')) || JSON.parse(JSON.stringify(defaultVoteReasons));

let currentSearchQuery = '';
let currentTagFilter = 'all';
let schemaBuffer = null; 

// 🌟 核心革新：数据与配置的双轨云端同步引擎
window.cloudRecords = [];
window.cloudSettings = null;

window.syncFromCloud = async (isStartup = false) => {
    // 1. 同步评价记录
    const { data: recData, error: recErr } = await supabaseClient.from('records').select('*');
    if (recErr) {
        console.error("数据同步失败:", recErr);
        showToast("❌ 无法连接到云端数据库，请检查网络");
    } else {
        window.cloudRecords = recData || [];
    }

    // 2. 同步全局配置
    const { data: setObj, error: setErr } = await supabaseClient.from('settings').select('*').eq('id', 'global').single();
    if (setErr && setErr.code !== 'PGRST116') {
        console.error("配置拉取失败:", setErr);
    } else if (setObj && setObj.payload) {
        window.cloudSettings = setObj.payload;
    }

    if (isStartup && !recErr) {
        const timeStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        showToast(`☁️ 云端数据与配置同步完成 (${timeStr})`);
    }
};

// 🌟 新增：静默推送配置到云端的发射器
window.saveSettingsToCloud = async (silent = true) => {
    const payload = {
        customSchemas: activeSchemas,
        customStatuses: customStatuses,
        customVoteReasons: customVoteReasons,
        theme: localStorage.getItem('themePref_v2') || 'auto',
        displayMode: localStorage.getItem('displayModePref_v2') || 'system',
        timeDisplayMode: localStorage.getItem('timeDisplayPref_v2') || 'updated',
        confirmDelayPrefs: JSON.parse(localStorage.getItem('confirmDelayPrefs_v2') || '{"danger": 3, "warning": 3}')
    };
    const { error } = await supabaseClient.from('settings').upsert({ id: 'global', payload: payload, updated_at: Date.now() });
    if (error) console.error("配置同步失败", error);
    else if (!silent) showToast("☁️ 系统配置已同步至云端");
};

const els = {
    navTabs: document.getElementById('mainNavTabs'),
    subFilters: document.getElementById('subFiltersContainer'),
    sortSelect: document.getElementById('sortSelect'),
    displayModeSelect: document.getElementById('displayModeSelect'),
    grid: document.getElementById('recordGrid'),
    modal: document.getElementById('editModal'),
    dimContainer: document.getElementById('dimensionsContainer'),
    mainCat: document.getElementById('mainCategorySelect'),
    subCat: document.getElementById('subCategorySelect'),
    workName: document.getElementById('workName'),
    status: document.getElementById('statusSelect'),
    review: document.getElementById('reviewText'),
    voteSlider: document.getElementById('voteSlider'),
    voteReasonContainer: document.getElementById('voteReasonContainer'),
    voteReasonSelect: document.getElementById('voteReasonSelect'),
    voteReasonInput: document.getElementById('voteReasonInput'),
    finalScore: document.getElementById('finalScoreDisplay'),
    refDouban: document.getElementById('refDouban'),
    refBangumi: document.getElementById('refBangumi'),
    delBtn: document.getElementById('deleteRecordBtn'),
    settingsModal: document.getElementById('settingsModal'),
    themeSelect: document.getElementById('themeSelect'),
    editorCatSelect: document.getElementById('editorCatSelect'),
    schemaEditor: document.getElementById('schemaEditorContainer'),
    statusList: document.getElementById('statusListContainer'),
    searchInput: document.getElementById('searchInput'),
    tagFilterSelect: document.getElementById('tagFilterSelect'),
    voteScoreInput: document.getElementById('voteScoreInput'),
    resetStatusBtn: document.getElementById('resetStatusBtn'),
};

// ================= 多体系打分换算逻辑 =================
function getBangumiLabel(score, hasScore) {
    if(!hasScore) return '未评级';
    if(score >= 9.5) return '超神作';
    if(score >= 8.5) return '神作';
    if(score >= 7.5) return '优秀';
    if(score >= 6.5) return '良好';
    if(score >= 5.5) return '及格';
    if(score >= 4.5) return '不过不失';
    if(score >= 3.5) return '较差';
    if(score >= 2.5) return '差';
    if(score >= 1.5) return '极差';
    return '不忍直视';
}
function getDoubanLabel(score, hasScore) {
    if(!hasScore) return '未评级';
    if(score >= 8.5) return '力荐';
    if(score >= 7.0) return '推荐';
    if(score >= 5.0) return '还行';
    if(score >= 3.0) return '较差';
    return '很差';
}
function renderStars(score) {
    let stars = Math.round(score / 2);
    if (stars < 1) stars = 1; 
    if (stars > 5) stars = 5; 
    let str = '';
    for(let i=1; i<=5; i++) { str += (i <= stars) ? '★' : '☆'; }
    return str;
}

// ================= 弹窗组件与主题 =================
function showToast(msg) {
    const container = document.getElementById('toastContainer');
    const existingToasts = Array.from(container.children);
    const duplicate = existingToasts.find(t => t.dataset.msg === msg && t.classList.contains('show'));

    if (duplicate) {
        let count = parseInt(duplicate.dataset.count || 1) + 1;
        duplicate.dataset.count = count;
        let badge = duplicate.querySelector('.toast-badge');
        if (!badge) { badge = document.createElement('div'); badge.className = 'toast-badge'; duplicate.appendChild(badge); }
        badge.textContent = count;
        duplicate.classList.remove('pulse'); void duplicate.offsetWidth; duplicate.classList.add('pulse');
        clearTimeout(duplicate.hideTimer);
        duplicate.hideTimer = setTimeout(() => { duplicate.classList.remove('show'); setTimeout(() => duplicate.remove(), 300); }, 2500);
        return;
    }

    const toast = document.createElement('div'); toast.className = 'toast'; toast.textContent = msg; toast.dataset.msg = msg; toast.dataset.count = 1;
    container.appendChild(toast); setTimeout(() => toast.classList.add('show'), 10);
    toast.hideTimer = setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2500);
}

function showConfirm(title, message, onConfirmCallback, type = 'danger') {
    const overlay = document.getElementById('confirmOverlay'); 
    const okBtn = document.getElementById('confirmOkBtn');
    const cancelBtn = document.getElementById('confirmCancelBtn');
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    
    const prefs = JSON.parse(localStorage.getItem('confirmDelayPrefs_v2') || '{"danger": 3, "warning": 3}');
    let delayTime = prefs[type] !== undefined ? parseInt(prefs[type]) : 3;

    overlay.classList.add('active'); let timer = null;
    const closeBox = () => { if (timer) clearInterval(timer); overlay.classList.remove('active'); };

    const executeAction = async () => {
        if (!okBtn.disabled) { 
            okBtn.disabled = true; okBtn.style.opacity = '0.5'; okBtn.style.cursor = 'wait';
            okBtn.textContent = '⏳ 处理中...';
            try { await onConfirmCallback(); } catch(e) { console.error(e); } 
            finally { closeBox(); okBtn.disabled = false; okBtn.style.opacity = '1'; okBtn.style.cursor = 'pointer'; okBtn.textContent = '确定'; }
        } 
    };

    if (delayTime > 0) {
        okBtn.disabled = true; okBtn.style.opacity = '0.5'; okBtn.style.cursor = 'not-allowed'; okBtn.textContent = `确定 (${delayTime}s)`;
        timer = setInterval(() => {
            delayTime--;
            if (delayTime > 0) { okBtn.textContent = `确定 (${delayTime}s)`; } 
            else { clearInterval(timer); okBtn.disabled = false; okBtn.style.opacity = '1'; okBtn.style.cursor = 'pointer'; okBtn.textContent = `确定`; okBtn.onclick = executeAction; }
        }, 1000);
    } else {
        okBtn.disabled = false; okBtn.style.opacity = '1'; okBtn.style.cursor = 'pointer'; okBtn.textContent = `确定`; okBtn.onclick = executeAction;
    }
    cancelBtn.onclick = closeBox;
}

function debounce(func, wait) { let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), wait); }; }
function applyTheme(theme) {
    if(theme === 'auto') document.documentElement.setAttribute('data-theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    else document.documentElement.setAttribute('data-theme', theme);
    debouncedRechart();
}
const debouncedRechart = debounce(() => { if(els.modal.classList.contains('active')) calculateScore(); }, 150);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => { if(localStorage.getItem('themePref_v2') === 'auto') applyTheme('auto'); });

function renderChangelog() {
    const container = document.getElementById('changelogContainer'); if(!container) return; container.innerHTML = '';
    APP_CHANGELOG.forEach((log, index) => {
        const isCurrent = index === 0;
        const wrapperStyle = isCurrent ? `background: var(--score-bg); padding: 16px; border-radius: 10px; margin-bottom: 12px; border: 1px solid var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.03);` : `padding: 16px 12px; border-bottom: 1px dashed var(--border-color);`;
        const titleHtml = isCurrent ? `<strong style="color: var(--primary); font-size: 16px; letter-spacing: 0.5px;">v${log.version}</strong> <span style="font-size:12px; color:var(--text-muted); font-weight: bold; margin-left: 6px;">(${log.date || '未知日期'})</span>` : `<strong style="color: var(--text-main); font-size: 15px;">v${log.version}</strong> <span style="font-size:11px; color:var(--text-muted); margin-left: 8px;">${log.date || ''}</span>`;
        const lis = log.changes.map(c => {
            const match = c.match(/^\[(.*?)\]\s*(.*)/);
            if (match) {
                const tag = match[1]; const text = match[2]; let tagStyle = '';
                if (tag.includes('新特性') || tag.includes('里程碑') || tag.includes('突破')) tagStyle = 'background: rgba(52, 152, 219, 0.1); color: var(--link-color); border: 1px solid rgba(52, 152, 219, 0.3);';
                else if (tag.includes('优化')) tagStyle = 'background: rgba(241, 196, 15, 0.15); color: #d68910; border: 1px solid rgba(241, 196, 15, 0.4);';
                else if (tag.includes('修复')) tagStyle = 'background: rgba(231, 76, 60, 0.1); color: var(--danger); border: 1px solid rgba(231, 76, 60, 0.3);';
                else tagStyle = 'background: var(--border-color); color: var(--text-muted); border: 1px solid transparent;';
                return `<li style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;"><span style="font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 4px; white-space: nowrap; line-height: 1.2; ${tagStyle}; flex-shrink: 0; margin-top: 2px;">${tag}</span><span style="line-height: 1.5; color: var(--text-main);">${text}</span></li>`;
            }
            return `<li style="margin-bottom: 8px; margin-left: 18px; list-style-type: disc; line-height: 1.5; color: var(--text-main);">${c}</li>`;
        }).join('');
        container.insertAdjacentHTML('beforeend', `<div style="${wrapperStyle}">${titleHtml}<ul style="margin-top: 14px; font-size: 13px; list-style: none; padding-left: 0;">${lis}</ul></div>`);
    });
}

// ================= 灵动预览核心引擎 =================
let hoverTimer = null; const previewEl = document.getElementById('hoverPreview');
function initHoverPreview() {
    document.getElementById('recordGrid').addEventListener('mouseover', (e) => {
        const card = e.target.closest('.record-card'); if (!card) return;
        const id = card.getAttribute('data-id'); const rec = window.cloudRecords.find(r => r.id === id); if (!rec) return;
        hoverTimer = setTimeout(() => { showPreview(rec, card); }, 500);
    });
    document.getElementById('recordGrid').addEventListener('mouseout', () => { clearTimeout(hoverTimer); previewEl.classList.remove('active'); });
}
function showPreview(rec, card) {
    const schema = activeSchemas[rec.subCat]; if (!schema) return;
    let html = `<div style="font-size:13px; font-weight:bold; margin-bottom:15px; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:8px;">📊 细分维度预览</div>`;
    schema.forEach(dim => {
        let sum = 0; dim.subs.forEach(s => sum += (rec.scores[s.id] || 0));
        const avg = sum / dim.subs.length; const percent = (avg * 10).toFixed(0);
        html += `<div class="preview-dim-row"><div class="preview-dim-header"><span>${dim.name}</span><span>${avg.toFixed(1)}</span></div><div class="preview-bar-bg"><div class="preview-bar-fill" style="width: ${percent}%"></div></div></div>`;
    });
    previewEl.innerHTML = html;
    const rect = card.getBoundingClientRect(); let left = rect.right + 15; let top = rect.top;
    if (left + 280 > window.innerWidth) left = rect.left - 275;
    previewEl.style.left = `${left}px`; previewEl.style.top = `${top}px`; previewEl.classList.add('active');
}

// ================= 导航与瀑布流 =================
function initNavTabs() {
    Object.keys(categoryTree).forEach(key => {
        const tab = document.createElement('div'); tab.className = `nav-tab ${key === 'all' ? 'active' : ''}`; tab.textContent = categoryTree[key].name;
        tab.onclick = () => {
            if (window.isDraggingNavTabs) return; 
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active')); tab.classList.add('active'); tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            currentMainFilter = key; currentSubFilter = 'all'; els.searchInput.value = ''; currentSearchQuery = ''; els.tagFilterSelect.value = 'all'; currentTagFilter = 'all';
            renderSubFilters(); renderMainList();
        };
        els.navTabs.appendChild(tab);
    });
    const navContainer = els.navTabs;
    navContainer.addEventListener('wheel', (e) => { if (e.deltaY !== 0) { e.preventDefault(); navContainer.scrollBy({ left: e.deltaY * 2, behavior: 'auto' }); } }, { passive: false });
    let isDown = false; let startX, scrollLeft; window.isDraggingNavTabs = false; 
    navContainer.addEventListener('mousedown', (e) => { isDown = true; window.isDraggingNavTabs = false; navContainer.style.cursor = 'grabbing'; navContainer.style.userSelect = 'none'; startX = e.pageX - navContainer.offsetLeft; scrollLeft = navContainer.scrollLeft; });
    navContainer.addEventListener('mouseleave', () => { isDown = false; navContainer.style.cursor = ''; });
    navContainer.addEventListener('mouseup', () => { isDown = false; navContainer.style.cursor = ''; setTimeout(() => window.isDraggingNavTabs = false, 50); });
    navContainer.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - navContainer.offsetLeft; const walk = (x - startX) * 1.5; if (Math.abs(walk) > 10) window.isDraggingNavTabs = true; navContainer.scrollLeft = scrollLeft - walk; });
}

function renderSubFilters() {
    els.subFilters.innerHTML = ''; if (currentMainFilter === 'all') return; 
    const allTag = document.createElement('div'); allTag.className = `sub-filter-tag ${currentSubFilter === 'all' ? 'active' : ''}`; allTag.textContent = '全部';
    allTag.onclick = () => { currentSubFilter = 'all'; renderSubFilters(); renderMainList(); }
    els.subFilters.appendChild(allTag);
    const subs = categoryTree[currentMainFilter].subs;
    Object.keys(subs).forEach(subKey => {
        const tag = document.createElement('div'); tag.className = `sub-filter-tag ${currentSubFilter === subKey ? 'active' : ''}`; tag.textContent = subs[subKey];
        tag.onclick = () => { currentSubFilter = subKey; renderSubFilters(); renderMainList(); }
        els.subFilters.appendChild(tag);
    });
}

els.searchInput.addEventListener('input', (e) => { currentSearchQuery = e.target.value.trim().toLowerCase(); renderMainList(); });
els.tagFilterSelect.addEventListener('change', (e) => { currentTagFilter = e.target.value; renderMainList(); });
els.sortSelect.onchange = (e) => { currentSort = e.target.value; renderMainList(); }
els.displayModeSelect.onchange = (e) => { localStorage.setItem('displayModePref_v2', e.target.value); saveSettingsToCloud(); renderMainList(); }

function renderMainList() {
    let records = [...window.cloudRecords]; els.grid.innerHTML = '';
    if (currentMainFilter !== 'all') records = records.filter(r => r.mainCat === currentMainFilter);
    if (currentSubFilter !== 'all') records = records.filter(r => r.subCat === currentSubFilter);
    if (currentTagFilter === 'incomplete_score') records = records.filter(r => r.isScoreIncomplete);
    if (currentTagFilter === 'incomplete_review') records = records.filter(r => r.isReviewIncomplete);

    if (currentSearchQuery) {
        const keywords = currentSearchQuery.split(/\s+/).filter(k => k.length > 0);
        records = records.filter(r => {
            const name = (r.name || '').toLowerCase(); const review = (r.review || '').toLowerCase();
            let virtualTags = [r.status, r.subCatText];
            if (r.isScoreIncomplete) virtualTags.push('缺分数'); if (r.isReviewIncomplete) virtualTags.push('无评语');
            if (r.voteStatus === 1) virtualTags.push('一票赞成', '白月光'); if (r.voteStatus === -1) virtualTags.push('一票否决', '踩雷');
            return keywords.every(kw => { return name.includes(kw) || review.includes(kw) || virtualTags.some(t => (t || '').toLowerCase().includes(kw)); });
        });
    }

    records.sort((a, b) => {
        const scoreA = parseFloat(a.finalScore); const scoreB = parseFloat(b.finalScore);
        switch(currentSort) {
            case 'update_desc': return (b.updatedAt || b.createdAt || parseInt(b.id)) - (a.updatedAt || a.createdAt || parseInt(a.id));
            case 'update_asc': return (a.updatedAt || a.createdAt || parseInt(a.id)) - (b.updatedAt || b.createdAt || parseInt(b.id));
            case 'create_desc': return (b.createdAt || parseInt(b.id)) - (a.createdAt || parseInt(a.id));
            case 'create_asc': return (a.createdAt || parseInt(a.id)) - (b.createdAt || parseInt(b.id));
            case 'score_desc': return scoreB - scoreA;
            case 'score_asc': return scoreA - scoreB;
            case 'name_asc': return a.name.localeCompare(b.name, 'zh-CN');
            case 'name_desc': return b.name.localeCompare(a.name, 'zh-CN');
            default: return 0;
        }
    });

    if (records.length === 0) { els.grid.innerHTML = `<div class="empty-state"><h3>这里空空如也</h3><p>点击右下角 + 号，开始录入精神食粮吧</p></div>`; return; }

    const displayMode = els.displayModeSelect.value;
    const timeDisplayMode = localStorage.getItem('timeDisplayPref_v2') || 'updated'; 

    records.forEach(rec => {
        const card = document.createElement('div'); card.className = 'record-card'; card.onclick = () => openModal(rec.id); card.setAttribute('data-id', rec.id);
        const coverText = rec.name.substring(0,2).toUpperCase();
        const voteStatus = rec.voteStatus !== undefined ? rec.voteStatus : (rec.isProtect ? 1 : (rec.isVeto ? -1 : 0));
        let badgeHtml = ''; if (voteStatus === 1) badgeHtml = `<div class="protect-badge" title="${rec.voteReason || ''}">一票赞成</div>`; else if (voteStatus === -1) badgeHtml = `<div class="veto-badge" title="${rec.voteReason || ''}">一票否决</div>`;
        let incompleteTags = ''; if (rec.isScoreIncomplete) incompleteTags += `<span class="tag-incomplete">缺分数</span>`; if (rec.isReviewIncomplete) incompleteTags += `<span class="tag-incomplete">无评语</span>`;
        let scoreHtml = ''; let scoreTitle = '评分'; const scoreVal = parseFloat(rec.finalScore); const hasScore = scoreVal > 0 || rec.isVeto || voteStatus === -1;

        if (!hasScore) { scoreHtml = `<span style="font-size:16px; color:var(--text-muted);">暂无</span>`; } 
        else if (displayMode === 'system') { scoreHtml = scoreVal.toFixed(1); } 
        else if (displayMode === 'douban') { scoreTitle = '豆瓣推荐'; scoreHtml = `<span style="font-size: 16px; letter-spacing: 2px; color: #f39c12;">${renderStars(scoreVal)}</span>`; } 
        else if (displayMode === 'bangumi') { scoreTitle = 'Bangumi'; let bScore = Math.round(scoreVal); if (bScore < 1) bScore = 1; scoreHtml = `<span>${bScore} <span style="font-size: 12px; font-weight: normal; color:var(--text-muted);">${getBangumiLabel(scoreVal, true)}</span></span>`; }

        const tUpdate = rec.updatedAt || rec.createdAt || parseInt(rec.id); const tCreate = rec.createdAt || parseInt(rec.id); const timeToShow = timeDisplayMode === 'created' ? tCreate : tUpdate;
        const hoverText = `修改于：${formatPreciseTime({createdAt: tUpdate})}\\n创建于：${formatPreciseTime({createdAt: tCreate})}`;

        card.innerHTML = `
            ${badgeHtml}
            <div class="record-cover" style="background: hsl(${Math.random() * 360}, 60%, 75%);">${coverText}</div>
            <div class="record-info">
                <div class="record-title" title="${rec.name}">${rec.name}</div>
                <div class="record-meta" title="${hoverText}">${rec.subCatText} | ${formatPreciseTime({createdAt: timeToShow})} ${incompleteTags}</div>
                <div class="record-desc">${rec.review || '暂无详细评语...'}</div>
                <div class="record-bottom">
                    <span class="record-status">${rec.status}</span>
                    <div style="display:flex; align-items:baseline; gap:4px;"><span style="font-size:11px; color:var(--text-muted)">${scoreTitle}</span><span class="record-score" style="font-size: ${displayMode==='system' ? '26px' : '18px'}">${scoreHtml}</span></div>
                </div>
            </div>`;
        els.grid.appendChild(card);
    });
}

// ================= 评分记录弹窗逻辑 =================
function initCascader() {
    els.mainCat.innerHTML = ''; Object.keys(categoryTree).filter(k => k !== 'all').forEach(key => { els.mainCat.add(new Option(categoryTree[key].name, key)); });
    els.mainCat.onchange = () => { const subs = categoryTree[els.mainCat.value].subs; els.subCat.innerHTML = ''; Object.keys(subs).forEach(subKey => els.subCat.add(new Option(subs[subKey], subKey))); activeScores = {}; renderDimensions(); isRecordDirty = true; };
    els.subCat.onchange = () => { activeScores = {}; renderDimensions(); isRecordDirty = true; };
}
function renderStatusDropdown() { els.status.innerHTML = ''; customStatuses.forEach(s => els.status.add(new Option(s, s))); }

function generateBlocks(subId, val) {
    let blocks = ''; for(let i = 1; i <= 10; i++) blocks += `<div class="score-block ${i <= val ? 'active' : ''}" data-val="${i}" data-subid="${subId}"></div>`;
    return `<div class="score-control-wrapper"><button class="btn-score-adjust" onclick="adjustScore('${subId}', -1)">-</button><div class="blocks-container" id="blocks_${subId}">${blocks}</div><button class="btn-score-adjust" onclick="adjustScore('${subId}', 1)">+</button><input type="number" class="score-input-num" id="input_${subId}" value="${val}" min="0" max="10" onchange="setScore('${subId}', this.value)"></div>`;
}

function renderDimensions() {
    els.dimContainer.innerHTML = ''; const schema = activeSchemas[els.subCat.value]; if(!schema) return;
    schema.forEach(dim => {
        let subsHTML = '';
        dim.subs.forEach(sub => {
            if(activeScores[sub.id] === undefined) activeScores[sub.id] = 0; 
            const tooltipHtml = `<span class="tooltip-icon">?<span class="tooltip-text">${sub.desc || '暂无详细解释'}</span></span>`;
            subsHTML += `<div class="sub-item"><div class="sub-name" title="${sub.name}">${sub.name} ${tooltipHtml}</div>${generateBlocks(sub.id, activeScores[sub.id])}</div>`;
        });
        els.dimContainer.insertAdjacentHTML('beforeend', `<div class="dimension-group"><div class="dimension-header"><div><span class="dimension-title">${dim.name}</span><span id="dimRealScore_${dim.id}" style="margin-left:8px; font-size:13px; color:var(--primary); font-weight:900;">0.0</span></div><span class="dimension-weight">权重: ${Math.round(dim.weight * 100)}%</span></div><div>${subsHTML}</div></div>`);
    });
    els.dimContainer.querySelectorAll('.score-block').forEach(b => { b.onclick = function() { setScore(this.dataset.subid, this.dataset.val); } });
    calculateScore();
}

window.setScore = function(subId, val) {
    let num = Math.min(10, Math.max(0, parseInt(val) || 0)); activeScores[subId] = num; document.getElementById(`input_${subId}`).value = num;
    const blocks = document.getElementById(`blocks_${subId}`).children;
    for(let i=0; i<10; i++) { if(i < num) blocks[i].classList.add('active'); else blocks[i].classList.remove('active'); }
    isRecordDirty = true; calculateScore();
}
window.adjustScore = function(id, delta) { setScore(id, activeScores[id] + delta); }

function calculateScore() {
    const schema = activeSchemas[els.subCat.value]; let total = 0, radarData = [], radarLabels = [], hasAnyScore = false;
    schema.forEach(dim => {
        let sum = 0; dim.subs.forEach(s => { sum += activeScores[s.id]; if(activeScores[s.id] > 0) hasAnyScore = true; });
        let avg = sum / dim.subs.length; total += avg * dim.weight; radarData.push(avg.toFixed(1)); radarLabels.push(dim.name);
        const dimScoreEl = document.getElementById(`dimRealScore_${dim.id}`); if (dimScoreEl) dimScoreEl.textContent = avg.toFixed(1);
    });

    const voteVal = parseInt(els.voteSlider.value); let finalTotal = total; let displayHtml = '';
    if (voteVal !== 0) { finalTotal = parseFloat(els.voteScoreInput.value) || 0; hasAnyScore = true; displayHtml = `<span class="score-strikethrough">${total.toFixed(1)}</span>${finalTotal.toFixed(1)}`; } 
    else { displayHtml = finalTotal.toFixed(1); }

    els.finalScore.innerHTML = displayHtml; els.finalScore.setAttribute('data-score', finalTotal.toFixed(1));
    
    if (!hasAnyScore && finalTotal === 0 && voteVal === 0) {
        els.finalScore.style.color = '#cbd5e0'; els.refDouban.innerHTML = `未评级`; els.refBangumi.innerHTML = `未评级`;
    } else {
        if (voteVal === 1) els.finalScore.style.color = 'var(--warning)'; else if (voteVal === -1) els.finalScore.style.color = 'var(--danger)'; else if(finalTotal >= 9) els.finalScore.style.color = '#f09199'; else if(finalTotal >= 6) els.finalScore.style.color = '#f39c12'; else els.finalScore.style.color = '#7f8c8d'; 
        const bLabel = getBangumiLabel(finalTotal, hasAnyScore); const dLabel = getDoubanLabel(finalTotal, hasAnyScore); let bScoreRef = Math.round(finalTotal); if (bScoreRef < 1) bScoreRef = 1; 
        els.refDouban.innerHTML = `<span style="color: #f39c12; letter-spacing: 2px; font-size: 14px;">${renderStars(finalTotal)}</span> <span style="font-weight:normal;">(${dLabel})</span>`;
        els.refBangumi.innerHTML = `${bScoreRef} 分 <span style="font-weight:normal;">(${bLabel})</span>`;
    }
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'; const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'; const labelColor = isDark ? '#a0aec0' : '#7f8c8d';
    const ctx = document.getElementById('radarChart').getContext('2d'); if(radarChartInstance) radarChartInstance.destroy();
    radarChartInstance = new Chart(ctx, { 
        type: 'radar', 
        data: { labels: radarLabels, datasets: [{ data: voteVal !== 0 ? radarLabels.map(()=>finalTotal) : radarData, backgroundColor: 'rgba(240, 145, 153, 0.25)', borderColor: '#f09199', pointBackgroundColor: '#f09199', borderWidth: 2, pointRadius: 3 }] },
        options: { scales: { r: { min: 0, max: 10, ticks: { display: false, stepSize: 2 }, grid: { color: gridColor }, angleLines: { color: gridColor }, pointLabels: { color: labelColor, font: {size: 11, weight: 'bold'} } } }, plugins: { legend: { display: false } }, maintainAspectRatio: false, animation: { duration: 0 } } 
    });
}

['workName', 'reviewText'].forEach(id => document.getElementById(id).addEventListener('input', () => isRecordDirty = true));
els.status.addEventListener('change', () => isRecordDirty = true);

// ================= 实时重名检测与跳转引擎 =================
els.workName.addEventListener('input', debounce(function() {
    const name = this.value.trim().toLowerCase(); const hintEl = document.getElementById('duplicateHint'); if (!name) { hintEl.innerHTML = ''; return; }
    const dup = window.cloudRecords.find(r => r.name.toLowerCase() === name && r.id !== currentEditingId);
    if (dup) hintEl.innerHTML = `⚠️ 馆内已有此记录：<a href="javascript:void(0)" onclick="jumpToRecord('${dup.id}')" style="color:var(--link-color); text-decoration:underline;">立即前往编辑原记录</a>`; else hintEl.innerHTML = '';
}, 300));
window.jumpToRecord = (id) => { isRecordDirty = false; document.getElementById('editModal').classList.remove('active'); document.body.style.overflow = ''; setTimeout(() => openModal(id), 150); showToast('已跳转至原有记录'); };

// ================= 一票机制动态 UI 与管理引擎 =================
function updateVoteUI(isProgrammatic = false) {
    const val = parseInt(els.voteSlider.value); els.voteSlider.className = val === -1 ? 'thumb-veto' : (val === 1 ? 'thumb-approve' : ''); els.voteReasonContainer.style.display = val === 0 ? 'none' : 'block';
    if (val !== 0) {
        const label = document.getElementById('voteReasonLabel'); const select = els.voteReasonSelect; const type = val === 1 ? 'approve' : 'veto';
        label.textContent = val === 1 ? '一票赞成的原因 (必填)：' : '一票否决的原因 (必填)：';
        select.innerHTML = '<option value="">自定义原因...</option>'; customVoteReasons[type].forEach(reason => select.add(new Option(reason, reason)));
        if (!isProgrammatic) {
            select.value = ''; const wrapper = document.getElementById('voteReasonInputWrapper'); wrapper.style.maxHeight = '150px'; wrapper.style.opacity = '1'; wrapper.style.marginTop = '8px';
            els.voteReasonInput.value = ''; if (typeof autoResizeTextarea === 'function') autoResizeTextarea(els.voteReasonInput);
            if (val === -1) els.voteScoreInput.value = 0; else if (val === 1) els.voteScoreInput.value = 10;
        }
    }
    if (val === -1) els.voteScoreInput.style.color = 'var(--danger)'; else if (val === 1) els.voteScoreInput.style.color = 'var(--warning)';
}

els.voteSlider.addEventListener('input', (e) => { updateVoteUI(false); isRecordDirty = true; calculateScore(); });
els.voteReasonSelect.addEventListener('change', (e) => {
    const wrapper = document.getElementById('voteReasonInputWrapper');
    if (e.target.value === "") { wrapper.style.maxHeight = '150px'; wrapper.style.opacity = '1'; wrapper.style.marginTop = '8px'; els.voteReasonInput.style.display = 'block'; els.voteReasonInput.value = ''; if (typeof autoResizeTextarea === 'function') autoResizeTextarea(els.voteReasonInput); } 
    else { wrapper.style.maxHeight = '0'; wrapper.style.opacity = '0'; wrapper.style.marginTop = '0'; els.voteReasonInput.value = e.target.value; }
    isRecordDirty = true;
});
els.voteReasonInput.addEventListener('input', function() { isRecordDirty = true; if (typeof autoResizeTextarea === 'function') autoResizeTextarea(this); });
els.voteScoreInput.addEventListener('input', () => { let val = parseFloat(els.voteScoreInput.value); if(val < 0) els.voteScoreInput.value = 0; if(val > 10) els.voteScoreInput.value = 10; isRecordDirty = true; calculateScore(); });

function renderVoteReasonsManager() {
    ['approve', 'veto'].forEach(type => {
        const listEl = document.getElementById(`${type}ReasonList`); listEl.innerHTML = '';
        customVoteReasons[type].forEach((reason, idx) => { listEl.insertAdjacentHTML('beforeend', `<div class="status-item draggable-item" draggable="true" ondragstart="handleDragStart(event, 'vote_${type}', ${idx})" ondragover="handleDragOver(event, 'vote_${type}')" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, 'vote_${type}', ${idx})" ondragend="handleDragEnd(event)"><div style="display:flex; align-items:center; gap:5px;"><div class="drag-handle" title="按住拖拽排序">☰</div><span>${reason}</span></div><button class="btn-icon-del" onclick="delVoteReason('${type}', ${idx})">✖</button></div>`); });
    });
}
window.addVoteReason = (type) => { const input = document.getElementById(type === 'approve' ? 'newApproveReason' : 'newVetoReason'); const val = input.value.trim(); if(!val) return; if(customVoteReasons[type].includes(val)) return showToast('该原因已存在'); customVoteReasons[type].push(val); localStorage.setItem('CustomVoteReasons_v2', JSON.stringify(customVoteReasons)); saveSettingsToCloud(); input.value = ''; renderVoteReasonsManager(); showToast('原因词条已添加'); };
window.delVoteReason = (type, idx) => { customVoteReasons[type].splice(idx, 1); localStorage.setItem('CustomVoteReasons_v2', JSON.stringify(customVoteReasons)); saveSettingsToCloud(); renderVoteReasonsManager(); };
window.moveVoteReason = (type, idx, dir) => { if (idx + dir < 0 || idx + dir >= customVoteReasons[type].length) return; const temp = customVoteReasons[type][idx]; customVoteReasons[type][idx] = customVoteReasons[type][idx+dir]; customVoteReasons[type][idx+dir] = temp; localStorage.setItem('CustomVoteReasons_v2', JSON.stringify(customVoteReasons)); saveSettingsToCloud(); renderVoteReasonsManager(); };
window.resetVoteReasons = () => { showConfirm('重置词条确认', '清空所有自定义一票判定词条并恢复默认。确定吗？', async () => { customVoteReasons = JSON.parse(JSON.stringify(defaultVoteReasons)); localStorage.setItem('CustomVoteReasons_v2', JSON.stringify(customVoteReasons)); saveSettingsToCloud(); renderVoteReasonsManager(); showToast('词条已恢复默认'); }); };

function openModal(id = null) {
    document.getElementById('duplicateHint').innerHTML = ''; currentEditingId = id; els.delBtn.style.display = id ? 'block' : 'none'; renderStatusDropdown(); isRecordDirty = false;
    if (id) { 
        const rec = window.cloudRecords.find(r => r.id === id); document.getElementById('modalTitle').textContent = '修改评价记录';
        const timeContainer = document.getElementById('timeInfoContainer'); timeContainer.style.display = 'flex';
        document.getElementById('createTimeLabel').textContent = `🌱 创建于：${formatPreciseTime({ createdAt: rec.createdAt || rec.id })}`;
        document.getElementById('updateTimeLabel').textContent = `🔄 修改于：${formatPreciseTime({ createdAt: rec.updatedAt || rec.createdAt || rec.id })}`;
        els.mainCat.value = rec.mainCat; const subs = categoryTree[rec.mainCat].subs; els.subCat.innerHTML = ''; Object.keys(subs).forEach(subKey => els.subCat.add(new Option(subs[subKey], subKey)));
        els.subCat.value = rec.subCat; els.workName.value = rec.name; if(!customStatuses.includes(rec.status)) els.status.add(new Option(rec.status, rec.status));
        els.status.value = rec.status; els.review.value = rec.review;
        const voteStat = rec.voteStatus !== undefined ? rec.voteStatus : (rec.isProtect ? 1 : (rec.isVeto ? -1 : 0)); els.voteSlider.value = voteStat; updateVoteUI(true); 
        if (voteStat !== 0) {
            const type = voteStat === 1 ? 'approve' : 'veto'; const wrapper = document.getElementById('voteReasonInputWrapper');
            if (customVoteReasons[type].includes(rec.voteReason)) { els.voteReasonSelect.value = rec.voteReason; wrapper.style.maxHeight = '0'; wrapper.style.opacity = '0'; wrapper.style.marginTop = '0'; els.voteReasonInput.value = rec.voteReason; } 
            else { els.voteReasonSelect.value = ''; wrapper.style.maxHeight = '150px'; wrapper.style.opacity = '1'; wrapper.style.marginTop = '8px'; els.voteReasonInput.value = rec.voteReason || ''; }
        }
        els.voteScoreInput.value = rec.voteScore !== undefined ? rec.voteScore : (voteStat === 1 ? 10 : (voteStat === -1 ? 0 : '')); activeScores = { ...rec.scores }; 
    } else {
        document.getElementById('modalTitle').textContent = '新增收视阅读记录'; document.getElementById('timeInfoContainer').style.display = 'none';
        els.workName.value = ''; els.review.value = ''; els.status.selectedIndex = 0; activeScores = {}; els.voteSlider.value = 0; els.voteScoreInput.value = ''; updateVoteUI(true);
        if (currentMainFilter !== 'all') { els.mainCat.value = currentMainFilter; els.mainCat.onchange(); if (currentSubFilter !== 'all') els.subCat.value = currentSubFilter; } 
        else { els.mainCat.selectedIndex = 0; els.mainCat.onchange(); }
    }
    renderDimensions(); els.modal.classList.add('active'); document.body.style.overflow = 'hidden';
    setTimeout(() => { isRecordDirty = false; if (typeof autoResizeTextarea === 'function') { autoResizeTextarea(els.review); autoResizeTextarea(els.voteReasonInput); } }, 50);
}

const reviewInput = document.getElementById('reviewText'); const autoResizeTextarea = (el) => { el.style.height = 'auto'; el.style.height = (el.scrollHeight) + 'px'; };
reviewInput.addEventListener('input', function() { autoResizeTextarea(this); });

const zenOverlay = document.getElementById('zenOverlay'); const zenReviewText = document.getElementById('zenReviewText'); const zenSidebar = document.getElementById('zenSidebar');
document.getElementById('openZenBtn').onclick = () => { zenReviewText.value = reviewInput.value; renderZenSidebar(); zenOverlay.classList.add('active'); setTimeout(() => { zenReviewText.focus(); zenReviewText.selectionStart = zenReviewText.value.length; }, 100); };
const closeZenMode = () => { reviewInput.value = zenReviewText.value; autoResizeTextarea(reviewInput); isRecordDirty = true; zenOverlay.classList.remove('active'); };
document.getElementById('closeZenBtn').onclick = closeZenMode; zenReviewText.addEventListener('input', () => { isRecordDirty = true; });

function renderZenSidebar() {
    const workName = els.workName.value || '未命名作品'; const finalScore = els.finalScore.innerHTML; const scoreColor = els.finalScore.style.color; const voteVal = parseInt(els.voteSlider.value);
    let voteHtml = '';
    if (voteVal === 1) voteHtml = `<div style="background: var(--warning); color: #000; padding: 12px; border-radius: 8px; font-weight: 900; margin-bottom: 20px; font-size: 13px;">🌟 一票赞成: <br><span style="font-weight:normal; margin-top:4px; display:block;">${els.voteReasonInput.value || els.voteReasonSelect.value || '无'}</span></div>`;
    else if (voteVal === -1) voteHtml = `<div style="background: var(--danger); color: #fff; padding: 12px; border-radius: 8px; font-weight: 900; margin-bottom: 20px; font-size: 13px;">💣 一票否决: <br><span style="font-weight:normal; margin-top:4px; display:block;">${els.voteReasonInput.value || els.voteReasonSelect.value || '无'}</span></div>`;

    const schema = activeSchemas[els.subCat.value]; let barsHtml = `<div style="font-size:13px; font-weight:bold; margin-bottom:15px; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:8px;">📊 实时评价细分矩阵</div>`;
    if (schema) { schema.forEach(dim => { let sum = 0; dim.subs.forEach(s => sum += (activeScores[s.id] || 0)); const avg = sum / dim.subs.length; const percent = (avg * 10).toFixed(0); barsHtml += `<div style="margin-bottom: 12px;"><div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; color: var(--text-main);"><span>${dim.name}</span><span style="font-weight: 900;">${avg.toFixed(1)}</span></div><div style="height: 6px; background: var(--score-bg); border-radius: 3px; overflow: hidden;"><div style="height: 100%; background: var(--primary); width: ${percent}%; border-radius: 3px;"></div></div></div>`; }); }
    zenSidebar.innerHTML = `<div style="font-size: 13px; color: var(--text-muted); font-weight: bold; margin-bottom: 5px;">正在评价</div><div style="font-size: 22px; font-weight: 900; color: var(--link-color); margin-bottom: 20px; line-height: 1.3;">${workName}</div><div style="font-size: 12px; color: var(--text-muted); margin-bottom: 5px;">系统演算总分</div><div style="font-size: 48px; font-weight: 900; line-height: 1; margin-bottom: 25px; color: ${scoreColor}; font-family: 'Arial Black', Impact, sans-serif;">${finalScore}</div>${voteHtml}${barsHtml}`;
}

function closeModal() { 
    if(isRecordDirty) showConfirm('未保存警告', '你有尚未保存的修改，直接关闭将丢失这些修改。确定要放弃吗？', async () => { els.modal.classList.remove('active'); document.body.style.overflow = ''; isRecordDirty = false; }, 'warning');
    else { els.modal.classList.remove('active'); document.body.style.overflow = ''; }
}
document.getElementById('fabAddBtn').onclick = () => openModal(null);
document.getElementById('closeModalBtn').onclick = closeModal;

// 🚀 云端防抖保存逻辑
document.getElementById('saveRecordBtn').onclick = async () => {
    const saveBtn = document.getElementById('saveRecordBtn'); if (saveBtn.disabled) return; 
    const newName = els.workName.value.trim(); if(!newName) return showToast('作品名称不能为空！');
    const records = window.cloudRecords; const isDuplicate = records.some(r => r.name.toLowerCase() === newName.toLowerCase() && r.id !== currentEditingId);
    if (isDuplicate) return showConfirm('作品重名警告', `馆内已存在名为《${newName}》的记录。请修改名称或编辑原记录。`, async () => {}, 'warning');
    const voteVal = parseInt(els.voteSlider.value); const voteReason = els.voteReasonInput.value.trim();
    if (voteVal !== 0 && !voteReason) return showToast('启用一票机制时，必须填写具体判定原因！');

    let isScoreIncomplete = false; let isReviewIncomplete = false;
    if (voteVal === 0) { const schema = activeSchemas[els.subCat.value]; schema.forEach(dim => dim.subs.forEach(s => { if ((activeScores[s.id] || 0) === 0) isScoreIncomplete = true; })); if (!els.review.value.trim()) isReviewIncomplete = true; }

    const executeSave = async () => {
        saveBtn.disabled = true; saveBtn.innerHTML = '⏳ 正在同步云端...'; saveBtn.style.opacity = '0.7'; saveBtn.style.cursor = 'wait';
        try {
            const now = Date.now(); let finalCreatedAt = now; 
            if (currentEditingId) { const oldRec = records.find(r => r.id === currentEditingId); if (oldRec) finalCreatedAt = oldRec.createdAt || parseInt(oldRec.id) || now; }
            const rec = {
                id: currentEditingId || now.toString(), name: newName, mainCat: els.mainCat.value, subCat: els.subCat.value, subCatText: els.subCat.options[els.subCat.selectedIndex].text, status: els.status.value, review: els.review.value,
                voteStatus: voteVal, voteReason: voteVal !== 0 ? voteReason : '', voteScore: voteVal !== 0 ? parseFloat(els.voteScoreInput.value) : undefined, isScoreIncomplete: isScoreIncomplete, isReviewIncomplete: isReviewIncomplete, scores: { ...activeScores }, 
                finalScore: els.finalScore.getAttribute('data-score') || els.finalScore.textContent, createdAt: finalCreatedAt, updatedAt: now, date: new Date(now).toLocaleDateString()
            };
            const { error } = await supabaseClient.from('records').upsert(rec);
            if (error) { console.error("保存失败", error); return showToast("❌ 保存至云端失败，请检查网络！"); }
            showToast(currentEditingId ? '✅ 修改已同步至云端' : '✅ 新作品已云端入库'); await window.syncFromCloud(); isRecordDirty = false; closeModal(); renderMainList();
        } finally { saveBtn.disabled = false; saveBtn.innerHTML = '保存评价入库'; saveBtn.style.opacity = '1'; saveBtn.style.cursor = 'pointer'; }
    };
    if (voteVal === 0 && (isScoreIncomplete || isReviewIncomplete)) { let msgArr = []; if (isScoreIncomplete) msgArr.push('部分小项未打分'); if (isReviewIncomplete) msgArr.push('未填写深度评语'); showConfirm('评价暂未完成', `系统检测到该作品【${msgArr.join('、')}】。\n是否先作为「待完善」记录暂存入库？`, async () => { await executeSave(); }, 'warning'); } 
    else { await executeSave(); }
};

els.delBtn.onclick = () => { showConfirm('删除确认', `确定要将《${els.workName.value}》彻底删除吗？此操作无法撤销。`, async () => { const { error } = await supabaseClient.from('records').delete().eq('id', currentEditingId); if (error) return showToast("❌ 云端删除失败！"); showToast('🗑️ 云端记录已彻底销毁'); await window.syncFromCloud(); isRecordDirty = false; closeModal(); renderMainList(); }, 'warning'); };

// ================= 系统设置与框架管理 =================
document.getElementById('openSettingsBtn').onclick = () => {
    schemaBuffer = JSON.parse(JSON.stringify(activeSchemas)); els.settingsModal.classList.add('active'); document.body.style.overflow = 'hidden'; els.editorCatSelect.innerHTML = '';
    Object.keys(categoryTree).filter(k=>k!=='all').forEach(mainK => { const optgroup = document.createElement('optgroup'); optgroup.label = categoryTree[mainK].name; Object.keys(categoryTree[mainK].subs).forEach(subK => optgroup.appendChild(new Option(categoryTree[mainK].subs[subK], subK))); els.editorCatSelect.appendChild(optgroup); });
    isSchemaDirty = false; renderSchemaEditor(); renderStatusManager(); renderVoteReasonsManager();
};
function closeSettingsModal() { if(isSchemaDirty) showConfirm('未保存警告', '你修改的评分细则尚未保存，确定要放弃修改吗？', async () => { els.settingsModal.classList.remove('active'); document.body.style.overflow = ''; isSchemaDirty = false; }, 'warning'); else { els.settingsModal.classList.remove('active'); document.body.style.overflow = ''; } }
document.getElementById('closeSettingsBtn').onclick = closeSettingsModal;
document.querySelectorAll('.setting-menu-item').forEach(item => { item.onclick = () => { document.querySelectorAll('.setting-menu-item').forEach(i => i.classList.remove('active')); document.querySelectorAll('.setting-section').forEach(s => s.classList.remove('active')); item.classList.add('active'); document.getElementById(item.dataset.target).classList.add('active'); }; });
els.themeSelect.onchange = (e) => { localStorage.setItem('themePref_v2', e.target.value); applyTheme(e.target.value); saveSettingsToCloud(); };
els.resetStatusBtn.onclick = () => { showConfirm('重置状态确认', '将清空所有自定义的状态标签，并恢复为系统初始设置。确定吗？', async () => { localStorage.removeItem('CustomStatuses_v2'); customStatuses = [...defaultStatuses]; saveSettingsToCloud(); renderStatusManager(); showToast('状态标签已恢复默认'); }); };
const finalOverlay = document.getElementById('finalConfirmOverlay'); document.getElementById('factoryResetBtn').onclick = () => { showConfirm('高危操作：清空全部数据', '将清空所有已保存的评价记录！操作极其危险，请谨慎确认。', async () => { finalOverlay.classList.add('active'); }, 'danger'); };
document.getElementById('finalCancelBtn').onclick = () => { finalOverlay.classList.remove('active'); }; document.getElementById('finalExportJsonBtn').onclick = () => { document.getElementById('exportJsonBtn').click(); showToast('✅ 抢救性备份已下载！'); };
document.getElementById('finalOkBtn').onclick = async () => {
    const btn = document.getElementById('finalOkBtn'); if (btn.disabled) return; btn.disabled = true; const oldText = btn.innerHTML; btn.innerHTML = '⏳ 正在抹除云端数据...'; btn.style.opacity = '0.7'; btn.style.cursor = 'wait';
    try { finalOverlay.classList.remove('active'); const { error } = await supabaseClient.from('records').delete().neq('id', '0'); if (error) return showToast('❌ 云端清空失败'); showToast('💥 云端数据已全部清空，迎来新生'); await window.syncFromCloud(); renderMainList(); } 
    finally { btn.disabled = false; btn.innerHTML = oldText; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
};
document.getElementById('resetSchemaBtn').onclick = () => { showConfirm('重置细则确认', '将清空所有自定义的评分维度，恢复为官方默认状态。确定吗？', async () => { localStorage.removeItem('CustomSchemas_v2'); activeSchemas = JSON.parse(JSON.stringify(defaultSchemas_v2)); if (schemaBuffer) schemaBuffer = JSON.parse(JSON.stringify(defaultSchemas_v2)); saveSettingsToCloud(); isSchemaDirty = false; renderSchemaEditor(); showToast('细则已恢复默认'); }); };
els.editorCatSelect.onchange = () => { if(isSchemaDirty) showConfirm('切换分类提示', '当前分类的修改未保存，切换将丢失修改。确定切换吗？', async () => { isSchemaDirty = false; renderSchemaEditor(); }, 'warning'); else renderSchemaEditor(); };
function renderSchemaEditor() {
    const catKey = els.editorCatSelect.value; const schema = schemaBuffer[catKey]; els.schemaEditor.innerHTML = '';
    schema.forEach((dim, dimIdx) => {
        let subsHtml = ''; dim.subs.forEach((sub, subIdx) => { subsHtml += `<div class="editor-sub-row draggable-item" draggable="true" ondragstart="handleDragStart(event, 'schema_sub', ${subIdx}, ${dimIdx})" ondragover="handleDragOver(event, 'schema_sub', ${dimIdx})" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, 'schema_sub', ${subIdx}, ${dimIdx})" ondragend="handleDragEnd(event)"><div class="drag-handle" title="按住拖拽排序">☰</div><input type="text" class="editor-sub-name-input" data-dim="${dimIdx}" data-sub="${subIdx}" data-type="name" value="${sub.name}" placeholder="小项名称"><input type="text" style="flex:1;" data-dim="${dimIdx}" data-sub="${subIdx}" data-type="desc" value="${sub.desc || ''}" placeholder="在这里输入问号悬浮释义..."><button class="btn-icon-del" style="font-size: 12px;" title="删除此小项" onclick="delSubItem('${catKey}', ${dimIdx}, ${subIdx})">✖</button></div>`; });
        els.schemaEditor.insertAdjacentHTML('beforeend', `<div class="editor-dim-card draggable-item" draggable="true" ondragstart="handleDragStart(event, 'schema_dim', ${dimIdx})" ondragover="handleDragOver(event, 'schema_dim')" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, 'schema_dim', ${dimIdx})" ondragend="handleDragEnd(event)"><div class="editor-dim-header"><div class="drag-handle" title="按住拖拽排序">☰</div><input type="text" style="flex:1; font-weight:bold; font-size:15px;" data-dim="${dimIdx}" data-type="dimName" value="${dim.name}"><div class="weight-input-wrapper"><span>权重</span><input type="number" class="editor-dim-weight-input" data-dim="${dimIdx}" data-type="weight" value="${Math.round(dim.weight * 100)}" min="0" max="100"><span>%</span></div><button class="btn-icon-del" style="font-size: 16px; margin-left: 5px;" title="删除此大类" onclick="delDimension('${catKey}', ${dimIdx})">✖</button></div><div>${subsHtml}</div><div class="editor-add-block" style="padding: 6px; margin: 10px 0 0 15px; font-size: 12px;" onclick="addSubItem('${catKey}', ${dimIdx})">+ 添加子项</div></div>`);
    });
    els.schemaEditor.insertAdjacentHTML('beforeend', `<div class="editor-add-block" onclick="addDimension('${catKey}')">+ 新增大评分维度</div>`);
    els.schemaEditor.querySelectorAll('input').forEach(input => { input.oninput = (e) => { isSchemaDirty = true; const d = e.target.dataset; const val = e.target.value; if(d.type === 'dimName') schema[d.dim].name = val; else if(d.type === 'weight') schema[d.dim].weight = parseInt(val) / 100; else if(d.type === 'name') schema[d.dim].subs[d.sub].name = val; else if(d.type === 'desc') schema[d.dim].subs[d.sub].desc = val; }; });
}

window.triggerSchemaReset = () => {
    const catKey = els.editorCatSelect.value; const catName = els.editorCatSelect.options[els.editorCatSelect.selectedIndex].text;
    showConfirm('重置确认', `确定要将【${catName}】的评分细则恢复为官方默认吗？此操作将立即覆盖并保存。`, async () => { activeSchemas[catKey] = JSON.parse(JSON.stringify(defaultSchemas_v2[catKey])); schemaBuffer[catKey] = JSON.parse(JSON.stringify(defaultSchemas_v2[catKey])); localStorage.setItem('CustomSchemas_v2', JSON.stringify(activeSchemas)); saveSettingsToCloud(); isSchemaDirty = false; renderSchemaEditor(); showToast(`已恢复【${catName}】的默认细则`); });
};
window.moveDimension = (cat, idx, dir) => { const schema = schemaBuffer[cat]; if (idx + dir < 0 || idx + dir >= schema.length) return; const temp = schema[idx]; schema[idx] = schema[idx+dir]; schema[idx+dir] = temp; isSchemaDirty = true; renderSchemaEditor(); };
window.delDimension = (cat, idx) => { if(schemaBuffer[cat].length <= 1) return showToast('至少保留一个大类'); schemaBuffer[cat].splice(idx, 1); isSchemaDirty = true; renderSchemaEditor(); showToast('大类已移除 (未保存前均可撤销)'); };
window.addDimension = (cat) => { schemaBuffer[cat].push({ id: 'dim_'+Date.now(), name: '新维度', weight: 0, subs: [{id: 'sub_'+Date.now(), name: '新子项', desc: ''}] }); isSchemaDirty = true; renderSchemaEditor(); };
window.moveSubItem = (cat, dimIdx, subIdx, dir) => { const subs = schemaBuffer[cat][dimIdx].subs; if (subIdx + dir < 0 || subIdx + dir >= subs.length) return; const temp = subs[subIdx]; subs[subIdx] = subs[subIdx+dir]; subs[subIdx+dir] = temp; isSchemaDirty = true; renderSchemaEditor(); };
window.delSubItem = (cat, dimIdx, subIdx) => { if(schemaBuffer[cat][dimIdx].subs.length <= 1) return showToast('至少保留一个子项'); schemaBuffer[cat][dimIdx].subs.splice(subIdx, 1); isSchemaDirty = true; renderSchemaEditor(); };
window.addSubItem = (cat, dimIdx) => { schemaBuffer[cat][dimIdx].subs.push({ id: 'sub_'+Date.now(), name: '新子项', desc: '' }); isSchemaDirty = true; renderSchemaEditor(); };
document.getElementById('saveSchemaBtn').onclick = () => {
    const catKey = els.editorCatSelect.value; const schema = schemaBuffer[catKey]; let weightSum = 0; schema.forEach(dim => weightSum += Math.round(dim.weight * 100));
    if (weightSum !== 100) return showToast(`⚠️ 权重总和必须为 100% (当前为 ${weightSum}%)`);
    activeSchemas = JSON.parse(JSON.stringify(schemaBuffer)); localStorage.setItem('CustomSchemas_v2', JSON.stringify(activeSchemas)); saveSettingsToCloud(false); isSchemaDirty = false; renderSchemaEditor();
};

// ================= 全局拖拽排序引擎 =================
let dragCtx = null; let dragScrollSpeed = 0; let dragScrollRAF = null;
const doDragScroll = () => { if (dragCtx && dragScrollSpeed !== 0) { const box = document.querySelector('.settings-content'); if (box) box.scrollTop += dragScrollSpeed; } if (dragCtx) dragScrollRAF = requestAnimationFrame(doDragScroll); };
window.handleDragStart = (e, type, idx, extra = null) => { e.stopPropagation(); dragCtx = { type, idx, extra }; const item = e.target.closest('.draggable-item'); setTimeout(() => { if(item) item.classList.add('dragging'); }, 0); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', ''); dragScrollSpeed = 0; if (!dragScrollRAF) dragScrollRAF = requestAnimationFrame(doDragScroll); };
window.handleDragOver = (e, type, extra = null) => { if (!dragCtx || dragCtx.type !== type || dragCtx.extra !== extra) return; e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'move'; document.querySelectorAll('.drop-over').forEach(el => el.classList.remove('drop-over')); const item = e.target.closest('.draggable-item'); if (item) item.classList.add('drop-over'); };
window.handleDragLeave = (e) => { e.stopPropagation(); };
window.handleDragEnd = (e) => { e.stopPropagation(); document.querySelectorAll('.draggable-item').forEach(el => el.classList.remove('dragging', 'drop-over')); dragCtx = null; cancelAnimationFrame(dragScrollRAF); dragScrollRAF = null; };
window.handleDrop = (e, type, toIdx, extra = null) => {
    if (!dragCtx || dragCtx.type !== type || dragCtx.extra !== extra) return; e.preventDefault(); e.stopPropagation(); document.querySelectorAll('.draggable-item').forEach(el => el.classList.remove('drop-over'));
    const fromIdx = dragCtx.idx; if (fromIdx === toIdx) { dragCtx = null; cancelAnimationFrame(dragScrollRAF); dragScrollRAF = null; return; }
    const moveArr = (arr, from, to) => { const item = arr.splice(from, 1)[0]; arr.splice(to, 0, item); };
    if (type === 'status') { moveArr(customStatuses, fromIdx, toIdx); localStorage.setItem('CustomStatuses_v2', JSON.stringify(customStatuses)); saveSettingsToCloud(); renderStatusManager(); } 
    else if (type === 'vote_approve') { moveArr(customVoteReasons.approve, fromIdx, toIdx); localStorage.setItem('CustomVoteReasons_v2', JSON.stringify(customVoteReasons)); saveSettingsToCloud(); renderVoteReasonsManager(); } 
    else if (type === 'vote_veto') { moveArr(customVoteReasons.veto, fromIdx, toIdx); localStorage.setItem('CustomVoteReasons_v2', JSON.stringify(customVoteReasons)); saveSettingsToCloud(); renderVoteReasonsManager(); } 
    else if (type === 'schema_dim') { const catKey = els.editorCatSelect.value; moveArr(schemaBuffer[catKey], fromIdx, toIdx); isSchemaDirty = true; renderSchemaEditor(); } 
    else if (type === 'schema_sub') { const catKey = els.editorCatSelect.value; moveArr(schemaBuffer[catKey][extra].subs, fromIdx, toIdx); isSchemaDirty = true; renderSchemaEditor(); }
    dragCtx = null; cancelAnimationFrame(dragScrollRAF); dragScrollRAF = null;
};
window.addEventListener('dragover', (e) => { if (!dragCtx) return; const box = document.querySelector('.settings-content'); if (!box) return; const rect = box.getBoundingClientRect(); const buffer = 160; if (e.clientY > 0 && e.clientY < rect.top + buffer) dragScrollSpeed = -Math.min(35, (buffer - (e.clientY - rect.top)) * 0.5); else if (e.clientY > 0 && e.clientY > rect.bottom - buffer) dragScrollSpeed = Math.min(35, (buffer - (rect.bottom - e.clientY)) * 0.5); else dragScrollSpeed = 0; }, true);

function renderStatusManager() {
    els.statusList.innerHTML = '';
    customStatuses.forEach((status, idx) => {
        const div = document.createElement('div'); div.className = 'status-item draggable-item'; div.draggable = true; div.ondragstart = (e) => handleDragStart(e, 'status', idx); div.ondragover = (e) => handleDragOver(e, 'status'); div.ondragleave = handleDragLeave; div.ondrop = (e) => handleDrop(e, 'status', idx); div.ondragend = handleDragEnd;
        div.innerHTML = `<div style="display:flex; align-items:center; gap:5px;"><div class="drag-handle" title="按住拖拽排序">☰</div><span>${status}</span></div><button class="btn-icon-del" onclick="delStatus(${idx})">✖</button>`; els.statusList.appendChild(div);
    });
    const resetBtn = document.createElement('button'); resetBtn.className = 'btn-danger-outline'; resetBtn.style.cssText = "width:100%; margin-top:20px; border-style:dashed;"; resetBtn.textContent = "⚠️ 恢复默认状态列表"; resetBtn.onclick = () => els.resetStatusBtn.click(); els.statusList.appendChild(resetBtn);
}
window.moveStatus = (idx, dir) => { if (idx + dir < 0 || idx + dir >= customStatuses.length) return; const temp = customStatuses[idx]; customStatuses[idx] = customStatuses[idx+dir]; customStatuses[idx+dir] = temp; localStorage.setItem('CustomStatuses_v2', JSON.stringify(customStatuses)); saveSettingsToCloud(); renderStatusManager(); };
document.getElementById('addStatusBtn').onclick = () => { const input = document.getElementById('newStatusInput'); const val = input.value.trim(); if(!val) return; if(customStatuses.includes(val)) return showToast('该状态已存在'); customStatuses.push(val); localStorage.setItem('CustomStatuses_v2', JSON.stringify(customStatuses)); saveSettingsToCloud(); input.value = ''; renderStatusManager(); showToast('状态已添加'); };
window.delStatus = function(idx) { if(customStatuses.length <= 1) return showToast('至少保留一个状态标签'); customStatuses.splice(idx, 1); localStorage.setItem('CustomStatuses_v2', JSON.stringify(customStatuses)); saveSettingsToCloud(); renderStatusManager(); }

function formatPreciseTime(rec) { const ts = parseInt(rec.createdAt || rec.id); if (ts && !isNaN(ts) && ts > 1000000000000) { const d = new Date(ts); const pad = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; } return rec.date; }
function getExportFilename(ext) { const now = new Date(); const pad = n => String(n).padStart(2, '0'); const timeStr = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`; return `牛人影音志_v${APP_VERSION}_${timeStr}.${ext}`; }
function generateExportData() { const records = window.cloudRecords; if(records.length === 0) { showToast('暂无数据可导出'); return null; } return records; }

document.getElementById('exportCsvBtn').onclick = () => {
    const records = generateExportData(); if(!records) return; let csv = "data:text/csv;charset=utf-8,\uFEFF"; csv += "大类,细分分类,作品名称,状态,系统得分,豆瓣星级,Bangumi评级,一票赞成,一票否决,一票原因,待完善标签,详细评分数据,评语,添加日期\n";
    records.forEach(r => { 
        const mainCatName = categoryTree[r.mainCat] ? categoryTree[r.mainCat].name : r.mainCat; let details = [];
        if(activeSchemas[r.subCat]) { activeSchemas[r.subCat].forEach(dim => { dim.subs.forEach(sub => { if(r.scores && r.scores[sub.id] !== undefined) details.push(`${sub.name}:${r.scores[sub.id]}`); }); }); }
        const hasScore = r.finalScore > 0 || r.isVeto || r.voteStatus === -1; const dStar = hasScore ? renderStars(r.finalScore) : "未评"; const bLabel = hasScore ? getBangumiLabel(r.finalScore, true) : "未评";
        const isProtectStr = (r.voteStatus === 1 || r.isProtect) ? "是" : "否"; const isVetoStr = (r.voteStatus === -1 || r.isVeto) ? "是" : "否"; let incompleteStr = []; if (r.isScoreIncomplete) incompleteStr.push("缺分数"); if (r.isReviewIncomplete) incompleteStr.push("无评语");
        let safeReview = (r.review || '').replace(/"/g, '""').replace(/\n/g, ' '); csv += `"${mainCatName}","${r.subCatText}","${r.name}","${r.status}",${r.finalScore},"${dStar}","${bLabel}",${isProtectStr},${isVetoStr},"${r.voteReason || ''}","${incompleteStr.join('|')}","${details.join(' | ')}","${safeReview}","${formatPreciseTime(r)}"\n`; 
    }); triggerDownload(csv, getExportFilename('csv'));
};
document.getElementById('exportTxtBtn').onclick = () => {
    const records = generateExportData(); if(!records) return; let txtStr = `=================================================\n 牛人影音志 档案备份 (v${APP_VERSION})\n 导出时间: ${new Date().toLocaleString()}\n 共计收录: ${records.length} 部作品\n=================================================\n\n`;
    records.forEach(r => {
        const mainCatName = categoryTree[r.mainCat] ? categoryTree[r.mainCat].name : r.mainCat; txtStr += `【 ${r.name} 】\n> 分类：${mainCatName} - ${r.subCatText}\n> 状态：${r.status}  |  入库时间：${formatPreciseTime(r)}\n`;
        const hasScore = r.finalScore > 0 || r.isVeto || r.voteStatus === -1; if (hasScore) txtStr += `> 综合得分：${r.finalScore}  (豆瓣: ${renderStars(r.finalScore)} | Bangumi: ${getBangumiLabel(r.finalScore, true)})\n`; else txtStr += `> 综合得分：未评级\n`;
        if (r.voteStatus === 1 || r.isProtect) txtStr += `> 特殊判定：🌟 一票赞成 (${r.voteReason || '无'})\n`; if (r.voteStatus === -1 || r.isVeto) txtStr += `> 特殊判定：💣 一票否决 (${r.voteReason || '无'})\n`;
        let details = []; if(activeSchemas[r.subCat]) { activeSchemas[r.subCat].forEach(dim => { dim.subs.forEach(sub => { if(r.scores && r.scores[sub.id] !== undefined) details.push(`${sub.name}:${r.scores[sub.id]}`); }); }); }
        if (details.length > 0) txtStr += `> 小项明细：${details.join(' | ')}\n`; txtStr += `> 深度剖析：\n${r.review || '暂无详细评语...'}\n-------------------------------------------------\n\n`;
    }); const txtData = "data:text/plain;charset=utf-8,\uFEFF" + encodeURIComponent(txtStr); triggerDownload(txtData, getExportFilename('txt'));
};
document.getElementById('exportJsonBtn').onclick = () => {
    const records = window.cloudRecords; 
    const settings = { customSchemas: activeSchemas, customStatuses: customStatuses, customVoteReasons: customVoteReasons, theme: localStorage.getItem('themePref_v2') || 'auto', displayMode: localStorage.getItem('displayModePref_v2') || 'system', timeDisplayMode: localStorage.getItem('timeDisplayPref_v2') || 'updated', confirmDelayPrefs: JSON.parse(localStorage.getItem('confirmDelayPrefs_v2') || '{"danger": 3, "warning": 3}') };
    const fullArchive = { meta: { app: "NiurenMediaLog", version: APP_VERSION, exportTime: Date.now() }, settings: settings, data: records };
    const jsonStr = JSON.stringify(fullArchive, null, 2); const dataUrl = "data:application/json;charset=utf-8,\uFEFF" + encodeURIComponent(jsonStr); triggerDownload(dataUrl, getExportFilename('json'));
};

document.getElementById('importJsonFile').addEventListener('change', function(e) {
    const file = e.target.files[0]; if (!file) return; const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            if (!importedData.meta || importedData.meta.app !== "NiurenMediaLog") { e.target.value = ''; return showToast('❌ 导入失败：无法识别的牛人影音志存档格式'); }
            showConfirm('数据覆盖警告', `识别到来自 v${importedData.meta.version} 版本的存档。导入将直接覆盖云端所有的评价记录和自定义设置。确定要继续吗？`, async () => {
                if (importedData.data && importedData.data.length > 0) { const { error } = await supabaseClient.from('records').upsert(importedData.data); if(error) return showToast('❌ 云端数据还原失败'); }
                if (importedData.settings) {
                    if (importedData.settings.customSchemas) { activeSchemas = importedData.settings.customSchemas; localStorage.setItem('CustomSchemas_v2', JSON.stringify(activeSchemas)); }
                    if (importedData.settings.customStatuses) { customStatuses = importedData.settings.customStatuses; localStorage.setItem('CustomStatuses_v2', JSON.stringify(customStatuses)); }
                    if (importedData.settings.customVoteReasons) { customVoteReasons = importedData.settings.customVoteReasons; localStorage.setItem('CustomVoteReasons_v2', JSON.stringify(customVoteReasons)); }
                    if (importedData.settings.theme) { localStorage.setItem('themePref_v2', importedData.settings.theme); els.themeSelect.value = importedData.settings.theme; applyTheme(importedData.settings.theme); }
                    if (importedData.settings.displayMode) { localStorage.setItem('displayModePref_v2', importedData.settings.displayMode); els.displayModeSelect.value = importedData.settings.displayMode; }
                    if (importedData.settings.timeDisplayMode) { localStorage.setItem('timeDisplayPref_v2', importedData.settings.timeDisplayMode); if (document.getElementById('timeDisplayModeSelect')) { document.getElementById('timeDisplayModeSelect').value = importedData.settings.timeDisplayMode; } }
                    if (importedData.settings.confirmDelayPrefs) { localStorage.setItem('confirmDelayPrefs_v2', JSON.stringify(importedData.settings.confirmDelayPrefs)); document.getElementById('delayDangerInput').value = importedData.settings.confirmDelayPrefs.danger; document.getElementById('delayWarningInput').value = importedData.settings.confirmDelayPrefs.warning; }
                    await saveSettingsToCloud(true); // 将导入的设置推向云端
                }
                showToast('✅ 云端存档导入成功！正在重载数据...'); e.target.value = ''; 
                await window.syncFromCloud(); renderMainList(); renderStatusManager(); renderVoteReasonsManager(); 
                if (els.settingsModal.classList.contains('active')) { schemaBuffer = JSON.parse(JSON.stringify(activeSchemas)); renderSchemaEditor(); }
            }, 'danger'); 
        } catch (err) { showToast('❌ 读取失败：JSON 文件解析异常或已损坏'); console.error(err); e.target.value = ''; }
    };
    reader.readAsText(file);
});
function triggerDownload(dataUrl, filename) { const link = document.createElement("a"); link.href = dataUrl; link.download = filename; document.body.appendChild(link); link.click(); document.body.removeChild(link); showToast(`成功导出：${filename}`); }

const tutData = [ { img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80', title: '欢迎来到牛人影音志', desc: '告别一拍脑袋的打分！在这里，我们用十余种专属分类、几十套精细的评价维度，为你建立最严谨的私人精神食粮档案馆。' }, { img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', title: '10分制加权算法与一票机制', desc: '每一个细分项都将参与最终加权计算。鼠标悬浮在 ❓ 号上可查看释义。遇到意义非凡或触碰底线的作品？果断使用“白月光”与“踩雷”一票机制。' }, { img: 'https://images.unsplash.com/photo-1588421357574-87938a86fa28?auto=format&fit=crop&w=600&q=80', title: '属于你的私人定制', desc: '在【系统设置】中，你可以自由修改每一个评分维度、权重、释义，甚至自定义“搁置”、“二刷中”等作品状态，打造你的终极评价体系。' } ];
let tutIndex = 0;
function updateTutorial() { document.getElementById('tutImg').src = tutData[tutIndex].img; document.getElementById('tutTitle').textContent = tutData[tutIndex].title; document.getElementById('tutDesc').textContent = tutData[tutIndex].desc; document.querySelectorAll('.tut-dot').forEach((d, i) => { d.className = i === tutIndex ? 'tut-dot active' : 'tut-dot'; }); document.getElementById('tutPrevBtn').style.opacity = tutIndex === 0 ? '0' : '1'; document.getElementById('tutPrevBtn').style.pointerEvents = tutIndex === 0 ? 'none' : 'auto'; document.getElementById('tutNextBtn').textContent = tutIndex === tutData.length - 1 ? '开始使用' : '下一步'; }
function openTutorial() { tutIndex = 0; updateTutorial(); document.getElementById('tutorialOverlay').classList.add('active'); }
document.getElementById('tutPrevBtn').onclick = () => { if(tutIndex > 0) { tutIndex--; updateTutorial(); } }; document.getElementById('tutNextBtn').onclick = () => { if(tutIndex < tutData.length - 1) { tutIndex++; updateTutorial(); } else { document.getElementById('tutorialOverlay').classList.remove('active'); localStorage.setItem('hasSeenTutorial_v2', 'true'); } }; document.getElementById('reopenTutorialBtn').onclick = () => { els.settingsModal.classList.remove('active'); document.body.style.overflow = ''; openTutorial(); };

els.modal.addEventListener('click', (e) => { if (e.target === els.modal) closeModal(); }); els.settingsModal.addEventListener('click', (e) => { if (e.target === els.settingsModal) closeSettingsModal(); }); const tutOverlayEl = document.getElementById('tutorialOverlay'); tutOverlayEl.addEventListener('click', (e) => { if (e.target === tutOverlayEl) { tutOverlayEl.classList.remove('active'); localStorage.setItem('hasSeenTutorial_v2', 'true'); } }); document.getElementById('confirmOverlay').addEventListener('click', (e) => { if (e.target === document.getElementById('confirmOverlay')) { document.getElementById('confirmCancelBtn').click(); } }); document.getElementById('finalConfirmOverlay').addEventListener('click', (e) => { if (e.target === document.getElementById('finalConfirmOverlay')) { document.getElementById('finalCancelBtn').click(); } });
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.getElementById('zenOverlay').classList.contains('active')) { closeZenMode(); return; }
        if (document.getElementById('finalConfirmOverlay').classList.contains('active')) { document.getElementById('finalCancelBtn').click(); return; }
        if (document.getElementById('confirmOverlay').classList.contains('active')) { document.getElementById('confirmCancelBtn').click(); return; }
        if (tutOverlayEl.classList.contains('active')) { tutOverlayEl.classList.remove('active'); localStorage.setItem('hasSeenTutorial_v2', 'true'); return; }
        if (els.settingsModal.classList.contains('active')) { closeSettingsModal(); return; }
        if (els.modal.classList.contains('active')) { closeModal(); return; }
        if (document.getElementById('dashboardModal').classList.contains('active')) { document.getElementById('dashboardModal').classList.remove('active'); document.body.style.overflow = ''; return; }
    }
});
document.getElementById('dashboardModal').addEventListener('click', (e) => { if (e.target === document.getElementById('dashboardModal')) { document.getElementById('dashboardModal').classList.remove('active'); document.body.style.overflow = ''; } });

// ================= 数据洞察看板核心引擎 =================
let dashCatChartInst = null; let dashScoreChartInst = null;
document.getElementById('openDashboardBtn').onclick = () => { document.getElementById('dashboardModal').classList.add('active'); document.body.style.overflow = 'hidden'; renderDashboardData(); };
document.getElementById('closeDashboardBtn').onclick = () => { document.getElementById('dashboardModal').classList.remove('active'); document.body.style.overflow = ''; };

function renderDashboardData() {
    const records = window.cloudRecords; 
    document.getElementById('dashTotal').textContent = records.length; const scoredRecs = records.filter(r => (parseFloat(r.finalScore) > 0 || r.voteStatus !== 0) && !r.isScoreIncomplete); const avg = scoredRecs.length ? (scoredRecs.reduce((sum, r) => sum + parseFloat(r.finalScore), 0) / scoredRecs.length).toFixed(1) : '0.0'; document.getElementById('dashAvgScore').textContent = avg; document.getElementById('dashApprove').textContent = records.filter(r => r.voteStatus === 1).length; document.getElementById('dashVeto').textContent = records.filter(r => r.voteStatus === -1).length;
    let mostFreqScore = '暂无'; if (scoredRecs.length > 0) { const scoreCounts = {}; scoredRecs.forEach(r => { const s = parseFloat(r.finalScore).toFixed(1); scoreCounts[s] = (scoreCounts[s] || 0) + 1; }); mostFreqScore = Object.keys(scoreCounts).reduce((a, b) => scoreCounts[a] > scoreCounts[b] ? a : b); } document.getElementById('dashMostFreqScore').textContent = mostFreqScore;
    if (records.length === 0) return; 
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'; const textColor = isDark ? '#e2e8f0' : '#2c3e50'; const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const catCounts = {}; records.forEach(r => { const name = categoryTree[r.mainCat] ? categoryTree[r.mainCat].name : '其他'; catCounts[name] = (catCounts[name] || 0) + 1; });
    if(dashCatChartInst) dashCatChartInst.destroy();
    dashCatChartInst = new Chart(document.getElementById('dashCatChart').getContext('2d'), { type: 'doughnut', data: { labels: Object.keys(catCounts), datasets: [{ data: Object.values(catCounts), backgroundColor: ['#f09199', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6', '#e67e22'], borderWidth: isDark ? 2 : 0, borderColor: isDark ? '#1e1e1e' : '#fff' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: textColor, font: {size: 11} } } } } });
    const scoreBins = {'9-10分(神作)':0, '8-9分(优秀)':0, '7-8分(良好)':0, '6-7分(及格)':0, '6分以下(雷区)':0};
    scoredRecs.forEach(r => { const s = parseFloat(r.finalScore); if(s >= 9) scoreBins['9-10分(神作)']++; else if(s >= 8) scoreBins['8-9分(优秀)']++; else if(s >= 7) scoreBins['7-8分(良好)']++; else if(s >= 6) scoreBins['6-7分(及格)']++; else scoreBins['6分以下(雷区)']++; });
    if(dashScoreChartInst) dashScoreChartInst.destroy();
    dashScoreChartInst = new Chart(document.getElementById('dashScoreChart').getContext('2d'), { type: 'bar', data: { labels: Object.keys(scoreBins), datasets: [{ label: '作品数量', data: Object.values(scoreBins), backgroundColor: ['#f09199', '#3498db', '#f1c40f', '#bdc3c7', '#e74c3c'], borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: textColor }, grid: { color: gridColor } }, x: { ticks: { color: textColor, font: {size: 11} }, grid: { display: false } } } } });
    const sortedRecs = [...scoredRecs].sort((a,b) => parseFloat(b.finalScore) - parseFloat(a.finalScore)); const top3 = sortedRecs.slice(0, 3); const bottom3 = [...sortedRecs].reverse().slice(0, 3);
    const renderHof = (arr, containerId, defaultColor) => { const html = arr.length > 0 ? arr.map(r => { let color = defaultColor; if(r.voteStatus === 1) color = 'var(--warning)'; if(r.voteStatus === -1) color = 'var(--danger)'; return `<div class="hof-item"><span class="hof-name" title="${r.name}">${r.name}</span><span class="hof-score" style="color: ${color};">${parseFloat(r.finalScore).toFixed(1)}</span></div>`; }).join('') : '<div style="text-align:center; color:var(--text-muted); padding: 10px 0;">暂无足够数据</div>'; document.getElementById(containerId).innerHTML = html; };
    renderHof(top3, 'hofTopList', '#f39c12'); renderHof(bottom3, 'hofBottomList', '#e74c3c');
}

window.addEventListener('beforeunload', (e) => { if (isRecordDirty || isSchemaDirty) { e.preventDefault(); e.returnValue = ''; } });

// 🚀 核心革新：加载时云端配置全面覆盖本地
async function init() {
    // 1. 强制拉取云端数据与配置
    await window.syncFromCloud(true);
    
    // 2. 双端漫游引擎：处理全局配置同步
    if (window.cloudSettings && Object.keys(window.cloudSettings).length > 0) {
        // 如果云端有配置，无条件覆盖本地并更新内存
        const s = window.cloudSettings;
        if (s.customSchemas) { activeSchemas = s.customSchemas; localStorage.setItem('CustomSchemas_v2', JSON.stringify(activeSchemas)); }
        if (s.customStatuses) { customStatuses = s.customStatuses; localStorage.setItem('CustomStatuses_v2', JSON.stringify(customStatuses)); }
        if (s.customVoteReasons) { customVoteReasons = s.customVoteReasons; localStorage.setItem('CustomVoteReasons_v2', JSON.stringify(customVoteReasons)); }
        if (s.theme) localStorage.setItem('themePref_v2', s.theme);
        if (s.displayMode) localStorage.setItem('displayModePref_v2', s.displayMode);
        if (s.timeDisplayMode) localStorage.setItem('timeDisplayPref_v2', s.timeDisplayMode);
        if (s.confirmDelayPrefs) localStorage.setItem('confirmDelayPrefs_v2', JSON.stringify(s.confirmDelayPrefs));
    } else {
        // 如果云端为空 (第一次建表)，将当前 PC 的设置推送上去建立云端档案
        await saveSettingsToCloud(true);
    }

    // 3. 应用渲染 UI 状态
    const savedTheme = localStorage.getItem('themePref_v2') || 'auto'; els.themeSelect.value = savedTheme; applyTheme(savedTheme);
    const savedDisplayMode = localStorage.getItem('displayModePref_v2') || 'system'; els.displayModeSelect.value = savedDisplayMode;
    const savedTimePref = localStorage.getItem('timeDisplayPref_v2') || 'updated'; document.getElementById('timeDisplayModeSelect').value = savedTimePref;
    
    document.querySelectorAll('.versionText').forEach(el => el.textContent = APP_VERSION); renderChangelog();
    
    const delayPrefs = JSON.parse(localStorage.getItem('confirmDelayPrefs_v2') || '{"danger": 3, "warning": 3}');
    document.getElementById('delayDangerInput').value = delayPrefs.danger; document.getElementById('delayWarningInput').value = delayPrefs.warning;
    const updateDelayPrefs = () => { localStorage.setItem('confirmDelayPrefs_v2', JSON.stringify({ danger: parseInt(document.getElementById('delayDangerInput').value) || 0, warning: parseInt(document.getElementById('delayWarningInput').value) || 0 })); saveSettingsToCloud(true); };
    document.getElementById('delayDangerInput').addEventListener('change', updateDelayPrefs); document.getElementById('delayWarningInput').addEventListener('change', updateDelayPrefs);

    initNavTabs(); initCascader(); renderMainList();
    if(!localStorage.getItem('hasSeenTutorial_v2')) setTimeout(openTutorial, 500);
    initHoverPreview();
}

init();