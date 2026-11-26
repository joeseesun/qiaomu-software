// Curated Mac software metadata, alias canonicalization, and optional background sync
// against Homebrew Cask JSON API & Apple iTunes Lookup API.

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

// Each entry: { name, aliases?, bundles?, homepage?, cask?, masUrl?, pricing?, summary? }
export const BUILTIN_APPS = [
  { name: 'Raycast', bundles: ['com.raycast.macos'], homepage: 'https://www.raycast.com', cask: 'raycast', pricing: '免费增值', summary: '新一代 Mac 启动器，集成剪贴板、窗口管理与扩展生态' },
  { name: 'Alfred', aliases: ['Alfred 5', 'Alfred 4'], bundles: ['com.runningwithcrayons.Alfred'], homepage: 'https://www.alfredapp.com', cask: 'alfred', pricing: '免费增值', summary: '经典的 Mac 效率启动器与 Workflow 自动化工具' },
  { name: 'Obsidian', bundles: ['md.obsidian'], homepage: 'https://obsidian.md', cask: 'obsidian', pricing: '免费增值', summary: '基于本地 Markdown 文件的双链知识库与笔记软件' },
  { name: 'Cursor', bundles: ['com.todesktop.230313mzl4w4u92'], homepage: 'https://www.cursor.com', cask: 'cursor', pricing: '免费增值', summary: 'AI 原生代码编辑器，深度集成上下文补全与 Agent 编程' },
  { name: 'Visual Studio Code', aliases: ['VS Code', 'VSCode', 'Code'], bundles: ['com.microsoft.VSCode'], homepage: 'https://code.visualstudio.com', cask: 'visual-studio-code', pricing: '开源免费', summary: '微软出品的跨平台代码编辑器与庞大插件生态' },
  { name: 'Zed', bundles: ['dev.zed.Zed'], homepage: 'https://zed.dev', cask: 'zed', pricing: '开源免费', summary: 'Rust 编写的高性能现代代码编辑器，启动与渲染极快' },
  { name: 'Sublime Text', aliases: ['Sublime'], bundles: ['com.sublimetext.4', 'com.sublimetext.3'], homepage: 'https://www.sublimetext.com', cask: 'sublime-text', pricing: '付费', summary: '轻量极速的原生文本与代码编辑器' },
  { name: 'Xcode', bundles: ['com.apple.dt.Xcode'], homepage: 'https://developer.apple.com/xcode/', masUrl: 'https://apps.apple.com/app/id497799835', pricing: '免费', summary: 'Apple 官方开发套件' },
  { name: 'Ghostty', bundles: ['com.mitchellh.ghostty'], homepage: 'https://ghostty.org', cask: 'ghostty', pricing: '开源免费', summary: 'GPU 加速、遵循 macOS 原生体验的现代终端模拟器' },
  { name: 'Warp', bundles: ['dev.warp.Warp-Stable'], homepage: 'https://www.warp.dev', cask: 'warp', pricing: '免费增值', summary: '融入块级编辑与 AI 辅助的现代终端' },
  { name: 'iTerm2', aliases: ['iTerm'], bundles: ['com.googlecode.iterm2'], homepage: 'https://iterm2.com', cask: 'iterm2', pricing: '开源免费', summary: 'macOS 老牌功能全面的终端模拟器' },
  { name: 'WezTerm', bundles: ['com.github.wez.wezterm'], homepage: 'https://wezfurlong.org/wezterm/', cask: 'wezterm', pricing: '开源免费', summary: 'Lua 配置、GPU 加速的跨平台终端' },
  { name: 'Kitty', bundles: ['net.kovidgoyal.kitty'], homepage: 'https://sw.kovidgoyal.net/kitty/', cask: 'kitty', pricing: '开源免费', summary: '轻量高速、支持图形协议的 GPU 终端' },
  { name: 'Alacritty', bundles: ['org.alacritty'], homepage: 'https://alacritty.org', cask: 'alacritty', pricing: '开源免费', summary: '极致简约的 OpenGL 加速终端' },
  { name: 'OrbStack', bundles: ['dev.kdrag0n.MacVirt'], homepage: 'https://orbstack.dev', cask: 'orbstack', pricing: '免费增值', summary: '轻量极速的 macOS Docker 与 Linux 虚拟机方案' },
  { name: 'Docker Desktop', aliases: ['Docker'], bundles: ['com.docker.docker'], homepage: 'https://www.docker.com/products/docker-desktop/', cask: 'docker', pricing: '免费增值', summary: '官方容器开发与运行环境' },
  { name: 'Arc', aliases: ['Arc Browser'], bundles: ['company.thebrowser.Browser'], homepage: 'https://arc.net', cask: 'arc', pricing: '免费', summary: '以侧边栏空间和分屏重构标签页体验的浏览器' },
  { name: 'Dia', bundles: ['company.thebrowser.dia'], homepage: 'https://www.diabrowser.com', pricing: '免费', summary: 'The Browser Company 推出的 AI 原生浏览器' },
  { name: 'Google Chrome', aliases: ['Chrome'], bundles: ['com.google.Chrome'], homepage: 'https://www.google.com/chrome/', cask: 'google-chrome', pricing: '免费', summary: '生态最完善的现代网页浏览器' },
  { name: 'Safari', bundles: ['com.apple.Safari'], homepage: 'https://www.apple.com/safari/', pricing: '系统自带', summary: 'macOS 原生省电浏览器，与 Apple 生态深度同步' },
  { name: 'Brave Browser', aliases: ['Brave'], bundles: ['com.brave.Browser'], homepage: 'https://brave.com', cask: 'brave-browser', pricing: '开源免费', summary: '内置广告与追踪拦截的隐私浏览器' },
  { name: 'Zen Browser', aliases: ['Zen'], bundles: ['app.zen-browser.zen'], homepage: 'https://zen-browser.app', cask: 'zen', pricing: '开源免费', summary: '基于 Firefox 的开源侧边栏高颜值浏览器' },
  { name: 'Firefox', bundles: ['org.mozilla.firefox'], homepage: 'https://www.mozilla.org/firefox/', cask: 'firefox', pricing: '开源免费', summary: '独立内核的开源网页浏览器' },
  { name: 'Bob', bundles: ['com.hezongyidev.Bob', 'com.ripperhe.Bob'], homepage: 'https://bobtranslate.com', masUrl: 'https://apps.apple.com/app/id1630034110', pricing: '付费', summary: 'macOS 口碑极佳的划词翻译与 OCR 工具' },
  { name: 'CleanShot X', aliases: ['CleanShot'], bundles: ['pl.maketheweb.cleanshotx'], homepage: 'https://cleanshot.com', cask: 'cleanshot', pricing: 'Setapp / 付费', summary: '集截图、标注、滚屏长图与录屏于一体的旗舰截图工具' },
  { name: 'Shottr', bundles: ['cc.ffitch.shottr'], homepage: 'https://shottr.cc', cask: 'shottr', pricing: '免费增值', summary: '极速轻量、支持像素测距和 OCR 的截图工具' },
  { name: 'PixPin', bundles: ['com.pixpin.PixPin'], homepage: 'https://pixpin.cn', cask: 'pixpin', pricing: '免费增值', summary: '支持截图、贴图、长截图与 GIF 录屏的高效工具' },
  { name: 'Snipaste', bundles: ['com.Snipaste'], homepage: 'https://www.snipaste.com', cask: 'snipaste', pricing: '免费增值', summary: '轻巧顺手的截图与桌面贴图工具' },
  { name: 'Screen Studio', bundles: ['com.timpler.screenstudio'], homepage: 'https://screen.studio', cask: 'screen-studio', pricing: '付费', summary: '自动平滑跟随缩放的高颜值产品演示录屏工具' },
  { name: 'Kap', bundles: ['com.wulkano.kap'], homepage: 'https://getkap.co', cask: 'kap', pricing: '开源免费', summary: '简洁开源的 macOS 屏幕录制与 GIF 导出工具' },
  { name: 'Notion', bundles: ['notion.id'], homepage: 'https://www.notion.so', cask: 'notion', pricing: '免费增值', summary: '集文档、数据库与项目协作于一体的 All-in-one 工作区' },
  { name: 'Typora', bundles: ['abnerworks.Typora'], homepage: 'https://typora.io', cask: 'typora', pricing: '付费', summary: '所见即所得的极简 Markdown 写作编辑器' },
  { name: 'Bear', aliases: ['熊掌记'], bundles: ['net.shinyfrog.bear'], homepage: 'https://bear.app', masUrl: 'https://apps.apple.com/app/id1091189122', pricing: '免费增值', summary: '极具设计感的原生 Apple 生态 Markdown 笔记' },
  { name: 'Heptabase', bundles: ['app.heptabase.desktop'], homepage: 'https://heptabase.com', cask: 'heptabase', pricing: '付费', summary: '以白板卡片为核心的视觉化学习与研究笔记工具' },
  { name: 'Logseq', bundles: ['com.electron.logseq'], homepage: 'https://logseq.com', cask: 'logseq', pricing: '开源免费', summary: '本地优先、以大纲和双链为核心的开源知识管理' },
  { name: 'Craft', bundles: ['com.lukilabs.lukiapp'], homepage: 'https://www.craft.do', masUrl: 'https://apps.apple.com/app/id1487937127', pricing: '免费增值', summary: '排版优雅、适合分享与协作的原生文档应用' },
  { name: 'Ulysses', bundles: ['com.ulyssesapp.mac'], homepage: 'https://ulysses.app', masUrl: 'https://apps.apple.com/app/id1225570693', pricing: 'Setapp / 付费', summary: '面向长文作者的沉浸式写作与发布工具' },
  { name: 'iA Writer', bundles: ['pro.writer.mac'], homepage: 'https://ia.net/writer', masUrl: 'https://apps.apple.com/app/id775737590', pricing: '付费', summary: '专注纯文本与排版美感的极简写作软件' },
  { name: 'Claude', bundles: ['com.anthropic.claudefordesktop'], homepage: 'https://claude.ai/download', cask: 'claude', pricing: '免费增值', summary: 'Anthropic 官方桌面端，支持快捷键唤起与 MCP 集成' },
  { name: 'ChatGPT', bundles: ['com.openai.chat'], homepage: 'https://openai.com/chatgpt/mac/', cask: 'chatgpt', pricing: '免费增值', summary: 'OpenAI 官方 macOS 原生客户端' },
  { name: 'Cherry Studio', bundles: ['com.kangfenmao.CherryStudio'], homepage: 'https://cherry-ai.com', cask: 'cherry-studio', pricing: '开源免费', summary: '支持多模型 API 与本地知识库的桌面 AI 客户端' },
  { name: 'Ollama', bundles: ['com.electron.ollama'], homepage: 'https://ollama.com', cask: 'ollama', pricing: '开源免费', summary: '一行命令在 Mac 本地运行开源大语言模型' },
  { name: 'LM Studio', bundles: ['ai.elementlabs.lmstudio'], homepage: 'https://lmstudio.ai', cask: 'lm-studio', pricing: '免费', summary: '带图形界面的本地大语言模型下载与调试工具' },
  { name: 'WeChat', aliases: ['微信'], bundles: ['com.tencent.xinWeChat'], homepage: 'https://mac.weixin.qq.com', cask: 'wechat', masUrl: 'https://apps.apple.com/app/id836500024', pricing: '免费', summary: '微信 macOS 桌面客户端' },
  { name: 'Telegram', bundles: ['ru.keepcoder.Telegram', 'org.telegram.desktop'], homepage: 'https://macos.telegram.org', cask: 'telegram', masUrl: 'https://apps.apple.com/app/id747648890', pricing: '免费', summary: '快速、跨平台同步的即时通讯工具' },
  { name: 'Slack', bundles: ['com.tinyspeck.slackmacgap'], homepage: 'https://slack.com', cask: 'slack', masUrl: 'https://apps.apple.com/app/id803453959', pricing: '免费增值', summary: '团队沟通与工作流通知中心' },
  { name: 'Discord', bundles: ['com.hnc.Discord'], homepage: 'https://discord.com', cask: 'discord', pricing: '免费增值', summary: '面向社区与开发者的语音文字交流平台' },
  { name: 'Linear', bundles: ['com.linear'], homepage: 'https://linear.app', cask: 'linear-linear', pricing: '免费增值', summary: '极速键盘流的产品研发与任务管理工具' },
  { name: 'Things', aliases: ['Things 3'], bundles: ['com.culturedcode.ThingsMac'], homepage: 'https://culturedcode.com/things/', masUrl: 'https://apps.apple.com/app/id904280696', pricing: '付费', summary: '获 Apple 设计大奖的极简 GTD 待办事项软件' },
  { name: 'TickTick', aliases: ['滴答清单'], bundles: ['com.TickTick.task.mac'], homepage: 'https://ticktick.com', cask: 'ticktick', masUrl: 'https://apps.apple.com/app/id966085870', pricing: '免费增值', summary: '结合待办、番茄钟与日历视图的时间管理应用' },
  { name: 'Todoist', bundles: ['com.todoist.mac.Todoist'], homepage: 'https://todoist.com', cask: 'todoist-app', masUrl: 'https://apps.apple.com/app/id585829637', pricing: '免费增值', summary: '支持自然语言输入的全平台任务管理软件' },
  { name: 'Fantastical', bundles: ['com.flexibits.fantastical2.mac'], homepage: 'https://flexibits.com/fantastical', cask: 'fantastical', masUrl: 'https://apps.apple.com/app/id975937182', pricing: '免费增值', summary: '支持自然语言解析日程的精致 macOS 日历' },
  { name: 'Figma', bundles: ['com.figma.Desktop'], homepage: 'https://www.figma.com', cask: 'figma', pricing: '免费增值', summary: '实时协作的界面设计与原型工具' },
  { name: 'Sketch', bundles: ['com.bohemiancoding.sketch3'], homepage: 'https://www.sketch.com', cask: 'sketch', pricing: '付费', summary: '原生 macOS 矢量界面设计软件' },
  { name: '1Password', aliases: ['1Password 8'], bundles: ['com.1password.1password'], homepage: 'https://1password.com', cask: '1password', pricing: '付费', summary: '安全易用的全平台密码与密钥管理器' },
  { name: 'Bitwarden', bundles: ['com.bitwarden.desktop'], homepage: 'https://bitwarden.com', cask: 'bitwarden', masUrl: 'https://apps.apple.com/app/id1352778147', pricing: '开源免费', summary: '开源跨平台密码管理器，支持自托管' },
  { name: 'Rectangle', bundles: ['com.knollsoft.Rectangle'], homepage: 'https://rectangleapp.com', cask: 'rectangle', pricing: '开源免费', summary: '轻巧免费的快捷键窗口分屏工具' },
  { name: 'Loop', bundles: ['com.MrKai77.Loop'], homepage: 'https://github.com/MrKai77/Loop', cask: 'loop', pricing: '开源免费', summary: '带优雅径向菜单的开源窗口管理工具' },
  { name: 'Magnet', bundles: ['com.crowdcafe.windowmagnet'], homepage: 'https://magnet.crowdcafe.com', masUrl: 'https://apps.apple.com/app/id441258766', pricing: '付费', summary: '拖拽贴边与快捷键分屏的经典窗口工具' },
  { name: 'Bartender', aliases: ['Bartender 5'], bundles: ['com.surteesstudios.Bartender'], homepage: 'https://www.macbartender.com', cask: 'bartender', pricing: 'Setapp / 付费', summary: '精细收纳与自定义 macOS 菜单栏图标' },
  { name: 'Ice', bundles: ['com.jordanbaird.Ice'], homepage: 'https://icemenubar.app', cask: 'jordanbaird-ice', pricing: '开源免费', summary: '开源高颜值的 macOS 菜单栏管理工具' },
  { name: 'AlDente', bundles: ['com.apphousekitchen.aldente-pro', 'com.davidwernhart.Helper'], homepage: 'https://apphousekitchen.com', cask: 'aldente', pricing: '免费增值', summary: '限制 MacBook 充电上限以延长电池寿命' },
  { name: 'Stats', bundles: ['eu.exelban.Stats'], homepage: 'https://github.com/exelban/stats', cask: 'stats', pricing: '开源免费', summary: '在菜单栏实时监控 CPU、内存、网速与温度' },
  { name: 'Maccy', bundles: ['org.p0deje.Maccy'], homepage: 'https://maccy.app', cask: 'maccy', pricing: '开源免费', summary: '轻量原生、纯键盘驱动的开源剪贴板历史' },
  { name: 'Paste', bundles: ['com.wiheads.paste'], homepage: 'https://pasteapp.io', masUrl: 'https://apps.apple.com/app/id967805235', pricing: 'Setapp / 付费', summary: '卡片式可视化剪贴板与多设备 iCloud 同步' },
  { name: 'Input Source Pro', bundles: ['com.runjuu.Input-Source-Pro'], homepage: 'https://inputsource.pro', cask: 'input-source-pro', pricing: '免费', summary: '按应用自动切换中英文输入法并在光标旁提示状态' },
  { name: 'Karabiner-Elements', aliases: ['Karabiner'], bundles: ['org.pqrs.Karabiner-Elements.Settings'], homepage: 'https://karabiner-elements.pqrs.org', cask: 'karabiner-elements', pricing: '开源免费', summary: '强大的 macOS 底层改键与 Hyper 键定制工具' },
  { name: 'BetterTouchTool', aliases: ['BTT'], bundles: ['com.hegenberg.BetterTouchTool'], homepage: 'https://folivora.ai', cask: 'bettertouchtool', pricing: 'Setapp / 付费', summary: '全能触控板手势、快捷键与自动化定制神器' },
  { name: 'PopClip', bundles: ['com.pilotmoon.popclip'], homepage: 'https://www.popclip.app', cask: 'popclip', masUrl: 'https://apps.apple.com/app/id445189367', pricing: 'Setapp / 付费', summary: '选中文本即弹出的快捷动作条与扩展生态' },
  { name: 'Hazel', bundles: ['com.noodlesoft.Hazel'], homepage: 'https://www.noodlesoft.com', cask: 'hazel', pricing: '付费', summary: '按规则自动整理下载文件夹与归档文件' },
  { name: 'MonitorControl', bundles: ['me.guillaumeb.MonitorControl'], homepage: 'https://github.com/MonitorControl/MonitorControl', cask: 'monitorcontrol', pricing: '开源免费', summary: '用原生键盘快捷键直接调节外接显示器亮度与音量' },
  { name: 'BetterDisplay', bundles: ['pro.betterdisplay.BetterDisplay'], homepage: 'https://github.com/waydabber/BetterDisplay', cask: 'betterdisplay', pricing: '免费增值', summary: '为外接显示器开启 HiDPI、虚拟屏与色彩亮度精细控制' },
  { name: 'Amphetamine', bundles: ['com.if.Amphetamine'], homepage: 'https://apps.apple.com/app/id937984704', masUrl: 'https://apps.apple.com/app/id937984704', pricing: '免费', summary: '按时长或应用条件防止 Mac 自动休眠' },
  { name: 'IINA', bundles: ['com.colliderli.iina'], homepage: 'https://iina.io', cask: 'iina', pricing: '开源免费', summary: '为 macOS 原生打造的开源现代全能视频播放器' },
  { name: 'Infuse', bundles: ['com.firecore.infuse'], homepage: 'https://firecore.com/infuse', masUrl: 'https://apps.apple.com/app/id1136220934', pricing: '免费增值', summary: '支持网盘与 NAS 海报墙的精美本地影音播放器' },
  { name: 'VLC', bundles: ['org.videolan.vlc'], homepage: 'https://www.videolan.org/vlc/', cask: 'vlc', pricing: '开源免费', summary: '经典跨平台开源万能媒体播放器' },
  { name: 'Downie', aliases: ['Downie 4'], bundles: ['com.charliemonroe.Downie-4'], homepage: 'https://software.charliemonroe.net/downie/', cask: 'downie', pricing: 'Setapp / 付费', summary: '支持上千网站的极简视频下载工具' },
  { name: 'Permute', aliases: ['Permute 3'], bundles: ['com.charliemonroe.Permute-3'], homepage: 'https://software.charliemonroe.net/permute/', cask: 'permute', pricing: 'Setapp / 付费', summary: '拖拽即转码的音视频与图片格式转换工具' },
  { name: 'HandBrake', bundles: ['fr.handbrake.HandBrake'], homepage: 'https://handbrake.fr', cask: 'handbrake', pricing: '开源免费', summary: '开源专业视频压缩与转码工具' },
  { name: 'NetNewsWire', bundles: ['com.ranchero.NetNewsWire-Evergreen'], homepage: 'https://netnewswire.com', cask: 'netnewswire', pricing: '开源免费', summary: '纯粹原生、免费开源的 macOS RSS 阅读器' },
  { name: 'Reeder', aliases: ['Reeder 5'], bundles: ['com.reederapp.5.macOS'], homepage: 'https://reederapp.com', masUrl: 'https://apps.apple.com/app/id1529448980', pricing: '付费', summary: '手感极佳的 Apple 生态 RSS 与稍后阅读客户端' },
  { name: 'Readwise Reader', aliases: ['Reader'], bundles: ['io.readwise.reader'], homepage: 'https://readwise.io/read', pricing: '付费', summary: '集网页、RSS、PDF 与划线同步于一体的深度阅读器' },
  { name: 'Tailscale', bundles: ['io.tailscale.ipn.macos'], homepage: 'https://tailscale.com', cask: 'tailscale', masUrl: 'https://apps.apple.com/app/id1475387142', pricing: '免费增值', summary: '零配置 WireGuard 组网，随时安全连回家里或服务器' },
  { name: 'Surge', aliases: ['Surge 5'], bundles: ['com.nssurge.surge-mac'], homepage: 'https://nssurge.com', cask: 'surge', pricing: '付费', summary: '专业级 macOS 网络调试、抓包与策略代理工具' },
  { name: 'Clash Verge', aliases: ['Clash Verge Rev'], bundles: ['io.github.clash-verge-rev.clash-verge-rev'], homepage: 'https://www.clashverge.dev', cask: 'clash-verge-rev', pricing: '开源免费', summary: '开源现代的网络代理桌面客户端' },
  { name: 'Proxyman', bundles: ['com.proxyman.NSProxy'], homepage: 'https://proxyman.io', cask: 'proxyman', pricing: 'Setapp / 付费', summary: '原生 macOS HTTP/HTTPS 抓包与接口调试工具' },
  { name: 'TablePlus', bundles: ['com.tinyapp.TablePlus'], homepage: 'https://tableplus.com', cask: 'tableplus', pricing: 'Setapp / 付费', summary: '原生高速的多数据库图形化客户端' },
  { name: 'Bruno', bundles: ['com.usebruno.app'], homepage: 'https://www.usebruno.com', cask: 'bruno', pricing: '开源免费', summary: '本地 Git 友好、轻量开源的 API 调试工具' },
  { name: 'Postman', bundles: ['com.postmanlabs.mac'], homepage: 'https://www.postman.com', cask: 'postman', pricing: '免费增值', summary: '广泛使用的 API 设计、测试与协作平台' },
  { name: 'Fork', bundles: ['com.DanPristupov.Fork'], homepage: 'https://git-fork.com', cask: 'fork', pricing: '付费', summary: '轻快顺手的原生 Git 图形化客户端' },
  { name: 'Tower', bundles: ['com.fournova.Tower3'], homepage: 'https://www.git-tower.com', cask: 'tower', pricing: '付费', summary: '功能强大、界面优雅的 macOS Git 客户端' },
  { name: 'GitHub Desktop', bundles: ['com.github.GitHubClient'], homepage: 'https://desktop.github.com', cask: 'github', pricing: '开源免费', summary: 'GitHub 官方简洁 Git 桌面端' },
  { name: 'Keka', bundles: ['com.aone.keka'], homepage: 'https://www.keka.io', cask: 'keka', masUrl: 'https://apps.apple.com/app/id470158795', pricing: '开源免费', summary: '支持 7z/RAR/ZIP 等多格式的原生压缩解压工具' },
  { name: 'The Unarchiver', bundles: ['com.macpaw.site.theunarchiver'], homepage: 'https://theunarchiver.com', cask: 'the-unarchiver', masUrl: 'https://apps.apple.com/app/id425424353', pricing: '免费', summary: '简洁可靠的免费解压工具，中文编码兼容极佳' },
  { name: 'AppCleaner', bundles: ['net.freemacsoft.AppCleaner'], homepage: 'https://freemacsoft.net/appcleaner/', cask: 'appcleaner', pricing: '免费', summary: '小巧纯粹的 Mac 应用与残留文件彻底卸载工具' },
  { name: 'Pearcleaner', bundles: ['com.alienator88.Pearcleaner'], homepage: 'https://itsalin.com/appInfo/?id=pearcleaner', cask: 'pearcleaner', pricing: '开源免费', summary: '现代开源的 Mac 应用卸载与孤立文件清理工具' },
  { name: 'Transmit', aliases: ['Transmit 5'], bundles: ['com.panic.Transmit'], homepage: 'https://panic.com/transmit/', cask: 'transmit', pricing: '付费', summary: 'macOS 标杆级 FTP / SFTP / S3 文件传输工具' },
  { name: 'ForkLift', aliases: ['ForkLift 4'], bundles: ['com.binarynights.ForkLift'], homepage: 'https://binarynights.com', cask: 'forklift', pricing: 'Setapp / 付费', summary: '原生双栏文件管理器与远程传输客户端' },
  { name: 'Spotify', bundles: ['com.spotify.client'], homepage: 'https://www.spotify.com', cask: 'spotify', pricing: '免费增值', summary: '全球主流流媒体音乐与播客平台' },
  { name: 'IntelliJ IDEA', bundles: ['com.jetbrains.intellij'], homepage: 'https://www.jetbrains.com/idea/', cask: 'intellij-idea', pricing: '免费增值', summary: 'JetBrains 旗舰 Java / Kotlin 集成开发环境' },
  { name: 'WebStorm', bundles: ['com.jetbrains.WebStorm'], homepage: 'https://www.jetbrains.com/webstorm/', cask: 'webstorm', pricing: '免费增值', summary: 'JetBrains 专业 JavaScript / TypeScript IDE' },
  { name: 'PyCharm', bundles: ['com.jetbrains.pycharm'], homepage: 'https://www.jetbrains.com/pycharm/', cask: 'pycharm', pricing: '免费增值', summary: 'JetBrains 专业 Python IDE' },
  { name: 'GoLand', bundles: ['com.jetbrains.goland'], homepage: 'https://www.jetbrains.com/goland/', cask: 'goland', pricing: '付费', summary: 'JetBrains 专业 Go 语言 IDE' },
  { name: 'DataGrip', bundles: ['com.jetbrains.datagrip'], homepage: 'https://www.jetbrains.com/datagrip/', cask: 'datagrip', pricing: '付费', summary: 'JetBrains 跨数据库 SQL IDE' },
  { name: 'Blender', bundles: ['org.blenderfoundation.blender'], homepage: 'https://www.blender.org', cask: 'blender', pricing: '开源免费', summary: '全能开源 3D 建模、动画与渲染套件' },
  { name: 'Final Cut Pro', bundles: ['com.apple.FinalCut'], homepage: 'https://www.apple.com/final-cut-pro/', masUrl: 'https://apps.apple.com/app/id424389933', pricing: '付费', summary: 'Apple 针对 Silicon 深度优化的专业视频剪辑软件' },
  { name: 'DaVinci Resolve', bundles: ['com.blackmagic-design.DaVinciResolve'], homepage: 'https://www.blackmagicdesign.com/products/davinciresolve', pricing: '免费增值', summary: '专业剪辑、调色与后期合成套件' },
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

export function seedMetadataAndAliases(db, now = () => Date.now()) {
  const ts = now();
  const upsertAlias = db.prepare(
    'INSERT OR IGNORE INTO app_aliases (alias_key, canonical_key, display_name) VALUES (?,?,?)'
  );
  const upsertMeta = db.prepare(`
    INSERT INTO app_metadata (app_key, homepage, cask, mas_url, pricing, summary, source, updated)
    VALUES (?,?,?,?,?,?,'builtin',?)
    ON CONFLICT(app_key) DO UPDATE SET
      homepage = COALESCE(NULLIF(app_metadata.homepage, ''), excluded.homepage),
      cask = COALESCE(NULLIF(app_metadata.cask, ''), excluded.cask),
      mas_url = COALESCE(NULLIF(app_metadata.mas_url, ''), excluded.mas_url),
      pricing = COALESCE(NULLIF(app_metadata.pricing, ''), excluded.pricing),
      summary = COALESCE(NULLIF(app_metadata.summary, ''), excluded.summary)
    WHERE app_metadata.source = 'builtin'
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
        ts
      );
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

// Safely validates external URLs before storing/rendering.
export function safeHttpUrl(url) {
  if (typeof url !== 'string' || !url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return parsed.toString();
  } catch {}
  return '';
}

// Background sync against Homebrew Cask JSON API & iTunes Lookup API.
// Only enriches apps that actually appear in public posters to keep DB & RAM tiny.
export function startMetadataSync(db, { now = () => Date.now(), log = console.warn } = {}) {
  let stopped = false;
  let timer = null;

  const activeAppsStmt = db.prepare(`
    SELECT m.app_key AS key, MIN(m.name) AS name,
      (SELECT b.bundle FROM app_mentions AS b WHERE b.app_key=m.app_key AND b.bundle IS NOT NULL AND b.bundle NOT LIKE 'cli:%'
        GROUP BY b.bundle ORDER BY COUNT(*) DESC LIMIT 1) AS bundle,
      md.homepage, md.cask, md.mas_url
    FROM app_mentions AS m
    JOIN shares AS s ON s.id=m.share_id AND s.visibility='public'
    LEFT JOIN app_metadata AS md ON md.app_key=m.app_key
    GROUP BY m.app_key
  `);

  const upsertMeta = db.prepare(`
    INSERT INTO app_metadata (app_key, homepage, cask, mas_url, pricing, summary, source, updated)
    VALUES (?,?,?,?,?,?,?,?)
    ON CONFLICT(app_key) DO UPDATE SET
      homepage = CASE WHEN excluded.homepage <> '' AND (app_metadata.homepage IS NULL OR app_metadata.homepage = '') THEN excluded.homepage ELSE app_metadata.homepage END,
      cask = CASE WHEN excluded.cask <> '' AND (app_metadata.cask IS NULL OR app_metadata.cask = '') THEN excluded.cask ELSE app_metadata.cask END,
      mas_url = CASE WHEN excluded.mas_url <> '' AND (app_metadata.mas_url IS NULL OR app_metadata.mas_url = '') THEN excluded.mas_url ELSE app_metadata.mas_url END,
      summary = CASE WHEN excluded.summary <> '' AND (app_metadata.summary IS NULL OR app_metadata.summary = '') THEN excluded.summary ELSE app_metadata.summary END,
      updated = excluded.updated
  `);

  async function syncOnce() {
    if (stopped) return;
    const active = activeAppsStmt.all();
    const needsBrew = active.filter(row => !row.cask || !row.homepage);
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
            const entry = { token: c.token, homepage: safeHttpUrl(c.homepage), desc: typeof c.desc === 'string' ? c.desc.slice(0, 120) : '' };
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
                upsertMeta.run(row.key, hit.homepage, hit.token, '', '', '', 'homebrew', ts);
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

    // Enrich missing Mac App Store links via Apple iTunes Lookup API (up to 8 per cycle)
    const needsMas = activeAppsStmt.all().filter(row => row.bundle && !row.mas_url).slice(0, 8);
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
          if (masUrl || homepage) {
            upsertMeta.run(row.key, homepage, '', masUrl, '', '', 'itunes', now());
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
  }, 10_000);
  timer.unref?.();

  return () => {
    stopped = true;
    clearTimeout(timer);
    clearInterval(timer);
  };
}
