<div align="center">

# Motion Project

**Animação 3D low-poly com Three.js, renderizada quadro a quadro via Playwright — um vídeo vertical que explica, em 30 segundos, o que é uma API.**

![Three.js](https://img.shields.io/badge/Three.js-0.187-000000?logo=threedotjs&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.65-2EAD33?logo=playwright&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ESM-F7DF1E?logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
[![Licença: MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-blue.svg)](./LICENSE)

</div>

---

## 📖 Sobre

O **Motion Project** é uma peça de *motion design* 3D que ensina um conceito técnico por meio de uma história. O tema é **"A História do Garçom Digital — o que é uma API"**: um restaurante low-poly onde o cliente (usuário), o garçom (a API) e o chef (o servidor/banco de dados) explicam, de forma visual e divertida, como uma requisição percorre o sistema.

A cena é construída em **Three.js** (`index.html` + `three.bundle.js`) e renderizada fora do navegador com **Playwright**, que captura a animação **quadro a quadro** em 1080×1920 a 30 fps — quadro a quadro é o que garante a fidelidade do resultado final. O roteiro completo, personagens, paleta e a linha do tempo estão documentados em `storyboard.md`.

## ✨ Funcionalidades

- **Cena 3D low-poly** com `flatShading`, personagens facetados e câmera dinâmica
- **Roteiro documentado** em `storyboard.md` (30 s / 900 frames a 30 fps)
- **Captura quadro a quadro** via Playwright (`capturar.mjs`), com modo de *preview* em meia resolução
- **Saída vertical 1080×1920** ideal para Reels, TikTok e Shorts
- **Overlays textuais** em tipografia Inter respeitando a *safe area*

## 🛠️ Tecnologias

![Three.js](https://img.shields.io/badge/Three.js-000000?logo=threedotjs&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 📁 Estrutura do projeto

```
motion-project/
├── index.html          # Cena 3D (Three.js) com a animação completa
├── three.bundle.js     # Build do Three.js embutido
├── capturar.mjs        # Captura quadro a quadro via Playwright
├── storyboard.md       # Roteiro, personagens, paleta e timeline
├── fonts/              # Fontes usadas na composição
└── frames/             # Quadros gerados (ignorados no Git)
```

## 🚀 Como rodar localmente

Requer **Node.js** com Playwright instalado.

```bash
npm install
npx playwright install chromium

# Preview rápido (meia resolução, 15 fps)
node capturar.mjs --preview

# Render final (1080x1920, 30 fps)
node capturar.mjs --from 0 --to 30 --fps 30 --dir frames
```

Os quadros são gravados em `frames/` (ou `preview_frames/` no modo preview) e podem ser convertidos em vídeo com FFmpeg:

```bash
ffmpeg -framerate 30 -i frames/%05d.png -c:v libx264 -pix_fmt yuv420p saida.mp4
```

## 📄 Licença

Distribuído sob a **Licença MIT**. Veja [`LICENSE`](./LICENSE).
