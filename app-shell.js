// AppShell v2（丈夫版） — 外部JSなので <script> タグは不要！
(function(){
  const SUPABASE_URL = "https://ectryrbhvoyitqddvhhi.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdHJ5cmJodm95aXRxZGR2aGhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NTU4MzcsImV4cCI6MjA3NTIzMTgzN30.-anH9-j3ph0x36G1Gt-AGBtyOJZgoztoKwPCIVwgiw8";

  const navItems = [
    { href:"index.html", icon:"🏠", label:"ホーム" },
    { href:"input.html", icon:"📝", label:"ログ入力（評価）" },
    { href:"feedbacklog.html", icon:"🗂️", label:"過去のフィードバック" },
    { href:"dashboard.html", icon:"📈", label:"ダッシュボード" },
    { href:"soudan.html", icon:"💬", label:"なんでも相談" },
    { href:"shindan.html", icon:"🧭", label:"管理職タイプ診断" },
{ 
  href: "https://www.smartboarding.jp/", 
  icon: "<img src='./SBlogo.png' alt='SB' style='width:20px;height:20px;vertical-align:middle;' />",
  label: "Smart Boarding", 
  external: true 
},
    { href:"setting.html", icon:"⚙️", label:"設定" },
  ];

  function isLoginPage(){
    const p = location.pathname.toLowerCase();
    return p.endsWith("/login.html") || p.endsWith("login.html");
  }

  function ensureSupabase(){
    if(!window.supabase){
      console.error("Supabase SDK が未読込です。<script src='https://unpkg.com/@supabase/supabase-js@2'></script> を先に置いてください。");
      return null;
    }
    if(!window.sb){
      window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return window.sb;
  }

  function ensureRootAndContent(){
    let root = document.getElementById("app-root");
    let content = document.getElementById("content");

    if(!root){
      root = document.createElement("div");
      root.id = "app-root";
      content = document.createElement("main");
      content.id = "content";
      content.className = "content";

      const toMove = [];
      for(const node of Array.from(document.body.childNodes)){
        if(node.tagName === "SCRIPT" || node.tagName === "LINK" || node.tagName === "STYLE") continue;
        toMove.push(node);
      }
      toMove.forEach(n => content.appendChild(n));
      root.appendChild(content);
      document.body.appendChild(root);
    }else if(!content){
      content = document.createElement("main");
      content.id = "content";
      content.className = "content";
      root.appendChild(content);
    }
    return { content };
  }

  function tplAppbar(email){
    return `
      <header class="appbar">
        <h1>1on1フィードバックAI4.0</h1>
        <div class="spacer"></div>
        <div class="user">${email ? `ログイン中：${email}` : ""}</div>
      </header>
    `;
  }

  function tplSidebar(pathname){
    const links = navItems.map(n=>{
      const isActive = !n.external && pathname.toLowerCase().endsWith("/"+n.href.toLowerCase());
      const cls = isActive ? "active" : "";
      const attrs = n.external ? `href="${n.href}" target="_blank" rel="noopener"` : `href="${n.href}"`;
      return `<a ${attrs} class="${cls}"><span>${n.icon}</span><span>${n.label}</span></a>`;
    }).join("");
    return `<aside class="sidebar"><nav class="nav">${links}</nav></aside>`;
  }

  async function mountShell(){
    if(isLoginPage()) return;               // ログイン画面では何もしない
    const sb = ensureSupabase(); if(!sb) return;

    const { data:{ user } } = await sb.auth.getUser();
    if(!user){ location.href = "login.html"; return; }

    const { content } = ensureRootAndContent();

    if(document.querySelector(".appbar") && document.querySelector(".sidebar")) return;

    const appWrapper = document.createElement("div");
    appWrapper.className = "app";
    appWrapper.innerHTML = tplSidebar(location.pathname);

    content.parentNode.insertBefore(appWrapper, content);
    appWrapper.appendChild(content);

    document.body.insertAdjacentHTML("afterbegin", tplAppbar(user.email));
  }

  function mountWhenReady(){
    if (document.readyState === "loading"){
      document.addEventListener("DOMContentLoaded", mountShell, { once:true });
    }else{
      mountShell();
    }
  }

  // 外から呼べるように公開
  window.AppShell = { mountShell: mountWhenReady };
})();
