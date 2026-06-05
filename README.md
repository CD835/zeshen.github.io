# 0xBlog — 网络安全学习笔记

一个纯静态的网络安全学习博客，使用 HTML + CSS + JavaScript 构建，可直接部署到 **GitHub Pages**。

## 🚀 快速部署到 GitHub Pages

### 第一步：创建 GitHub 仓库

```bash
# 在这个目录下初始化 git
git init
git add .
git commit -m "初始化博客"

# 在 GitHub 上创建新仓库（例如：cyber-blog）
# 然后关联远程仓库
git remote add origin https://github.com/你的用户名/cyber-blog.git
git branch -M main
git push -u origin main
```

### 第二步：开启 GitHub Pages

1. 进入你的 GitHub 仓库 → **Settings** → **Pages**
2. **Source** 选择 `Deploy from a branch`
3. **Branch** 选择 `main`，文件夹选 `/ (root)`
4. 点击 **Save**
5. 等待 1-2 分钟，你的博客将部署在 `https://你的用户名.github.io/cyber-blog/`

> 💡 如果想要 `https://你的用户名.github.io` 这样的短地址，把仓库名设为 `你的用户名.github.io` 即可。

## 📝 如何添加新文章

### 方法一：编辑 posts.json（推荐）

只需在 `posts.json` 的数组中添加一条新记录：

```json
{
  "id": "my-new-post",
  "title": "你的文章标题",
  "date": "2026-06-10",
  "excerpt": "文章摘要，显示在列表页，控制在 100 字以内。",
  "tags": ["Web安全", "XSS"],
  "content": "<h2>第一章</h2><p>文章正文 HTML...</p>"
}
```

### 字段说明

| 字段 | 说明 |
|------|------|
| `id` | 唯一标识，用英文和连字符，如 `sql-injection-guide` |
| `title` | 文章标题 |
| `date` | 日期，格式 `YYYY-MM-DD` |
| `excerpt` | 摘要，显示在文章列表中 |
| `tags` | 标签数组，用于分类和筛选 |
| `content` | 文章正文，支持 HTML 标签 |

### 方法二：使用独立 HTML 文件

你也可以把每篇文章写成独立的 `.html` 文件放在 `posts/` 目录下，然后在 `posts.json` 中引用路径。

## 🏷️ 标签管理

博客会自动从 `posts.json` 中提取所有标签并生成筛选按钮。你可以自由定义标签，建议使用的标签体系：

- **方向**：`Web安全` `渗透测试` `代码审计` `内网渗透` `云安全` `移动安全` `IoT安全`
- **技术**：`SQL注入` `XSS` `CSRF` `SSRF` `文件上传` `命令注入` `反序列化`
- **工具**：`Burp Suite` `Nmap` `sqlmap` `Metasploit` `Wireshark`
- **其他**：`CTF` `漏洞复现` `CVE` `工具开发` `Python` `学习笔记`

## 🎨 主题

博客默认使用暗色主题（终端风格），点击右上角的 🌙/☀️ 按钮可以切换亮色/暗色主题，偏好会自动保存在浏览器中。

## 📂 文件结构

```
我的博客/
├── index.html          # 主页面
├── posts.json          # ⭐ 文章数据（主要编辑这个文件）
├── css/
│   └── style.css       # 样式文件
├── js/
│   └── blog.js         # 核心逻辑
├── posts/              # 独立文章文件（可选）
├── .github/            # GitHub Actions（可选）
└── README.md           # 本说明文件
```

## 🔄 日常更新工作流

### 最简单的更新方式（在 GitHub 网页上操作）

1. 打开你的仓库 → 点击 `posts.json` → 点击 ✏️ 编辑按钮
2. 添加新文章 JSON → 点击 **Commit changes**
3. GitHub Pages 会自动重新部署（约 1-2 分钟生效）

### 本地更新 + 推送

```bash
# 1. 编辑 posts.json 添加新文章

# 2. 本地预览（可选，任选一种方式）
python -m http.server 8080        # Python 3
# 或
npx serve .                       # 需要 Node.js

# 3. 提交推送
git add posts.json
git commit -m "新增文章：XXX"
git push
```

## 💡 进阶建议

### 1. 绑定自定义域名
在 GitHub Pages 设置中添加自定义域名，并配置 DNS 的 CNAME 记录。

### 2. 添加评论系统
可以使用 Giscus（基于 GitHub Discussions）或 utterances 为文章添加评论功能。

### 3. 添加访问统计
使用 Google Analytics 或不蒜子（busuanzi）添加访问量统计。

### 4. 自动部署
在 `.github/workflows/` 下添加 GitHub Actions 工作流，实现推送自动部署。

### 5. SEO 优化
- 每篇文章写一段好的 `excerpt`（会显示在社交分享中）
- 使用有意义的 `id`（影响 URL 可读性）
- 后续可添加 sitemap 生成

## 📚 推荐学习资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — Web 安全必读
- [PortSwigger Web Security Academy](https://portswigger.net/web-security) — 免费 Web 安全实验
- [HackTheBox](https://www.hackthebox.com/) — 渗透测试靶场
- [TryHackMe](https://tryhackme.com/) — 新手友好靶场
- [BUUCTF](https://buuoj.cn/) — CTF 在线平台

---

Keep Learning · Keep Hacking (Ethically) 🛡️
