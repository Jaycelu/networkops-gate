(function () {
  const FALLBACK_VERSION = "20260228";
  const EXPECTED_TOOLS_HASH = "072123497a838de74f44cdd2be2798e39e28fe14ebc00d6734b0a6d1c771235b";
  const CACHE_TTL_MS = 10 * 60 * 1000;
  const DATA_CACHE_KEY = `networkops-tools-data:${FALLBACK_VERSION}`;
  const METRICS_KEY = "networkops-site-metrics:v1";
  const MOODS = ["高效", "专注", "平稳", "疲惫", "兴奋"];

  const base = detectBase();
  const version = detectVersion();
  const dataUrl = `${base}/data/tools.json?v=${encodeURIComponent(version)}`;
  const metricsUrl = `${base}/data/metrics.json?v=${encodeURIComponent(version)}`;
  let externalMetrics = null;

  function detectBase() {
    if (window.SITE_BASE) return window.SITE_BASE;
    return window.location.pathname.includes("/pages/") ? ".." : ".";
  }

  function detectVersion() {
    if (window.ASSET_VERSION) return window.ASSET_VERSION;
    const src = document.querySelector('script[src*="/js/app.js"], script[src*="js/app.js"]');
    if (!src) return FALLBACK_VERSION;
    const scriptSrc = src.getAttribute("src") || "";
    const query = scriptSrc.split("?")[1] || "";
    const params = new URLSearchParams(query);
    return params.get("v") || FALLBACK_VERSION;
  }

  function localDateKey(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + (offsetDays || 0));
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function escapeHtml(input) {
    return String(input || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function sumMapValues(obj) {
    return Object.values(obj || {}).reduce((acc, n) => acc + Number(n || 0), 0);
  }

  function readMetrics() {
    try {
      const raw = localStorage.getItem(METRICS_KEY);
      if (!raw) return { visitsByDate: {}, downloadsByDate: {}, downloadsByTool: {}, moodByDate: {} };
      const parsed = JSON.parse(raw);
      return {
        visitsByDate: parsed.visitsByDate || {},
        downloadsByDate: parsed.downloadsByDate || {},
        downloadsByTool: parsed.downloadsByTool || {},
        moodByDate: parsed.moodByDate || {}
      };
    } catch {
      return { visitsByDate: {}, downloadsByDate: {}, downloadsByTool: {}, moodByDate: {} };
    }
  }

  function normalizeMetrics(input) {
    const safe = input && typeof input === "object" ? input : {};
    return {
      visitsByDate: safe.visitsByDate && typeof safe.visitsByDate === "object" ? safe.visitsByDate : {},
      downloadsByDate: safe.downloadsByDate && typeof safe.downloadsByDate === "object" ? safe.downloadsByDate : {},
      downloadsByTool: safe.downloadsByTool && typeof safe.downloadsByTool === "object" ? safe.downloadsByTool : {},
      moodByDate: safe.moodByDate && typeof safe.moodByDate === "object" ? safe.moodByDate : {}
    };
  }

  function writeMetrics(metrics) {
    try {
      localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
    } catch {
      // Ignore storage write failures.
    }
  }

  function bumpDailyVisit() {
    const metrics = readMetrics();
    const day = localDateKey(0);
    metrics.visitsByDate[day] = Number(metrics.visitsByDate[day] || 0) + 1;
    writeMetrics(metrics);
  }

  function recordDownload(toolSlug) {
    if (!toolSlug) return;
    const metrics = readMetrics();
    const day = localDateKey(0);
    const perDay = metrics.downloadsByDate[day] || {};
    perDay[toolSlug] = Number(perDay[toolSlug] || 0) + 1;
    metrics.downloadsByDate[day] = perDay;
    metrics.downloadsByTool[toolSlug] = Number(metrics.downloadsByTool[toolSlug] || 0) + 1;
    writeMetrics(metrics);
  }

  function readCachedData() {
    try {
      const raw = localStorage.getItem(DATA_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.ts || !parsed.data || !parsed.hash) return null;
      if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
      if (parsed.hash !== EXPECTED_TOOLS_HASH) return null;
      return parsed.data;
    } catch {
      return null;
    }
  }

  function writeCachedData(data, hash) {
    try {
      localStorage.setItem(DATA_CACHE_KEY, JSON.stringify({ ts: Date.now(), hash, data }));
    } catch {
      // Ignore storage failures.
    }
  }

  async function sha256Hex(text) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error("浏览器不支持 integrity 校验能力");
    }
    const bytes = new TextEncoder().encode(text);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function setError(message) {
    const area = document.getElementById("app-error");
    if (area) area.textContent = message;
  }

  function parseDownloadPath(rawPath) {
    if (typeof rawPath !== "string") return null;
    const trimmed = rawPath.trim();
    if (!trimmed) return null;
    try {
      const url = new URL(trimmed, window.location.origin);
      if (url.origin !== window.location.origin) return null;
      const path = url.pathname;
      if (path.includes("..")) return null;
      if (!/^\/downloads\/[a-z0-9-]+\/[a-zA-Z0-9._/-]+$/.test(path)) return null;
      return path;
    } catch {
      return null;
    }
  }

  function getSafeDownloadHref(rawPath, expectedSlug) {
    const pathname = parseDownloadPath(rawPath);
    if (!pathname) return null;
    const slug = String(expectedSlug || "");
    const prefix = `/downloads/${slug}/`;
    if (!pathname.startsWith(prefix)) return null;
    return `${base}${pathname}`;
  }

  function getDownloadSlugFromHref(rawHref) {
    const pathname = parseDownloadPath(rawHref);
    if (!pathname) return "";
    const match = pathname.match(/^\/downloads\/([a-z0-9-]+)\//);
    return match ? match[1] : "";
  }

  async function fetchFreshData() {
    const res = await fetch(dataUrl, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed to load data: ${res.status}`);

    const rawText = await res.text();
    const hash = await sha256Hex(rawText);
    if (hash !== EXPECTED_TOOLS_HASH) {
      throw new Error("data/tools.json 完整性校验失败，可能存在文件篡改");
    }

    const data = JSON.parse(rawText);
    writeCachedData(data, hash);
    return data;
  }

  async function fetchData() {
    const cached = readCachedData();
    if (cached) {
      fetchFreshData().catch(() => {});
      return cached;
    }
    return fetchFreshData();
  }

  async function fetchExternalMetrics() {
    try {
      const res = await fetch(metricsUrl, { cache: "no-cache" });
      if (!res.ok) return;
      const payload = await res.json();
      externalMetrics = normalizeMetrics(payload);
    } catch {
      // Keep local metrics as fallback.
    }
  }

  function prefetchLikelyPages() {
    const links = [
      `${base}/index.html`,
      `${base}/pages/tools.html`,
      `${base}/pages/downloads.html`,
      dataUrl
    ];

    links.forEach((href) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = href;
      document.head.appendChild(link);
    });
  }

  function toolCard(basePath, tool) {
    const safeName = escapeHtml(tool.name);
    const safeSummary = escapeHtml(tool.summary);
    const safeCategory = escapeHtml(tool.category);
    const safeStatus = escapeHtml(tool.status);
    const safeSlug = encodeURIComponent(String(tool.slug || ""));
    const hasHttpRepo = typeof tool.repository === "string" && /^https?:\/\//.test(tool.repository);
    const safeRepo = hasHttpRepo ? tool.repository : "";
    const repoLink = safeRepo
      ? `<a href="${safeRepo}" target="_blank" rel="noreferrer">开源地址</a>`
      : "";

    return `
      <article class="card">
        <h3>${safeName}</h3>
        <p>${safeSummary}</p>
        <div class="meta">${safeCategory} · ${safeStatus}</div>
        <div class="tool-links">
          <a href="${basePath}/pages/tool.html?slug=${safeSlug}">查看详情</a>
          <a href="${basePath}/pages/downloads.html?slug=${safeSlug}">下载版本</a>
          ${repoLink}
        </div>
      </article>
    `;
  }

  function renderMetricsWidget(data) {
    const visitToday = document.getElementById("visit-today");
    const downloadToday = document.getElementById("download-today");
    const trend = document.getElementById("visit-trend");
    const top = document.getElementById("download-top");
    if (!visitToday || !downloadToday || !trend || !top) return;

    const metrics = externalMetrics ? { ...normalizeMetrics(externalMetrics), moodByDate: readMetrics().moodByDate } : readMetrics();
    const day = localDateKey(0);

    visitToday.textContent = String(Number(metrics.visitsByDate[day] || 0));
    downloadToday.textContent = String(sumMapValues(metrics.downloadsByDate[day] || {}));

    const days = Array.from({ length: 7 }, (_, idx) => localDateKey(idx - 6));
    const values = days.map((d) => Number(metrics.visitsByDate[d] || 0));
    const maxVal = Math.max(1, ...values);

    trend.innerHTML = days
      .map((d, idx) => {
        const value = values[idx];
        const level = value <= 0 ? "l0" : `l${Math.max(1, Math.min(8, Math.ceil((value / maxVal) * 8)))}`;
        return `
          <div class="trend-item">
            <div class="trend-bar ${level}"></div>
            <div class="trend-label">${escapeHtml(d.slice(5))}</div>
          </div>
        `;
      })
      .join("");

    const nameBySlug = Object.fromEntries((data.tools || []).map((t) => [String(t.slug || ""), String(t.name || t.slug || "未知工具")]));
    const topItems = Object.entries(metrics.downloadsByTool || {})
      .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
      .slice(0, 5);

    if (!topItems.length) {
      top.innerHTML = '<p class="download-empty">暂无下载记录，点击下载后会自动累计。</p>';
      return;
    }

    top.innerHTML = topItems
      .map(([slug, count]) => {
        const toolName = nameBySlug[slug] || slug;
        return `<div class="download-row"><span>${escapeHtml(toolName)}</span><strong>${Number(count || 0)}</strong></div>`;
      })
      .join("");
  }

  function renderMoodWidget() {
    const options = document.getElementById("mood-options");
    const current = document.getElementById("mood-current");
    if (!options || !current) return;

    const day = localDateKey(0);
    const metrics = readMetrics();

    function draw() {
      const state = readMetrics();
      const selected = String((state.moodByDate || {})[day] || "");
      options.innerHTML = MOODS.map((mood) => {
        const active = mood === selected ? "active" : "";
        return `<button class="mood-btn ${active}" type="button" data-mood="${escapeHtml(mood)}">${escapeHtml(mood)}</button>`;
      }).join("");

      current.textContent = selected
        ? `今天记录：${selected}`
        : "今天还没有记录心情。";

      options.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const chosen = btn.getAttribute("data-mood") || "";
          const next = readMetrics();
          next.moodByDate[day] = chosen;
          writeMetrics(next);
          draw();
        });
      });
    }

    if (!metrics.moodByDate[day]) {
      metrics.moodByDate[day] = "";
      writeMetrics(metrics);
    }

    draw();
  }

  function renderHome(data) {
    const defaults = data.tools.find((item) => item.slug === "network-ai-ops") || data.tools[0];
    if (!defaults) return;

    const tabs = document.getElementById("home-tool-tabs");
    const titleBtn = document.getElementById("home-tool-title-btn");
    const tagline = document.getElementById("home-tool-tagline");
    const summary = document.getElementById("home-tool-summary");
    const highlights = document.getElementById("home-tool-highlights");
    const capabilities = document.getElementById("home-tool-capabilities");
    const scenarios = document.getElementById("home-tool-scenarios");
    const requirements = document.getElementById("home-tool-requirements");
    const downloads = document.getElementById("home-tool-downloads");

    if (!tabs || !titleBtn || !tagline || !summary || !highlights || !capabilities || !scenarios || !requirements || !downloads) {
      return;
    }

    let activeSlug = new URLSearchParams(window.location.search).get("tool") || defaults.slug;
    if (!data.tools.some((t) => t.slug === activeSlug)) activeSlug = defaults.slug;

    function drawTabs() {
      tabs.innerHTML = data.tools
        .map((tool) => {
          const active = tool.slug === activeSlug ? "active" : "";
          return `<button class="tool-tab ${active}" data-slug="${escapeHtml(tool.slug)}">${escapeHtml(tool.name)}</button>`;
        })
        .join("");

      tabs.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeSlug = btn.getAttribute("data-slug") || defaults.slug;
          const url = `${window.location.pathname}?tool=${encodeURIComponent(activeSlug)}`;
          window.history.replaceState({}, "", url);
          drawTabs();
          drawTool();
        });
      });
    }

    function drawTool() {
      const tool = data.tools.find((item) => item.slug === activeSlug) || defaults;
      titleBtn.textContent = String(tool.name || "");
      titleBtn.href = `${base}/pages/tool.html?slug=${encodeURIComponent(String(tool.slug || ""))}`;
      tagline.textContent = String(tool.tagline || "");
      summary.textContent = String(tool.summary || "");
      highlights.innerHTML = `<ul>${(tool.highlights || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
      capabilities.innerHTML = (tool.capabilities || [])
        .map((c) => `<article class="card"><h3>${escapeHtml(c.title)}</h3><p>${escapeHtml(c.detail)}</p></article>`)
        .join("");
      scenarios.innerHTML = `<ul>${(tool.scenarios || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
      requirements.innerHTML = `<ul>${(tool.requirements || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;

      downloads.innerHTML = (tool.downloads || []).length
        ? tool.downloads
            .map(
              (d) => {
                const safeHref = getSafeDownloadHref(d.path, tool.slug);
                const linkCell = safeHref
                  ? `<a href="${safeHref}" download>${escapeHtml(d.filename)}</a>`
                  : `<span class="download-empty">链接已拦截（白名单校验未通过）</span>`;
                return `
                <article class="card">
                  <h3>${escapeHtml(d.platform)}</h3>
                  <p>${escapeHtml(d.version)} · ${escapeHtml(d.arch)}</p>
                  <div class="meta">${escapeHtml(d.date)}</div>
                  <div class="tool-links">${linkCell}</div>
                </article>
              `;
              }
            )
            .join("")
        : `
            <article class="card">
              <h3>${escapeHtml(tool.name)}</h3>
              <p>当前暂无可下载版本，请查看下载中心或仓库发布说明。</p>
              <div class="tool-links"><a href="${base}/pages/downloads.html?slug=${encodeURIComponent(String(tool.slug || ""))}">查看下载中心</a></div>
            </article>
          `;
    }

    drawTabs();
    drawTool();
    renderMetricsWidget(data);
    renderMoodWidget();
  }

  function renderTools(data) {
    const wrap = document.getElementById("tool-grid");
    if (!wrap) return;
    wrap.innerHTML = data.tools.map((tool) => toolCard("..", tool)).join("");
  }

  function renderToolDetail(data) {
    const wrap = document.getElementById("tool-detail");
    if (!wrap) return;

    const slug = new URLSearchParams(window.location.search).get("slug");
    const tool = data.tools.find((item) => item.slug === slug) || data.tools[0];
    if (!tool) return;

    document.title = `${String(tool.name || "工具")} | 工具详情`;

    const highlights = (tool.highlights || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("");
    const caps = (tool.capabilities || [])
      .map((c) => `<article class="card"><h3>${escapeHtml(c.title)}</h3><p>${escapeHtml(c.detail)}</p></article>`)
      .join("");
    const scenes = (tool.scenarios || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("");
    const reqs = (tool.requirements || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("");
    const changes = (tool.changelog || [])
      .map(
        (x) => `<article class="card"><h3>${escapeHtml(x.version)}</h3><ul>${(x.items || []).map((v) => `<li>${escapeHtml(v)}</li>`).join("")}</ul></article>`
      )
      .join("");

    wrap.innerHTML = `
      <section class="section">
        <h2>${escapeHtml(tool.name)}</h2>
        <p class="section-lead">${escapeHtml(tool.tagline)}</p>
        <div class="badges"><span class="badge">${escapeHtml(tool.category)}</span><span class="badge">${escapeHtml(tool.status)}</span></div>
      </section>

      <section class="section">
        <h2>工具简介</h2>
        <p class="section-lead">${escapeHtml(tool.summary)}</p>
      </section>

      <section class="section">
        <h2>核心亮点</h2>
        <div class="card"><ul>${highlights}</ul></div>
      </section>

      <section class="section">
        <h2>能力模块</h2>
        <div class="grid grid-2">${caps}</div>
      </section>

      <section class="section">
        <h2>适用场景</h2>
        <div class="card"><ul>${scenes}</ul></div>
      </section>

      <section class="section">
        <h2>系统要求</h2>
        <div class="card"><ul>${reqs}</ul></div>
      </section>

      <section class="section">
        <h2>版本更新</h2>
        <div class="grid grid-2">${changes}</div>
      </section>

      <section class="section">
        <div class="tool-links">
          <a class="btn btn-secondary" href="./downloads.html?slug=${encodeURIComponent(String(tool.slug || ""))}">前往下载中心</a>
        </div>
      </section>
    `;
  }

  function renderDownloads(data) {
    const body = document.getElementById("download-body");
    if (!body) return;

    const slug = new URLSearchParams(window.location.search).get("slug");
    const tools = slug ? data.tools.filter((t) => t.slug === slug) : data.tools;

    body.innerHTML = tools
      .map((tool) => {
        if (!(tool.downloads || []).length) {
          return `
            <tr>
              <td>${escapeHtml(tool.name)}</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>暂无发布包</td>
            </tr>
          `;
        }

        const rows = tool.downloads
          .map(
            (d) => {
              const safeHref = getSafeDownloadHref(d.path, tool.slug);
              const linkCell = safeHref
                ? `<a href="${safeHref}" download>${escapeHtml(d.filename)}</a>`
                : `<span class="download-empty">已拦截</span>`;
              return `
              <tr>
                <td>${escapeHtml(tool.name)}</td>
                <td>${escapeHtml(d.version)}</td>
                <td>${escapeHtml(d.platform)}</td>
                <td>${escapeHtml(d.arch)}</td>
                <td>${escapeHtml(d.date)}</td>
                <td>${escapeHtml(d.size)}</td>
                <td>${linkCell}</td>
              </tr>
            `;
            }
          )
          .join("");

        return rows;
      })
      .join("");

    const filters = document.getElementById("download-filters");
    if (!filters) return;

    const allPlatforms = [...new Set(data.tools.flatMap((tool) => (tool.downloads || []).map((d) => d.platform)))];

    filters.innerHTML = ["全部", ...allPlatforms]
      .map((platform) => `<button class="badge" data-platform="${escapeHtml(platform)}">${escapeHtml(platform)}</button>`)
      .join("");

    filters.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = btn.getAttribute("data-platform") || "全部";
        document.querySelectorAll("#download-body tr").forEach((tr) => {
          const rowPlatform = tr.children[2].textContent || "";
          tr.style.display = current === "全部" || rowPlatform === current ? "" : "none";
        });
      });
    });
  }

  function setContact(data) {
    document.querySelectorAll("[data-contact-author]").forEach((n) => {
      n.textContent = String(data.site.author || "");
    });
    document.querySelectorAll("[data-contact-wechat]").forEach((n) => {
      n.textContent = String(data.site.wechat || "");
    });
    document.querySelectorAll("[data-contact-email]").forEach((n) => {
      const email = String(data.site.email || "");
      n.textContent = email;
      n.href = `mailto:${email}`;
    });
  }

  function initDownloadTracker(data) {
    const knownSlugs = new Set((data.tools || []).map((tool) => String(tool.slug || "")));

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[download]");
      if (!anchor) return;

      let slug = "";
      try {
        slug = getDownloadSlugFromHref(anchor.href);
      } catch {
        return;
      }

      if (!knownSlugs.has(slug)) return;
      recordDownload(slug);
      renderMetricsWidget(data);
    });
  }

  function initPointerEffects() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    function paint() {
      document.documentElement.style.setProperty("--mx", `${x}px`);
      document.documentElement.style.setProperty("--my", `${y}px`);
      rafId = 0;
    }

    window.addEventListener("mousemove", (event) => {
      x = event.clientX;
      y = event.clientY;
      document.body.classList.add("pointer-ready");
      if (!rafId) rafId = window.requestAnimationFrame(paint);
    });
  }

  bumpDailyVisit();
  prefetchLikelyPages();
  initPointerEffects();
  Promise.all([fetchData(), fetchExternalMetrics()])
    .then(([data]) => {
      setContact(data);
      renderHome(data);
      renderTools(data);
      renderToolDetail(data);
      renderDownloads(data);
      initDownloadTracker(data);
    })
    .catch((error) => {
      console.error(error);
      setError("数据加载或完整性校验失败，请检查 data/tools.json 与静态服务配置。");
    });
})();
