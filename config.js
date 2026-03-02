// ================= 牛人影音志 - 全局静态配置中心 =================

// 1. 系统版本与更新日志
const APP_CHANGELOG = [
    {
        version: '1.3.1',
        date: '2026/3/2',
        changes: [
            '[新特性] 视觉升级：全站引入专属主视觉 Icon，在浏览器标签页及导航栏全局展示。',
            '[优化] 导航栏布局重构：优化了左侧 Logo 与标题的排版间距与悬浮动效，使其在各设备下均能保持优雅的居中对齐。'
        ]
    },{
        version: '1.3.0',
        date: '2026/3/2',
        changes: [
            '[✨里程碑] 彻底云端化跃升：系统正式接入 Supabase 云端数据库！告别本地浏览器缓存，实现跨平台的实时无缝、全局配置云端同步。',
            '[优化] 全局网络防抖与优雅加载：针对云端延迟，为核心按钮引入异步防触控锁与 Loading 动效，彻底杜绝数据重复提交。',
            '[优化] 强化云端交互反馈：网页启动时及网络操作后增加明确的 Toast 提示，附带精准时间戳。',
            '[优化] 深度代码架构重构：抽离所有静态配置与长文本字典至独立的 config.js，极大提升核心逻辑的优雅度与可维护性。',
            '[优化] 搜索框「灵动伸缩」动效：优化首页检索栏，获取焦点后将自适应平滑延展，完美填满顶部可用空白区域。'
        ]
    },  
    {
        version: '1.2.1',
        date: '2026/3/2',
        changes: [
            '[✨里程碑] 磅礴上线「个人数据洞察看板」：内置 Chart.js 双引擎渲染，支持实时呈现领域涉猎饼图与评分正态分布曲线。',
            '[新特性] 生态闭环：系统设置新增「导入/导出 JSON 存档」功能。一键无损还原全量打分数据。',
            '[新特性] 独创「沉浸式全屏写作 (Zen Mode)」：在评语栏点击开启全屏打字机模式。',
            '[新特性] 引入“时空双轴”管理系统：评价记录现已区分「创建时间」与「修改时间」。',
            '[优化] 交互大升级：全面支持丝滑的拖拽重排功能。'
        ]
    },
    {
        version: '1.2.0',
        changes: [
            '[新特性] 引入“灵动预览”机制：首页卡片悬浮 0.5s 即可自动查看多维小分细则。',
            '[新特性] 评分面板大类显分：修改评价时，各核心大类标题旁实时显示当前的平均得分。'
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

// 2. 核心大类与细分树
const categoryTree = {
    'all': { name: '全部记录', subs: {} },
    'acg': { name: '二次元 / ACG', subs: { 'anime': '番剧 / 动画', 'vn': 'Galgame', 'game': '游戏', 'manga': '漫画 / 轻小说', 'acg_music': 'ACG 音乐' } },
    'live_action': { name: '三次元影视', subs: { 'movie': '电影', 'tv': '电视剧', 'doc': '纪录片' } },
    'literature': { name: '文学与阅读', subs: { 'novel': '长/中篇小说', 'prose': '散文 / 随笔', 'nonfic': '社科 / 纪实', 'poetry': '诗歌 / 戏剧' } },
    'art_audio': { name: '艺术与泛听觉', subs: { 'artbook': '摄影集 / 画册', 'podcast': '泛音乐 / 播客' } }
};

// 3. 官方默认评分细则字典
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

// 4. 默认作品状态
const defaultStatuses = ['已看 / 通关', '二刷 / 多周目中', '进行中', '搁置中', '烂尾弃坑'];