/* ==========================================================
   Matensy — terminal portfolio
   Boot sequence · matrix rain · glitch · scramble · hexdump
   analyzer · interactive shell
   ========================================================== */
(function () {
  'use strict';

  window.__appReady = true;

  const root   = document.documentElement;
  const REDUCE = root.classList.contains('reduce-motion');
  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const rand  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const HTB_URL = 'https://app.hackthebox.com/users/1645631';

  /* ── Boot sequence ──────────────────────────────────── */

  function runBoot() {
    const boot = $('#boot');
    const log  = $('#boot-log');
    if (!root.classList.contains('booting') || !boot) return Promise.resolve();

    const now  = new Date();
    const last = new Date(now.getTime() - 1000 * 60 * 60 * 26).toString().slice(0, 24);
    const lines = [
      '<span class="ts">[    0.000000]</span> Linux version 6.8.0-kali-amd64 (matensy@kali) #1 SMP PREEMPT_DYNAMIC',
      '<span class="ts">[    0.004211]</span> Command line: BOOT_IMAGE=/vmlinuz root=/dev/mapper/portfolio ro quiet',
      '<span class="ts">[    0.118734]</span> Memory: 16384K available (offensive-sec reserved)',
      '[  <span class="ok">OK</span>  ] Started Network Manager.',
      '[  <span class="ok">OK</span>  ] Started OpenVPN tunnel to Hack The Box (<span class="acc">tun0</span>).',
      '[  <span class="ok">OK</span>  ] Mounted <span class="acc">/home/matensy/reports</span>.',
      '[  <span class="ok">OK</span>  ] Loaded module <span class="acc">malware_analysis.ko</span>.',
      '[  <span class="ok">OK</span>  ] Reached target <span class="acc">Offensive Security</span>.',
      '[ <span class="warn">WARN</span> ] /home/matensy/writeups is sealed until retirement.',
      '',
      'kali login: <span class="ok">matensy</span>',
      'Password: ••••••••••••',
      'Last login: ' + last + ' from 10.10.14.17',
      '<span class="acc">Welcome back. HTB rank: #17 BR.</span>',
    ];

    let skipped = false;
    let done;
    const finished = new Promise(r => { done = r; });

    function finish() {
      if (boot.classList.contains('fade')) return;
      boot.classList.add('fade');
      try { sessionStorage.setItem('booted', '1'); } catch (e) {}
      setTimeout(() => {
        root.classList.remove('booting');
        boot.remove();
        done();
      }, 400);
    }

    function skip() { skipped = true; finish(); }
    boot.addEventListener('click', skip);
    window.addEventListener('keydown', skip, { once: true });

    (async () => {
      for (const line of lines) {
        if (skipped) return;
        log.innerHTML += line + '\n';
        await sleep(line ? rand(55, 110) : 140);
      }
      await sleep(420);
      window.removeEventListener('keydown', skip);
      finish();
    })();

    return finished;
  }

  /* ── Matrix rain ────────────────────────────────────── */

  const Matrix = (function () {
    const canvas = $('#matrix');
    if (!canvas || REDUCE) return { toggle() { return false; } };

    const ctx    = canvas.getContext('2d');
    const glyphs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789ABCDEF<>/{}$#'.split('');
    const size   = 16;
    let cols, drops, w, h, raf, last = 0, running = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols  = Math.ceil(w / size);
      drops = Array.from({ length: cols }, () => rand(-60, 0));
      ctx.fillStyle = '#07070b';
      ctx.fillRect(0, 0, w, h);
    }

    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (t - last < 55) return;
      last = t;

      ctx.fillStyle = 'rgba(7, 7, 11, 0.14)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = size + 'px "JetBrains Mono", monospace';

      for (let i = 0; i < cols; i++) {
        const y = drops[i] * size;
        if (y > 0) {
          const ch = glyphs[(Math.random() * glyphs.length) | 0];
          ctx.fillStyle = Math.random() > 0.975 ? '#4ade80' : (Math.random() > 0.5 ? '#c084fc' : '#a855f7');
          ctx.fillText(ch, i * size, y);
        }
        if (y > h && Math.random() > 0.975) drops[i] = rand(-20, 0);
        drops[i]++;
      }
    }

    function start() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    function stop()  { cancelAnimationFrame(raf); raf = null; }

    resize();
    start();

    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else if (running) start();
    });

    return {
      toggle() {
        running = !running;
        canvas.style.display = running ? '' : 'none';
        running ? start() : stop();
        return running;
      },
    };
  })();

  /* ── Clock ──────────────────────────────────────────── */

  (function clock() {
    const el = $('#clock');
    if (!el) return;
    const pad = n => String(n).padStart(2, '0');
    const tick = () => {
      const d = new Date();
      el.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    };
    tick();
    setInterval(tick, 1000);
  })();

  /* ── Glitch on the ASCII banner ─────────────────────── */

  function initGlitch() {
    const art = $('.ascii.glitch');
    if (!art || REDUCE) return;
    const text = art.textContent;
    ['l1', 'l2'].forEach(cls => {
      const layer = document.createElement('span');
      layer.className = 'glitch-layer ' + cls;
      layer.textContent = text;
      art.appendChild(layer);
    });

    function glitch() {
      art.classList.remove('glitching');
      void art.offsetWidth; // restart the animation
      art.classList.add('glitching');
      setTimeout(() => art.classList.remove('glitching'), 380);
    }

    (function loop() {
      setTimeout(() => { if (!document.hidden) glitch(); loop(); }, rand(2800, 6500));
    })();
    art.parentElement.addEventListener('mouseenter', glitch);
    setTimeout(glitch, 300);
  }

  /* ── Typewriter roles ───────────────────────────────── */

  function initTyper() {
    const el = $('#typer');
    if (!el || REDUCE) return;
    const roles = [
      'Offensive Security · Malware Analysis',
      'Top 17 BR @ Hack The Box',
      'Active Directory · Kerberos · ADCS',
      'Reverse Engineering · .NET · Rust',
      'CTF Player — auramentality',
    ];
    let i = 0;
    (async function loop() {
      for (;;) {
        const word = roles[i++ % roles.length];
        for (let c = 1; c <= word.length; c++) {
          el.textContent = word.slice(0, c);
          await sleep(rand(35, 70));
        }
        await sleep(2000);
        for (let c = word.length; c >= 0; c--) {
          el.textContent = word.slice(0, c);
          await sleep(18);
        }
        await sleep(300);
      }
    })();
  }

  /* ── Text scramble (decrypt effect) ─────────────────── */

  const SCRAMBLE_CHARS = '!<>-_\\/[]{}=+*^?#$%&01ABCDEF';

  function scramble(el, duration) {
    const target = el.dataset.text || el.textContent;
    el.dataset.text = target;
    const frames = Math.round((duration || 700) / 30);
    const queue = Array.from(target, ch => ({
      ch,
      start: rand(0, frames * 0.4),
      end:   rand(frames * 0.4, frames),
    }));
    let f = 0;
    return new Promise(resolve => {
      (function step() {
        let out = '', settled = 0;
        for (const q of queue) {
          if (f >= q.end || q.ch === ' ') { out += esc(q.ch); settled++; }
          else if (f >= q.start) out += '<span class="c-accent">' + esc(SCRAMBLE_CHARS[rand(0, SCRAMBLE_CHARS.length - 1)]) + '</span>';
          else out += esc(q.ch);
        }
        el.innerHTML = out;
        if (settled === queue.length) { el.textContent = target; resolve(); return; }
        f++;
        setTimeout(step, 30);
      })();
    });
  }

  /* ── HTB rank countdown ─────────────────────────────── */

  function rankCountdown(el) {
    const target = parseInt(el.dataset.rank, 10);
    const from   = 999;
    const dur    = 1700;
    const t0     = performance.now();
    (function step(t) {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = '#' + Math.round(from - (from - target) * eased);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ── Section command typing ─────────────────────────── */

  async function typeCommand(block) {
    const el = $('.cmd-text', block);
    if (!el) return;
    const text = el.textContent;
    el.textContent = '';
    block.classList.add('typed');
    const caret = document.createElement('span');
    caret.className = 'caret';
    el.after(caret);
    for (let i = 1; i <= text.length; i++) {
      el.textContent = text.slice(0, i);
      await sleep(rand(22, 48));
    }
    await sleep(600);
    caret.remove();
  }

  /* ── Scroll-driven effects ──────────────────────────── */

  function initObservers() {
    // Stagger reveals that share a parent grid.
    $$('.grid-2, .grid-3, .gitlog').forEach(group => {
      $$('.reveal', group).forEach((el, i) => { el.style.transitionDelay = (i * 90) + 'ms'; });
    });

    if (REDUCE || !('IntersectionObserver' in window)) {
      $$('.reveal').forEach(el => el.classList.add('in'));
      $$('.sec-cmd[data-type]').forEach(el => el.classList.add('typed'));
      return;
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);
        if (el.classList.contains('reveal')) {
          el.classList.add('in');
          // Drop the stagger delay afterwards so hover transitions stay snappy.
          if (el.style.transitionDelay) setTimeout(() => { el.style.transitionDelay = ''; }, 1200);
        }
        else if (el.matches('.sec-cmd[data-type]')) typeCommand(el);
        else if (el.hasAttribute('data-scramble')) scramble(el, 900);
        else if (el.hasAttribute('data-rank')) rankCountdown(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    $$('.reveal, .sec-cmd[data-type], [data-scramble], [data-rank]').forEach(el => io.observe(el));
  }

  function initNavSpy() {
    const links = $$('.sb-nav a');
    const nav   = $('.sb-nav');
    if (!('IntersectionObserver' in window)) return;

    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach(a => {
          const on = a.dataset.nav === id;
          a.classList.toggle('active', on);
          if (on && nav.scrollWidth > nav.clientWidth) {
            nav.scrollTo({ left: a.offsetLeft - nav.clientWidth / 2 + a.clientWidth / 2, behavior: 'smooth' });
          }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    $$('main > section[id]').forEach(s => spy.observe(s));
  }

  /* ── Hexdump + analyzer ─────────────────────────────── */

  function buildSample() {
    const bytes = new Uint8Array(0x600);
    const put = (off, arr) => arr.forEach((b, i) => { bytes[off + i] = b; });
    const str = s => Array.from(s, c => c.charCodeAt(0));

    // DOS header
    put(0x00, [0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00,
               0xb8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40]);
    put(0x3c, [0x80]);
    // DOS stub
    put(0x40, [0x0e, 0x1f, 0xba, 0x0e, 0x00, 0xb4, 0x09, 0xcd, 0x21, 0xb8, 0x01, 0x4c, 0xcd, 0x21]);
    put(0x4e, str('This program cannot be run in DOS mode.'));
    put(0x75, [0x0d, 0x0d, 0x0a, 0x24]);
    // PE header: i386, 3 sections, .NET (opt header 0xE0)
    put(0x80, [0x50, 0x45, 0x00, 0x00, 0x4c, 0x01, 0x03, 0x00, 0x8a, 0x2c, 0x49, 0x6a]);
    put(0x94, [0xe0, 0x00, 0x02, 0x01, 0x0b, 0x01, 0x30, 0x00, 0x00, 0xf2, 0x07, 0x00]);
    // Section table
    put(0x178, str('.text'));
    put(0x180, [0x34, 0xf1, 0x07, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0xf2, 0x07, 0x00]);
    put(0x1a0, str('.rsrc'));
    put(0x1c8, str('.reloc'));
    // .text — AES-encrypted CIL, near-max entropy
    for (let i = 0x200; i < bytes.length; i++) bytes[i] = rand(0, 255);
    return bytes;
  }

  function initAnalyzer() {
    const hex = $('#hexdump');
    const log = $('#analysis-log');
    if (!hex || !log) return;

    const sample = buildSample();
    const h2 = n => n.toString(16).padStart(2, '0');
    const narrow = () => hex.clientWidth < 420;

    function row(off) {
      let hexPart = '', ascii = '';
      for (let i = 0; i < 16; i++) {
        const b = sample[off + i];
        let cls = '';
        if (off + i <= 0x01) cls = 'mz';
        else if (off + i >= 0x80 && off + i <= 0x83) cls = 'pe';
        else if (off >= 0x200 && b > 0xe0) cls = 'hot';
        const hx = h2(b);
        hexPart += cls ? '<span class="' + cls + '">' + hx + '</span>' : hx;
        if (i % 2 === 1 && i < 15) hexPart += ' ';
        ascii += b >= 0x20 && b < 0x7f ? esc(String.fromCharCode(b)) : '.';
      }
      return '<div><span class="off">' + off.toString(16).padStart(8, '0') + ':</span> ' + hexPart +
        (narrow() ? '' : '  <span class="asc">' + ascii + '</span>') + '</div>';
    }

    const steps = [
      ['i', '$ ./analyze.py Kjnry.exe'],
      ['i', '[*] sha256 d313447f…beb288bc'],
      ['i', '[*] PE32 · .NET Framework 4.0.30319'],
      ['w', '[!] header claims 48 sections, found 3'],
      ['w', '[!] .text entropy 7.966/8.0 → encrypted CIL'],
      ['p', '[+] protector: .NET Reactor v4'],
      ['i', '[*] de4dotEx → 2,515 lines of C# recovered'],
      ['i', '[*] layer 1/3 TripleDES-CBC ...... ok'],
      ['i', '[*] layer 2/3 GZip ............... ok'],
      ['i', '[*] layer 3/3 AES-256-CBC ........ ok'],
      ['p', '[+] entry: SlIwm5KqL()  ← stealer'],
      ['w', '[!] VirtualAlloc · WriteProcessMemory'],
      ['e', '[✗] verdict: CRITICAL — InfoStealer (CVSS 9.6)'],
    ];

    if (REDUCE) {
      let html = '';
      for (let off = 0; off < 0xa0; off += 16) html += row(off);
      hex.innerHTML = html;
      log.innerHTML = steps.map(([c, t]) => '<div class="' + c + '">' + esc(t) + '</div>').join('');
      return;
    }

    let visible = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.05 }).observe(hex);
    } else {
      visible = true;
    }

    // hexdump stream
    let off = 0;
    const maxRows = 18;
    setInterval(() => {
      if (!visible || document.hidden) return;
      hex.insertAdjacentHTML('beforeend', row(off));
      while (hex.children.length > maxRows) hex.firstElementChild.remove();
      off += 16;
      if (off >= sample.length) { off = 0; sample.set(buildSample()); }
    }, 120);

    // analysis log
    (async function loop() {
      for (;;) {
        log.innerHTML = '';
        for (const [cls, text] of steps) {
          while (!visible || document.hidden) await sleep(300);
          const div = document.createElement('div');
          div.className = cls;
          div.textContent = text;
          log.appendChild(div);
          await sleep(rand(350, 700));
        }
        await sleep(4200);
      }
    })();
  }

  /* ── Copy buttons + toast ───────────────────────────── */

  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (err) {}
      ta.remove();
    }
    toast('[✓] copiado: ' + text);
  }

  $$('[data-copy]').forEach(btn => btn.addEventListener('click', () => copyText(btn.dataset.copy)));

  /* ── Interactive shell ──────────────────────────────── */

  const Shell = (function () {
    const dlg  = $('#shell');
    const out  = $('#shell-out');
    const inp  = $('#shell-in');
    const body = $('#shell-body');
    if (!dlg) return { open() {}, close() {}, toggle() {} };

    const history = [];
    let hIdx = -1;
    let lastFocus = null;
    let greeted = false;
    let busy = false;

    const kv = (k, v) => '<span class="k">' + k + '</span>' + v;
    const link = (href, text) => '<a href="' + href + '" target="_blank" rel="noopener">' + text + '</a>';

    function print(cmd, html) {
      const el = document.createElement('div');
      el.className = 'sh-block';
      el.innerHTML =
        (cmd !== null ? '<div><span class="ps1-inline"><span class="ps1-user">matensy㉿kali</span>:<span class="ps1-path">~</span>$</span> <span class="sh-cmd">' + esc(cmd) + '</span></div>' : '') +
        '<div class="sh-out"></div>';
      const o = el.lastChild;
      if (html) o.innerHTML = html;
      out.appendChild(el);
      body.scrollTop = body.scrollHeight;
      return o;
    }

    function goto(id) {
      close();
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
    }

    const FILES = {
      'about.md':
        'Matheus Henrique de Jesus — "Matensy"\n' +
        'Estudante de Ciência da Computação (UNIP), Ribeirão Preto/SP.\n\n' +
        'Segurança ofensiva, Active Directory e análise de malware.\n' +
        'Top 17 BR no Hack The Box como <span class="p">auramentality</span>.',
      'certifications.txt':
        '<span class="p">[✓]</span> Google Cybersecurity\n' +
        '<span class="p">[✓]</span> The Complete Ethical Hacking Course: Beginner to Advanced\n' +
        '<span class="p">[✓]</span> Formação PowerShell: automatize suas tarefas\n' +
        '<span class="p">[✓]</span> Formação Shell Scripting: automatize tarefas\n' +
        '<span class="p">[✓]</span> Administração de Redes Windows',
      'contact.sh':
        '#!/bin/bash\n' +
        'echo "matheuscolobino@hotmail.com"\n' +
        'echo "github.com/Matensy"\n' +
        'echo "discord: matensy"',
    };

    const SECTIONS = { home: 'home', whoami: 'whoami', about: 'whoami', skills: 'skills', malware: 'malware', reports: 'malware', experience: 'experience', exp: 'experience', career: 'experience', contact: 'contact' };

    function denied(path) {
      return '<span class="e">ls: cannot open directory \'' + esc(path) + '\': Permission denied</span>\n' +
        '<span class="w">[!]</span> Writeups ficam selados até a máquina aposentar (regras do HTB).';
    }

    const CMDS = {
      help() {
        return [
          ['whoami', 'quem sou eu'],
          ['neofetch', 'resumo do sistema'],
          ['skills', 'habilidades & stack'],
          ['reports', 'relatórios de análise de malware'],
          ['experience', 'experiência profissional'],
          ['htb', 'perfil no Hack The Box'],
          ['contact', 'como falar comigo'],
          ['ls / cat', 'navegar pelos arquivos'],
          ['cd &lt;seção&gt;', 'rolar a página até a seção'],
          ['hack', '¯\\_(ツ)_/¯'],
          ['matrix', 'liga/desliga a chuva de caracteres'],
          ['clear', 'limpar (ou Ctrl+L)'],
          ['exit', 'fechar o shell (ou Esc)'],
        ].map(([c, d]) => kv(c, d)).join('\n');
      },
      whoami() {
        return 'matensy <span class="muted">(Matheus Henrique)</span> — offensive security &amp; malware analysis';
      },
      neofetch() {
        return [
          '<span class="p">matensy</span>@<span class="k" style="min-width:0">kali</span>',
          '─────────────────',
          kv('Nome', 'Matheus Henrique de Jesus'),
          kv('Local', 'Ribeirão Preto, SP — BR'),
          kv('Formação', 'B.Sc. Ciência da Computação — UNIP'),
          kv('HTB', '<span class="p">auramentality</span> · Top 17 BR'),
          kv('Foco', 'Red Team · Malware Analysis · AD'),
        ].join('\n');
      },
      skills() {
        return [
          '<span class="k">offensive/</span>',
          '├── Active Directory (Kerberos, LDAP, ADCS, DCSync, DPAPI)',
          '├── Web Hacking &amp; SQL Injection',
          '└── Vulnerability Research · CTFs',
          '<span class="k">reversing/</span>',
          '├── Análise estática de PE (entropia, seções, IOCs)',
          '├── Desofuscação .NET (de4dotEx)',
          '└── Process injection &amp; anti-analysis',
          '<span class="k">infra/</span>',
          '├── Linux · Windows Server · Redes',
          '├── AWS &amp; Cloud',
          '└── Python · PowerShell · Bash',
        ].join('\n');
      },
      reports() {
        return [
          '-rw-r--r-- 1 matensy 462K ' + link('assets/docs/kjnry-malware-analysis.pdf', 'kjnry-malware-analysis.pdf'),
          '           <span class="muted">Kjnry.exe — .NET Reactor v4 InfoStealer · CRITICAL</span>',
          '-rw-r--r-- 1 matensy 256K ' + link('assets/docs/abc-malware-analysis.pdf', 'abc-malware-analysis.pdf'),
          '           <span class="muted">javaw.exe — Rust InfoStealer + NT syscall injection · CRITICAL</span>',
        ].join('\n');
      },
      experience() {
        return [
          '<span class="w">7f3a9c1</span> Estágio de Cibersegurança — Adekz Tecnologia <span class="muted">(Set 2025 – Mar 2026)</span>',
          '<span class="w">3b8e21d</span> Estagiário de TI — Compass UOL <span class="muted">(Fev 2025 – Abr 2025)</span>',
          '<span class="w">a19c4f0</span> Analista de SAC — Leroy Merlin <span class="muted">(Dez 2023 – Jun 2024)</span>',
          '<span class="w">0e5d7b2</span> Assistente de Gestão TI — Leroy Merlin <span class="muted">(Ago 2023 – Nov 2023)</span>',
        ].join('\n');
      },
      htb() {
        return [
          kv('player', '<span class="p">auramentality</span>'),
          kv('rank', 'Top 17 BR'),
          kv('profile', link(HTB_URL, 'app.hackthebox.com')),
        ].join('\n');
      },
      contact() {
        return [
          kv('email', '<a href="mailto:matheuscolobino@hotmail.com">matheuscolobino@hotmail.com</a>'),
          kv('linkedin', link('https://www.linkedin.com/in/matheus-henrique-de-jesus-1538b0248/', 'in/matheus-henrique-de-jesus')),
          kv('github', link('https://github.com/Matensy', 'github.com/Matensy')),
          kv('htb', link(HTB_URL, 'auramentality')),
          kv('discord', 'matensy'),
        ].join('\n');
      },
      ls(args) {
        const p = (args[0] || '').replace(/^~\//, '').replace(/\/$/, '');
        if (!p || p === '.' || p === '~') {
          return '<span class="k" style="min-width:0">career/</span>  <span class="k" style="min-width:0">reports/</span>  <span class="k" style="min-width:0">skills/</span>  <span class="e">writeups/</span>  about.md  certifications.txt  <span class="p">contact.sh</span>';
        }
        if (p === 'writeups') return denied('writeups/');
        if (p === 'reports' || p === 'reports/malware' || p === 'malware') return CMDS.reports();
        if (p === 'skills') return CMDS.skills();
        if (p === 'career') return CMDS.experience();
        return '<span class="e">ls: cannot access \'' + esc(args[0]) + '\': No such file or directory</span>';
      },
      cat(args) {
        const f = (args[0] || '').replace(/^~\//, '');
        if (!f) return '<span class="e">cat: missing operand</span>';
        if (FILES[f]) return FILES[f];
        if (f.startsWith('writeups')) return '<span class="e">cat: ' + esc(f) + ': Permission denied</span>';
        if (f === '/etc/shadow') return '<span class="e">cat: /etc/shadow: Permission denied</span> <span class="muted">— boa tentativa 😏</span>';
        if (f === 'flag.txt' || f === 'root.txt' || f === 'user.txt') return '<span class="w">HTB{n0_fl4gs_h3r3_try_h4rd3r}</span>';
        return '<span class="e">cat: ' + esc(f) + ': No such file or directory</span>';
      },
      cd(args) {
        const t = (args[0] || '').replace(/^~\//, '').replace(/\/$/, '');
        if (!t || t === '~') { goto('home'); return null; }
        if (t === 'writeups') return '<span class="e">cd: writeups: Permission denied</span>';
        if (SECTIONS[t]) { goto(SECTIONS[t]); return null; }
        return '<span class="e">cd: ' + esc(t) + ': No such file or directory</span>';
      },
      open(args) {
        const f = args[0] || '';
        if (/kjnry/i.test(f)) { window.open('assets/docs/kjnry-malware-analysis.pdf', '_blank', 'noopener'); return 'abrindo kjnry-malware-analysis.pdf…'; }
        if (/abc|javaw/i.test(f)) { window.open('assets/docs/abc-malware-analysis.pdf', '_blank', 'noopener'); return 'abrindo abc-malware-analysis.pdf…'; }
        return 'uso: open kjnry | open javaw';
      },
      echo(args) { return esc(args.join(' ')); },
      date() { return esc(new Date().toString()); },
      pwd() { return '/home/matensy'; },
      id() { return 'uid=1000(matensy) gid=1000(matensy) groups=1000(matensy),27(sudo?),1337(htb)'; },
      uname(args) { return args.includes('-a') ? 'Linux kali 6.8.0-kali-amd64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux' : 'Linux'; },
      history() { return history.slice().reverse().map((c, i) => String(i + 1).padStart(4) + '  ' + esc(c)).join('\n'); },
      sudo() { return '<span class="e">matensy is not in the sudoers file. This incident will be reported.</span> 👀'; },
      rm(args) { return args.join(' ').includes('-rf') ? '<span class="w">rm: nice try.</span> 🙃' : 'rm: missing operand'; },
      matrix() { return Matrix.toggle() ? '<span class="p">[+]</span> matrix rain: on' : '<span class="w">[-]</span> matrix rain: off'; },
      clear() { out.innerHTML = ''; return null; },
      exit() { close(); return null; },
      hack: runHack,
    };
    CMDS.about = CMDS.neofetch;
    CMDS.malware = CMDS.reports;
    CMDS.exp = CMDS.experience;
    CMDS.quit = CMDS.exit;
    CMDS.ll = CMDS.ls;

    async function runHack(_, o) {
      busy = true;
      const line = (cls, text) => { o.innerHTML += (cls ? '<span class="' + cls + '">' + text + '</span>' : text) + '\n'; body.scrollTop = body.scrollHeight; };
      const bar = async (label) => {
        const span = document.createElement('span');
        o.appendChild(span);
        o.appendChild(document.createTextNode('\n'));
        for (let p = 0; p <= 20; p++) {
          span.textContent = label + ' [' + '█'.repeat(p) + '░'.repeat(20 - p) + '] ' + (p * 5) + '%';
          body.scrollTop = body.scrollHeight;
          await sleep(REDUCE ? 0 : rand(25, 70));
        }
      };
      const wait = ms => sleep(REDUCE ? 0 : ms);

      line('', '[*] target: 10.10.11.17 (dc01.lab.local)');
      await wait(400);
      line('', '[*] nmap -sC -sV -p- 10.10.11.17');
      await bar('    scanning ');
      line('p', '[+] 53/dns 88/kerberos 389/ldap 445/smb 5985/winrm');
      await wait(350);
      line('', '[*] enumerating users via LDAP…');
      await wait(500);
      line('p', '[+] svc_backup: DONT_REQ_PREAUTH → AS-REP roastable');
      await bar('    cracking ');
      line('p', '[+] svc_backup:********  (hash cracked)');
      await wait(350);
      line('', '[*] certipy find -vulnerable');
      await wait(500);
      line('w', '[!] template "UserAuth" vulnerable to ESC1');
      await wait(400);
      line('p', '[+] certificate issued for administrator@lab.local');
      await wait(400);
      line('', '[*] secretsdump → DCSync');
      await bar('    dumping ');
      line('p', '[✓] root@dc01 — pwned.');
      line('muted', '    (simulação — nenhuma máquina real foi tocada 😉)');
      busy = false;
      return undefined;
    }

    async function run(raw) {
      const line = raw.trim();
      inp.value = '';
      hIdx = -1;
      if (!line) { print('', ''); return; }
      history.unshift(line);

      const [name, ...args] = line.split(/\s+/);
      const fn = CMDS[name.toLowerCase()];
      if (!fn) {
        print(line, '<span class="e">zsh: command not found: ' + esc(name) + '</span> — digite <span class="p">help</span>');
        return;
      }
      if (name.toLowerCase() === 'clear') { fn(args); return; }
      const o = print(line, '');
      const res = await fn(args, o);
      if (res === null && !o.innerHTML) o.parentElement.remove();
      else if (typeof res === 'string') o.innerHTML = res;
      body.scrollTop = body.scrollHeight;
    }

    function open() {
      if (!dlg.hidden) return;
      lastFocus = document.activeElement;
      dlg.hidden = false;
      inp.focus();
      if (!greeted) {
        greeted = true;
        print(null, '<span class="p">Bem-vindo ao shell do matensy.</span> Digite <span class="p">help</span> para ver os comandos.\n<span class="muted">Tab completa · ↑↓ histórico · Esc fecha</span>');
      }
    }

    function close() {
      if (dlg.hidden) return;
      dlg.hidden = true;
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function toggle() { dlg.hidden ? open() : close(); }

    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!busy) run(inp.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (hIdx < history.length - 1) inp.value = history[++hIdx];
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (hIdx > 0) inp.value = history[--hIdx];
        else { hIdx = -1; inp.value = ''; }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const parts = inp.value.split(' ');
        const cur = parts[parts.length - 1].toLowerCase();
        const pool = parts.length === 1
          ? Object.keys(CMDS)
          : Object.keys(FILES).concat(Object.keys(SECTIONS), ['writeups/', 'kjnry', 'javaw']);
        const matches = pool.filter(c => c.startsWith(cur));
        if (cur && matches.length === 1) { parts[parts.length - 1] = matches[0]; inp.value = parts.join(' '); }
        else if (cur && matches.length > 1) print(inp.value, matches.join('  '));
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        out.innerHTML = '';
      } else if (e.key === 'Escape' || e.key === '`') {
        e.preventDefault();
        close();
      }
    });

    body.addEventListener('click', () => {
      if (!window.getSelection().toString()) inp.focus();
    });

    $$('[data-open-shell]').forEach(b => b.addEventListener('click', open));
    $$('[data-close-shell]').forEach(b => b.addEventListener('click', close));

    document.addEventListener('keydown', e => {
      const t = e.target;
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (e.key === '`' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape' && !dlg.hidden) {
        close();
      }
    });

    document.addEventListener('mousedown', e => {
      if (!dlg.hidden && !dlg.contains(e.target) && !e.target.closest('[data-open-shell]')) close();
    });

    return { open, close, toggle };
  })();

  /* ── Init ───────────────────────────────────────────── */

  function start() {
    initGlitch();
    initTyper();
    initObservers();
    initNavSpy();
    initAnalyzer();
  }

  function boot() {
    runBoot().then(start);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // Console greeting for the curious.
  try {
    console.log('%c matensy %c curioso? digite ` na página para abrir o shell.', 'background:#a855f7;color:#000;font-weight:bold', 'color:#a855f7');
  } catch (e) {}
})();
