# matensy.github.io

Portfólio pessoal com tema de terminal — segurança ofensiva e análise de malware.

## Estrutura

```
index.html              conteúdo (HTML puro, funciona sem JS)
assets/css/style.css    tema terminal, janelas, glitch, scanlines
assets/js/app.js        boot, matrix rain, hexdump animado, shell interativo
assets/docs/            relatórios de análise de malware (PDF)
assets/img/             favicon
```

Sem build e sem dependências: o GitHub Pages serve os arquivos direto.

## Adicionar um relatório de malware

1. Coloque o PDF em `assets/docs/`.
2. Duplique um `<article class="win reveal report">` na seção `#malware` do `index.html`.
3. (Opcional) adicione a linha no comando `reports` em `assets/js/app.js`.

## Shell interativo

Pressione <kbd>`</kbd> na página (ou clique em `>_ shell`). Comandos: `help`, `whoami`,
`neofetch`, `skills`, `reports`, `experience`, `htb`, `contact`, `ls`, `cat`, `cd`, `hack`, `matrix`.

Animações respeitam `prefers-reduced-motion`.
