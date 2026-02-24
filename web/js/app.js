(function () {
  const base = window.SITE_BASE || ".";
  const dataUrl = `${base}/data/tools.json`;

  async function fetchData() {
    const res = await fetch(dataUrl);
    if (!res.ok) throw new Error(`Failed to load data: ${res.status}`);
    return res.json();
  }

  function toolCard(basePath, tool) {
    const repoLink = tool.repository && tool.repository.startsWith("http")
      ? `<a href="${tool.repository}" target="_blank" rel="noreferrer">开源地址</a>`
      : "";

    return `
      <article class="card">
        <h3>${tool.name}</h3>
        <p>${tool.summary}</p>
        <div class="meta">${tool.category} · ${tool.status}</div>
        <div class="tool-links">
          <a href="${basePath}/pages/tool.html?slug=${tool.slug}">查看详情</a>
          <a href="${basePath}/pages/downloads.html?slug=${tool.slug}">下载版本</a>
          ${repoLink}
        </div>
      </article>
    `;
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
        .map(
          (tool) => `<button class="tool-tab ${tool.slug === activeSlug ? "active" : ""}" data-slug="${tool.slug}">${tool.name}</button>`
        )
        .join("");

      tabs.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeSlug = btn.getAttribute("data-slug");
          const url = `${window.location.pathname}?tool=${activeSlug}`;
          window.history.replaceState({}, "", url);
          drawTabs();
          drawTool();
        });
      });
    }

    function drawTool() {
      const tool = data.tools.find((item) => item.slug === activeSlug) || defaults;
      titleBtn.textContent = tool.name;
      titleBtn.href = `${base}/pages/tool.html?slug=${tool.slug}`;
      tagline.textContent = tool.tagline;
      summary.textContent = tool.summary;
      highlights.innerHTML = `<ul>${tool.highlights.map((x) => `<li>${x}</li>`).join("")}</ul>`;
      capabilities.innerHTML = tool.capabilities
        .map((c) => `<article class="card"><h3>${c.title}</h3><p>${c.detail}</p></article>`)
        .join("");
      scenarios.innerHTML = `<ul>${tool.scenarios.map((x) => `<li>${x}</li>`).join("")}</ul>`;
      requirements.innerHTML = `<ul>${tool.requirements.map((x) => `<li>${x}</li>`).join("")}</ul>`;

      downloads.innerHTML = tool.downloads.length
        ? tool.downloads
            .map(
              (d) => `
                <article class="card">
                  <h3>${d.platform}</h3>
                  <p>${d.version} · ${d.arch}</p>
                  <div class="meta">${d.date}</div>
                  <div class="tool-links"><a href="${d.path.replace(/^\.\//, `${base}/`)}" download>${d.filename}</a></div>
                </article>
              `
            )
            .join("")
        : `
            <article class="card">
              <h3>${tool.name}</h3>
              <p>当前暂无可下载版本，请查看下载中心或仓库发布说明。</p>
              <div class="tool-links"><a href="${base}/pages/downloads.html?slug=${tool.slug}">查看下载中心</a></div>
            </article>
          `;
    }

    drawTabs();
    drawTool();
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
    document.title = `${tool.name} | 工具详情`;

    const highlights = tool.highlights.map((x) => `<li>${x}</li>`).join("");
    const caps = tool.capabilities
      .map((c) => `<article class="card"><h3>${c.title}</h3><p>${c.detail}</p></article>`)
      .join("");
    const scenes = tool.scenarios.map((x) => `<li>${x}</li>`).join("");
    const reqs = tool.requirements.map((x) => `<li>${x}</li>`).join("");
    const changes = tool.changelog
      .map(
        (x) => `<article class="card"><h3>${x.version}</h3><ul>${x.items.map((v) => `<li>${v}</li>`).join("")}</ul></article>`
      )
      .join("");

    wrap.innerHTML = `
      <section class="section">
        <h2>${tool.name}</h2>
        <p class="section-lead">${tool.tagline}</p>
        <div class="badges"><span class="badge">${tool.category}</span><span class="badge">${tool.status}</span></div>
      </section>

      <section class="section">
        <h2>工具简介</h2>
        <p class="section-lead">${tool.summary}</p>
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
          <a class="btn btn-secondary" href="./downloads.html?slug=${tool.slug}">前往下载中心</a>
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
        if (!tool.downloads.length) {
          return `
            <tr>
              <td>${tool.name}</td>
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
            (d) => `
              <tr>
                <td>${tool.name}</td>
                <td>${d.version}</td>
                <td>${d.platform}</td>
                <td>${d.arch}</td>
                <td>${d.date}</td>
                <td>${d.size}</td>
                <td><a href="${d.path.replace(/^\.\//, `${base}/`)}" download>${d.filename}</a></td>
              </tr>
            `
          )
          .join("");

        return rows;
      })
      .join("");

    const filters = document.getElementById("download-filters");
    if (!filters) return;

    const allPlatforms = [
      ...new Set(data.tools.flatMap((tool) => tool.downloads.map((d) => d.platform)))
    ];

    filters.innerHTML = ["全部", ...allPlatforms]
      .map(
        (platform) =>
          `<button class="badge" data-platform="${platform}">${platform}</button>`
      )
      .join("");

    filters.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = btn.getAttribute("data-platform");
        document.querySelectorAll("#download-body tr").forEach((tr) => {
          const rowPlatform = tr.children[2].textContent;
          tr.style.display = current === "全部" || rowPlatform === current ? "" : "none";
        });
      });
    });
  }

  function setContact(data) {
    document.querySelectorAll("[data-contact-author]").forEach((n) => (n.textContent = data.site.author));
    document.querySelectorAll("[data-contact-wechat]").forEach((n) => (n.textContent = data.site.wechat));
    document.querySelectorAll("[data-contact-email]").forEach((n) => {
      n.textContent = data.site.email;
      n.href = `mailto:${data.site.email}`;
    });
  }

  fetchData()
    .then((data) => {
      setContact(data);
      renderHome(data);
      renderTools(data);
      renderToolDetail(data);
      renderDownloads(data);
    })
    .catch((error) => {
      console.error(error);
      const area = document.getElementById("app-error");
      if (area) area.textContent = "数据加载失败，请检查 data/tools.json 与静态服务路径。";
    });
})();
