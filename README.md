# Último Lume

Um souls-like curto, feito para ser zerado em uns dez minutos. Roda direto no navegador, no celular ou no PC, e pode ser instalado como app.

> *No princípio havia o Lume. E enquanto ele ardia, os mortos dormiam.*

**Jogar:** https://helioairosa11-ops.github.io/-ltimo-lume/

## A história

O reino de Vesperal era protegido pelo Lume, uma chama que mantinha os mortos dormindo. Três guardiões juraram protegê-la. Mas o rei temeu o dia em que ela se apagaria e tentou guardá-la só para si. O Lume se partiu em três brasas, a cinza cobriu o reino e os mortos despertaram.

Você é um deles, o **Cinzento**. Junto à primeira fogueira, Ione, a Guardiã do Fogo, pede que você recupere as três brasas.

## Os chefes

| Chefe | Onde | Estilo |
|---|---|---|
| **Bramir, o Juramento Partido** | Portão, além do Pátio do Juramento | Cavaleiro gigante de alabarda: varridas, golpe no chão com onda de choque e investida. Na segunda fase, varre duas vezes. |
| **Vesper, Tecelã de Cinzas** | Bosque além do Pântano das Velas | Feiticeira que flutua e mantém distância: leque e anel de orbes, espíritos que perseguem, teleporte. Na segunda fase, espiral de orbes. |
| **Aldric, o Rei Apagado** | Trono da Catedral Apagada | Rei com espada grande: combos de três golpes, estocada e trilha de fogo. Na segunda fase, chamas negras, chuva de brasas e giro. |

O jogo tem **dois finais**, escolhidos no altar depois do último chefe.

## Como jogar

| Ação | Teclado | Toque | Controle |
|---|---|---|---|
| Andar | WASD ou setas | Arrastar no lado esquerdo | Analógico esquerdo |
| Atacar (até 3 golpes seguidos) | J ou clique | Botão da espada | RB |
| Rolar (invulnerável por um instante) | Espaço | Botão da seta | B / ○ |
| Beber frasco | Q | Botão do frasco | X / □ |
| Interagir | E | Botão no centro da tela | A / ✕ |
| Travar mira | Tab | Botão do alvo | LB ou R3 |
| Pausa | Esc | Botão no canto | Start |

Dicas:
- Ataque depois que o inimigo golpear. O chão fica vermelho antes dos golpes fortes.
- Ao morrer, suas cinzas ficam onde você caiu. Volte para buscá-las antes de morrer de novo.
- Descansar na fogueira cura, recarrega os frascos e traz os inimigos de volta. Lá você também gasta cinzas para subir Vigor (vida), Força (dano) e Fôlego (energia).
- O progresso é salvo no próprio navegador a cada fogueira.

## Instalar como app

Depois que o site estiver no ar (veja abaixo):

- **Android (Chrome):** abra o link, toque em ⋮ e depois em **Instalar app** ou **Adicionar à tela inicial**.
- **iPhone (Safari):** abra o link, toque em **Compartilhar** e depois em **Adicionar à Tela de Início**.
- **PC (Chrome ou Edge):** clique no ícone de instalar na barra de endereço.

Depois da primeira abertura, o jogo funciona offline.

## Colocar no ar com GitHub Pages

1. No repositório, abra **Settings → Pages**.
2. Em **Build and deployment → Source**, escolha **Deploy from a branch**.
3. Selecione a branch **main**, a pasta **/ (root)** e clique em **Save**.
4. Em um ou dois minutos o jogo aparece em `https://helioairosa11-ops.github.io/-ltimo-lume/`.

## Rodar no computador

Qualquer servidor estático serve. Por exemplo:

```bash
python3 -m http.server 8000
```

Depois abra http://localhost:8000. Abrir o `index.html` direto também funciona, só que sem instalação offline.

## Arquivos

- `index.html`: o jogo inteiro (HTML, CSS e JavaScript, sem dependências)
- `manifest.webmanifest` e `sw.js`: instalação como app e modo offline
- `icons/`: ícones do app

Tudo é desenhado em canvas e o som é gerado na hora pelo navegador. Não há imagens nem áudios externos.

## Licença

MIT. Veja [LICENSE](LICENSE).
