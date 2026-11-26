# 乔木软件推荐

大家分享自己 Mac 上真正在用的软件的地方。每张海报来自一位用户的真实桌面，公开海报给其中每款软件投一票。

- [首页](https://software.qiaomu.ai/)：最新海报、最近大家在推荐的软件、走心推荐理由精选、按分类/身份找。
- [海报](https://software.qiaomu.ai/posters)：按软件名、标题、身份标签或作者查找，可按软件、分类、身份与作者筛选。
- [软件榜](https://software.qiaomu.ai/apps)：总榜、最近升温（近 30 天）、新上榜、小众宝藏四种排序，支持随机逛逛与一键加入本地装机清单。
- [测品味](https://software.qiaomu.ai/taste)：勾选常用软件，测算撞款率、小众独特度，并匹配全站口味最像的真实桌面海报。
- [网页制作](https://software.qiaomu.ai/studio)：无需安装工具，在浏览器里选壁纸并复用全站共识图标 30 秒合成海报，支持原地更新与撤回。
- 软件页 `/apps/:名称`：推荐海报数、官网/App Store/Homebrew Cask 一键安装、大家的推荐理由（支持「写得好」投票）、常一起被推荐、同分类其他选择、动态 OG 分享图（`/og/apps/:名称.png`）与开发者可嵌入 SVG 徽章（`/badges/apps/:名称.svg`）。
- 海报页 `/s/:id`：点击大图灯箱预览、带标题下载海报、一键复制文字清单、整张加入本地装机清单（导出 `brew install --cask` / `Brewfile` / Markdown）、口味相近的海报。
- 订阅与开放接口：`/feed.xml`（RSS 2.0）与公开只读 JSON API（`/api/v1/apps`、`/api/v1/apps/:名称`、`/api/v1/posters`、`/api/v1/suggest`）。

界面设计规范见 [DESIGN.md](DESIGN.md)。

![示例海报](public/demo.webp)

## 使用

在 Mac 本机安装 [qiaomu-mac-software](https://github.com/joeseesun/qiaomu-mac-software)，对助手说“用我的壁纸和应用图标做一张软件推荐海报”。用户选软件与署名，预览确认后可生成仅链接或公开画廊作品。撤回凭证由本机 Skill 保存。

软件目录以公开海报为统计单位。一张海报里同一个软件即使放在多个分类也只计一次。选了分类后只计该分类的公开海报。目录按软件名称归集，英文名称大小写合并，分享撤回后立即更新。

网站只接收合成图、最终选中的软件名称、分类、推荐理由、应用 ID 和图标，以及标题、分享名和可见范围。后端重新编码图片和图标并去掉源图元数据。仅链接页面可以被转发，且不出现在画廊、软件榜和站点地图。

图标按 SHA-256 内容寻址，同一个图标只存一份。同一软件有多个版本的图标时，显示被最多公开海报使用的那个（并列取最新），单次上传无法替换大家公认的图标。运营者可把 `icons` 表中某条记录的 `blocked` 设为 1 来屏蔽它。旧链接 `/?app=…`、`/?q=…` 会 301 到 `/posters`。

## 开发

需要 Node.js 22.16+，数据默认保存在 `./data`。浏览器访问 http://127.0.0.1:3268。

```sh
npm ci
npm test
npm start
```

`POST /api/v1/shares` 接收 JSON `{name,title,visibility,apps:[{name,group,note?,id?,icon?}],icons?,image}`，其中 image 是 PNG 的 Base64，visibility 可为 `link` 或 `public`。`note` 是不超过 60 字的推荐理由，`id` 是应用 Bundle ID，`icon` 是图标 PNG 的 SHA-256。`icons` 是 `{sha256: PNG 的 Base64}`，只能包含 apps 引用过的指纹，每个 32–512px 正方形、不超过 64 KiB，合计不超过 1.5 MiB；服务端校验指纹后转成 128px WebP，已有的指纹直接跳过。上传前可用 `POST /api/v1/icons/lookup` 发送 `{hashes:[最多 48 个指纹]}`，响应 `{missing:[…]}` 列出网站还没有的指纹，客户端只需上传这些。图标由 `GET /icons/:sha256.webp` 提供，长期缓存。客户端可提供 64 位小写十六进制的随机 `Idempotency-Key` 头，让同一上传安全重试。响应含 share ID、URL 和仅供作者使用的撤回凭证。用 `DELETE /api/v1/shares/:id` 并带 `Authorization: Bearer <凭证>` 撤回。撤回凭证不要进日志或分享链接。站点无需用户账号，公开分享按 IP 限流与总存储配额运行。

## 部署维护

`deploy/` 提供 systemd 与 Nginx 配置。运行时只监听 127.0.0.1。站点用 SQLite，图片、作品元数据和公开软件索引在同一个数据库。启动时从既有公开海报补建索引。将数据目录置于版本目录之外，备份请用 SQLite 在线备份或停服务后备份数据库。

环境变量 `PORT`、`PUBLIC_ORIGIN`、`DATA_DIR` 可覆盖默认配置，`UMAMI_SITE_ID` 可启用 Umami，`TRUST_PROXY=1` 只用于反代覆盖 X-Real-IP 的部署。

举报保存在 SQLite 的 `reports` 表。运营者可按时间查看举报，对确需删除的作品在同一事务删除 `shares` 与 `reports` 中对应 ID，并在维护连接开启 SQLite 外键以级联更新软件索引。

MIT 许可。网站示例中的应用图标归其权利人。Copyright (c) 2026 向阳乔木。
