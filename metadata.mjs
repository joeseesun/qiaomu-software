// Curated Mac software metadata, alias canonicalization, standard themes,
// pain-point search keywords, free/open-source alternatives, audit slots,
// setup packs, and background sync against Homebrew Cask & Apple iTunes APIs.

export const normalizeAppKey = (name) =>
  String(name ?? '').normalize('NFC').trim().replace(/[A-Z]+/g, letters => letters.toLowerCase());

export const ROLES = [
  '独立开发者',
  '全栈开发',
  '前端开发',
  '后端开发',
  'AI 工程师',
  '设计师',
  '产品经理',
  '内容创作者',
  '效率极客',
  '学生',
];

export const STANDARD_THEMES = [
  { id: 'ai', name: 'AI 工具' },
  { id: 'dev', name: '开发编程' },
  { id: 'productivity', name: '效率与启动' },
  { id: 'notes', name: '写作与笔记' },
  { id: 'browser', name: '浏览器' },
  { id: 'system', name: '系统增强' },
  { id: 'media', name: '截图与影音' },
  { id: 'design', name: '设计与创意' },
  { id: 'chat', name: '沟通与协作' },
];

export const THEME_BY_ID = new Map(STANDARD_THEMES.map(t => [t.id, t]));

// Core Mac productivity slots checked during /taste Mac software audit
export const AUDIT_SLOTS = [
  {
    id: 'launcher',
    name: '启动器与效率中枢',
    why: '替代 Spotlight，一键启动应用、搜文件、运行快捷脚本',
    apps: ['raycast', 'alfred', 'utools'],
    champion: 'raycast',
    freePick: 'raycast',
  },
  {
    id: 'screenshot',
    name: '截图与标注录屏',
    why: '日常沟通、写文档、提 Bug 最频繁的刚需工具',
    apps: ['cleanshot x', 'shottr', 'pixpin', 'snipaste', 'ishot pro', 'screen studio', 'kap'],
    champion: 'cleanshot x',
    freePick: 'shottr',
  },
  {
    id: 'window',
    name: '窗口分屏管理',
    why: '快捷键一键半屏/居中/跨屏移动，大屏必备',
    apps: ['rectangle', 'loop', 'magnet', 'raycast', 'bettertouchtool'],
    champion: 'rectangle',
    freePick: 'loop',
  },
  {
    id: 'clipboard',
    name: '剪贴板历史',
    why: '随时回溯之前复制过的文本、代码与图片，永不丢内容',
    apps: ['maccy', 'paste', 'raycast', 'alfred', 'utools'],
    champion: 'maccy',
    freePick: 'maccy',
  },
  {
    id: 'system',
    name: '菜单栏与系统增强',
    why: '收纳刘海菜单栏、限制电池充电、自动切输入法或监控硬件',
    apps: ['ice', 'bartender', 'stats', 'aldente', 'input source pro', 'monitorcontrol', 'betterdisplay', 'amphetamine'],
    champion: 'ice',
    freePick: 'stats',
  },
  {
    id: 'notes',
    name: '笔记与知识沉淀',
    why: '构建个人知识库、顺手写 Markdown 或划词翻译查阅',
    apps: ['obsidian', 'notion', 'typora', 'bear', 'heptabase', 'logseq', 'craft', 'bob', 'easydict'],
    champion: 'obsidian',
    freePick: 'obsidian',
  },
  {
    id: 'terminal',
    name: '现代终端与开发',
    why: '比系统自带终端更快的渲染、分屏体验或轻量容器环境',
    apps: ['ghostty', 'warp', 'iterm2', 'wezterm', 'kitty', 'alacritty', 'orbstack', 'cursor', 'visual studio code', 'zed'],
    champion: 'ghostty',
    freePick: 'ghostty',
  },
];

// Curated New Mac Setup Packs (/setup)
export const SETUP_PACKS = [
  {
    id: 'essential',
    name: '新 Mac 必装基础包',
    desc: '刚拆箱或重装系统后最值得先装的 10 款高频工具，覆盖启动、截图、分屏、菜单栏、解压与卸载。',
    apps: ['raycast', 'shottr', 'rectangle', 'ice', 'maccy', 'iina', 'keka', 'appcleaner', 'input source pro', 'stats'],
  },
  {
    id: 'dev-ai',
    name: 'AI & 独立开发全家桶',
    desc: 'AI 编程编辑器、现代 GPU 终端、轻量 Docker、抓包与内网穿透一次配齐。',
    apps: ['cursor', 'visual studio code', 'ghostty', 'orbstack', 'raycast', 'claude', 'ollama', 'bruno', 'tableplus', 'tailscale'],
  },
  {
    id: 'writing',
    name: '写作与知识管理套件',
    desc: '本地知识库、Markdown 写作、划词翻译、截图与 RSS 深度阅读组合。',
    apps: ['obsidian', 'typora', 'easydict', 'shottr', 'netnewswire', 'ticktick', 'arc', 'claude'],
  },
  {
    id: 'foss',
    name: '0 元纯开源免费全家桶',
    desc: '全部开源免费，零订阅压力，一样把 macOS 打造成极客效率主机。',
    apps: ['visual studio code', 'zed', 'ghostty', 'rectangle', 'ice', 'maccy', 'stats', 'iina', 'keka', 'pearcleaner', 'bitwarden', 'bruno', 'netnewswire', 'easydict', 'logseq'],
  },
];

// Direct curated free/open-source alternatives for paid or freemium apps
export const FREE_ALTERNATIVES = {
  'cleanshot x': ['shottr', 'pixpin', 'snipaste'],
  'ishot pro': ['shottr', 'pixpin', 'snipaste'],
  'bartender': ['ice'],
  'paste': ['maccy', 'raycast'],
  'alfred': ['raycast'],
  'magnet': ['rectangle', 'loop'],
  'bob': ['easydict'],
  'betterdisplay': ['monitorcontrol'],
  'docker desktop': ['orbstack'],
  'postman': ['bruno'],
  'tower': ['github desktop'],
  'fork': ['github desktop'],
  '1password': ['bitwarden'],
  'surge': ['flclash', 'clash verge'],
  'screen studio': ['kap'],
  'reeder': ['netnewswire'],
  'typora': ['obsidian', 'logseq'],
  'bear': ['obsidian', 'logseq'],
  'ulysses': ['obsidian', 'logseq'],
  'ia writer': ['obsidian', 'logseq'],
  'infuse': ['iina', 'vlc'],
  'transmit': ['cyberduck'],
  'downie': ['yt-dlp'],
};

// Each entry: { name, aliases?, bundles?, homepage?, cask?, masUrl?, pricing?, summary?, themes?, keywords?, system? }
export const BUILTIN_APPS = [
  { name: 'Raycast', bundles: ['com.raycast.macos'], homepage: 'https://www.raycast.com', cask: 'raycast', pricing: '免费增值', summary: '新一代 Mac 启动器，集成剪贴板、窗口管理与扩展生态', themes: ['productivity', 'ai'], keywords: '启动器 剪贴板 剪切板 窗口分屏 快捷键 效率 替代 Spotlight' },
  { name: 'Alfred', aliases: ['Alfred 5', 'Alfred 4'], bundles: ['com.runningwithcrayons.Alfred'], homepage: 'https://www.alfredapp.com', cask: 'alfred', pricing: '免费增值', summary: '经典的 Mac 效率启动器与 Workflow 自动化工具', themes: ['productivity'], keywords: '启动器 剪贴板 自动化 workflow 搜索 快捷键' },
  { name: 'uTools', bundles: ['org.u.tools'], homepage: 'https://www.u.tools', cask: 'utools', pricing: '免费增值', summary: '插件化现代效率工具箱，中文生态丰富', themes: ['productivity'], keywords: '启动器 插件 工具箱 剪贴板 翻译 快捷' },
  { name: 'Obsidian', bundles: ['md.obsidian'], homepage: 'https://obsidian.md', cask: 'obsidian', pricing: '免费增值', summary: '基于本地 Markdown 文件的双链知识库与笔记软件', themes: ['notes'], keywords: '笔记 知识库 双链 markdown 写作 本地 知识管理' },
  { name: 'Cursor', bundles: ['com.todesktop.230313mzl4w4u92'], homepage: 'https://www.cursor.com', cask: 'cursor', pricing: '免费增值', summary: 'AI 原生代码编辑器，深度集成上下文补全与 Agent 编程', themes: ['ai', 'dev'], keywords: 'AI 编程 代码编辑器 IDE 写代码 Agent' },
  { name: 'Windsurf', bundles: ['com.exafunction.windsurf'], homepage: 'https://windsurf.com', cask: 'windsurf', pricing: '免费增值', summary: 'Codeium 出品的 Agentic AI 代码编辑器', themes: ['ai', 'dev'], keywords: 'AI 编程 代码编辑器 IDE Agent Windsurf' },
  { name: 'Trae', bundles: ['com.trae.app'], homepage: 'https://www.trae.ai', pricing: '免费', summary: '字节跳动出品的 AI 原生代码编辑器', themes: ['ai', 'dev'], keywords: 'AI 编程 代码编辑器 IDE Trae 字节' },
  { name: 'Antigravity', homepage: 'https://antigravity.google', cask: 'antigravity', pricing: '免费', summary: 'Google 推出的 Agent-first AI 编程与开发工作台', themes: ['ai', 'dev'], keywords: 'AI 编程 IDE Agent 开发 Google' },
  { name: 'Claude Code', bundles: ['cli:claude-code'], homepage: 'https://docs.anthropic.com/en/docs/claude-code', pricing: '免费增值', summary: 'Anthropic 官方终端 AI 编程 Agent', themes: ['ai', 'dev'], keywords: 'AI 编程 终端 Agent CLI 写代码' },
  { name: 'Codex', homepage: 'https://openai.com/codex', cask: 'codex', pricing: '免费增值', summary: 'OpenAI 推出的 AI 编程助手与桌面/终端 Agent', themes: ['ai', 'dev'], keywords: 'AI 编程 Agent 写代码 OpenAI' },
  { name: 'Visual Studio Code', aliases: ['VS Code', 'VSCode', 'Code'], bundles: ['com.microsoft.VSCode'], homepage: 'https://code.visualstudio.com', cask: 'visual-studio-code', pricing: '开源免费', summary: '微软出品的跨平台代码编辑器与庞大插件生态', themes: ['dev'], keywords: '代码编辑器 编程 IDE 前端 后端 插件' },
  { name: 'Zed', bundles: ['dev.zed.Zed'], homepage: 'https://zed.dev', cask: 'zed', pricing: '开源免费', summary: 'Rust 编写的高性能现代代码编辑器，启动与渲染极快', themes: ['dev', 'ai'], keywords: '代码编辑器 编程 Rust 极速 IDE' },
  { name: 'Sublime Text', aliases: ['Sublime'], bundles: ['com.sublimetext.4', 'com.sublimetext.3'], homepage: 'https://www.sublimetext.com', cask: 'sublime-text', pricing: '付费', summary: '轻量极速的原生文本与代码编辑器', themes: ['dev', 'notes'], keywords: '文本编辑器 代码 打开大文件 极速' },
  { name: 'Xcode', bundles: ['com.apple.dt.Xcode'], homepage: 'https://developer.apple.com/xcode/', masUrl: 'https://apps.apple.com/app/id497799835', pricing: '免费', summary: 'Apple 官方 iOS/macOS 应用开发套件', themes: ['dev'], keywords: 'iOS macOS Swift 开发 IDE' },
  { name: 'Ghostty', bundles: ['com.mitchellh.ghostty'], homepage: 'https://ghostty.org', cask: 'ghostty', pricing: '开源免费', summary: 'GPU 加速、遵循 macOS 原生体验的现代终端模拟器', themes: ['dev'], keywords: '终端 命令行 terminal GPU 原生 极速' },
  { name: 'Warp', bundles: ['dev.warp.Warp-Stable'], homepage: 'https://www.warp.dev', cask: 'warp', pricing: '免费增值', summary: '融入块级编辑与 AI 辅助的现代终端', themes: ['dev', 'ai'], keywords: '终端 命令行 terminal AI 补全' },
  { name: 'iTerm2', aliases: ['iTerm'], bundles: ['com.googlecode.iterm2'], homepage: 'https://iterm2.com', cask: 'iterm2', pricing: '开源免费', summary: 'macOS 老牌功能全面的终端模拟器', themes: ['dev'], keywords: '终端 命令行 terminal 分屏 ssh' },
  { name: 'cmux', aliases: ['CMux'], homepage: 'https://github.com/manaflow-ai/cmux', pricing: '开源免费', summary: '面向多 Agent 协作与开发工作流的终端工作台', themes: ['dev', 'ai'], keywords: '终端 多路复用 Agent 开发 工作台' },
  { name: 'WezTerm', bundles: ['com.github.wez.wezterm'], homepage: 'https://wezfurlong.org/wezterm/', cask: 'wezterm', pricing: '开源免费', summary: 'Lua 配置、GPU 加速的跨平台终端', themes: ['dev'], keywords: '终端 命令行 terminal Lua' },
  { name: 'Kitty', bundles: ['net.kovidgoyal.kitty'], homepage: 'https://sw.kovidgoyal.net/kitty/', cask: 'kitty', pricing: '开源免费', summary: '轻量高速、支持图形协议的 GPU 终端', themes: ['dev'], keywords: '终端 命令行 terminal GPU' },
  { name: 'Alacritty', bundles: ['org.alacritty'], homepage: 'https://alacritty.org', cask: 'alacritty', pricing: '开源免费', summary: '极致简约的 OpenGL 加速终端', themes: ['dev'], keywords: '终端 命令行 terminal 轻量' },
  { name: 'OrbStack', bundles: ['dev.kdrag0n.MacVirt'], homepage: 'https://orbstack.dev', cask: 'orbstack', pricing: '免费增值', summary: '轻量极速的 macOS Docker 与 Linux 虚拟机方案', themes: ['dev'], keywords: 'Docker 容器 虚拟机 Linux 省电 替代 Docker Desktop' },
  { name: 'Docker Desktop', aliases: ['Docker'], bundles: ['com.docker.docker'], homepage: 'https://www.docker.com/products/docker-desktop/', cask: 'docker', pricing: '免费增值', summary: '官方容器开发与运行环境', themes: ['dev'], keywords: '容器 Docker 镜像 开发环境' },
  { name: 'Arc', aliases: ['Arc Browser'], bundles: ['company.thebrowser.Browser'], homepage: 'https://arc.net', cask: 'arc', pricing: '免费', summary: '以侧边栏空间和分屏重构标签页体验的浏览器', themes: ['browser'], keywords: '浏览器 侧边栏 标签页 分屏 空间' },
  { name: 'Dia', bundles: ['company.thebrowser.dia'], homepage: 'https://www.diabrowser.com', pricing: '免费', summary: 'The Browser Company 推出的 AI 原生浏览器', themes: ['browser', 'ai'], keywords: '浏览器 AI 网页总结' },
  { name: 'ego lite', aliases: ['Ego Browser', 'Ego'], homepage: 'https://ego.ai', pricing: '免费', summary: '面向人类与 AI Agent 协同操作的 Chromium 浏览器', themes: ['browser', 'ai'], keywords: '浏览器 AI Agent 自动化' },
  { name: 'Google Chrome', aliases: ['Chrome'], bundles: ['com.google.Chrome'], homepage: 'https://www.google.com/chrome/', cask: 'google-chrome', pricing: '免费', summary: '生态最完善的现代网页浏览器', themes: ['browser'], keywords: '浏览器 网页 插件 调试' },
  { name: 'Brave Browser', aliases: ['Brave'], bundles: ['com.brave.Browser'], homepage: 'https://brave.com', cask: 'brave-browser', pricing: '开源免费', summary: '内置广告与追踪拦截的隐私浏览器', themes: ['browser'], keywords: '浏览器 去广告 隐私 开源' },
  { name: 'Zen Browser', aliases: ['Zen'], bundles: ['app.zen-browser.zen'], homepage: 'https://zen-browser.app', cask: 'zen', pricing: '开源免费', summary: '基于 Firefox 的开源侧边栏高颜值浏览器', themes: ['browser'], keywords: '浏览器 侧边栏 Firefox 开源 替代 Arc' },
  { name: 'Firefox', bundles: ['org.mozilla.firefox'], homepage: 'https://www.mozilla.org/firefox/', cask: 'firefox', pricing: '开源免费', summary: '独立内核的开源网页浏览器', themes: ['browser'], keywords: '浏览器 火狐 开源 隐私' },
  { name: 'Bob', bundles: ['com.hezongyidev.Bob', 'com.ripperhe.Bob'], homepage: 'https://bobtranslate.com', masUrl: 'https://apps.apple.com/app/id1630034110', pricing: '付费', summary: 'macOS 口碑极佳的划词翻译与 OCR 工具', themes: ['productivity', 'ai'], keywords: '翻译 划词翻译 OCR 截图翻译 英文 词典' },
  { name: 'Easydict', bundles: ['com.izual.Easydict'], homepage: 'https://github.com/tisfeng/Easydict', cask: 'easydict', pricing: '开源免费', summary: '开源好用的 macOS 划词翻译与 OCR 词典，支持大模型翻译', themes: ['productivity', 'ai'], keywords: '翻译 划词翻译 OCR 开源 免费 替代 Bob 词典' },
  { name: '欧路词典', aliases: ['Eudic'], bundles: ['com.eusoft.eudic'], homepage: 'https://www.eudic.net', cask: 'eudic', pricing: '免费增值', summary: '支持自定义 MDX 词库与生词本的专业英语词典', themes: ['productivity', 'notes'], keywords: '词典 英语 翻译 划词 学习 背单词' },
  { name: 'CleanShot X', aliases: ['CleanShot'], bundles: ['pl.maketheweb.cleanshotx'], homepage: 'https://cleanshot.com', cask: 'cleanshot', pricing: 'Setapp / 付费', summary: '集截图、标注、滚屏长图与录屏于一体的旗舰截图工具', themes: ['media', 'productivity'], keywords: '截图 录屏 长截图 标注 贴图 OCR 马赛克' },
  { name: 'Shottr', bundles: ['cc.ffitch.shottr'], homepage: 'https://shottr.cc', cask: 'shottr', pricing: '免费增值', summary: '极速轻量、支持像素测距、长截图和 OCR 的截图工具', themes: ['media', 'productivity'], keywords: '截图 长截图 标注 测距 OCR 免费 替代 CleanShot' },
  { name: 'PixPin', bundles: ['com.pixpin.PixPin'], homepage: 'https://pixpin.cn', cask: 'pixpin', pricing: '免费增值', summary: '支持截图、贴图、长截图、OCR 与 GIF 录屏的高效工具', themes: ['media', 'productivity'], keywords: '截图 贴图 长截图 GIF 录屏 OCR 免费' },
  { name: 'Snipaste', bundles: ['com.Snipaste'], homepage: 'https://www.snipaste.com', cask: 'snipaste', pricing: '免费增值', summary: '轻巧顺手的截图与桌面贴图工具', themes: ['media', 'productivity'], keywords: '截图 贴图 标注 取色 免费' },
  { name: 'iShot Pro', aliases: ['iShot'], bundles: ['cn.better365.ishot', 'cn.better365.ishotpro'], homepage: 'https://www.better365.cn/ishot.html', masUrl: 'https://apps.apple.com/app/id1485844094', pricing: '付费', summary: '国产全能 Mac 截图、长截图、贴图、录屏与套壳美化工具', themes: ['media', 'productivity'], keywords: '截图 长截图 录屏 贴图 带壳截图 标注' },
  { name: 'Screen Studio', bundles: ['com.timpler.screenstudio'], homepage: 'https://screen.studio', cask: 'screen-studio', pricing: '付费', summary: '自动平滑跟随缩放的高颜值产品演示录屏工具', themes: ['media', 'design'], keywords: '录屏 演示 视频 缩放 教程 宣传片' },
  { name: 'Kap', bundles: ['com.wulkano.kap'], homepage: 'https://getkap.co', cask: 'kap', pricing: '开源免费', summary: '简洁开源的 macOS 屏幕录制与 GIF 导出工具', themes: ['media'], keywords: '录屏 GIF 开源 免费 录制' },
  { name: 'Notion', bundles: ['notion.id'], homepage: 'https://www.notion.so', cask: 'notion', pricing: '免费增值', summary: '集文档、数据库与项目协作于一体的 All-in-one 工作区', themes: ['notes', 'chat'], keywords: '笔记 文档 数据库 协作 知识库 项目管理' },
  { name: 'Typora', bundles: ['abnerworks.Typora'], homepage: 'https://typora.io', cask: 'typora', pricing: '付费', summary: '所见即所得的极简 Markdown 写作编辑器', themes: ['notes'], keywords: 'markdown 写作 编辑器 笔记 博客' },
  { name: 'Bear', aliases: ['熊掌记'], bundles: ['net.shinyfrog.bear'], homepage: 'https://bear.app', masUrl: 'https://apps.apple.com/app/id1091189122', pricing: '免费增值', summary: '极具设计感的原生 Apple 生态 Markdown 笔记', themes: ['notes'], keywords: '笔记 markdown 写作 原生 iCloud 颜值' },
  { name: 'Heptabase', bundles: ['app.heptabase.desktop'], homepage: 'https://heptabase.com', cask: 'heptabase', pricing: '付费', summary: '以白板卡片为核心的视觉化学习与研究笔记工具', themes: ['notes'], keywords: '白板 卡片笔记 深度阅读 知识管理 研究' },
  { name: 'Logseq', bundles: ['com.electron.logseq'], homepage: 'https://logseq.com', cask: 'logseq', pricing: '开源免费', summary: '本地优先、以大纲和双链为核心的开源知识管理', themes: ['notes'], keywords: '笔记 大纲 双链 开源 免费 知识库' },
  { name: 'Craft', bundles: ['com.lukilabs.lukiapp'], homepage: 'https://www.craft.do', masUrl: 'https://apps.apple.com/app/id1487937127', pricing: '免费增值', summary: '排版优雅、适合分享与协作的原生文档应用', themes: ['notes'], keywords: '文档 笔记 排版 分享 原生' },
  { name: 'Ulysses', bundles: ['com.ulyssesapp.mac'], homepage: 'https://ulysses.app', masUrl: 'https://apps.apple.com/app/id1225570693', pricing: 'Setapp / 付费', summary: '面向长文作者的沉浸式写作与发布工具', themes: ['notes'], keywords: '写作 长文 专栏 公众号 markdown' },
  { name: 'iA Writer', bundles: ['pro.writer.mac'], homepage: 'https://ia.net/writer', masUrl: 'https://apps.apple.com/app/id775737590', pricing: '付费', summary: '专注纯文本与排版美感的极简写作软件', themes: ['notes'], keywords: '写作 纯文本 极简 markdown 专注' },
  { name: 'Anki', bundles: ['net.ankiweb.dtop'], homepage: 'https://apps.ankiweb.net', cask: 'anki', pricing: '开源免费', summary: '基于间隔重复算法的开源记忆卡片学习软件', themes: ['notes'], keywords: '背单词 记忆 闪卡 学习 考试 开源' },
  { name: 'Xmind', aliases: ['XMind'], bundles: ['net.xmind.vana.app'], homepage: 'https://xmind.app', cask: 'xmind', pricing: '免费增值', summary: '高颜值思维导图与头脑风暴工具', themes: ['notes', 'design'], keywords: '思维导图 脑图 梳理 大纲' },
  { name: 'WPS Office', aliases: ['WPS'], bundles: ['com.kingsoft.wpsoffice.mac'], homepage: 'https://www.wps.cn', cask: 'wpsoffice', pricing: '免费增值', summary: '兼容 Office 文档、表格与 PDF 的办公套件', themes: ['notes'], keywords: '办公 Word Excel PPT PDF 文档' },
  { name: 'Claude', bundles: ['com.anthropic.claudefordesktop'], homepage: 'https://claude.ai/download', cask: 'claude', pricing: '免费增值', summary: 'Anthropic 官方桌面端，支持快捷键唤起与 MCP 集成', themes: ['ai'], keywords: 'AI 大模型 对话 写作 编程 MCP' },
  { name: 'ChatGPT', bundles: ['com.openai.chat'], homepage: 'https://openai.com/chatgpt/mac/', cask: 'chatgpt', pricing: '免费增值', summary: 'OpenAI 官方 macOS 原生客户端，支持快捷键随时提问', themes: ['ai'], keywords: 'AI 大模型 对话 OpenAI 语音 截图提问' },
  { name: 'DeepSeek', homepage: 'https://www.deepseek.com', pricing: '免费', summary: 'DeepSeek 深度求索 AI 助手与推理模型客户端', themes: ['ai'], keywords: 'AI 大模型 深度思考 推理 国产' },
  { name: '豆包', aliases: ['Doubao'], homepage: 'https://www.doubao.com', pricing: '免费', summary: '字节跳动出品的 AI 桌面助手，支持划词、伴随搜索与语音', themes: ['ai'], keywords: 'AI 助手 划词 搜索 翻译 字节' },
  { name: 'Kimi', homepage: 'https://kimi.moonshot.cn', pricing: '免费', summary: '月之暗面出品的长文本理解与搜索 AI 助手', themes: ['ai'], keywords: 'AI 长文本 总结 论文 搜索' },
  { name: 'Gemini', homepage: 'https://gemini.google.com', pricing: '免费增值', summary: 'Google 多模态 AI 助手与深度研究工具', themes: ['ai'], keywords: 'AI Google 多模态 对话 搜索' },
  { name: 'Perplexity', bundles: ['ai.perplexity.mac'], homepage: 'https://www.perplexity.ai', cask: 'perplexity', pricing: '免费增值', summary: '带实时引用的 AI 答案搜索引擎桌面端', themes: ['ai'], keywords: 'AI 搜索 问答 调研 引用' },
  { name: 'Poe', bundles: ['com.quora.poe.electron'], homepage: 'https://poe.com', pricing: '免费增值', summary: '一站式聚合多款顶尖大模型的 AI 对话客户端', themes: ['ai'], keywords: 'AI 多模型 聚合 对话' },
  { name: 'Jan', homepage: 'https://jan.ai', cask: 'jan', pricing: '开源免费', summary: '离线优先的开源本地大模型桌面客户端', themes: ['ai', 'dev'], keywords: '本地大模型 AI 开源 离线 LLM' },
  { name: 'Msty', homepage: 'https://msty.app', cask: 'msty', pricing: '免费增值', summary: '支持本地模型、知识库与多模型分屏对比的 AI 桌面端', themes: ['ai'], keywords: 'AI 本地大模型 知识库 多模型' },
  { name: 'Cherry Studio', bundles: ['com.kangfenmao.CherryStudio'], homepage: 'https://cherry-ai.com', cask: 'cherry-studio', pricing: '开源免费', summary: '支持多模型 API 与本地知识库的开源桌面 AI 客户端', themes: ['ai'], keywords: 'AI 客户端 API 多模型 知识库 开源 免费' },
  { name: 'Ollama', bundles: ['com.electron.ollama'], homepage: 'https://ollama.com', cask: 'ollama', pricing: '开源免费', summary: '一行命令在 Mac 本地运行开源大语言模型', themes: ['ai', 'dev'], keywords: '本地大模型 AI 离线 LLM 开源' },
  { name: 'LM Studio', bundles: ['ai.elementlabs.lmstudio'], homepage: 'https://lmstudio.ai', cask: 'lm-studio', pricing: '免费', summary: '带图形界面的本地大语言模型下载与调试工具', themes: ['ai', 'dev'], keywords: '本地大模型 AI 离线 GGUF MLX' },
  { name: 'WeChat', aliases: ['微信'], bundles: ['com.tencent.xinWeChat'], homepage: 'https://mac.weixin.qq.com', cask: 'wechat', masUrl: 'https://apps.apple.com/app/id836500024', pricing: '免费', summary: '微信 macOS 桌面客户端', themes: ['chat'], keywords: '聊天 微信 社交 沟通' },
  { name: '飞书', aliases: ['Feishu', 'Lark'], bundles: ['com.electron.lark'], homepage: 'https://www.feishu.cn', cask: 'feishu', pricing: '免费增值', summary: '集即时沟通、多维表格、云文档与会议于一体的协作平台', themes: ['chat', 'notes'], keywords: '协作 办公 文档 多维表格 会议 聊天' },
  { name: '腾讯会议', aliases: ['Tencent Meeting', 'VooV Meeting'], bundles: ['com.tencent.meeting'], homepage: 'https://meeting.tencent.com', cask: 'tencent-meeting', pricing: '免费增值', summary: '流畅稳定的音视频会议与屏幕共享软件', themes: ['chat'], keywords: '会议 视频 语音 屏幕共享 办公' },
  { name: '钉钉', aliases: ['DingTalk'], bundles: ['com.alibaba.DingTalkMac'], homepage: 'https://www.dingtalk.com', cask: 'dingtalk', pricing: '免费', summary: '阿里出品的企业办公沟通与审批平台', themes: ['chat'], keywords: '办公 沟通 打卡 会议 协作' },
  { name: 'Telegram', bundles: ['ru.keepcoder.Telegram', 'org.telegram.desktop'], homepage: 'https://macos.telegram.org', cask: 'telegram', masUrl: 'https://apps.apple.com/app/id747648890', pricing: '免费', summary: '快速、跨平台同步的即时通讯工具', themes: ['chat'], keywords: '聊天 即时通讯 群组 频道 传文件' },
  { name: 'Slack', bundles: ['com.tinyspeck.slackmacgap'], homepage: 'https://slack.com', cask: 'slack', masUrl: 'https://apps.apple.com/app/id803453959', pricing: '免费增值', summary: '团队沟通与工作流通知中心', themes: ['chat'], keywords: '团队 协作 聊天 通知 办公' },
  { name: 'Discord', bundles: ['com.hnc.Discord'], homepage: 'https://discord.com', cask: 'discord', pricing: '免费增值', summary: '面向社区与开发者的语音文字交流平台', themes: ['chat'], keywords: '社区 语音 聊天 开发者 频道' },
  { name: 'Linear', bundles: ['com.linear'], homepage: 'https://linear.app', cask: 'linear-linear', pricing: '免费增值', summary: '极速键盘流的产品研发与任务管理工具', themes: ['productivity', 'dev'], keywords: '项目管理 任务 Issue 研发 敏捷' },
  { name: 'Things', aliases: ['Things 3'], bundles: ['com.culturedcode.ThingsMac'], homepage: 'https://culturedcode.com/things/', masUrl: 'https://apps.apple.com/app/id904280696', pricing: '付费', summary: '获 Apple 设计大奖的极简 GTD 待办事项软件', themes: ['productivity'], keywords: '待办 TODO GTD 任务 清单 时间管理' },
  { name: 'TickTick', aliases: ['滴答清单'], bundles: ['com.TickTick.task.mac'], homepage: 'https://ticktick.com', cask: 'ticktick', masUrl: 'https://apps.apple.com/app/id966085870', pricing: '免费增值', summary: '结合待办、番茄钟与日历视图的时间管理应用', themes: ['productivity'], keywords: '待办 TODO 番茄钟 提醒 日历 时间管理' },
  { name: 'Todoist', bundles: ['com.todoist.mac.Todoist'], homepage: 'https://todoist.com', cask: 'todoist-app', masUrl: 'https://apps.apple.com/app/id585829637', pricing: '免费增值', summary: '支持自然语言输入的全平台任务管理软件', themes: ['productivity'], keywords: '待办 TODO 任务 提醒' },
  { name: 'Fantastical', bundles: ['com.flexibits.fantastical2.mac'], homepage: 'https://flexibits.com/fantastical', cask: 'fantastical', masUrl: 'https://apps.apple.com/app/id975937182', pricing: '免费增值', summary: '支持自然语言解析日程的精致 macOS 日历', themes: ['productivity'], keywords: '日历 日程 会议 提醒' },
  { name: 'Figma', bundles: ['com.figma.Desktop'], homepage: 'https://www.figma.com', cask: 'figma', pricing: '免费增值', summary: '实时协作的界面设计与原型工具', themes: ['design'], keywords: 'UI 设计 原型 协作 切图 矢量' },
  { name: 'Sketch', bundles: ['com.bohemiancoding.sketch3'], homepage: 'https://www.sketch.com', cask: 'sketch', pricing: '付费', summary: '原生 macOS 矢量界面设计软件', themes: ['design'], keywords: 'UI 设计 矢量 原生' },
  { name: 'Pixelmator Pro', bundles: ['com.pixelmatorteam.pixelmator.x'], homepage: 'https://www.pixelmator.com/pro/', masUrl: 'https://apps.apple.com/app/id1289583905', pricing: '付费', summary: '原生流畅、支持 AI 抠图与修图的 macOS 图像编辑神器', themes: ['design'], keywords: '修图 抠图 P图 替代 Photoshop 设计' },
  { name: '1Password', aliases: ['1Password 8'], bundles: ['com.1password.1password'], homepage: 'https://1password.com', cask: '1password', pricing: '付费', summary: '安全易用的全平台密码与密钥管理器', themes: ['system', 'productivity'], keywords: '密码管理 2FA 通行密钥 安全 自动填充' },
  { name: 'Bitwarden', bundles: ['com.bitwarden.desktop'], homepage: 'https://bitwarden.com', cask: 'bitwarden', masUrl: 'https://apps.apple.com/app/id1352778147', pricing: '开源免费', summary: '开源跨平台密码管理器，支持自托管', themes: ['system', 'productivity'], keywords: '密码管理 开源 免费 安全 替代 1Password' },
  { name: 'Rectangle', bundles: ['com.knollsoft.Rectangle'], homepage: 'https://rectangleapp.com', cask: 'rectangle', pricing: '开源免费', summary: '轻巧免费的快捷键窗口分屏工具', themes: ['system', 'productivity'], keywords: '窗口 分屏 快捷键 布局 免费 开源 替代 Magnet' },
  { name: 'Loop', bundles: ['com.MrKai77.Loop'], homepage: 'https://github.com/MrKai77/Loop', cask: 'loop', pricing: '开源免费', summary: '带优雅径向菜单的开源窗口管理工具', themes: ['system', 'productivity'], keywords: '窗口 分屏 径向菜单 开源 免费 颜值' },
  { name: 'Magnet', bundles: ['com.crowdcafe.windowmagnet'], homepage: 'https://magnet.crowdcafe.com', masUrl: 'https://apps.apple.com/app/id441258766', pricing: '付费', summary: '拖拽贴边与快捷键分屏的经典窗口工具', themes: ['system', 'productivity'], keywords: '窗口 分屏 贴边 布局' },
  { name: 'Bartender', aliases: ['Bartender 5'], bundles: ['com.surteesstudios.Bartender'], homepage: 'https://www.macbartender.com', cask: 'bartender', pricing: 'Setapp / 付费', summary: '精细收纳与自定义 macOS 菜单栏图标', themes: ['system'], keywords: '菜单栏 刘海 隐藏图标 状态栏 整理' },
  { name: 'Ice', bundles: ['com.jordanbaird.Ice'], homepage: 'https://icemenubar.app', cask: 'jordanbaird-ice', pricing: '开源免费', summary: '开源高颜值的 macOS 菜单栏管理工具', themes: ['system'], keywords: '菜单栏 刘海 隐藏图标 开源 免费 替代 Bartender' },
  { name: 'AlDente', bundles: ['com.apphousekitchen.aldente-pro', 'com.davidwernhart.Helper'], homepage: 'https://apphousekitchen.com', cask: 'aldente', pricing: '免费增值', summary: '限制 MacBook 充电上限以延长电池寿命', themes: ['system'], keywords: '电池 充电上限 保护电池 寿命 电源' },
  { name: 'Stats', bundles: ['eu.exelban.Stats'], homepage: 'https://github.com/exelban/stats', cask: 'stats', pricing: '开源免费', summary: '在菜单栏实时监控 CPU、内存、网速与温度', themes: ['system'], keywords: '系统监控 网速 CPU 内存 温度 风扇 菜单栏 开源' },
  { name: 'Maccy', bundles: ['org.p0deje.Maccy'], homepage: 'https://maccy.app', cask: 'maccy', pricing: '开源免费', summary: '轻量原生、纯键盘驱动的开源剪贴板历史', themes: ['productivity'], keywords: '剪贴板 剪切板 历史 开源 免费 替代 Paste' },
  { name: 'Paste', bundles: ['com.wiheads.paste'], homepage: 'https://pasteapp.io', masUrl: 'https://apps.apple.com/app/id967805235', pricing: 'Setapp / 付费', summary: '卡片式可视化剪贴板与多设备 iCloud 同步', themes: ['productivity'], keywords: '剪贴板 剪切板 历史 iCloud 同步' },
  { name: 'Input Source Pro', bundles: ['com.runjuu.Input-Source-Pro'], homepage: 'https://inputsource.pro', cask: 'input-source-pro', pricing: '免费', summary: '按应用自动切换中英文输入法并在光标旁提示状态', themes: ['system', 'productivity'], keywords: '输入法 中英文 自动切换 光标提示 免费' },
  { name: '微信输入法', aliases: ['WeType'], bundles: ['com.tencent.inputmethod.wetype'], homepage: 'https://z.weixin.qq.com', pricing: '免费', summary: '跨设备剪贴板同步、无广告的简洁中文输入法', themes: ['system', 'productivity'], keywords: '输入法 中文 打字 免费 无广告' },
  { name: 'Karabiner-Elements', aliases: ['Karabiner'], bundles: ['org.pqrs.Karabiner-Elements.Settings'], homepage: 'https://karabiner-elements.pqrs.org', cask: 'karabiner-elements', pricing: '开源免费', summary: '强大的 macOS 底层改键与 Hyper 键定制工具', themes: ['system'], keywords: '改键 键盘 快捷键 Hyper CapsLock 开源' },
  { name: 'BetterTouchTool', aliases: ['BTT'], bundles: ['com.hegenberg.BetterTouchTool'], homepage: 'https://folivora.ai', cask: 'bettertouchtool', pricing: 'Setapp / 付费', summary: '全能触控板手势、快捷键与自动化定制神器', themes: ['system', 'productivity'], keywords: '触控板 手势 鼠标 快捷键 窗口 自动化' },
  { name: 'PopClip', bundles: ['com.pilotmoon.popclip'], homepage: 'https://www.popclip.app', cask: 'popclip', masUrl: 'https://apps.apple.com/app/id445189367', pricing: 'Setapp / 付费', summary: '选中文本即弹出的快捷动作条与扩展生态', themes: ['productivity'], keywords: '划词 选中文本 快捷动作 搜索 翻译' },
  { name: 'Hazel', bundles: ['com.noodlesoft.Hazel'], homepage: 'https://www.noodlesoft.com', cask: 'hazel', pricing: '付费', summary: '按规则自动整理下载文件夹与归档文件', themes: ['system', 'productivity'], keywords: '自动整理 文件归档 下载文件夹 自动化' },
  { name: 'MonitorControl', bundles: ['me.guillaumeb.MonitorControl'], homepage: 'https://github.com/MonitorControl/MonitorControl', cask: 'monitorcontrol', pricing: '开源免费', summary: '用原生键盘快捷键直接调节外接显示器亮度与音量', themes: ['system'], keywords: '外接显示器 亮度 音量 DDC 开源 免费' },
  { name: 'BetterDisplay', bundles: ['pro.betterdisplay.BetterDisplay'], homepage: 'https://github.com/waydabber/BetterDisplay', cask: 'betterdisplay', pricing: '免费增值', summary: '为外接显示器开启 HiDPI、虚拟屏与色彩亮度精细控制', themes: ['system'], keywords: '外接显示器 HiDPI 分辨率 模糊 亮度 虚拟屏' },
  { name: 'Amphetamine', bundles: ['com.if.Amphetamine'], homepage: 'https://apps.apple.com/app/id937984704', masUrl: 'https://apps.apple.com/app/id937984704', pricing: '免费', summary: '按时长或应用条件防止 Mac 自动休眠与息屏', themes: ['system'], keywords: '防休眠 不锁屏 亮屏 咖啡因 免费' },
  { name: 'IINA', bundles: ['com.colliderli.iina'], homepage: 'https://iina.io', cask: 'iina', pricing: '开源免费', summary: '为 macOS 原生打造的开源现代全能视频播放器', themes: ['media'], keywords: '视频播放器 电影 字幕 开源 免费 原生' },
  { name: 'Infuse', bundles: ['com.firecore.infuse'], homepage: 'https://firecore.com/infuse', masUrl: 'https://apps.apple.com/app/id1136220934', pricing: '免费增值', summary: '支持网盘与 NAS 海报墙的精美本地影音播放器', themes: ['media'], keywords: '播放器 NAS 网盘 海报墙 影音 电影' },
  { name: 'VLC', bundles: ['org.videolan.vlc'], homepage: 'https://www.videolan.org/vlc/', cask: 'vlc', pricing: '开源免费', summary: '经典跨平台开源万能媒体播放器', themes: ['media'], keywords: '视频播放器 音频 全格式 开源 免费' },
  { name: 'Downie', aliases: ['Downie 4'], bundles: ['com.charliemonroe.Downie-4'], homepage: 'https://software.charliemonroe.net/downie/', cask: 'downie', pricing: 'Setapp / 付费', summary: '支持上千网站的极简视频下载工具', themes: ['media'], keywords: '视频下载 YouTube B站 抓取' },
  { name: 'Permute', aliases: ['Permute 3'], bundles: ['com.charliemonroe.Permute-3'], homepage: 'https://software.charliemonroe.net/permute/', cask: 'permute', pricing: 'Setapp / 付费', summary: '拖拽即转码的音视频与图片格式转换工具', themes: ['media'], keywords: '格式转换 转码 视频 压缩 音频' },
  { name: 'HandBrake', bundles: ['fr.handbrake.HandBrake'], homepage: 'https://handbrake.fr', cask: 'handbrake', pricing: '开源免费', summary: '开源专业视频压缩与转码工具', themes: ['media'], keywords: '视频压缩 转码 开源 免费' },
  { name: 'PicGo', bundles: ['com.molunerfinn.picgo'], homepage: 'https://molunerfinn.com/PicGo/', cask: 'picgo', pricing: '开源免费', summary: '支持多对象存储的一键图床上传工具', themes: ['productivity', 'media'], keywords: '图床 图片上传 markdown 博客 开源 免费' },
  { name: 'NetNewsWire', bundles: ['com.ranchero.NetNewsWire-Evergreen'], homepage: 'https://netnewswire.com', cask: 'netnewswire', pricing: '开源免费', summary: '纯粹原生、免费开源的 macOS RSS 阅读器', themes: ['notes'], keywords: 'RSS 订阅 阅读器 新闻 开源 免费 替代 Reeder' },
  { name: 'Reeder', aliases: ['Reeder 5'], bundles: ['com.reederapp.5.macOS'], homepage: 'https://reederapp.com', masUrl: 'https://apps.apple.com/app/id1529448980', pricing: '付费', summary: '手感极佳的 Apple 生态 RSS 与稍后阅读客户端', themes: ['notes'], keywords: 'RSS 订阅 阅读器 稍后阅读' },
  { name: 'Readwise Reader', aliases: ['Reader'], bundles: ['io.readwise.reader'], homepage: 'https://readwise.io/read', pricing: '付费', summary: '集网页、RSS、PDF 与划线同步于一体的深度阅读器', themes: ['notes'], keywords: '稍后阅读 划线 RSS PDF 深度阅读' },
  { name: 'Tailscale', bundles: ['io.tailscale.ipn.macos'], homepage: 'https://tailscale.com', cask: 'tailscale', masUrl: 'https://apps.apple.com/app/id1475387142', pricing: '免费增值', summary: '零配置 WireGuard 组网，随时安全连回家里或服务器', themes: ['system', 'dev'], keywords: '组网 内网穿透 VPN 远程连家里 NAS SSH' },
  { name: 'Surge', aliases: ['Surge 5'], bundles: ['com.nssurge.surge-mac'], homepage: 'https://nssurge.com', cask: 'surge', pricing: '付费', summary: '专业级 macOS 网络调试、抓包与策略代理工具', themes: ['system', 'dev'], keywords: '网络 代理 抓包 调试 规则' },
  { name: 'FlClash', bundles: ['com.follow.clash'], homepage: 'https://github.com/chen08209/FlClash', pricing: '开源免费', summary: '基于 Flutter 与 Mihomo 内核的开源多平台代理客户端', themes: ['system'], keywords: '网络 代理 开源 免费 Clash 科学上网' },
  { name: 'Clash Verge', aliases: ['Clash Verge Rev'], bundles: ['io.github.clash-verge-rev.clash-verge-rev'], homepage: 'https://www.clashverge.dev', cask: 'clash-verge-rev', pricing: '开源免费', summary: '开源现代的网络代理桌面客户端', themes: ['system'], keywords: '网络 代理 开源 免费 Clash' },
  { name: 'Proxyman', bundles: ['com.proxyman.NSProxy'], homepage: 'https://proxyman.io', cask: 'proxyman', pricing: 'Setapp / 付费', summary: '原生 macOS HTTP/HTTPS 抓包与接口调试工具', themes: ['dev'], keywords: '抓包 HTTP HTTPS 接口调试 网络' },
  { name: 'TablePlus', bundles: ['com.tinyapp.TablePlus'], homepage: 'https://tableplus.com', cask: 'tableplus', pricing: 'Setapp / 付费', summary: '原生高速的多数据库图形化客户端', themes: ['dev'], keywords: '数据库 SQL MySQL Postgres SQLite Redis' },
  { name: 'Bruno', bundles: ['com.usebruno.app'], homepage: 'https://www.usebruno.com', cask: 'bruno', pricing: '开源免费', summary: '本地 Git 友好、轻量开源的 API 调试工具', themes: ['dev'], keywords: 'API 接口调试 HTTP 开源 免费 替代 Postman' },
  { name: 'Postman', bundles: ['com.postmanlabs.mac'], homepage: 'https://www.postman.com', cask: 'postman', pricing: '免费增值', summary: '广泛使用的 API 设计、测试与协作平台', themes: ['dev'], keywords: 'API 接口调试 测试 HTTP' },
  { name: 'Fork', bundles: ['com.DanPristupov.Fork'], homepage: 'https://git-fork.com', cask: 'fork', pricing: '付费', summary: '轻快顺手的原生 Git 图形化客户端', themes: ['dev'], keywords: 'Git 版本控制 代码提交 合并' },
  { name: 'Tower', bundles: ['com.fournova.Tower3'], homepage: 'https://www.git-tower.com', cask: 'tower', pricing: '付费', summary: '功能强大、界面优雅的 macOS Git 客户端', themes: ['dev'], keywords: 'Git 版本控制 客户端' },
  { name: 'GitHub Desktop', bundles: ['com.github.GitHubClient'], homepage: 'https://desktop.github.com', cask: 'github', pricing: '开源免费', summary: 'GitHub 官方简洁 Git 桌面端', themes: ['dev'], keywords: 'Git GitHub 开源 免费 版本控制' },
  { name: 'Keka', bundles: ['com.aone.keka'], homepage: 'https://www.keka.io', cask: 'keka', masUrl: 'https://apps.apple.com/app/id470158795', pricing: '开源免费', summary: '支持 7z/RAR/ZIP 等多格式的原生压缩解压工具', themes: ['system'], keywords: '压缩 解压 RAR 7z ZIP 加密 开源 免费' },
  { name: 'The Unarchiver', bundles: ['com.macpaw.site.theunarchiver'], homepage: 'https://theunarchiver.com', cask: 'the-unarchiver', masUrl: 'https://apps.apple.com/app/id425424353', pricing: '免费', summary: '简洁可靠的免费解压工具，中文编码兼容极佳', themes: ['system'], keywords: '解压 RAR ZIP 中文乱码 免费' },
  { name: 'AppCleaner', bundles: ['net.freemacsoft.AppCleaner'], homepage: 'https://freemacsoft.net/appcleaner/', cask: 'appcleaner', pricing: '免费', summary: '小巧纯粹的 Mac 应用与残留文件彻底卸载工具', themes: ['system'], keywords: '卸载 清理 残留 垃圾 免费' },
  { name: 'Pearcleaner', bundles: ['com.alienator88.Pearcleaner'], homepage: 'https://itsalin.com/appInfo/?id=pearcleaner', cask: 'pearcleaner', pricing: '开源免费', summary: '现代开源的 Mac 应用卸载与孤立文件清理工具', themes: ['system'], keywords: '卸载 清理 残留 开源 免费 替代 CleanMyMac' },
  { name: 'Transmit', aliases: ['Transmit 5'], bundles: ['com.panic.Transmit'], homepage: 'https://panic.com/transmit/', cask: 'transmit', pricing: '付费', summary: 'macOS 标杆级 FTP / SFTP / S3 文件传输工具', themes: ['dev', 'system'], keywords: 'FTP SFTP S3 服务器 文件传输' },
  { name: 'ForkLift', aliases: ['ForkLift 4'], bundles: ['com.binarynights.ForkLift'], homepage: 'https://binarynights.com', cask: 'forklift', pricing: 'Setapp / 付费', summary: '原生双栏文件管理器与远程传输客户端', themes: ['system'], keywords: '文件管理 双栏 Finder 替代 SFTP' },
  { name: 'Spotify', bundles: ['com.spotify.client'], homepage: 'https://www.spotify.com', cask: 'spotify', pricing: '免费增值', summary: '全球主流流媒体音乐与播客平台', themes: ['media'], keywords: '音乐 听歌 播客 流媒体' },
  { name: '网易云音乐', aliases: ['NetEaseMusic'], bundles: ['com.netease.163music'], homepage: 'https://music.163.com', cask: 'neteasemusic', pricing: '免费增值', summary: '网易云音乐 macOS 桌面客户端', themes: ['media'], keywords: '音乐 听歌 歌单' },
  { name: 'IntelliJ IDEA', bundles: ['com.jetbrains.intellij'], homepage: 'https://www.jetbrains.com/idea/', cask: 'intellij-idea', pricing: '免费增值', summary: 'JetBrains 旗舰 Java / Kotlin 集成开发环境', themes: ['dev'], keywords: 'Java Kotlin IDE 开发 JetBrains' },
  { name: 'WebStorm', bundles: ['com.jetbrains.WebStorm'], homepage: 'https://www.jetbrains.com/webstorm/', cask: 'webstorm', pricing: '免费增值', summary: 'JetBrains 专业 JavaScript / TypeScript IDE', themes: ['dev'], keywords: '前端 JS TS IDE 开发 JetBrains' },
  { name: 'PyCharm', bundles: ['com.jetbrains.pycharm'], homepage: 'https://www.jetbrains.com/pycharm/', cask: 'pycharm', pricing: '免费增值', summary: 'JetBrains 专业 Python IDE', themes: ['dev'], keywords: 'Python AI IDE 开发 JetBrains' },
  { name: 'GoLand', bundles: ['com.jetbrains.goland'], homepage: 'https://www.jetbrains.com/goland/', cask: 'goland', pricing: '付费', summary: 'JetBrains 专业 Go 语言 IDE', themes: ['dev'], keywords: 'Go Golang IDE 开发 JetBrains' },
  { name: 'DataGrip', bundles: ['com.jetbrains.datagrip'], homepage: 'https://www.jetbrains.com/datagrip/', cask: 'datagrip', pricing: '付费', summary: 'JetBrains 跨数据库 SQL IDE', themes: ['dev'], keywords: '数据库 SQL IDE JetBrains' },
  { name: 'Blender', bundles: ['org.blenderfoundation.blender'], homepage: 'https://www.blender.org', cask: 'blender', pricing: '开源免费', summary: '全能开源 3D 建模、动画与渲染套件', themes: ['design', 'media'], keywords: '3D 建模 渲染 动画 开源 免费' },
  { name: 'Final Cut Pro', bundles: ['com.apple.FinalCut'], homepage: 'https://www.apple.com/final-cut-pro/', masUrl: 'https://apps.apple.com/app/id424389933', pricing: '付费', summary: 'Apple 针对 Silicon 深度优化的专业视频剪辑软件', themes: ['media', 'design'], keywords: '视频剪辑 后期 剪片 苹果' },
  { name: 'DaVinci Resolve', bundles: ['com.blackmagic-design.DaVinciResolve'], homepage: 'https://www.blackmagicdesign.com/products/davinciresolve', pricing: '免费增值', summary: '专业剪辑、调色与后期合成套件', themes: ['media', 'design'], keywords: '视频剪辑 调色 达芬奇 后期 免费' },
  // macOS Built-in System Apps (marked system: true so users can toggle hiding them)
  { name: 'Safari', bundles: ['com.apple.Safari'], homepage: 'https://www.apple.com/safari/', pricing: '系统自带', summary: 'macOS 原生省电浏览器，与 Apple 生态深度同步', themes: ['browser'], keywords: '浏览器 原生 省电 苹果', system: true },
  { name: '备忘录', aliases: ['Notes'], bundles: ['com.apple.Notes'], pricing: '系统自带', summary: 'macOS 系统自带原生笔记与 iCloud 同步工具', themes: ['notes'], keywords: '笔记 备忘录 iCloud 同步', system: true },
  { name: '图书', aliases: ['Books', 'Apple Books'], bundles: ['com.apple.iBooksX'], pricing: '系统自带', summary: 'macOS 系统自带电子书与 PDF 阅读器', themes: ['notes'], keywords: '电子书 EPUB PDF 阅读', system: true },
  { name: '文本编辑', aliases: ['TextEdit'], bundles: ['com.apple.TextEdit'], pricing: '系统自带', summary: 'macOS 系统自带轻量纯文本与富文本编辑器', themes: ['notes'], keywords: '纯文本 文本编辑 记事本', system: true },
  { name: '预览', aliases: ['Preview'], bundles: ['com.apple.Preview'], pricing: '系统自带', summary: 'macOS 系统自带图片与 PDF 批注签名工具', themes: ['media', 'productivity'], keywords: 'PDF 图片 签名 批注', system: true },
  { name: '终端', aliases: ['Terminal'], bundles: ['com.apple.Terminal'], pricing: '系统自带', summary: 'macOS 系统自带命令行终端', themes: ['dev'], keywords: '终端 命令行', system: true },
  { name: '照片', aliases: ['Photos'], bundles: ['com.apple.Photos'], pricing: '系统自带', summary: 'macOS 系统自带图库与 iCloud 照片管理', themes: ['media'], keywords: '照片 图库 相册', system: true },
  { name: '提醒事项', aliases: ['Reminders'], bundles: ['com.apple.reminders'], pricing: '系统自带', summary: 'macOS 系统自带待办提醒应用', themes: ['productivity'], keywords: '待办 提醒 TODO', system: true },
  { name: '日历', aliases: ['Calendar'], bundles: ['com.apple.iCal'], pricing: '系统自带', summary: 'macOS 系统自带日程管理应用', themes: ['productivity'], keywords: '日历 日程', system: true },
  { name: '邮件', aliases: ['Mail'], bundles: ['com.apple.mail'], pricing: '系统自带', summary: 'macOS 系统自带电子邮件客户端', themes: ['chat'], keywords: '邮件 邮箱', system: true },
  { name: 'Keynote 讲演', aliases: ['Keynote'], bundles: ['com.apple.iWork.Keynote'], pricing: '系统自带', summary: 'Apple 出品的高颜值幻灯片演示工具', themes: ['notes', 'design'], keywords: 'PPT 演示 幻灯片', system: true },
  { name: 'Pages 文稿', aliases: ['Pages'], bundles: ['com.apple.iWork.Pages'], pricing: '系统自带', summary: 'Apple 出品的文档排版与文字处理软件', themes: ['notes'], keywords: '文档 Word 排版', system: true },
  { name: 'Numbers 表格', aliases: ['Numbers'], bundles: ['com.apple.iWork.Numbers'], pricing: '系统自带', summary: 'Apple 出品的轻量电子表格软件', themes: ['notes'], keywords: '表格 Excel 图表', system: true },
  { name: '快捷指令', aliases: ['Shortcuts'], bundles: ['com.apple.shortcuts'], pricing: '系统自带', summary: 'macOS 原生可视化自动化流程工具', themes: ['system', 'productivity'], keywords: '自动化 快捷指令 工作流', system: true },
];

export const BUILTIN_BY_KEY = new Map();
export const BUILTIN_ALIAS_TO_CANONICAL = new Map();
export const BUILTIN_BUNDLE_TO_CANONICAL = new Map();

for (const item of BUILTIN_APPS) {
  const key = normalizeAppKey(item.name);
  BUILTIN_BY_KEY.set(key, { ...item, key });
  for (const alias of item.aliases ?? []) {
    const aliasKey = normalizeAppKey(alias);
    if (aliasKey && aliasKey !== key) {
      BUILTIN_ALIAS_TO_CANONICAL.set(aliasKey, { key, name: item.name });
    }
  }
  for (const bundle of item.bundles ?? []) {
    BUILTIN_BUNDLE_TO_CANONICAL.set(bundle, { key, name: item.name });
  }
}

export function inferThemesFromText(text) {
  const s = String(text ?? '');
  const out = new Set();
  if (/ai|大模型|llm|agent|gpt|claude|deepseek|豆包|kimi|gemini|模型/i.test(s)) out.add('ai');
  if (/开发|编程|代码|终端|terminal|docker|git|sql|api|调试|ide|cli/i.test(s)) out.add('dev');
  if (/效率|启动|剪贴板|翻译|词典|待办|todo|工作流|工具/i.test(s)) out.add('productivity');
  if (/写作|笔记|办公|markdown|文档|知识|阅读|rss|书/i.test(s)) out.add('notes');
  if (/浏览|browser|chrome|safari|firefox|arc|zen/i.test(s)) out.add('browser');
  if (/系统|菜单栏|窗口|分屏|电池|监控|显示器|输入法|解压|卸载|代理|密码|网络|休眠/i.test(s)) out.add('system');
  if (/截图|录屏|影音|视频|播放|音乐|播客|音频|图床/i.test(s)) out.add('media');
  if (/设计|创作|ui|原型|修图|剪辑|3d|导图|图/i.test(s)) out.add('design');
  if (/沟通|聊天|社交|协作|会议|邮件|微信|飞书|slack|telegram/i.test(s)) out.add('chat');
  return [...out];
}

export function seedMetadataAndAliases(db, now = () => Date.now()) {
  const ts = now();
  const upsertAlias = db.prepare(
    'INSERT OR IGNORE INTO app_aliases (alias_key, canonical_key, display_name) VALUES (?,?,?)'
  );
  const upsertMeta = db.prepare(`
    INSERT INTO app_metadata (app_key, homepage, cask, mas_url, pricing, summary, themes, keywords, is_system, source, updated)
    VALUES (?,?,?,?,?,?,?,?,?,'builtin',?)
    ON CONFLICT(app_key) DO UPDATE SET
      homepage = COALESCE(NULLIF(excluded.homepage, ''), app_metadata.homepage),
      cask = COALESCE(NULLIF(excluded.cask, ''), app_metadata.cask),
      mas_url = COALESCE(NULLIF(excluded.mas_url, ''), app_metadata.mas_url),
      pricing = COALESCE(NULLIF(excluded.pricing, ''), app_metadata.pricing),
      summary = COALESCE(NULLIF(excluded.summary, ''), app_metadata.summary),
      themes = COALESCE(NULLIF(excluded.themes, ''), app_metadata.themes),
      keywords = COALESCE(NULLIF(excluded.keywords, ''), app_metadata.keywords),
      is_system = MAX(app_metadata.is_system, excluded.is_system),
      updated = excluded.updated
  `);
  db.exec('BEGIN IMMEDIATE');
  try {
    for (const [aliasKey, target] of BUILTIN_ALIAS_TO_CANONICAL) {
      upsertAlias.run(aliasKey, target.key, target.name);
    }
    for (const item of BUILTIN_APPS) {
      const key = normalizeAppKey(item.name);
      upsertMeta.run(
        key,
        item.homepage ?? '',
        item.cask ?? '',
        item.masUrl ?? '',
        item.pricing ?? '',
        item.summary ?? '',
        (item.themes ?? []).join(','),
        item.keywords ?? '',
        item.system ? 1 : 0,
        ts
      );
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function safeHttpUrl(url) {
  if (typeof url !== 'string' || !url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return parsed.toString();
  } catch {}
  return '';
}

export function parseApplicationsPaste(rawText) {
  const lines = String(rawText ?? '')
    .split(/[\r\n,，;；]+/)
    .map(s => s.trim())
    .filter(Boolean);
  const out = [];
  const seen = new Set();
  for (let line of lines) {
    // Strip leading paths like /Applications/Raycast.app or ls -l columns
    const pathMatch = line.match(/([^/]+)\.app$/i);
    if (pathMatch) line = pathMatch[1];
    else line = line.replace(/\.app$/i, '').trim();
    // Skip obvious system utility folders or noise
    if (!line || line === 'Utilities' || line.startsWith('.') || line.startsWith('total ')) continue;
    if (/(?:helper|uninstaller|installer)$/i.test(line)) continue;
    const key = normalizeAppKey(line);
    if (key && !seen.has(key) && Array.from(line).length <= 60) {
      seen.add(key);
      out.push(line);
      if (out.length >= 48) break;
    }
  }
  return out;
}

// Background sync against Homebrew Cask JSON API & iTunes Lookup API.
export function startMetadataSync(db, { now = () => Date.now(), log = console.warn } = {}) {
  let stopped = false;
  let timer = null;

  const activeAppsStmt = db.prepare(`
    SELECT m.app_key AS key, MIN(m.name) AS name,
      (SELECT b.bundle FROM app_mentions AS b WHERE b.app_key=m.app_key AND b.bundle IS NOT NULL AND b.bundle NOT LIKE 'cli:%'
        GROUP BY b.bundle ORDER BY COUNT(*) DESC LIMIT 1) AS bundle,
      md.homepage, md.cask, md.mas_url, md.summary
    FROM app_mentions AS m
    JOIN shares AS s ON s.id=m.share_id AND s.visibility='public'
    LEFT JOIN app_metadata AS md ON md.app_key=m.app_key
    GROUP BY m.app_key
  `);

  const upsertMeta = db.prepare(`
    INSERT INTO app_metadata (app_key, homepage, cask, mas_url, pricing, summary, themes, keywords, is_system, source, updated)
    VALUES (?,?,?,?,?,?,?,?,0,?,?)
    ON CONFLICT(app_key) DO UPDATE SET
      homepage = CASE WHEN excluded.homepage <> '' AND (app_metadata.homepage IS NULL OR app_metadata.homepage = '') THEN excluded.homepage ELSE app_metadata.homepage END,
      cask = CASE WHEN excluded.cask <> '' AND (app_metadata.cask IS NULL OR app_metadata.cask = '') THEN excluded.cask ELSE app_metadata.cask END,
      mas_url = CASE WHEN excluded.mas_url <> '' AND (app_metadata.mas_url IS NULL OR app_metadata.mas_url = '') THEN excluded.mas_url ELSE app_metadata.mas_url END,
      summary = CASE WHEN excluded.summary <> '' AND (app_metadata.summary IS NULL OR app_metadata.summary = '') THEN excluded.summary ELSE app_metadata.summary END,
      themes = CASE WHEN excluded.themes <> '' AND (app_metadata.themes IS NULL OR app_metadata.themes = '') THEN excluded.themes ELSE app_metadata.themes END,
      updated = excluded.updated
  `);

  async function syncOnce() {
    if (stopped) return;
    const active = activeAppsStmt.all();
    const needsBrew = active.filter(row => !row.cask || !row.homepage || !row.summary);
    if (needsBrew.length) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15_000);
        const res = await fetch('https://formulae.brew.sh/api/cask.json', {
          signal: controller.signal,
          headers: { 'user-agent': 'qiaomu-software/1.0 (+https://software.qiaomu.ai)' },
        });
        clearTimeout(timeout);
        if (res.ok) {
          const casks = await res.json();
          const byName = new Map();
          for (const c of casks) {
            if (!c?.token || !/^[a-z0-9@._+-]+$/i.test(c.token)) continue;
            const desc = typeof c.desc === 'string' ? c.desc.trim().slice(0, 140) : '';
            const entry = {
              token: c.token,
              homepage: safeHttpUrl(c.homepage),
              desc,
              themes: inferThemesFromText(`${c.token} ${(c.name ?? []).join(' ')} ${desc}`).join(','),
            };
            for (const n of c.name ?? []) {
              const k = normalizeAppKey(n);
              if (k && !byName.has(k)) byName.set(k, entry);
            }
            const tokenKey = normalizeAppKey(c.token.replace(/-/g, ' '));
            if (tokenKey && !byName.has(tokenKey)) byName.set(tokenKey, entry);
          }
          const ts = now();
          db.exec('BEGIN IMMEDIATE');
          try {
            for (const row of needsBrew) {
              const hit = byName.get(row.key) ?? byName.get(normalizeAppKey(row.name));
              if (hit) {
                upsertMeta.run(row.key, hit.homepage, hit.token, '', '', hit.desc, hit.themes, '', 'homebrew', ts);
              }
            }
            db.exec('COMMIT');
          } catch (err) {
            db.exec('ROLLBACK');
            throw err;
          }
        }
      } catch (err) {
        if (!stopped) log('Metadata Homebrew sync skipped:', err.message);
      }
    }

    const needsMas = activeAppsStmt.all().filter(row => row.bundle && (!row.mas_url || !row.summary)).slice(0, 10);
    for (const row of needsMas) {
      if (stopped) break;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(
          'https://itunes.apple.com/lookup?country=cn&entity=macSoftware&bundleId=' + encodeURIComponent(row.bundle),
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          const hit = data?.results?.[0];
          const masUrl = safeHttpUrl(hit?.trackViewUrl);
          const homepage = safeHttpUrl(hit?.sellerUrl);
          const firstSentence = typeof hit?.description === 'string'
            ? hit.description.split(/[。\n]/)[0].trim().slice(0, 100)
            : '';
          if (masUrl || homepage || firstSentence) {
            upsertMeta.run(row.key, homepage, '', masUrl, '', firstSentence, inferThemesFromText(firstSentence).join(','), '', 'itunes', now());
          }
        }
      } catch {
        // Ignore individual lookup failures
      }
    }
  }

  timer = setTimeout(() => {
    syncOnce().finally(() => {
      if (!stopped) {
        timer = setInterval(syncOnce, 24 * 60 * 60_000);
        timer.unref?.();
      }
    });
  }, 8_000);
  timer.unref?.();

  return () => {
    stopped = true;
    clearTimeout(timer);
    clearInterval(timer);
  };
}
