// 🚀 牛人影音志 v1.3.0 - 满血云端版

// 🌟 1. 唤醒 Supabase 云端心脏
const SUPABASE_URL = '在这里填入你的_Project_URL'; 
const SUPABASE_ANON_KEY = '在这里填入你的_anon_public_key'; 
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================= 系统版本与更新日志配置中心 =================
const APP_CHANGELOG = [
    {
        version: '1.3.0',
        date: '2026/3/2',
        changes: [
            '[✨里程碑] 彻底云端化跃升：系统正式接入 Supabase 云端数据库！告别本地浏览器缓存，实现多设备、跨平台的实时无缝同步。',
            '[新特性] 引入全局云端状态引擎：所有增删改操作均直连云端，网页初始化及每次操作后自动静默拉取最新数据。',
            '[优化] 全局网络防抖与优雅加载：针对云端延迟，为“保存”、“删除”、“清空”等核心按钮引入异步防触控锁与 Loading 动效，彻底杜绝因网络延迟导致的连续点击与数据重复。',
            '[优化] 强化云端交互反馈：网页启动时及网络操作后增加明确的 Toast 提示，附带精准时间戳，时刻掌握数据同步状态。'
        ]
    },
    {
        version: '1.2.1',
        date: '2026/3/2',
        changes: [
            '[✨里程碑] 磅礴上线「个人数据洞察看板」：内置 Chart.js 双引擎渲染，支持实时呈现【领域涉猎饼图】、【全站评分正态分布曲线】等核心参数。',
            '[新特性] 生态闭环：系统设置新增「导入/导出 JSON 存档」功能。一键无损还原全量打分数据、专属分类框架与界面偏好。',
            '[新特性] 独创「沉浸式全屏写作 (Zen Mode)」：在评语栏点击开启全屏打字机模式。左侧智能停靠“上下文面板”，右侧提供无干扰广阔写作区。',
            '[新特性] 引入“时空双轴”管理系统：评价记录现已区分「创建时间」与「修改时间」。',
            '[优化] 交互大升级：引入自主研发的原生 HTML5 拖拽引擎，全面支持丝滑的拖拽重排。'
        ]
    },
    {
        version: '1.2.0',
        changes: [
            '[新特性] 引入“灵动预览”机制：首页卡片悬浮 0.5s 即可自动查看多维小分细则。',
            '[新特性] 评分面板大类显分：修改评价时，各核心大类标题旁实时显示当前的平均得分。',
        ]
    },
    {
        version: '1.1.0',
        changes: [
            '重构一票机制，引入左右滑块交互，强制要求填写判定原因。',
            '新增首页全局搜索，支持作品名、评语及状态标签的多维检索。'
        ]
    }
];

const APP_VERSION = APP_CHANGELOG[0].version;

// ================= 核心数据字典 =================
const categoryTree = {
    'all': { name: '全部记录', subs: {} },
    'acg': { name: '二次元 / ACG', subs: { 'anime': '番剧 / 动画', 'vn': 'Galgame', 'game': '游戏', 'manga': '漫画 / 轻小说', 'acg_music': 'ACG 音乐' } },
    'live_action': { name: '三次元影视', subs: { 'movie': '电影', 'tv': '电视剧', 'doc': '纪录片' } },
    'literature': { name: '文学与阅读', subs: { 'novel': '长/中篇小说', 'prose': '散文 / 随笔', 'nonfic': '社科 / 纪实', 'poetry': '诗歌 / 戏剧' } },
    'art_audio': { name: '艺术与泛听觉', subs: { 'artbook': '摄影集 / 画册', 'podcast': '泛音乐 / 播客' } }
};

const defaultSchemas_v2 = {
  'anime': [
    { id: 'an_sc', name: '剧本与叙事', weight: 0.30, subs: [{id:'ans1', name:'主线架构', desc:'故事主干的完整性与逻辑框架'}, {id:'ans2', name:'叙事节奏', desc:'情节推进的流畅度与起伏把控'}, {id:'ans3', name:'伏笔回收', desc:'设定的闭环与结局收束完整度'}] },
    { id: 'an_ch', name: '角色塑造', weight: 0.25, subs: [{id:'anc1', name:'人设辨识度', desc:'角色属性、外貌与记忆点'}, {id:'anc2', name:'成长弧光', desc:'角色经历事件后的转变与发展'}, {id:'anc3', name:'动机与情感共鸣', desc:'行为逻辑是否足以打动人心'}] },
    { id: 'an_vi', name: '作画与演出', weight: 0.20, subs: [{id:'anv1', name:'分镜张力', desc:'镜头语言与关键画面的冲击力'}, {id:'anv2', name:'动作/日常流畅度', desc:'作画张数与人物形体崩坏控制'}, {id:'anv3', name:'场景与光影美术', desc:'背景绘制与色彩传递的情绪'}] },
    { id: 'an_au', name: '声乐表现', weight: 0.15, subs: [{id:'ana1', name:'CV契合度', desc:'声优声线与角色贴合度及表现力'}, {id:'ana2', name:'配乐渲染力', desc:'BGM切入时机与氛围感染力'}, {id:'ana3', name:'音效细节', desc:'环境音、战斗音效的真实与质感'}] },
    { id: 'an_th', name: '内核与余韵', weight: 0.10, subs: [{id:'ant1', name:'核心探讨', desc:'作品传达的深层主旨与思想'}, {id:'ant2', name:'结局收束', desc:'落幕时的处理手法'}, {id:'ant3', name:'观后长尾回味', desc:'看完后引发的持续思考或感动'}] }
  ],
  'vn': [
    { id: 'vn_sc', name: '文本与剧本', weight: 0.30, subs: [{id:'vns1', name:'日常氛围感', desc:'日常互动的趣味性与心流体验'}, {id:'vns2', name:'主线悬念/逻辑', desc:'核心剧情的悬念设置与合理性'}, {id:'vns3', name:'多线剧本收束', desc:'各分支路线质量及真结局体验'}] },
    { id: 'vn_ch', name: '角色与羁绊', weight: 0.25, subs: [{id:'vnc1', name:'个人线深度', desc:'单线对角色内心的挖掘程度'}, {id:'vnc2', name:'互动化学反应', desc:'主角与攻略对象间的CP感与火花'}, {id:'vnc3', name:'萌点与反差构建', desc:'角色属性设定的独特吸引力'}] },
    { id: 'vn_sy', name: '系统与交互', weight: 0.15, subs: [{id:'vny1', name:'UI美学设计', desc:'界面的视觉舒适度与风格统一'}, {id:'vny2', name:'Skip/Log便捷度', desc:'快进、回看、存档机制的流畅性'}, {id:'vny3', name:'自定义自由度', desc:'按键、独立音量等设置的详尽度'}] },
    { id: 'vn_vi', name: '美术视效', weight: 0.15, subs: [{id:'vnv1', name:'立绘精细度', desc:'人体比例、服饰细节与表情差分'}, {id:'vnv2', name:'CG构图与差分', desc:'关键节点CG的张力与变化丰富度'}, {id:'vnv3', name:'画面演出效果', desc:'特效、震屏与静态画面的动态感'}] },
    { id: 'vn_au', name: '音声沉浸', weight: 0.15, subs: [{id:'vna1', name:'CV表现力', desc:'语气生动度、情感爆发与娇喘等'}, {id:'vna2', name:'场景环境音', desc:'提升沉浸感的拟音(风雨/脚步等)'}, {id:'vna3', name:'BGM契合度', desc:'配乐对当前文本情绪的精准烘托'}] }
  ],
  'game': [
    { id: 'ga_gp', name: '核心玩法', weight: 0.35, subs: [{id:'gag1', name:'机制深度', desc:'系统玩法的可挖掘空间与策略性'}, {id:'gag2', name:'交互反馈/打击感', desc:'操作响应、物理反馈与手柄震动'}, {id:'gag3', name:'难度与成长曲线', desc:'挑战难度的合理递进与奖励机制'}] },
    { id: 'ga_wd', name: '世界与关卡', weight: 0.25, subs: [{id:'gaw1', name:'箱庭/开放探索', desc:'地图设计的精妙程度与探索欲'}, {id:'gaw2', name:'地图引导设计', desc:'任务、路标与解谜的自然引导'}, {id:'gaw3', name:'场景环境叙事', desc:'通过场景物件与碎片传达的碎片故事'}] },
    { id: 'ga_sc', name: '剧情与演出', weight: 0.20, subs: [{id:'gas1', name:'世界观建构', desc:'背景设定的吸引力与逻辑自洽'}, {id:'gas2', name:'过场演出张力', desc:'即时演算演出的电影感与运镜'}, {id:'gas3', name:'文本对白质量', desc:'台词的生动性与人物配音文本'}] },
    { id: 'ga_te', name: '视听与技术', weight: 0.20, subs: [{id:'gat1', name:'画面精度与优化', desc:'贴图材质、光追效果与帧数稳定性'}, {id:'gat2', name:'动作捕捉/渲染', desc:'人物动作自然度与面部表情'}, {id:'gat3', name:'原声与空间音效', desc:'OST质量与3D环境音响定位'}] }
  ],
  'manga': [
    { id: 'ma_vi', name: '分镜与画工', weight: 0.35, subs: [{id:'mav1', name:'画面表现力', desc:'线条、网点与大场面的震撼感'}, {id:'mav2', name:'分镜流畅度/视导', desc:'阅读视线引导与动作的连贯性'}, {id:'mav3', name:'人体与透视构图', desc:'基础画功、人体结构与特殊透视'}] },
    { id: 'ma_sc', name: '剧本结构', weight: 0.30, subs: [{id:'mas1', name:'篇章连贯性', desc:'长篇连载时的剧情衔接与规划'}, {id:'mas2', name:'核心脑洞/设定', desc:'题材与点子的新颖程度'}, {id:'mas3', name:'叙事节奏把控', desc:'水剧情程度与高潮爆发点的铺垫'}] },
    { id: 'ma_ch', name: '角色塑造', weight: 0.20, subs: [{id:'mac1', name:'性格立体度', desc:'角色的多面性与非脸谱化'}, {id:'mac2', name:'行为逻辑合理性', desc:'角色的决策是否符合其设定'}, {id:'mac3', name:'群像关系网', desc:'配角塑造与角色间的互动张力'}] },
    { id: 'ma_th', name: '思想内核', weight: 0.15, subs: [{id:'mat1', name:'主题挖掘深度', desc:'作品试图探讨的深层社会/人性议题'}, {id:'mat2', name:'价值观表达', desc:'作者通过故事传递的态度'}, {id:'mat3', name:'画面留白与隐喻', desc:'非文字表达的隐喻与艺术性'}] }
  ],
  'acg_music': [
    { id: 'mu_me', name: '编曲与旋律', weight: 0.35, subs: [{id:'mum1', name:'旋律记忆点', desc:'主旋律是否抓耳、有传唱度'}, {id:'mum2', name:'乐器编排与层次', desc:'配器的丰富度与声部交织的精妙'}, {id:'mum3', name:'和声走向设计', desc:'和弦编排的创新与情绪推动力'}] },
    { id: 'mu_vo', name: '人声与演奏', weight: 0.30, subs: [{id:'muv1', name:'情感爆发/感染力', desc:'歌手/演奏者倾注的情感浓度'}, {id:'muv2', name:'技巧运用', desc:'转音、颤音、高低音域的驾驭'}, {id:'muv3', name:'音色特质辨识度', desc:'嗓音或主奏乐器的独特个性'}] },
    { id: 'mu_ly', name: '词作与意境', weight: 0.20, subs: [{id:'mul1', name:'遣词造句美感', desc:'歌词的文学性与修辞手法'}, {id:'mul2', name:'原作主题契合度', desc:'作为OST/OP时与作品主题的贴合'}, {id:'mul3', name:'意象与画面构建', desc:'听感带来的画面联想与意境'}] },
    { id: 'mu_mi', name: '工程与混音', weight: 0.15, subs: [{id:'mui1', name:'声场定位与宽阔度', desc:'混音营造的立体感与空间感'}, {id:'mui2', name:'频段均衡', desc:'高、中、低频的清晰分离与饱满'}, {id:'mui3', name:'动态范围控制', desc:'响度控制与细腻的强弱对比'}] }
  ],
  'movie': [
    { id: 'mo_sc', name: '剧本与结构', weight: 0.30, subs: [{id:'mos1', name:'叙事诡计/结构', desc:'剧作结构的巧妙性(如倒叙、环形等)'}, {id:'mos2', name:'多线交织严密性', desc:'复杂线索的收束与逻辑漏洞控制'}, {id:'mos3', name:'台词文本张力', desc:'对白的文学性、潜台词与戏剧冲突'}] },
    { id: 'mo_vi', name: '视听语言', weight: 0.30, subs: [{id:'mov1', name:'镜头调度', desc:'长镜头、走位与画面构图设计'}, {id:'mov2', name:'光影与色彩美学', desc:'色彩调性对氛围与心理的暗示'}, {id:'mov3', name:'剪辑节奏把控', desc:'蒙太奇手法的运用与叙事节奏'}] },
    { id: 'mo_ac', name: '表演塑造', weight: 0.20, subs: [{id:'moa1', name:'情绪爆发力', desc:'高光时刻演员的情感释放'}, {id:'moa2', name:'微表情控制', desc:'细腻的面部肌肉管理与眼神戏'}, {id:'moa3', name:'角色气质契合', desc:'演员本身特质与剧本角色的融合度'}] },
    { id: 'mo_au', name: '音效配乐', weight: 0.10, subs: [{id:'mou1', name:'氛围烘托精准度', desc:'OST切入对情绪的推动'}, {id:'mou2', name:'声音设计/拟音', desc:'特殊音效对临场感与压迫感的塑造'}, {id:'mou3', name:'沉默/留白运用', desc:'无声胜有声的声场控制'}] },
    { id: 'mo_th', name: '哲学表达', weight: 0.10, subs: [{id:'mot1', name:'影像隐喻深度', desc:'道具、构图背后的象征意义'}, {id:'mot2', name:'时代社会投射', desc:'对现实社会的批判或反思'}, {id:'mot3', name:'思想启发性', desc:'打破常规认知的哲学启迪'}] }
  ],
  'tv': [
    { id: 'tv_sc', name: '剧作与悬念', weight: 0.35, subs: [{id:'tvs1', name:'单集钩子/悬念', desc:'每集结尾留存观众的吸引力'}, {id:'tvs2', name:'长线草蛇灰线', desc:'贯穿整季的伏笔铺陈与回收'}, {id:'tvs3', name:'逻辑闭环完整度', desc:'大结局填坑情况与无注水程度'}] },
    { id: 'tv_ch', name: '群像成长', weight: 0.25, subs: [{id:'tvc1', name:'角色弧光转变', desc:'长时间跨度下人物性格的合理演变'}, {id:'tvc2', name:'关系动态演变', desc:'角色间联盟、背叛等化学反应'}, {id:'tvc3', name:'动机信服度', desc:'行为是否符合常理与设定'}] },
    { id: 'tv_pr', name: '制作水准', weight: 0.25, subs: [{id:'tvp1', name:'服化道考究度', desc:'服装、化妆、道具的时代还原与质感'}, {id:'tvp2', name:'摄影构图美感', desc:'电视剧摄影的电影感追求'}, {id:'tvp3', name:'场景美术置景', desc:'实景搭建与特效合成的融合'}] },
    { id: 'tv_th', name: '主题探讨', weight: 0.15, subs: [{id:'tvt1', name:'社会切片精准度', desc:'对特定行业或人群的真实刻画'}, {id:'tvt2', name:'价值观碰撞', desc:'多元立场在剧中的博弈'}, {id:'tvt3', name:'人性幽暗/闪光点', desc:'展现人性的复杂多面'}] }
  ],
  'doc': [
    { id: 'do_re', name: '真实与客观', weight: 0.35, subs: [{id:'dor1', name:'视角中立性', desc:'导演是否避免了过度的刻意引导'}, {id:'dor2', name:'史料/素材详实度', desc:'档案、采访记录的深度与广度'}, {id:'dor3', name:'推演逻辑链条', desc:'结论推导是否经得起推敲'}] },
    { id: 'do_sc', name: '叙事剪辑', weight: 0.25, subs: [{id:'dos1', name:'素材组织架构', desc:'海量碎片素材的编排逻辑'}, {id:'dos2', name:'叙述节奏把控', desc:'沉闷话题的趣味化或紧凑化处理'}, {id:'dos3', name:'切入点新颖度', desc:'选题角度的独特与猎奇性'}] },
    { id: 'do_vi', name: '影像美学', weight: 0.25, subs: [{id:'dov1', name:'构图质感', desc:'纪实影像的构图审美'}, {id:'dov2', name:'现场抓拍张力', desc:'不可复制的冲突瞬间捕捉'}, {id:'dov3', name:'色彩调性', desc:'调色对纪录片整体氛围的定调'}] },
    { id: 'do_au', name: '声效旁白', weight: 0.15, subs: [{id:'doa1', name:'文案文本厚度', desc:'解说词的文学性与思想性'}, {id:'doa2', name:'旁白感染力/声线', desc:'配音演员嗓音的契合度与讲述感'}, {id:'doa3', name:'环境同期声收录', desc:'现场真实声音的还原度'}] }
  ],
  'novel': [
    { id: 'no_st', name: '结构与叙事', weight: 0.30, subs: [{id:'nos1', name:'元小说/诡计设计', desc:'打破第四面墙或精妙的叙事圈套'}, {id:'nos2', name:'草蛇灰线与伏笔', desc:'看似闲笔实则惊雷的细节铺垫'}, {id:'nos3', name:'视角切换与拼图', desc:'多视点叙事拼凑全貌的精巧度'}] },
    { id: 'no_fl', name: '文本与心流', weight: 0.25, subs: [{id:'nof1', name:'阅读沉浸感', desc:'文字吸力让人难以释卷的程度'}, {id:'nof2', name:'语感与叙述节奏', desc:'长短句交错带来的文字呼吸感'}, {id:'nof3', name:'修辞与隐喻美感', desc:'巧妙的比喻与诗意的遣词造句'}] },
    { id: 'no_ch', name: '人物与动机', weight: 0.20, subs: [{id:'noc1', name:'潜意识与心理刻画', desc:'对复杂幽微内心世界的深挖'}, {id:'noc2', name:'行为逻辑严密性', desc:'性格决定命运的合理推演'}, {id:'noc3', name:'命运抗争张力', desc:'人物在极端困境下的挣扎与光辉'}] },
    { id: 'no_th', name: '思想与哲理', weight: 0.25, subs: [{id:'not1', name:'存在主义探讨', desc:'对生命意义与个人选择的拷问'}, {id:'not2', name:'荒诞感/虚无建构', desc:'揭示现实悖论的卡夫卡式荒诞'}, {id:'not3', name:'时代/社会隐喻', desc:'折射宏大历史与社会现实的深度'}] }
  ],
  'prose': [
    { id: 'pr_la', name: '语言与修辞', weight: 0.35, subs: [{id:'prl1', name:'遣词炼字精准度', desc:'用词的考究与独创性'}, {id:'prl2', name:'语感韵律美', desc:'文字朗读时的声韵和谐与节奏'}, {id:'prl3', name:'意象密度与新意', desc:'新鲜比喻与意象组合带来的美学冲击'}] },
    { id: 'pr_st', name: '形散与神聚', weight: 0.35, subs: [{id:'prs1', name:'思绪发散自由度', desc:'联想的开阔与思维的跳跃感'}, {id:'prs2', name:'核心主旨穿透力', desc:'发散收束后直击内核的力度'}, {id:'prs3', name:'篇章结构收放', desc:'起承转合的自然散淡与不落俗套'}] },
    { id: 'pr_em', name: '情感与共鸣', weight: 0.30, subs: [{id:'pre1', name:'表达真诚度', desc:'不做作、不无病呻吟的文字底色'}, {id:'pre2', name:'阅历厚度与沧桑感', desc:'透过文字显露的生命体悟'}, {id:'pre3', name:'情绪共振极值', desc:'引发读者深深共鸣与嗟叹的程度'}] }
  ],
  'nonfic': [
    { id: 'nf_lo', name: '逻辑与论证', weight: 0.35, subs: [{id:'nfl1', name:'理论框架严密性', desc:'立论的基础架构是否稳固自洽'}, {id:'nfl2', name:'核心概念定义清晰', desc:'专业术语使用的准确与明晰'}, {id:'nfl3', name:'推理演进连贯性', desc:'层层递进、环环相扣的逻辑推导'}] },
    { id: 'nf_ev', name: '资料与考据', weight: 0.30, subs: [{id:'nfe1', name:'数据详实/多维考证', desc:'论据的丰富度与视角的交叉验证'}, {id:'nfe2', name:'引用文献权威性', desc:'资料来源的可靠与学术严谨度'}, {id:'nfe3', name:'案例佐证精准度', desc:'所选案例对核心观点的支撑力度'}] },
    { id: 'nf_in', name: '洞察启发', weight: 0.20, subs: [{id:'nfi1', name:'视角独特性', desc:'提供看待世界或历史的全新维度'}, {id:'nfi2', name:'破除常识/反直觉', desc:'颠覆固有认知的震撼感'}, {id:'nfi3', name:'思维模型拓展', desc:'读后对个人认知体系的实质性升级'}] },
    { id: 'nf_re', name: '文本易读性', weight: 0.15, subs: [{id:'nfr1', name:'枯燥度降解能力', desc:'将硬核知识写得引人入胜的笔力'}, {id:'nfr2', name:'专业术语拆解', desc:'面向大众的深入浅出解说'}, {id:'nfr3', name:'叙述流畅度', desc:'文字本身的连贯与阅读顺畅感'}] }
  ],
  'poetry': [
    { id: 'po_im', name: '意象与隐喻', weight: 0.35, subs: [{id:'poi1', name:'意象组合创新', desc:'打破常规搭配产生的陌生化美感'}, {id:'poi2', name:'象征内核深度', desc:'意象背后承载的深层哲学或情感'}, {id:'poi3', name:'联想与延展空间', desc:'诗意带来的无限解读可能与留白'}] },
    { id: 'po_rh', name: '韵律与形式', weight: 0.35, subs: [{id:'por1', name:'内生节奏感', desc:'脱离外在格式的诗意内在呼吸'}, {id:'por2', name:'押韵/分行美学', desc:'形式上的音韵美与分行节奏'}, {id:'por3', name:'文字排列的视觉张力', desc:'版式布局等视觉层面的诗意探索'}] },
    { id: 'po_in', name: '直觉情感', weight: 0.30, subs: [{id:'pon1', name:'灵光闪现的锐度', desc:'极具穿透力、直击灵魂的诗眼'}, {id:'pon2', name:'情绪结晶浓度', desc:'高度浓缩提纯的情感爆发力'}, {id:'pon3', name:'留白与余韵', desc:'读完后在脑海中久久回荡的震颤'}] }
  ],
  'artbook': [
    { id: 'ar_li', name: '光影与构图', weight: 0.35, subs: [{id:'arl1', name:'曝光控制/光比分配', desc:'光影塑造的体积感与氛围层次'}, {id:'arl2', name:'几何视觉引导线', desc:'画面构图对视线的精妙牵引'}, {id:'arl3', name:'空间透视感', desc:'二维平面中创造的三维纵深体验'}] },
    { id: 'ar_co', name: '概念与叙事', weight: 0.35, subs: [{id:'arc1', name:'决定性瞬间抓拍', desc:'按下快门时无可替代的冲突瞬间'}, {id:'arc2', name:'组图叙事连贯性', desc:'画册整体编排形成的故事性流淌'}, {id:'arc3', name:'核心主题传达', desc:'视觉元素对立意的高效准确投射'}] },
    { id: 'ar_te', name: '质感色彩', weight: 0.15, subs: [{id:'art1', name:'色彩情绪渲染', desc:'色调搭配对观看者心理的微妙暗示'}, {id:'art2', name:'颗粒与锐度质感', desc:'底片颗粒或材质肌理带来的审美'}, {id:'art3', name:'后期修饰克制度', desc:'避免过度失真的恰到好处处理'}] },
    { id: 'ar_pr', name: '装帧印制', weight: 0.15, subs: [{id:'arp1', name:'纸张触感/显色度', desc:'材质选择对作品最终呈现的加成'}, {id:'arp2', name:'开本与版式设计', desc:'整体画册拿在手中的物理交互体验'}, {id:'arp3', name:'排版留白呼吸感', desc:'图像与留白的节奏搭配'}] }
  ],
  'podcast': [
    { id: 'pd_co', name: '内容硬核度', weight: 0.40, subs: [{id:'pdc1', name:'信息密度', desc:'单位时间内输出的高质量干货量'}, {id:'pdc2', name:'选题切入角度', desc:'独到、刁钻且有价值的议题切入'}, {id:'pdc3', name:'逻辑推演结构', desc:'讨论不散漫，有一条清晰的主轴'}] },
    { id: 'pd_ex', name: '表达与互动', weight: 0.35, subs: [{id:'pde1', name:'讲述节奏/控场', desc:'主播把控进度、引导话题的能力'}, {id:'pde2', name:'嘉宾化学反应', desc:'多方对谈时的观点碰撞与火花'}, {id:'pde3', name:'观点输出清晰度', desc:'口头表达的条理性与易理解程度'}] },
    { id: 'pd_au', name: '声音工程', weight: 0.25, subs: [{id:'pda1', name:'录音底噪与混响控制', desc:'录音环境的专业度与人声质感'}, {id:'pda2', name:'剪辑去口癖流畅度', desc:'后期对冗余信息的净化与衔接'}, {id:'pda3', name:'Jingle/音效铺垫', desc:'片头尾及转场音效对氛围的提升'}] }
  ]
};

const defaultStatuses = ['已看 / 通关', '二刷 / 多周目中', '进行中', '搁置中', '烂尾弃坑'];

// ================= 全局状态管理 (云端进化版) =================
let currentMainFilter = 'all';
let currentSubFilter = 'all'; 
let currentSort = 'update_desc';
let currentEditingId = null; 
let activeScores = {}; 
let radarChartInstance = null;

let isRecordDirty = false;
let isSchemaDirty = false;

let activeSchemas = JSON.parse(localStorage.getItem('CustomSchemas_v2')) || JSON.parse(JSON.stringify(defaultSchemas_v2));
let customStatuses = JSON.parse(localStorage.getItem('CustomStatuses_v2')) || [...defaultStatuses];

const defaultVoteReasons = {
    approve: ['白月光 / 童年滤镜', '核心诡计太惊艳'],
    veto: ['严重触碰三观底线', '喂屎烂尾 / 涉嫌欺诈']
};
let customVoteReasons = JSON.parse(localStorage.getItem('CustomVoteReasons_v2')) || JSON.parse(JSON.stringify(defaultVoteReasons));

let currentSearchQuery = '';
let currentTagFilter = 'all';
let schemaBuffer = null; 

// 🌟 核心革新：云端全局数据缓存与心跳同步引擎
window.cloudRecords = [];
window.syncFromCloud = async (isStartup = false) => {
    const { data, error } = await supabaseClient.from('records').select('*');
    if (error) {
        console.error("数据同步失败:", error);
        showToast("❌ 无法连接到云端数据库，请检查网络");
    } else {
        window.cloudRecords = data || [];
        if (isStartup) {
            const timeStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
            showToast(`☁️ 云端数据同步完成 (${timeStr})`);
        }
    }
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
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'toast-badge';
            duplicate.appendChild(badge);
        }
        badge.textContent = count;
        duplicate.classList.remove('pulse');
        void duplicate.offsetWidth; 
        duplicate.classList.add('pulse');
        clearTimeout(duplicate.hideTimer);
        duplicate.hideTimer = setTimeout(() => {
            duplicate.classList.remove('show');
            setTimeout(() => duplicate.remove(), 300);
        }, 2500);
        return;
    }

    const toast = document.createElement('div'); 
    toast.className = 'toast'; 
    toast.textContent = msg;
    toast.dataset.msg = msg; 
    toast.dataset.count = 1;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    toast.hideTimer = setTimeout(() => { 
        toast.classList.remove('show'); 
        setTimeout(() => toast.remove(), 300); 
    }, 2500);
}

// 🌟 核心革新：支持异步等待的防抖确认弹窗
function showConfirm(title, message, onConfirmCallback, type = 'danger') {
    const overlay = document.getElementById('confirmOverlay'); 
    const okBtn = document.getElementById('confirmOkBtn');
    const cancelBtn = document.getElementById('confirmCancelBtn');
    
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    
    const prefs = JSON.parse(localStorage.getItem('confirmDelayPrefs_v2') || '{"danger": 3, "warning": 3}');
    let delayTime = prefs[type] !== undefined ? parseInt(prefs[type]) : 3;

    overlay.classList.add('active');
    let timer = null;
    
    const closeBox = () => { 
        if (timer) clearInterval(timer);
        overlay.classList.remove('active'); 
    };

    // 将执行逻辑抽离，支持 Async Await 锁定
    const executeAction = async () => {
        if (!okBtn.disabled) { 
            okBtn.disabled = true;
            okBtn.style.opacity = '0.5';
            okBtn.style.cursor = 'wait';
            const originalText = okBtn.textContent;
            okBtn.textContent = '⏳ 处理中...';
            try {
                await onConfirmCallback(); 
            } catch(e) {
                console.error(e);
            } finally {
                closeBox(); 
                // 恢复原状，为下次打开做准备
                okBtn.disabled = false;
                okBtn.style.opacity = '1';
                okBtn.style.cursor = 'pointer';
                okBtn.textContent = '确定';
            }
        } 
    };

    if (delayTime > 0) {
        okBtn.disabled = true;
        okBtn.style.opacity = '0.5';
        okBtn.style.cursor = 'not-allowed';
        okBtn.textContent = `确定 (${delayTime}s)`;

        timer = setInterval(() => {
            delayTime--;
            if (delayTime > 0) {
                okBtn.textContent = `确定 (${delayTime}s)`;
            } else {
                clearInterval(timer);
                okBtn.disabled = false;
                okBtn.style.opacity = '1';
                okBtn.style.cursor = 'pointer';
                okBtn.textContent = `确定`;
                okBtn.onclick = executeAction;
            }
        }, 1000);
    } else {
        okBtn.disabled = false;
        okBtn.style.opacity = '1';
        okBtn.style.cursor = 'pointer';
        okBtn.textContent = `确定`;
        okBtn.onclick = executeAction;
    }

    cancelBtn.onclick = closeBox;
}

function debounce(func, wait) {
    let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), wait); };
}

function applyTheme(theme) {
    if(theme === 'auto') document.documentElement.setAttribute('data-theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    else document.documentElement.setAttribute('data-theme', theme);
    debouncedRechart();
}
const debouncedRechart = debounce(() => { if(els.modal.classList.contains('active')) calculateScore(); }, 150);

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if(localStorage.getItem('themePref_v2') === 'auto') applyTheme('auto');
});

function renderChangelog() {
    const container = document.getElementById('changelogContainer');
    if(!container) return;
    container.innerHTML = '';
    
    APP_CHANGELOG.forEach((log, index) => {
        const isCurrent = index === 0;
        const wrapperStyle = isCurrent 
            ? `background: var(--score-bg); padding: 16px; border-radius: 10px; margin-bottom: 12px; border: 1px solid var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.03);` 
            : `padding: 16px 12px; border-bottom: 1px dashed var(--border-color);`;
        
        const titleHtml = isCurrent 
            ? `<strong style="color: var(--primary); font-size: 16px; letter-spacing: 0.5px;">v${log.version}</strong> <span style="font-size:12px; color:var(--text-muted); font-weight: bold; margin-left: 6px;">(${log.date || '未知日期'})</span>`
            : `<strong style="color: var(--text-main); font-size: 15px;">v${log.version}</strong> <span style="font-size:11px; color:var(--text-muted); margin-left: 8px;">${log.date || ''}</span>`;
            
        const lis = log.changes.map(c => {
            const match = c.match(/^\[(.*?)\]\s*(.*)/);
            if (match) {
                const tag = match[1];
                const text = match[2];
                let tagStyle = '';
                if (tag.includes('新特性') || tag.includes('里程碑')) tagStyle = 'background: rgba(52, 152, 219, 0.1); color: var(--link-color); border: 1px solid rgba(52, 152, 219, 0.3);';
                else if (tag.includes('优化')) tagStyle = 'background: rgba(241, 196, 15, 0.15); color: #d68910; border: 1px solid rgba(241, 196, 15, 0.4);';
                else if (tag.includes('修复')) tagStyle = 'background: rgba(231, 76, 60, 0.1); color: var(--danger); border: 1px solid rgba(231, 76, 60, 0.3);';
                else tagStyle = 'background: var(--border-color); color: var(--text-muted); border: 1px solid transparent;';
                
                return `
                    <li style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
                        <span style="font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 4px; white-space: nowrap; line-height: 1.2; ${tagStyle}; flex-shrink: 0; margin-top: 2px;">${tag}</span>
                        <span style="line-height: 1.5; color: var(--text-main);">${text}</span>
                    </li>`;
            }
            return `<li style="margin-bottom: 8px; margin-left: 18px; list-style-type: disc; line-height: 1.5; color: var(--text-main);">${c}</li>`;
        }).join('');
        
        const html = `
            <div style="${wrapperStyle}">
                ${titleHtml}
                <ul style="margin-top: 14px; font-size: 13px; list-style: none; padding-left: 0;">
                    ${lis}
                </ul>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

// ================= 灵动预览核心引擎 =================
let hoverTimer = null;
const previewEl = document.getElementById('hoverPreview');

function initHoverPreview() {
    document.getElementById('recordGrid').addEventListener('mouseover', (e) => {
        const card = e.target.closest('.record-card');
        if (!card) return;

        const id = card.getAttribute('data-id'); 
        const records = window.cloudRecords; 
        const rec = records.find(r => r.id === id);
        if (!rec) return;

        hoverTimer = setTimeout(() => { showPreview(rec, card); }, 500);
    });

    document.getElementById('recordGrid').addEventListener('mouseout', () => {
        clearTimeout(hoverTimer);
        previewEl.classList.remove('active');
    });
}

function showPreview(rec, card) {
    const schema = activeSchemas[rec.subCat];
    if (!schema) return;

    let html = `<div style="font-size:13px; font-weight:bold; margin-bottom:15px; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:8px;">📊 细分维度预览</div>`;
    
    schema.forEach(dim => {
        let sum = 0;
        dim.subs.forEach(s => sum += (rec.scores[s.id] || 0));
        const avg = sum / dim.subs.length;
        const percent = (avg * 10).toFixed(0);

        html += `
            <div class="preview-dim-row">
                <div class="preview-dim-header">
                    <span>${dim.name}</span>
                    <span>${avg.toFixed(1)}</span>
                </div>
                <div class="preview-bar-bg"><div class="preview-bar-fill" style="width: ${percent}%"></div></div>
            </div>`;
    });

    previewEl.innerHTML = html;
    const rect = card.getBoundingClientRect();
    let left = rect.right + 15;
    let top = rect.top;

    if (left + 280 > window.innerWidth) left = rect.left - 275;
    
    previewEl.style.left = `${left}px`;
    previewEl.style.top = `${top}px`;
    previewEl.classList.add('active');
}

// ================= 导航与瀑布流 =================
function initNavTabs() {
    Object.keys(categoryTree).forEach(key => {
        const tab = document.createElement('div');
        tab.className = `nav-tab ${key === 'all' ? 'active' : ''}`;
        tab.textContent = categoryTree[key].name;
        tab.onclick = () => {
            if (window.isDraggingNavTabs) return; 
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

            currentMainFilter = key; currentSubFilter = 'all'; 
            els.searchInput.value = ''; currentSearchQuery = '';
            els.tagFilterSelect.value = 'all'; currentTagFilter = 'all';
            renderSubFilters(); renderMainList();
        };
        els.navTabs.appendChild(tab);
    });

    const navContainer = els.navTabs;
    navContainer.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) { e.preventDefault(); navContainer.scrollBy({ left: e.deltaY * 2, behavior: 'auto' }); }
    }, { passive: false });

    let isDown = false; let startX, scrollLeft; window.isDraggingNavTabs = false; 
    navContainer.addEventListener('mousedown', (e) => {
        isDown = true; window.isDraggingNavTabs = false;
        navContainer.style.cursor = 'grabbing'; navContainer.style.userSelect = 'none'; 
        startX = e.pageX - navContainer.offsetLeft; scrollLeft = navContainer.scrollLeft;
    });
    navContainer.addEventListener('mouseleave', () => { isDown = false; navContainer.style.cursor = ''; });
    navContainer.addEventListener('mouseup', () => {
        isDown = false; navContainer.style.cursor = '';
        setTimeout(() => window.isDraggingNavTabs = false, 50);
    });
    navContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - navContainer.offsetLeft;
        const walk = (x - startX) * 1.5; 
        if (Math.abs(walk) > 10) window.isDraggingNavTabs = true; 
        navContainer.scrollLeft = scrollLeft - walk;
    });
}

function renderSubFilters() {
    els.subFilters.innerHTML = '';
    if (currentMainFilter === 'all') return; 
    const allTag = document.createElement('div');
    allTag.className = `sub-filter-tag ${currentSubFilter === 'all' ? 'active' : ''}`;
    allTag.textContent = '全部';
    allTag.onclick = () => { currentSubFilter = 'all'; renderSubFilters(); renderMainList(); }
    els.subFilters.appendChild(allTag);

    const subs = categoryTree[currentMainFilter].subs;
    Object.keys(subs).forEach(subKey => {
        const tag = document.createElement('div');
        tag.className = `sub-filter-tag ${currentSubFilter === subKey ? 'active' : ''}`;
        tag.textContent = subs[subKey];
        tag.onclick = () => { currentSubFilter = subKey; renderSubFilters(); renderMainList(); }
        els.subFilters.appendChild(tag);
    });
}

els.searchInput.addEventListener('input', (e) => { currentSearchQuery = e.target.value.trim().toLowerCase(); renderMainList(); });
els.tagFilterSelect.addEventListener('change', (e) => { currentTagFilter = e.target.value; renderMainList(); });
els.sortSelect.onchange = (e) => { currentSort = e.target.value; renderMainList(); }
els.displayModeSelect.onchange = (e) => { localStorage.setItem('displayModePref_v2', e.target.value); renderMainList(); }

function renderMainList() {
    let records = [...window.cloudRecords]; 

    els.grid.innerHTML = '';

    if (currentMainFilter !== 'all') records = records.filter(r => r.mainCat === currentMainFilter);
    if (currentSubFilter !== 'all') records = records.filter(r => r.subCat === currentSubFilter);
    if (currentTagFilter === 'incomplete_score') records = records.filter(r => r.isScoreIncomplete);
    if (currentTagFilter === 'incomplete_review') records = records.filter(r => r.isReviewIncomplete);

    if (currentSearchQuery) {
        const keywords = currentSearchQuery.split(/\s+/).filter(k => k.length > 0);
        records = records.filter(r => {
            const name = (r.name || '').toLowerCase();
            const review = (r.review || '').toLowerCase();
            let virtualTags = [r.status, r.subCatText];
            if (r.isScoreIncomplete) virtualTags.push('缺分数');
            if (r.isReviewIncomplete) virtualTags.push('无评语');
            if (r.voteStatus === 1) virtualTags.push('一票赞成', '白月光');
            if (r.voteStatus === -1) virtualTags.push('一票否决', '踩雷');

            return keywords.every(kw => {
                const matchName = name.includes(kw);
                const matchReview = review.includes(kw);
                const matchTags = virtualTags.some(t => (t || '').toLowerCase().includes(kw));
                return matchName || matchReview || matchTags;
            });
        });
    }

    records.sort((a, b) => {
        const scoreA = parseFloat(a.finalScore);
        const scoreB = parseFloat(b.finalScore);
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

    if (records.length === 0) {
        els.grid.innerHTML = `<div class="empty-state"><h3>这里空空如也</h3><p>点击右下角 + 号，开始录入精神食粮吧</p></div>`;
        return;
    }

    const displayMode = els.displayModeSelect.value;
    const timeDisplayMode = localStorage.getItem('timeDisplayPref_v2') || 'updated'; 

    records.forEach(rec => {
        const card = document.createElement('div');
        card.className = 'record-card'; card.onclick = () => openModal(rec.id);
        card.setAttribute('data-id', rec.id);
        const coverText = rec.name.substring(0,2).toUpperCase();
        const voteStatus = rec.voteStatus !== undefined ? rec.voteStatus : (rec.isProtect ? 1 : (rec.isVeto ? -1 : 0));
        let badgeHtml = '';
        if (voteStatus === 1) badgeHtml = `<div class="protect-badge" title="${rec.voteReason || ''}">一票赞成</div>`;
        else if (voteStatus === -1) badgeHtml = `<div class="veto-badge" title="${rec.voteReason || ''}">一票否决</div>`;
        
        let incompleteTags = '';
        if (rec.isScoreIncomplete) incompleteTags += `<span class="tag-incomplete">缺分数</span>`;
        if (rec.isReviewIncomplete) incompleteTags += `<span class="tag-incomplete">无评语</span>`;
        
        let scoreHtml = ''; let scoreTitle = '评分';
        const scoreVal = parseFloat(rec.finalScore);
        const hasScore = scoreVal > 0 || rec.isVeto || voteStatus === -1;

        if (!hasScore) {
            scoreHtml = `<span style="font-size:16px; color:var(--text-muted);">暂无</span>`;
        } else if (displayMode === 'system') {
            scoreHtml = scoreVal.toFixed(1);
        } else if (displayMode === 'douban') {
            scoreTitle = '豆瓣推荐';
            scoreHtml = `<span style="font-size: 16px; letter-spacing: 2px; color: #f39c12;">${renderStars(scoreVal)}</span>`;
        } else if (displayMode === 'bangumi') {
            scoreTitle = 'Bangumi';
            let bScore = Math.round(scoreVal);
            if (bScore < 1) bScore = 1; 
            scoreHtml = `<span>${bScore} <span style="font-size: 12px; font-weight: normal; color:var(--text-muted);">${getBangumiLabel(scoreVal, true)}</span></span>`;
        }

        const tUpdate = rec.updatedAt || rec.createdAt || parseInt(rec.id);
        const tCreate = rec.createdAt || parseInt(rec.id);
        const timeToShow = timeDisplayMode === 'created' ? tCreate : tUpdate;
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
                    <div style="display:flex; align-items:baseline; gap:4px;">
                        <span style="font-size:11px; color:var(--text-muted)">${scoreTitle}</span>
                        <span class="record-score" style="font-size: ${displayMode==='system' ? '26px' : '18px'}">${scoreHtml}</span>
                    </div>
                </div>
            </div>
        `;
        els.grid.appendChild(card);
    });
}

// ================= 评分记录弹窗逻辑 =================
function initCascader() {
    els.mainCat.innerHTML = '';
    Object.keys(categoryTree).filter(k => k !== 'all').forEach(key => { els.mainCat.add(new Option(categoryTree[key].name, key)); });
    els.mainCat.onchange = () => {
        const subs = categoryTree[els.mainCat.value].subs;
        els.subCat.innerHTML = '';
        Object.keys(subs).forEach(subKey => els.subCat.add(new Option(subs[subKey], subKey)));
        activeScores = {}; renderDimensions(); isRecordDirty = true;
    };
    els.subCat.onchange = () => { activeScores = {}; renderDimensions(); isRecordDirty = true; };
}

function renderStatusDropdown() {
    els.status.innerHTML = '';
    customStatuses.forEach(s => els.status.add(new Option(s, s)));
}

function generateBlocks(subId, val) {
    let blocks = '';
    for(let i = 1; i <= 10; i++) blocks += `<div class="score-block ${i <= val ? 'active' : ''}" data-val="${i}" data-subid="${subId}"></div>`;
    return `
        <div class="score-control-wrapper">
            <button class="btn-score-adjust" onclick="adjustScore('${subId}', -1)">-</button>
            <div class="blocks-container" id="blocks_${subId}">${blocks}</div>
            <button class="btn-score-adjust" onclick="adjustScore('${subId}', 1)">+</button>
            <input type="number" class="score-input-num" id="input_${subId}" value="${val}" min="0" max="10" onchange="setScore('${subId}', this.value)">
        </div>`;
}

function renderDimensions() {
    els.dimContainer.innerHTML = '';
    const schema = activeSchemas[els.subCat.value];
    if(!schema) return;
    schema.forEach(dim => {
        let subsHTML = '';
        dim.subs.forEach(sub => {
            if(activeScores[sub.id] === undefined) activeScores[sub.id] = 0; 
            const tooltipHtml = `<span class="tooltip-icon">?<span class="tooltip-text">${sub.desc || '暂无详细解释'}</span></span>`;
            subsHTML += `<div class="sub-item"><div class="sub-name" title="${sub.name}">${sub.name} ${tooltipHtml}</div>${generateBlocks(sub.id, activeScores[sub.id])}</div>`;
        });
        els.dimContainer.insertAdjacentHTML('beforeend', `
            <div class="dimension-group">
                <div class="dimension-header">
                    <div>
                        <span class="dimension-title">${dim.name}</span>
                        <span id="dimRealScore_${dim.id}" style="margin-left:8px; font-size:13px; color:var(--primary); font-weight:900;">0.0</span>
                    </div>
                    <span class="dimension-weight">权重: ${Math.round(dim.weight * 100)}%</span>
                </div>
                <div>${subsHTML}</div>
            </div>`);
    });
    els.dimContainer.querySelectorAll('.score-block').forEach(b => { b.onclick = function() { setScore(this.dataset.subid, this.dataset.val); } });
    calculateScore();
}

window.setScore = function(subId, val) {
    let num = Math.min(10, Math.max(0, parseInt(val) || 0));
    activeScores[subId] = num; document.getElementById(`input_${subId}`).value = num;
    const blocks = document.getElementById(`blocks_${subId}`).children;
    for(let i=0; i<10; i++) { if(i < num) blocks[i].classList.add('active'); else blocks[i].classList.remove('active'); }
    isRecordDirty = true; calculateScore();
}
window.adjustScore = function(id, delta) { setScore(id, activeScores[id] + delta); }

function calculateScore() {
    const schema = activeSchemas[els.subCat.value];
    let total = 0, radarData = [], radarLabels = [], hasAnyScore = false;
    schema.forEach(dim => {
        let sum = 0; 
        dim.subs.forEach(s => { sum += activeScores[s.id]; if(activeScores[s.id] > 0) hasAnyScore = true; });
        let avg = sum / dim.subs.length; total += avg * dim.weight;
        radarData.push(avg.toFixed(1)); radarLabels.push(dim.name);
        const dimScoreEl = document.getElementById(`dimRealScore_${dim.id}`);
        if (dimScoreEl) dimScoreEl.textContent = avg.toFixed(1);
    });

    const voteVal = parseInt(els.voteSlider.value);
    let finalTotal = total; let displayHtml = '';

    if (voteVal !== 0) {
        finalTotal = parseFloat(els.voteScoreInput.value) || 0;
        hasAnyScore = true;
        displayHtml = `<span class="score-strikethrough">${total.toFixed(1)}</span>${finalTotal.toFixed(1)}`;
    } else { displayHtml = finalTotal.toFixed(1); }

    els.finalScore.innerHTML = displayHtml;
    els.finalScore.setAttribute('data-score', finalTotal.toFixed(1));
    
    if (!hasAnyScore && finalTotal === 0 && voteVal === 0) {
        els.finalScore.style.color = '#cbd5e0'; els.refDouban.innerHTML = `未评级`; els.refBangumi.innerHTML = `未评级`;
    } else {
        if (voteVal === 1) els.finalScore.style.color = 'var(--warning)';
        else if (voteVal === -1) els.finalScore.style.color = 'var(--danger)';
        else if(finalTotal >= 9) els.finalScore.style.color = '#f09199'; 
        else if(finalTotal >= 6) els.finalScore.style.color = '#f39c12'; 
        else els.finalScore.style.color = '#7f8c8d'; 

        const bLabel = getBangumiLabel(finalTotal, hasAnyScore); const dLabel = getDoubanLabel(finalTotal, hasAnyScore);
        let bScoreRef = Math.round(finalTotal); if (bScoreRef < 1) bScoreRef = 1; 
        els.refDouban.innerHTML = `<span style="color: #f39c12; letter-spacing: 2px; font-size: 14px;">${renderStars(finalTotal)}</span> <span style="font-weight:normal;">(${dLabel})</span>`;
        els.refBangumi.innerHTML = `${bScoreRef} 分 <span style="font-weight:normal;">(${bLabel})</span>`;
    }
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const labelColor = isDark ? '#a0aec0' : '#7f8c8d';

    const ctx = document.getElementById('radarChart').getContext('2d');
    if(radarChartInstance) radarChartInstance.destroy();
    radarChartInstance = new Chart(ctx, { 
        type: 'radar', 
        data: { 
            labels: radarLabels, 
            datasets: [{ 
                data: voteVal !== 0 ? radarLabels.map(()=>finalTotal) : radarData, 
                backgroundColor: 'rgba(240, 145, 153, 0.25)', borderColor: '#f09199', pointBackgroundColor: '#f09199', borderWidth: 2, pointRadius: 3 
            }] 
        },
        options: { 
            scales: { r: { min: 0, max: 10, ticks: { display: false, stepSize: 2 }, grid: { color: gridColor }, angleLines: { color: gridColor }, pointLabels: { color: labelColor, font: {size: 11, weight: 'bold'} } } }, 
            plugins: { legend: { display: false } }, maintainAspectRatio: false, animation: { duration: 0 } 
        } 
    });
}

['workName', 'reviewText'].forEach(id => document.getElementById(id).addEventListener('input', () => isRecordDirty = true));
els.status.addEventListener('change', () => isRecordDirty = true);

// ================= 实时重名检测与跳转引擎 =================
els.workName.addEventListener('input', debounce(function() {
    const name = this.value.trim().toLowerCase();
    const hintEl = document.getElementById('duplicateHint');
    if (!name) { hintEl.innerHTML = ''; return; }

    const records = window.cloudRecords; 
    const dup = records.find(r => r.name.toLowerCase() === name && r.id !== currentEditingId);
    if (dup) hintEl.innerHTML = `⚠️ 馆内已有此记录：<a href="javascript:void(0)" onclick="jumpToRecord('${dup.id}')" style="color:var(--link-color); text-decoration:underline;">立即前往编辑原记录</a>`;
    else hintEl.innerHTML = '';
}, 300));

window.jumpToRecord = (id) => {
    isRecordDirty = false; document.getElementById('editModal').classList.remove('active'); document.body.style.overflow = '';
    setTimeout(() => openModal(id), 150); showToast('已跳转至原有记录');
};

// ================= 一票机制动态 UI 与管理引擎 =================
function updateVoteUI(isProgrammatic = false) {
    const val = parseInt(els.voteSlider.value);
    els.voteSlider.className = val === -1 ? 'thumb-veto' : (val === 1 ? 'thumb-approve' : '');
    els.voteReasonContainer.style.display = val === 0 ? 'none' : 'block';
    
    if (val !== 0) {
        const label = document.getElementById('voteReasonLabel');
        const select = els.voteReasonSelect; const type = val === 1 ? 'approve' : 'veto';
        label.textContent = val === 1 ? '一票赞成的原因 (必填)：' : '一票否决的原因 (必填)：';
        select.innerHTML = '<option value="">自定义原因...</option>';
        customVoteReasons[type].forEach(reason => select.add(new Option(reason, reason)));

        if (!isProgrammatic) {
            select.value = ''; const wrapper = document.getElementById('voteReasonInputWrapper');
            wrapper.style.maxHeight = '150px'; wrapper.style.opacity = '1'; wrapper.style.marginTop = '8px';
            els.voteReasonInput.value = ''; 
            if (typeof autoResizeTextarea === 'function') autoResizeTextarea(els.voteReasonInput);
            if (val === -1) els.voteScoreInput.value = 0; else if (val === 1) els.voteScoreInput.value = 10;
        }
    }
    if (val === -1) els.voteScoreInput.style.color = 'var(--danger)';
    else if (val === 1) els.voteScoreInput.style.color = 'var(--warning)';
}

els.voteSlider.addEventListener('input', (e) => { updateVoteUI(false); isRecordDirty = true; calculateScore(); });
els.voteReasonSelect.addEventListener('change', (e) => {
    const wrapper = document.getElementById('voteReasonInputWrapper');
    if (e.target.value === "") {
        wrapper.style.maxHeight = '150px'; wrapper.style.opacity = '1'; wrapper.style.marginTop = '8px';
        els.voteReasonInput.style.display = 'block'; els.voteReasonInput.value = '';
        if (typeof autoResizeTextarea === 'function') autoResizeTextarea(els.voteReasonInput);
    } else {
        wrapper.style.maxHeight = '0'; wrapper.style.opacity = '0'; wrapper.style.marginTop = '0';
        els.voteReasonInput.value = e.target.value;
    }
    isRecordDirty = true;
});
els.voteReasonInput.addEventListener('input', function() { isRecordDirty = true; if (typeof autoResizeTextarea === 'function') autoResizeTextarea(this); });
els.voteScoreInput.addEventListener('input', () => {
    let val = parseFloat(els.voteScoreInput.value);
    if(val < 0) els.voteScoreInput.value = 0;
    if(val > 10) els.voteScoreInput.value = 10;
    isRecordDirty = true; calculateScore();
});

function renderVoteReasonsManager() {
    ['approve', 'veto'].forEach(type => {
        const listEl = document.getElementById(`${type}ReasonList`); listEl.innerHTML = '';
        customVoteReasons[type].forEach((reason, idx) => {
            listEl.insertAdjacentHTML('beforeend', `
                <div class="status-item draggable-item" draggable="true" ondragstart="handleDragStart(event, 'vote_${type}', ${idx})" ondragover="handleDragOver(event, 'vote_${type}')" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, 'vote_${type}', ${idx})" ondragend="handleDragEnd(event)">
                    <div style="display:flex; align-items:center; gap:5px;"><div class="drag-handle" title="按住拖拽排序">☰</div><span>${reason}</span></div>
                    <button class="btn-icon-del" onclick="delVoteReason('${type}', ${idx})">✖</button>
                </div>`);
        });
    });
}

window.addVoteReason = (type) => {
    const input = document.getElementById(type === 'approve' ? 'newApproveReason' : 'newVetoReason');
    const val = input.value.trim(); if(!val) return;
    if(customVoteReasons[type].includes(val)) return showToast('该原因已存在');
    customVoteReasons[type].push(val); localStorage.setItem('CustomVoteReasons_v2', JSON.stringify(customVoteReasons));
    input.value = ''; renderVoteReasonsManager(); showToast('原因词条已添加');
};
window.delVoteReason = (type, idx) => { customVoteReasons[type].splice(idx, 1); localStorage.setItem('CustomVoteReasons_v2', JSON.stringify(customVoteReasons)); renderVoteReasonsManager(); };
window.moveVoteReason = (type, idx, dir) => {
    if (idx + dir < 0 || idx + dir >= customVoteReasons[type].length) return;
    const temp = customVoteReasons[type][idx]; customVoteReasons[type][idx] = customVoteReasons[type][idx+dir]; customVoteReasons[type][idx+dir] = temp;
    localStorage.setItem('CustomVoteReasons_v2', JSON.stringify(customVoteReasons)); renderVoteReasonsManager();
};
window.resetVoteReasons = () => {
    showConfirm('重置词条确认', '清空所有自定义一票判定词条并恢复默认。确定吗？', async () => {
        customVoteReasons = JSON.parse(JSON.stringify(defaultVoteReasons)); localStorage.setItem('CustomVoteReasons_v2', JSON.stringify(customVoteReasons));
        renderVoteReasonsManager(); showToast('词条已恢复默认');
    });
};

function openModal(id = null) {
    document.getElementById('duplicateHint').innerHTML = ''; currentEditingId = id; els.delBtn.style.display = id ? 'block' : 'none'; 
    renderStatusDropdown(); isRecordDirty = false;

    if (id) { 
        const records = window.cloudRecords; 
        const rec = records.find(r => r.id === id);
        document.getElementById('modalTitle').textContent = '修改评价记录';

        const timeContainer = document.getElementById('timeInfoContainer');
        const createLabel = document.getElementById('createTimeLabel');
        const updateLabel = document.getElementById('updateTimeLabel');
        timeContainer.style.display = 'flex';
        createLabel.textContent = `🌱 创建于：${formatPreciseTime({ createdAt: rec.createdAt || rec.id })}`;
        updateLabel.textContent = `🔄 修改于：${formatPreciseTime({ createdAt: rec.updatedAt || rec.createdAt || rec.id })}`;

        els.mainCat.value = rec.mainCat;
        const subs = categoryTree[rec.mainCat].subs; els.subCat.innerHTML = '';
        Object.keys(subs).forEach(subKey => els.subCat.add(new Option(subs[subKey], subKey)));
        els.subCat.value = rec.subCat; els.workName.value = rec.name; 
        if(!customStatuses.includes(rec.status)) els.status.add(new Option(rec.status, rec.status));
        els.status.value = rec.status; els.review.value = rec.review;
        
        const voteStat = rec.voteStatus !== undefined ? rec.voteStatus : (rec.isProtect ? 1 : (rec.isVeto ? -1 : 0));
        els.voteSlider.value = voteStat; updateVoteUI(true); 

        if (voteStat !== 0) {
            const type = voteStat === 1 ? 'approve' : 'veto';
            const wrapper = document.getElementById('voteReasonInputWrapper');
            if (customVoteReasons[type].includes(rec.voteReason)) {
                els.voteReasonSelect.value = rec.voteReason; wrapper.style.maxHeight = '0'; wrapper.style.opacity = '0'; wrapper.style.marginTop = '0'; els.voteReasonInput.value = rec.voteReason;
            } else {
                els.voteReasonSelect.value = ''; wrapper.style.maxHeight = '150px'; wrapper.style.opacity = '1'; wrapper.style.marginTop = '8px'; els.voteReasonInput.value = rec.voteReason || '';
            }
        }
        els.voteScoreInput.value = rec.voteScore !== undefined ? rec.voteScore : (voteStat === 1 ? 10 : (voteStat === -1 ? 0 : ''));
        activeScores = { ...rec.scores }; 
    } else {
        document.getElementById('modalTitle').textContent = '新增收视阅读记录';
        document.getElementById('timeInfoContainer').style.display = 'none';
        els.workName.value = ''; els.review.value = ''; els.status.selectedIndex = 0; activeScores = {};
        els.voteSlider.value = 0; els.voteScoreInput.value = ''; updateVoteUI(true);
        if (currentMainFilter !== 'all') {
            els.mainCat.value = currentMainFilter; els.mainCat.onchange(); 
            if (currentSubFilter !== 'all') els.subCat.value = currentSubFilter;
        } else { els.mainCat.selectedIndex = 0; els.mainCat.onchange(); }
    }
    renderDimensions(); els.modal.classList.add('active'); document.body.style.overflow = 'hidden';
    setTimeout(() => {
        isRecordDirty = false;
        if (typeof autoResizeTextarea === 'function') { autoResizeTextarea(els.review); autoResizeTextarea(els.voteReasonInput); }
    }, 50);
}

const reviewInput = document.getElementById('reviewText');
const autoResizeTextarea = (el) => { el.style.height = 'auto'; el.style.height = (el.scrollHeight) + 'px'; };
reviewInput.addEventListener('input', function() { autoResizeTextarea(this); });

const zenOverlay = document.getElementById('zenOverlay'); const zenReviewText = document.getElementById('zenReviewText'); const zenSidebar = document.getElementById('zenSidebar');
document.getElementById('openZenBtn').onclick = () => {
    zenReviewText.value = reviewInput.value; renderZenSidebar(); zenOverlay.classList.add('active');
    setTimeout(() => { zenReviewText.focus(); zenReviewText.selectionStart = zenReviewText.value.length; }, 100);
};
const closeZenMode = () => { reviewInput.value = zenReviewText.value; autoResizeTextarea(reviewInput); isRecordDirty = true; zenOverlay.classList.remove('active'); };
document.getElementById('closeZenBtn').onclick = closeZenMode; zenReviewText.addEventListener('input', () => { isRecordDirty = true; });

function renderZenSidebar() {
    const workName = els.workName.value || '未命名作品'; const finalScore = els.finalScore.innerHTML; const scoreColor = els.finalScore.style.color; const voteVal = parseInt(els.voteSlider.value);
    let voteHtml = '';
    if (voteVal === 1) voteHtml = `<div style="background: var(--warning); color: #000; padding: 12px; border-radius: 8px; font-weight: 900; margin-bottom: 20px; font-size: 13px;">🌟 一票赞成: <br><span style="font-weight:normal; margin-top:4px; display:block;">${els.voteReasonInput.value || els.voteReasonSelect.value || '无'}</span></div>`;
    else if (voteVal === -1) voteHtml = `<div style="background: var(--danger); color: #fff; padding: 12px; border-radius: 8px; font-weight: 900; margin-bottom: 20px; font-size: 13px;">💣 一票否决: <br><span style="font-weight:normal; margin-top:4px; display:block;">${els.voteReasonInput.value || els.voteReasonSelect.value || '无'}</span></div>`;

    const schema = activeSchemas[els.subCat.value]; let barsHtml = `<div style="font-size:13px; font-weight:bold; margin-bottom:15px; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:8px;">📊 实时评价细分矩阵</div>`;
    if (schema) {
        schema.forEach(dim => {
            let sum = 0; dim.subs.forEach(s => sum += (activeScores[s.id] || 0));
            const avg = sum / dim.subs.length; const percent = (avg * 10).toFixed(0);
            barsHtml += `<div style="margin-bottom: 12px;"><div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; color: var(--text-main);"><span>${dim.name}</span><span style="font-weight: 900;">${avg.toFixed(1)}</span></div><div style="height: 6px; background: var(--score-bg); border-radius: 3px; overflow: hidden;"><div style="height: 100%; background: var(--primary); width: ${percent}%; border-radius: 3px;"></div></div></div>`;
        });
    }
    zenSidebar.innerHTML = `<div style="font-size: 13px; color: var(--text-muted); font-weight: bold; margin-bottom: 5px;">正在评价</div><div style="font-size: 22px; font-weight: 900; color: var(--link-color); margin-bottom: 20px; line-height: 1.3;">${workName}</div><div style="font-size: 12px; color: var(--text-muted); margin-bottom: 5px;">系统演算总分</div><div style="font-size: 48px; font-weight: 900; line-height: 1; margin-bottom: 25px; color: ${scoreColor}; font-family: 'Arial Black', Impact, sans-serif;">${finalScore}</div>${voteHtml}${barsHtml}`;
}

function closeModal() { 
    if(isRecordDirty) showConfirm('未保存警告', '你有尚未保存的修改，直接关闭将丢失这些修改。确定要放弃吗？', async () => { els.modal.classList.remove('active'); document.body.style.overflow = ''; isRecordDirty = false; }, 'warning');
    else { els.modal.classList.remove('active'); document.body.style.overflow = ''; }
}
document.getElementById('fabAddBtn').onclick = () => openModal(null);
document.getElementById('closeModalBtn').onclick = closeModal;

// 🚀 核心革新：云端防抖保存逻辑
document.getElementById('saveRecordBtn').onclick = async () => {
    const saveBtn = document.getElementById('saveRecordBtn');
    if (saveBtn.disabled) return; // 防连点锁

    const newName = els.workName.value.trim(); 
    if(!newName) return showToast('作品名称不能为空！');

    const records = window.cloudRecords; 
    const isDuplicate = records.some(r => r.name.toLowerCase() === newName.toLowerCase() && r.id !== currentEditingId);
    if (isDuplicate) return showConfirm('作品重名警告', `馆内已存在名为《${newName}》的记录。请修改名称或编辑原记录。`, async () => {}, 'warning');

    const voteVal = parseInt(els.voteSlider.value);
    const voteReason = els.voteReasonInput.value.trim();
    if (voteVal !== 0 && !voteReason) return showToast('启用一票机制时，必须填写具体判定原因！');

    let isScoreIncomplete = false; let isReviewIncomplete = false;
    if (voteVal === 0) {
        const schema = activeSchemas[els.subCat.value];
        schema.forEach(dim => dim.subs.forEach(s => { if ((activeScores[s.id] || 0) === 0) isScoreIncomplete = true; }));
        if (!els.review.value.trim()) isReviewIncomplete = true;
    }

    const executeSave = async () => {
        // UI 防抖锁启动
        saveBtn.disabled = true;
        saveBtn.innerHTML = '⏳ 正在同步云端...';
        saveBtn.style.opacity = '0.7';
        saveBtn.style.cursor = 'wait';

        try {
            const now = Date.now(); let finalCreatedAt = now; 
            if (currentEditingId) {
                const oldRec = records.find(r => r.id === currentEditingId);
                if (oldRec) finalCreatedAt = oldRec.createdAt || parseInt(oldRec.id) || now;
            }

            const rec = {
                id: currentEditingId || now.toString(), name: newName, mainCat: els.mainCat.value, subCat: els.subCat.value,
                subCatText: els.subCat.options[els.subCat.selectedIndex].text, status: els.status.value, review: els.review.value,
                voteStatus: voteVal, voteReason: voteVal !== 0 ? voteReason : '', voteScore: voteVal !== 0 ? parseFloat(els.voteScoreInput.value) : undefined,
                isScoreIncomplete: isScoreIncomplete, isReviewIncomplete: isReviewIncomplete, scores: { ...activeScores }, 
                finalScore: els.finalScore.getAttribute('data-score') || els.finalScore.textContent,
                createdAt: finalCreatedAt, updatedAt: now, date: new Date(now).toLocaleDateString()
            };
            
            // ☁️ 异步推送到 Supabase
            const { error } = await supabaseClient.from('records').upsert(rec);
            if (error) {
                console.error("保存失败", error);
                return showToast("❌ 保存至云端失败，请检查网络！");
            }
            
            showToast(currentEditingId ? '✅ 修改已同步至云端' : '✅ 新作品已云端入库');
            await window.syncFromCloud(); // 重新拉取同步本地数组
            isRecordDirty = false; closeModal(); renderMainList();
        } finally {
            // UI 防抖锁解除
            saveBtn.disabled = false;
            saveBtn.innerHTML = '保存评价入库';
            saveBtn.style.opacity = '1';
            saveBtn.style.cursor = 'pointer';
        }
    };

    if (voteVal === 0 && (isScoreIncomplete || isReviewIncomplete)) {
        let msgArr = []; if (isScoreIncomplete) msgArr.push('部分小项未打分'); if (isReviewIncomplete) msgArr.push('未填写深度评语');
        showConfirm('评价暂未完成', `系统检测到该作品【${msgArr.join('、')}】。\n是否先作为「待完善」记录暂存入库？`, async () => { await executeSave(); }, 'warning');
    } else { await executeSave(); }
};

// 🚀 核心革新：云端防抖删除逻辑
els.delBtn.onclick = () => {
    showConfirm('删除确认', `确定要将《${els.workName.value}》彻底删除吗？此操作无法撤销。`, async () => {
        const { error } = await supabaseClient.from('records').delete().eq('id', currentEditingId);
        if (error) return showToast("❌ 云端删除失败！");

        showToast('🗑️ 云端记录已彻底销毁'); 
        await window.syncFromCloud(); // 重新同步
        isRecordDirty = false; closeModal(); renderMainList();
    }, 'warning');
};

// ================= 系统设置与框架管理 =================
document.getElementById('openSettingsBtn').onclick = () => {
    schemaBuffer = JSON.parse(JSON.stringify(activeSchemas)); 
    els.settingsModal.classList.add('active'); document.body.style.overflow = 'hidden';
    els.editorCatSelect.innerHTML = '';
    Object.keys(categoryTree).filter(k=>k!=='all').forEach(mainK => {
        const optgroup = document.createElement('optgroup'); optgroup.label = categoryTree[mainK].name;
        Object.keys(categoryTree[mainK].subs).forEach(subK => optgroup.appendChild(new Option(categoryTree[mainK].subs[subK], subK)));
        els.editorCatSelect.appendChild(optgroup);
    });
    isSchemaDirty = false; renderSchemaEditor(); renderStatusManager(); renderVoteReasonsManager();
};

function closeSettingsModal() {
    if(isSchemaDirty) showConfirm('未保存警告', '你修改的评分细则尚未保存，确定要放弃修改吗？', async () => { els.settingsModal.classList.remove('active'); document.body.style.overflow = ''; isSchemaDirty = false; }, 'warning');
    else { els.settingsModal.classList.remove('active'); document.body.style.overflow = ''; }
}
document.getElementById('closeSettingsBtn').onclick = closeSettingsModal;

document.querySelectorAll('.setting-menu-item').forEach(item => {
    item.onclick = () => {
        document.querySelectorAll('.setting-menu-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.setting-section').forEach(s => s.classList.remove('active'));
        item.classList.add('active'); document.getElementById(item.dataset.target).classList.add('active');
    };
});

els.themeSelect.onchange = (e) => { localStorage.setItem('themePref_v2', e.target.value); applyTheme(e.target.value); };
els.resetStatusBtn.onclick = () => {
    showConfirm('重置状态确认', '将清空所有自定义的状态标签，并恢复为系统初始设置（如：已看、进行中等）。确定吗？', async () => {
        localStorage.removeItem('CustomStatuses_v2'); customStatuses = [...defaultStatuses]; 
        renderStatusManager(); showToast('状态标签已恢复默认');
    });
};

const finalOverlay = document.getElementById('finalConfirmOverlay');
document.getElementById('factoryResetBtn').onclick = () => { showConfirm('高危操作：清空全部数据', '将清空所有已保存的评价记录！操作极其危险，请谨慎确认。', async () => { finalOverlay.classList.add('active'); }, 'danger'); };
document.getElementById('finalCancelBtn').onclick = () => { finalOverlay.classList.remove('active'); };
document.getElementById('finalExportJsonBtn').onclick = () => { document.getElementById('exportJsonBtn').click(); showToast('✅ 抢救性备份已下载！'); };

// 🚀 核心革新：云端防抖清库
document.getElementById('finalOkBtn').onclick = async () => {
    const btn = document.getElementById('finalOkBtn');
    if (btn.disabled) return;
    
    btn.disabled = true;
    const oldText = btn.innerHTML;
    btn.innerHTML = '⏳ 正在抹除云端数据...';
    btn.style.opacity = '0.7';
    btn.style.cursor = 'wait';

    try {
        finalOverlay.classList.remove('active');
        // 危险：删除所有记录 (匹配 ID 不为空的数据)
        const { error } = await supabaseClient.from('records').delete().neq('id', '0');
        if (error) return showToast('❌ 云端清空失败');

        showToast('💥 云端数据已全部清空，迎来新生'); 
        await window.syncFromCloud();
        renderMainList();
    } finally {
        btn.disabled = false;
        btn.innerHTML = oldText;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    }
};

document.getElementById('resetSchemaBtn').onclick = () => {
    showConfirm('重置细则确认', '将清空所有自定义的评分维度，恢复为官方默认状态。确定吗？', async () => {
        localStorage.removeItem('CustomSchemas_v2'); activeSchemas = JSON.parse(JSON.stringify(defaultSchemas_v2));
        if (schemaBuffer) schemaBuffer = JSON.parse(JSON.stringify(defaultSchemas_v2));
        isSchemaDirty = false; renderSchemaEditor(); showToast('细则已恢复默认');
    });
};

els.editorCatSelect.onchange = () => {
    if(isSchemaDirty) showConfirm('切换分类提示', '当前分类的修改未保存，切换将丢失修改。确定切换吗？', async () => { isSchemaDirty = false; renderSchemaEditor(); }, 'warning');
    else renderSchemaEditor();
};

function renderSchemaEditor() {
    const catKey = els.editorCatSelect.value; const schema = schemaBuffer[catKey]; els.schemaEditor.innerHTML = '';
    schema.forEach((dim, dimIdx) => {
        let subsHtml = '';
        dim.subs.forEach((sub, subIdx) => {
            subsHtml += `<div class="editor-sub-row draggable-item" draggable="true" ondragstart="handleDragStart(event, 'schema_sub', ${subIdx}, ${dimIdx})" ondragover="handleDragOver(event, 'schema_sub', ${dimIdx})" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, 'schema_sub', ${subIdx}, ${dimIdx})" ondragend="handleDragEnd(event)"><div class="drag-handle" title="按住拖拽排序">☰</div><input type="text" class="editor-sub-name-input" data-dim="${dimIdx}" data-sub="${subIdx}" data-type="name" value="${sub.name}" placeholder="小项名称"><input type="text" style="flex:1;" data-dim="${dimIdx}" data-sub="${subIdx}" data-type="desc" value="${sub.desc || ''}" placeholder="在这里输入问号悬浮释义..."><button class="btn-icon-del" style="font-size: 12px;" title="删除此小项" onclick="delSubItem('${catKey}', ${dimIdx}, ${subIdx})">✖</button></div>`;
        });
        const html = `<div class="editor-dim-card draggable-item" draggable="true" ondragstart="handleDragStart(event, 'schema_dim', ${dimIdx})" ondragover="handleDragOver(event, 'schema_dim')" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, 'schema_dim', ${dimIdx})" ondragend="handleDragEnd(event)"><div class="editor-dim-header"><div class="drag-handle" title="按住拖拽排序">☰</div><input type="text" style="flex:1; font-weight:bold; font-size:15px;" data-dim="${dimIdx}" data-type="dimName" value="${dim.name}"><div class="weight-input-wrapper"><span>权重</span><input type="number" class="editor-dim-weight-input" data-dim="${dimIdx}" data-type="weight" value="${Math.round(dim.weight * 100)}" min="0" max="100"><span>%</span></div><button class="btn-icon-del" style="font-size: 16px; margin-left: 5px;" title="删除此大类" onclick="delDimension('${catKey}', ${dimIdx})">✖</button></div><div>${subsHtml}</div><div class="editor-add-block" style="padding: 6px; margin: 10px 0 0 15px; font-size: 12px;" onclick="addSubItem('${catKey}', ${dimIdx})">+ 添加子项</div></div>`;
        els.schemaEditor.insertAdjacentHTML('beforeend', html);
    });
    els.schemaEditor.insertAdjacentHTML('beforeend', `<div class="editor-add-block" onclick="addDimension('${catKey}')">+ 新增大评分维度</div>`);
    els.schemaEditor.querySelectorAll('input').forEach(input => {
        input.oninput = (e) => {
            isSchemaDirty = true; const d = e.target.dataset; const val = e.target.value;
            if(d.type === 'dimName') schema[d.dim].name = val;
            else if(d.type === 'weight') schema[d.dim].weight = parseInt(val) / 100;
            else if(d.type === 'name') schema[d.dim].subs[d.sub].name = val;
            else if(d.type === 'desc') schema[d.dim].subs[d.sub].desc = val;
        };
    });
}

window.triggerSchemaReset = () => {
    const catKey = els.editorCatSelect.value; const catName = els.editorCatSelect.options[els.editorCatSelect.selectedIndex].text;
    showConfirm('重置确认', `确定要将【${catName}】的评分细则恢复为官方默认吗？此操作将立即覆盖并保存。`, async () => {
        activeSchemas[catKey] = JSON.parse(JSON.stringify(defaultSchemas_v2[catKey]));
        schemaBuffer[catKey] = JSON.parse(JSON.stringify(defaultSchemas_v2[catKey])); 
        localStorage.setItem('CustomSchemas_v2', JSON.stringify(activeSchemas));
        isSchemaDirty = false; renderSchemaEditor(); showToast(`已恢复【${catName}】的默认细则`);
    });
};

window.moveDimension = (cat, idx, dir) => {
    const schema = schemaBuffer[cat]; if (idx + dir < 0 || idx + dir >= schema.length) return;
    const temp = schema[idx]; schema[idx] = schema[idx+dir]; schema[idx+dir] = temp;
    isSchemaDirty = true; renderSchemaEditor();
};
window.delDimension = (cat, idx) => {
    if(schemaBuffer[cat].length <= 1) return showToast('至少保留一个大类'); 
    schemaBuffer[cat].splice(idx, 1); isSchemaDirty = true; renderSchemaEditor(); showToast('大类已移除 (未保存前均可撤销)'); 
};
window.addDimension = (cat) => {
    schemaBuffer[cat].push({ id: 'dim_'+Date.now(), name: '新维度', weight: 0, subs: [{id: 'sub_'+Date.now(), name: '新子项', desc: ''}] }); 
    isSchemaDirty = true; renderSchemaEditor();
};
window.moveSubItem = (cat, dimIdx, subIdx, dir) => {
    const subs = schemaBuffer[cat][dimIdx].subs; if (subIdx + dir < 0 || subIdx + dir >= subs.length) return;
    const temp = subs[subIdx]; subs[subIdx] = subs[subIdx+dir]; subs[subIdx+dir] = temp;
    isSchemaDirty = true; renderSchemaEditor();
};
window.delSubItem = (cat, dimIdx, subIdx) => {
    if(schemaBuffer[cat][dimIdx].subs.length <= 1) return showToast('至少保留一个子项'); 
    schemaBuffer[cat][dimIdx].subs.splice(subIdx, 1); isSchemaDirty = true; renderSchemaEditor();
};
window.addSubItem = (cat, dimIdx) => {
    schemaBuffer[cat][dimIdx].subs.push({ id: 'sub_'+Date.now(), name: '新子项', desc: '' }); 
    isSchemaDirty = true; renderSchemaEditor();
};

document.getElementById('saveSchemaBtn').onclick = () => {
    const catKey = els.editorCatSelect.value; const schema = schemaBuffer[catKey];
    let weightSum = 0; schema.forEach(dim => weightSum += Math.round(dim.weight * 100));
    if (weightSum !== 100) return showToast(`⚠️ 权重总和必须为 100% (当前为 ${weightSum}%)`);
    activeSchemas = JSON.parse(JSON.stringify(schemaBuffer)); 
    localStorage.setItem('CustomSchemas_v2', JSON.stringify(activeSchemas));
    isSchemaDirty = false; showToast('✅ 系统评分框架已更新！'); renderSchemaEditor();
};

// ================= 全局拖拽排序引擎 =================
let dragCtx = null; let dragScrollSpeed = 0; let dragScrollRAF = null;
const doDragScroll = () => {
    if (dragCtx && dragScrollSpeed !== 0) { const box = document.querySelector('.settings-content'); if (box) box.scrollTop += dragScrollSpeed; }
    if (dragCtx) dragScrollRAF = requestAnimationFrame(doDragScroll);
};
window.handleDragStart = (e, type, idx, extra = null) => {
    e.stopPropagation(); dragCtx = { type, idx, extra };
    const item = e.target.closest('.draggable-item'); setTimeout(() => { if(item) item.classList.add('dragging'); }, 0); 
    e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', ''); 
    dragScrollSpeed = 0; if (!dragScrollRAF) dragScrollRAF = requestAnimationFrame(doDragScroll);
};
window.handleDragOver = (e, type, extra = null) => {
    if (!dragCtx || dragCtx.type !== type || dragCtx.extra !== extra) return;
    e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.drop-over').forEach(el => el.classList.remove('drop-over'));
    const item = e.target.closest('.draggable-item'); if (item) item.classList.add('drop-over'); 
};
window.handleDragLeave = (e) => { e.stopPropagation(); };
window.handleDragEnd = (e) => {
    e.stopPropagation(); document.querySelectorAll('.draggable-item').forEach(el => el.classList.remove('dragging', 'drop-over'));
    dragCtx = null; cancelAnimationFrame(dragScrollRAF); dragScrollRAF = null;
};
window.handleDrop = (e, type, toIdx, extra = null) => {
    if (!dragCtx || dragCtx.type !== type || dragCtx.extra !== extra) return;
    e.preventDefault(); e.stopPropagation(); 
    document.querySelectorAll('.draggable-item').forEach(el => el.classList.remove('drop-over'));
    const fromIdx = dragCtx.idx; if (fromIdx === toIdx) { dragCtx = null; cancelAnimationFrame(dragScrollRAF); dragScrollRAF = null; return; }
    const moveArr = (arr, from, to) => { const item = arr.splice(from, 1)[0]; arr.splice(to, 0, item); };
    if (type === 'status') { moveArr(customStatuses, fromIdx, toIdx); localStorage.setItem('CustomStatuses_v2', JSON.stringify(customStatuses)); renderStatusManager(); } 
    else if (type === 'vote_approve') { moveArr(customVoteReasons.approve, fromIdx, toIdx); localStorage.setItem('CustomVoteReasons_v2', JSON.stringify(customVoteReasons)); renderVoteReasonsManager(); } 
    else if (type === 'vote_veto') { moveArr(customVoteReasons.veto, fromIdx, toIdx); localStorage.setItem('CustomVoteReasons_v2', JSON.stringify(customVoteReasons)); renderVoteReasonsManager(); } 
    else if (type === 'schema_dim') { const catKey = els.editorCatSelect.value; moveArr(schemaBuffer[catKey], fromIdx, toIdx); isSchemaDirty = true; renderSchemaEditor(); } 
    else if (type === 'schema_sub') { const catKey = els.editorCatSelect.value; moveArr(schemaBuffer[catKey][extra].subs, fromIdx, toIdx); isSchemaDirty = true; renderSchemaEditor(); }
    dragCtx = null; cancelAnimationFrame(dragScrollRAF); dragScrollRAF = null;
};
window.addEventListener('dragover', (e) => {
    if (!dragCtx) return; const box = document.querySelector('.settings-content'); if (!box) return;
    const rect = box.getBoundingClientRect(); const buffer = 160; 
    if (e.clientY > 0 && e.clientY < rect.top + buffer) dragScrollSpeed = -Math.min(35, (buffer - (e.clientY - rect.top)) * 0.5);
    else if (e.clientY > 0 && e.clientY > rect.bottom - buffer) dragScrollSpeed = Math.min(35, (buffer - (rect.bottom - e.clientY)) * 0.5);
    else dragScrollSpeed = 0; 
}, true);

function renderStatusManager() {
    els.statusList.innerHTML = '';
    customStatuses.forEach((status, idx) => {
        const div = document.createElement('div'); div.className = 'status-item draggable-item';
        div.draggable = true; div.ondragstart = (e) => handleDragStart(e, 'status', idx); div.ondragover = (e) => handleDragOver(e, 'status'); div.ondragleave = handleDragLeave; div.ondrop = (e) => handleDrop(e, 'status', idx); div.ondragend = handleDragEnd;
        div.innerHTML = `<div style="display:flex; align-items:center; gap:5px;"><div class="drag-handle" title="按住拖拽排序">☰</div><span>${status}</span></div><button class="btn-icon-del" onclick="delStatus(${idx})">✖</button>`;
        els.statusList.appendChild(div);
    });
    const resetBtn = document.createElement('button'); resetBtn.className = 'btn-danger-outline'; resetBtn.style.cssText = "width:100%; margin-top:20px; border-style:dashed;"; resetBtn.textContent = "⚠️ 恢复默认状态列表"; resetBtn.onclick = () => els.resetStatusBtn.click();
    els.statusList.appendChild(resetBtn);
}
window.moveStatus = (idx, dir) => {
    if (idx + dir < 0 || idx + dir >= customStatuses.length) return;
    const temp = customStatuses[idx]; customStatuses[idx] = customStatuses[idx+dir]; customStatuses[idx+dir] = temp;
    localStorage.setItem('CustomStatuses_v2', JSON.stringify(customStatuses)); renderStatusManager();
};
document.getElementById('addStatusBtn').onclick = () => {
    const input = document.getElementById('newStatusInput'); const val = input.value.trim(); if(!val) return;
    if(customStatuses.includes(val)) return showToast('该状态已存在');
    customStatuses.push(val); localStorage.setItem('CustomStatuses_v2', JSON.stringify(customStatuses)); input.value = ''; renderStatusManager(); showToast('状态已添加');
};
window.delStatus = function(idx) {
    if(customStatuses.length <= 1) return showToast('至少保留一个状态标签');
    customStatuses.splice(idx, 1); localStorage.setItem('CustomStatuses_v2', JSON.stringify(customStatuses)); renderStatusManager();
}

function formatPreciseTime(rec) {
    const ts = parseInt(rec.createdAt || rec.id); 
    if (ts && !isNaN(ts) && ts > 1000000000000) {
        const d = new Date(ts); const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    return rec.date; 
}

function getExportFilename(ext) {
    const now = new Date(); const pad = n => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return `牛人影音志_v${APP_VERSION}_${timeStr}.${ext}`;
}

function generateExportData() {
    const records = window.cloudRecords; 
    if(records.length === 0) { showToast('暂无数据可导出'); return null; }
    return records;
}

document.getElementById('exportCsvBtn').onclick = () => {
    const records = generateExportData(); if(!records) return;
    let csv = "data:text/csv;charset=utf-8,\uFEFF";
    csv += "大类,细分分类,作品名称,状态,系统得分,豆瓣星级,Bangumi评级,一票赞成,一票否决,一票原因,待完善标签,详细评分数据,评语,添加日期\n";
    records.forEach(r => { 
        const mainCatName = categoryTree[r.mainCat] ? categoryTree[r.mainCat].name : r.mainCat;
        let details = [];
        if(activeSchemas[r.subCat]) { activeSchemas[r.subCat].forEach(dim => { dim.subs.forEach(sub => { if(r.scores && r.scores[sub.id] !== undefined) details.push(`${sub.name}:${r.scores[sub.id]}`); }); }); }
        const hasScore = r.finalScore > 0 || r.isVeto || r.voteStatus === -1;
        const dStar = hasScore ? renderStars(r.finalScore) : "未评"; const bLabel = hasScore ? getBangumiLabel(r.finalScore, true) : "未评";
        const isProtectStr = (r.voteStatus === 1 || r.isProtect) ? "是" : "否"; const isVetoStr = (r.voteStatus === -1 || r.isVeto) ? "是" : "否";
        let incompleteStr = []; if (r.isScoreIncomplete) incompleteStr.push("缺分数"); if (r.isReviewIncomplete) incompleteStr.push("无评语");
        let safeReview = (r.review || '').replace(/"/g, '""').replace(/\n/g, ' '); 
        csv += `"${mainCatName}","${r.subCatText}","${r.name}","${r.status}",${r.finalScore},"${dStar}","${bLabel}",${isProtectStr},${isVetoStr},"${r.voteReason || ''}","${incompleteStr.join('|')}","${details.join(' | ')}","${safeReview}","${formatPreciseTime(r)}"\n`; 
    });
    triggerDownload(csv, getExportFilename('csv'));
};

document.getElementById('exportTxtBtn').onclick = () => {
    const records = generateExportData(); if(!records) return;
    let txtStr = `=================================================\n 牛人影音志 档案备份 (v${APP_VERSION})\n 导出时间: ${new Date().toLocaleString()}\n 共计收录: ${records.length} 部作品\n=================================================\n\n`;
    records.forEach(r => {
        const mainCatName = categoryTree[r.mainCat] ? categoryTree[r.mainCat].name : r.mainCat;
        txtStr += `【 ${r.name} 】\n> 分类：${mainCatName} - ${r.subCatText}\n> 状态：${r.status}  |  入库时间：${formatPreciseTime(r)}\n`;
        const hasScore = r.finalScore > 0 || r.isVeto || r.voteStatus === -1;
        if (hasScore) txtStr += `> 综合得分：${r.finalScore}  (豆瓣: ${renderStars(r.finalScore)} | Bangumi: ${getBangumiLabel(r.finalScore, true)})\n`;
        else txtStr += `> 综合得分：未评级\n`;
        if (r.voteStatus === 1 || r.isProtect) txtStr += `> 特殊判定：🌟 一票赞成 (${r.voteReason || '无'})\n`;
        if (r.voteStatus === -1 || r.isVeto) txtStr += `> 特殊判定：💣 一票否决 (${r.voteReason || '无'})\n`;
        let details = [];
        if(activeSchemas[r.subCat]) { activeSchemas[r.subCat].forEach(dim => { dim.subs.forEach(sub => { if(r.scores && r.scores[sub.id] !== undefined) details.push(`${sub.name}:${r.scores[sub.id]}`); }); }); }
        if (details.length > 0) txtStr += `> 小项明细：${details.join(' | ')}\n`;
        txtStr += `> 深度剖析：\n${r.review || '暂无详细评语...'}\n-------------------------------------------------\n\n`;
    });
    const txtData = "data:text/plain;charset=utf-8,\uFEFF" + encodeURIComponent(txtStr);
    triggerDownload(txtData, getExportFilename('txt'));
};

document.getElementById('exportJsonBtn').onclick = () => {
    const records = window.cloudRecords; 
    const settings = {
        customSchemas: activeSchemas, customStatuses: customStatuses, customVoteReasons: customVoteReasons, 
        theme: localStorage.getItem('themePref_v2') || 'auto', displayMode: localStorage.getItem('displayModePref_v2') || 'system',
        timeDisplayMode: localStorage.getItem('timeDisplayPref_v2') || 'updated', confirmDelayPrefs: JSON.parse(localStorage.getItem('confirmDelayPrefs_v2') || '{"danger": 3, "warning": 3}')
    };
    const fullArchive = { meta: { app: "NiurenMediaLog", version: APP_VERSION, exportTime: Date.now() }, settings: settings, data: records };
    const jsonStr = JSON.stringify(fullArchive, null, 2);
    const dataUrl = "data:application/json;charset=utf-8,\uFEFF" + encodeURIComponent(jsonStr);
    triggerDownload(dataUrl, getExportFilename('json'));
};

// 🚀 核心革新：云端防抖导入还原
document.getElementById('importJsonFile').addEventListener('change', function(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            if (!importedData.meta || importedData.meta.app !== "NiurenMediaLog") {
                e.target.value = ''; return showToast('❌ 导入失败：无法识别的牛人影音志存档格式');
            }
            showConfirm('数据覆盖警告', `识别到来自 v${importedData.meta.version} 版本的存档。导入将直接覆盖云端所有的评价记录和自定义设置。确定要继续吗？`, async () => {
                
                if (importedData.data && importedData.data.length > 0) {
                    const { error } = await supabaseClient.from('records').upsert(importedData.data);
                    if(error) return showToast('❌ 云端数据还原失败');
                }

                if (importedData.settings) {
                    if (importedData.settings.customSchemas) { activeSchemas = importedData.settings.customSchemas; localStorage.setItem('CustomSchemas_v2', JSON.stringify(activeSchemas)); }
                    if (importedData.settings.customStatuses) { customStatuses = importedData.settings.customStatuses; localStorage.setItem('CustomStatuses_v2', JSON.stringify(customStatuses)); }
                    if (importedData.settings.customVoteReasons) { customVoteReasons = importedData.settings.customVoteReasons; localStorage.setItem('CustomVoteReasons_v2', JSON.stringify(customVoteReasons)); }
                    if (importedData.settings.theme) { localStorage.setItem('themePref_v2', importedData.settings.theme); els.themeSelect.value = importedData.settings.theme; applyTheme(importedData.settings.theme); }
                    if (importedData.settings.displayMode) { localStorage.setItem('displayModePref_v2', importedData.settings.displayMode); els.displayModeSelect.value = importedData.settings.displayMode; }
                    if (importedData.settings.timeDisplayMode) { localStorage.setItem('timeDisplayPref_v2', importedData.settings.timeDisplayMode); if (document.getElementById('timeDisplayModeSelect')) { document.getElementById('timeDisplayModeSelect').value = importedData.settings.timeDisplayMode; } }
                    if (importedData.settings.confirmDelayPrefs) { localStorage.setItem('confirmDelayPrefs_v2', JSON.stringify(importedData.settings.confirmDelayPrefs)); document.getElementById('delayDangerInput').value = importedData.settings.confirmDelayPrefs.danger; document.getElementById('delayWarningInput').value = importedData.settings.confirmDelayPrefs.warning; }
                }

                showToast('✅ 云端存档导入成功！正在重载数据...'); e.target.value = ''; 
                
                await window.syncFromCloud(); 
                renderMainList(); renderStatusManager(); renderVoteReasonsManager(); 
                if (els.settingsModal.classList.contains('active')) { schemaBuffer = JSON.parse(JSON.stringify(activeSchemas)); renderSchemaEditor(); }
            }, 'danger'); 
        } catch (err) { showToast('❌ 读取失败：JSON 文件解析异常或已损坏'); console.error(err); e.target.value = ''; }
    };
    reader.readAsText(file);
});

function triggerDownload(dataUrl, filename) {
    const link = document.createElement("a"); link.href = dataUrl; link.download = filename; 
    document.body.appendChild(link); link.click(); document.body.removeChild(link); showToast(`成功导出：${filename}`);
}

const tutData = [
    { img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80', title: '欢迎来到牛人影音志', desc: '告别一拍脑袋的打分！在这里，我们用十余种专属分类、几十套精细的评价维度，为你建立最严谨的私人精神食粮档案馆。' },
    { img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', title: '10分制加权算法与一票机制', desc: '每一个细分项都将参与最终加权计算。鼠标悬浮在 ❓ 号上可查看释义。遇到意义非凡或触碰底线的作品？果断使用“白月光”与“踩雷”一票机制。' },
    { img: 'https://images.unsplash.com/photo-1588421357574-87938a86fa28?auto=format&fit=crop&w=600&q=80', title: '属于你的私人定制', desc: '在【系统设置】中，你可以自由修改每一个评分维度、权重、释义，甚至自定义“搁置”、“二刷中”等作品状态，打造你的终极评价体系。' }
];
let tutIndex = 0;
function updateTutorial() {
    document.getElementById('tutImg').src = tutData[tutIndex].img; document.getElementById('tutTitle').textContent = tutData[tutIndex].title; document.getElementById('tutDesc').textContent = tutData[tutIndex].desc;
    document.querySelectorAll('.tut-dot').forEach((d, i) => { d.className = i === tutIndex ? 'tut-dot active' : 'tut-dot'; });
    document.getElementById('tutPrevBtn').style.opacity = tutIndex === 0 ? '0' : '1'; document.getElementById('tutPrevBtn').style.pointerEvents = tutIndex === 0 ? 'none' : 'auto';
    document.getElementById('tutNextBtn').textContent = tutIndex === tutData.length - 1 ? '开始使用' : '下一步';
}
function openTutorial() { tutIndex = 0; updateTutorial(); document.getElementById('tutorialOverlay').classList.add('active'); }
document.getElementById('tutPrevBtn').onclick = () => { if(tutIndex > 0) { tutIndex--; updateTutorial(); } };
document.getElementById('tutNextBtn').onclick = () => { 
    if(tutIndex < tutData.length - 1) { tutIndex++; updateTutorial(); } 
    else { document.getElementById('tutorialOverlay').classList.remove('active'); localStorage.setItem('hasSeenTutorial_v2', 'true'); }
};
document.getElementById('reopenTutorialBtn').onclick = () => { els.settingsModal.classList.remove('active'); document.body.style.overflow = ''; openTutorial(); };

els.modal.addEventListener('click', (e) => { if (e.target === els.modal) closeModal(); });
els.settingsModal.addEventListener('click', (e) => { if (e.target === els.settingsModal) closeSettingsModal(); });
const tutOverlayEl = document.getElementById('tutorialOverlay');
tutOverlayEl.addEventListener('click', (e) => { if (e.target === tutOverlayEl) { tutOverlayEl.classList.remove('active'); localStorage.setItem('hasSeenTutorial_v2', 'true'); } });
document.getElementById('confirmOverlay').addEventListener('click', (e) => { if (e.target === document.getElementById('confirmOverlay')) { document.getElementById('confirmCancelBtn').click(); } });
document.getElementById('finalConfirmOverlay').addEventListener('click', (e) => { if (e.target === document.getElementById('finalConfirmOverlay')) { document.getElementById('finalCancelBtn').click(); } });

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

document.getElementById('dashboardModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('dashboardModal')) { document.getElementById('dashboardModal').classList.remove('active'); document.body.style.overflow = ''; }
});

// ================= 数据洞察看板核心引擎 =================
let dashCatChartInst = null; let dashScoreChartInst = null;

document.getElementById('openDashboardBtn').onclick = () => {
    document.getElementById('dashboardModal').classList.add('active'); document.body.style.overflow = 'hidden'; renderDashboardData();
};
document.getElementById('closeDashboardBtn').onclick = () => { document.getElementById('dashboardModal').classList.remove('active'); document.body.style.overflow = ''; };

function renderDashboardData() {
    const records = window.cloudRecords; 
    
    document.getElementById('dashTotal').textContent = records.length;
    const scoredRecs = records.filter(r => (parseFloat(r.finalScore) > 0 || r.voteStatus !== 0) && !r.isScoreIncomplete);
    const avg = scoredRecs.length ? (scoredRecs.reduce((sum, r) => sum + parseFloat(r.finalScore), 0) / scoredRecs.length).toFixed(1) : '0.0';
    document.getElementById('dashAvgScore').textContent = avg;
    document.getElementById('dashApprove').textContent = records.filter(r => r.voteStatus === 1).length;
    document.getElementById('dashVeto').textContent = records.filter(r => r.voteStatus === -1).length;

    let mostFreqScore = '暂无';
    if (scoredRecs.length > 0) {
        const scoreCounts = {};
        scoredRecs.forEach(r => { const s = parseFloat(r.finalScore).toFixed(1); scoreCounts[s] = (scoreCounts[s] || 0) + 1; });
        mostFreqScore = Object.keys(scoreCounts).reduce((a, b) => scoreCounts[a] > scoreCounts[b] ? a : b);
    }
    document.getElementById('dashMostFreqScore').textContent = mostFreqScore;

    if (records.length === 0) return; 

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#e2e8f0' : '#2c3e50'; const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    const catCounts = {};
    records.forEach(r => { const name = categoryTree[r.mainCat] ? categoryTree[r.mainCat].name : '其他'; catCounts[name] = (catCounts[name] || 0) + 1; });
    
    if(dashCatChartInst) dashCatChartInst.destroy();
    dashCatChartInst = new Chart(document.getElementById('dashCatChart').getContext('2d'), {
        type: 'doughnut',
        data: { labels: Object.keys(catCounts), datasets: [{ data: Object.values(catCounts), backgroundColor: ['#f09199', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6', '#e67e22'], borderWidth: isDark ? 2 : 0, borderColor: isDark ? '#1e1e1e' : '#fff' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: textColor, font: {size: 11} } } } }
    });

    const scoreBins = {'9-10分(神作)':0, '8-9分(优秀)':0, '7-8分(良好)':0, '6-7分(及格)':0, '6分以下(雷区)':0};
    scoredRecs.forEach(r => {
        const s = parseFloat(r.finalScore);
        if(s >= 9) scoreBins['9-10分(神作)']++; else if(s >= 8) scoreBins['8-9分(优秀)']++; else if(s >= 7) scoreBins['7-8分(良好)']++; else if(s >= 6) scoreBins['6-7分(及格)']++; else scoreBins['6分以下(雷区)']++;
    });

    if(dashScoreChartInst) dashScoreChartInst.destroy();
    dashScoreChartInst = new Chart(document.getElementById('dashScoreChart').getContext('2d'), {
        type: 'bar',
        data: { labels: Object.keys(scoreBins), datasets: [{ label: '作品数量', data: Object.values(scoreBins), backgroundColor: ['#f09199', '#3498db', '#f1c40f', '#bdc3c7', '#e74c3c'], borderRadius: 6 }] },
        options: { 
            responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: textColor }, grid: { color: gridColor } }, x: { ticks: { color: textColor, font: {size: 11} }, grid: { display: false } } }
        }
    });

    const sortedRecs = [...scoredRecs].sort((a,b) => parseFloat(b.finalScore) - parseFloat(a.finalScore));
    const top3 = sortedRecs.slice(0, 3); const bottom3 = [...sortedRecs].reverse().slice(0, 3);

    const renderHof = (arr, containerId, defaultColor) => {
        const html = arr.length > 0 ? arr.map(r => {
            let color = defaultColor; if(r.voteStatus === 1) color = 'var(--warning)'; if(r.voteStatus === -1) color = 'var(--danger)';
            return `<div class="hof-item"><span class="hof-name" title="${r.name}">${r.name}</span><span class="hof-score" style="color: ${color};">${parseFloat(r.finalScore).toFixed(1)}</span></div>`;
        }).join('') : '<div style="text-align:center; color:var(--text-muted); padding: 10px 0;">暂无足够数据</div>';
        document.getElementById(containerId).innerHTML = html;
    };

    renderHof(top3, 'hofTopList', '#f39c12'); renderHof(bottom3, 'hofBottomList', '#e74c3c');
}

window.addEventListener('beforeunload', (e) => { if (isRecordDirty || isSchemaDirty) { e.preventDefault(); e.returnValue = ''; } });

// 🚀 核心革新：启动时强制拉取云端数据
async function init() {
    const savedTheme = localStorage.getItem('themePref_v2') || 'auto'; els.themeSelect.value = savedTheme; applyTheme(savedTheme);
    const savedDisplayMode = localStorage.getItem('displayModePref_v2') || 'system'; els.displayModeSelect.value = savedDisplayMode;
    const savedTimePref = localStorage.getItem('timeDisplayPref_v2') || 'updated'; document.getElementById('timeDisplayModeSelect').value = savedTimePref;
    document.getElementById('timeDisplayModeSelect').onchange = (e) => { localStorage.setItem('timeDisplayPref_v2', e.target.value); renderMainList(); };
    document.querySelectorAll('.versionText').forEach(el => el.textContent = APP_VERSION);
    renderChangelog();
    
    const delayPrefs = JSON.parse(localStorage.getItem('confirmDelayPrefs_v2') || '{"danger": 3, "warning": 3}');
    document.getElementById('delayDangerInput').value = delayPrefs.danger; document.getElementById('delayWarningInput').value = delayPrefs.warning;
    const updateDelayPrefs = () => { localStorage.setItem('confirmDelayPrefs_v2', JSON.stringify({ danger: parseInt(document.getElementById('delayDangerInput').value) || 0, warning: parseInt(document.getElementById('delayWarningInput').value) || 0 })); };
    document.getElementById('delayDangerInput').addEventListener('change', updateDelayPrefs); document.getElementById('delayWarningInput').addEventListener('change', updateDelayPrefs);

    // ☁️ 等待云端数据同步完成... (传入 true 触发启动问候 Toast)
    await window.syncFromCloud(true);
    
    initNavTabs(); initCascader(); renderMainList();
    if(!localStorage.getItem('hasSeenTutorial_v2')) setTimeout(openTutorial, 500);
    initHoverPreview();
}

init();