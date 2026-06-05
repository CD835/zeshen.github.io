/* ============================================
   0xBlog — 网络安全学习笔记
   核心 JavaScript 逻辑
   ============================================ */

// ---------- 全局状态 ----------
const state = {
  posts: [],
  currentPage: 1,
  postsPerPage: 5,
  activeTag: 'all',
  searchQuery: '',
  currentView: 'home',   // 'home' | 'archive' | 'about' | 'post'
  theme: 'dark',
};

// ---------- 初始化 ----------
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadPosts();
  bindEvents();
});

// ---------- 加载文章数据 ----------
async function loadPosts() {
  try {
    const resp = await fetch('posts.json');
    if (!resp.ok) throw new Error('posts.json 加载失败');
    state.posts = await resp.json();
    // 按日期降序排列
    state.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    initTags();
    renderAll();
  } catch (err) {
    document.getElementById('postList').innerHTML = `
      <div class="empty-state">
        <span class="emoji">📂</span>
        <p>暂无文章。请在 <code>posts.json</code> 中添加你的第一篇文章！</p>
      </div>`;
    console.error('加载文章失败:', err);
  }
}

// ---------- 初始化标签列表 ----------
function initTags() {
  const tagCount = {};
  state.posts.forEach(p => {
    (p.tags || []).forEach(t => {
      tagCount[t] = (tagCount[t] || 0) + 1;
    });
  });

  // 筛选标签按钮
  const tagFilter = document.getElementById('tagFilter');
  const allBtn = tagFilter.querySelector('[data-tag="all"]');
  tagFilter.innerHTML = '';
  tagFilter.appendChild(allBtn);

  Object.entries(tagCount).sort((a, b) => b[1] - a[1]).forEach(([tag, count]) => {
    const btn = document.createElement('button');
    btn.className = 'tag-btn';
    btn.dataset.tag = tag;
    btn.textContent = `${tag} (${count})`;
    tagFilter.appendChild(btn);
  });

  // 侧边栏热门标签
  const hotTags = document.getElementById('hotTags');
  hotTags.innerHTML = '';
  Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 8).forEach(([tag]) => {
    const span = document.createElement('span');
    span.className = 'hot-tag';
    span.textContent = tag;
    span.addEventListener('click', () => filterByTag(tag));
    hotTags.appendChild(span);
  });

  // 侧边栏最新文章
  const recentPosts = document.getElementById('recentPosts');
  recentPosts.innerHTML = '';
  state.posts.slice(0, 5).forEach(p => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = p.title;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      openPost(p);
    });
    li.appendChild(a);
    recentPosts.appendChild(li);
  });
}

// ---------- 渲染所有区域 ----------
function renderAll() {
  renderPostList();
  renderPagination();
}

// ---------- 渲染文章列表 ----------
function renderPostList() {
  const container = document.getElementById('postList');
  let filtered = state.posts;

  // 标签筛选
  if (state.activeTag !== 'all') {
    filtered = filtered.filter(p => (p.tags || []).includes(state.activeTag));
  }

  // 搜索筛选
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.trim().toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.excerpt || '').toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state"><span class="emoji">🔍</span><p>没有找到匹配的文章</p></div>`;
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  // 分页
  const totalPages = Math.ceil(filtered.length / state.postsPerPage);
  if (state.currentPage > totalPages) state.currentPage = totalPages;
  const start = (state.currentPage - 1) * state.postsPerPage;
  const pagePosts = filtered.slice(start, start + state.postsPerPage);

  container.innerHTML = pagePosts.map(p => `
    <article class="post-card" data-id="${p.id}">
      <div class="post-card-header">
        <h2 class="post-title">${escapeHtml(p.title)}</h2>
        <span class="post-date">${formatDate(p.date)}</span>
      </div>
      <p class="post-excerpt">${escapeHtml(p.excerpt || '')}</p>
      <div class="post-meta">
        ${(p.tags || []).map(t => `<span class="post-tag">#${escapeHtml(t)}</span>`).join('')}
      </div>
    </article>
  `).join('');

  // 绑定点击事件
  container.querySelectorAll('.post-card').forEach(card => {
    card.addEventListener('click', () => {
      const post = state.posts.find(p => p.id === card.dataset.id);
      if (post) openPost(post);
    });
  });

  // 存储总数用于分页
  container.dataset.totalPages = totalPages;
}

// ---------- 渲染分页 ----------
function renderPagination() {
  const container = document.getElementById('pagination');
  const totalPages = parseInt(document.getElementById('postList').dataset.totalPages || '1');
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  html += `<button class="page-btn" ${state.currentPage <= 1 ? 'disabled' : ''} data-page="prev">← 上一页</button>`;

  for (let i = 1; i <= totalPages; i++) {
    // 显示页码策略：首页、末页、当前页附近
    if (i === 1 || i === totalPages || (i >= state.currentPage - 2 && i <= state.currentPage + 2)) {
      html += `<button class="page-btn ${i === state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (i === state.currentPage - 3 || i === state.currentPage + 3) {
      html += `<span style="color:var(--text-muted)">…</span>`;
    }
  }

  html += `<button class="page-btn" ${state.currentPage >= totalPages ? 'disabled' : ''} data-page="next">下一页 →</button>`;
  container.innerHTML = html;

  container.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page === 'prev') state.currentPage = Math.max(1, state.currentPage - 1);
      else if (page === 'next') state.currentPage = Math.min(totalPages, state.currentPage + 1);
      else state.currentPage = parseInt(page);
      renderPostList();
      renderPagination();
      document.getElementById('postList').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ---------- 文章详情弹窗 ----------
function openPost(post) {
  // 移除已有弹窗
  const existing = document.querySelector('.post-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'post-overlay';
  overlay.innerHTML = `
    <div class="post-detail">
      <button class="post-detail-close" title="关闭">✕</button>
      <h1>${escapeHtml(post.title)}</h1>
      <span class="post-date">📅 ${formatDate(post.date)}  &nbsp;|&nbsp;  🏷️ ${(post.tags || []).map(t => escapeHtml(t)).join(' · ')}</span>
      <div class="post-body">${post.content || post.excerpt || ''}</div>
    </div>`;

  document.body.appendChild(overlay);

  // 关闭事件
  const close = () => overlay.remove();
  overlay.querySelector('.post-detail-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', function escClose(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escClose); }
  });
}

// ---------- 渲染归档列表 ----------
function renderArchive() {
  const container = document.getElementById('archiveList');
  if (state.posts.length === 0) {
    container.innerHTML = `<div class="empty-state"><span class="emoji">📭</span><p>还没有文章</p></div>`;
    return;
  }

  container.innerHTML = state.posts.map(p => `
    <div class="archive-item" data-id="${p.id}">
      <span class="archive-date">${formatDate(p.date)}</span>
      <a href="#" class="archive-title">${escapeHtml(p.title)}</a>
    </div>
  `).join('');

  container.querySelectorAll('.archive-item').forEach(item => {
    item.addEventListener('click', () => {
      const post = state.posts.find(p => p.id === item.dataset.id);
      if (post) openPost(post);
    });
  });
}

// ---------- 导航切换 ----------
function showView(view) {
  state.currentView = view;
  document.getElementById('homeSection').style.display = view === 'home' ? '' : 'none';
  document.getElementById('archiveSection').style.display = view === 'archive' ? '' : 'none';
  document.getElementById('aboutSection').style.display = view === 'about' ? '' : 'none';

  // 激活导航链接
  document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
    link.classList.toggle('active', link.dataset.nav === view);
  });

  if (view === 'archive') renderArchive();

  // 关闭移动菜单
  document.getElementById('mobileMenu').classList.remove('open');
}

// ---------- 标签筛选 ----------
function filterByTag(tag) {
  state.activeTag = tag;
  state.currentPage = 1;
  state.searchQuery = '';
  document.getElementById('searchInput').value = '';

  document.querySelectorAll('#tagFilter .tag-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tag === tag);
  });

  showView('home');
  renderAll();
}

// ---------- 事件绑定 ----------
function bindEvents() {
  // 搜索
  const searchInput = document.getElementById('searchInput');
  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.searchQuery = searchInput.value;
      state.currentPage = 1;
      renderAll();
    }, 300);
  });

  // 标签筛选按钮
  document.getElementById('tagFilter').addEventListener('click', (e) => {
    if (e.target.classList.contains('tag-btn')) {
      const tag = e.target.dataset.tag;
      filterByTag(tag);
    }
  });

  // 桌面导航
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showView(link.dataset.nav);
    });
  });

  // 移动端导航
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showView(link.dataset.nav);
    });
  });

  // 汉堡菜单
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('open');
  });

  // 主题切换
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // 回到顶部
  const backTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backTop.classList.toggle('show', window.scrollY > 400);
  });
  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---------- 主题管理 ----------
function loadTheme() {
  const saved = localStorage.getItem('blog-theme') || 'dark';
  state.theme = saved;
  applyTheme();
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('blog-theme', state.theme);
  applyTheme();
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
}

// ---------- 工具函数 ----------
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
