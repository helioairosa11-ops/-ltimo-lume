# Último Lume

Um souls-like curto, feito para ser zerado em uns dez minutos. Roda direto no navegador, no celular ou no PC, e pode ser instalado como app.

> *No princípio havia o Lume. E enquanto ele ardia, os mortos dormiam.*

**Jogar:** https://helioairosa11-ops.github.io/-ltimo-lume/ (funciona depois de ativar o GitHub Pages, veja abaixo)

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
| Correr | Segurar Espaço | Segurar o botão da seta | Segurar B / ○ |
| Beber frasco | Q | Botão do frasco | X / □ |
| Interagir | E | Botão no centro da tela | A / ✕ |
| Travar mira | Tab | Botão do alvo | LB ou R3 |
| Pausa | Esc | Botão no canto | Start |

Dicas:
- Ataque depois que o inimigo golpear. O chão fica vermelho antes dos golpes fortes.
- Cada chefe tem uma barra dourada de postura embaixo da vida. Ela enche com golpes seguidos; quando enche, o chefe cambaleia e o próximo golpe é crítico.
- Ao morrer, suas cinzas ficam onde você caiu. Volte para buscá-las antes de morrer de novo.
- Descansar na fogueira cura, recarrega os frascos e traz os inimigos de volta. Lá você também gasta cinzas para subir Vigor (vida), Força (dano) e Fôlego (energia).
- O progresso é salvo no próprio navegador a cada fogueira.

## Música, vozes e ambientação

- **Menu:** tema orquestral *Flare Main*, de Brandon Morris.
- **Cada área tem som próprio:** gotas e vento de caverna na cripta, vento e corvos no pátio (com raios e trovões), coruja, água e névoa no pântano, eco de passos na catedral.
- **Fogueiras:** a música muda para um tema calmo quando você se aproxima, com o crepitar do fogo.
- **Cada chefe tem sua trilha**, que fica mais intensa na segunda fase.
- **Vozes:** gemidos dos Ocos, rosnados dos cães, rugidos de Bramir, a respiração fantasma e os gritos de Vesper, os grunhidos de Aldric e a dor e a morte do herói. As falas de Ione aparecem em texto.
- Com pouca vida, você ouve o próprio coração.

A música começa no primeiro toque ou clique, porque os navegadores não deixam tocar som antes disso. Todos os áudios têm licença livre; autores e licenças estão em [CREDITS.md](CREDITS.md) e na tela de Créditos do jogo.

## Colocar no ar com GitHub Pages (passo a passo)

Isso só precisa ser feito uma vez. Pelo celular, use o **navegador** (Chrome ou Safari) em github.com, não o app do GitHub, porque o app não mostra as configurações do site.

1. **Abra as configurações do repositório.** Entre em https://github.com/helioairosa11-ops/-ltimo-lume. Na barra de abas embaixo do nome do repositório (*Code, Issues, Pull requests...*), toque em **Settings**, a última aba, com ícone de engrenagem. No celular essa barra rola para o lado: arraste-a para a esquerda até ver **Settings**, ou toque no botão **···** no fim da barra e escolha **Settings**. Se ainda assim não aparecer, abra o menu do navegador e ative **Versão para computador** (Chrome) ou **Solicitar site para computador** (Safari).
2. **Abra a seção Pages.** Na lista do lado esquerdo da página de Settings (no celular ela pode estar no topo, num menu que se abre), procure o grupo **Code and automation** e toque em **Pages**.
3. **Escolha de onde o site vem.** Em **Build and deployment**, no campo **Source**, deixe **Deploy from a branch**. Logo abaixo, em **Branch**, toque no botão que diz **None** e escolha **main**. Ao lado aparece um segundo botão com a pasta: deixe **/ (root)**. Toque em **Save**.
4. **Espere e abra o jogo.** O GitHub leva de um a três minutos para publicar. Recarregue a página de Pages: quando estiver pronto, aparece no topo a frase **"Your site is live at https://helioairosa11-ops.github.io/-ltimo-lume/"** e um botão **Visit site**. Esse é o link do jogo para jogar e compartilhar.

Se depois de alguns minutos o link mostrar "404", espere mais um pouco e recarregue. A primeira publicação às vezes demora mais.

## Instalar como app

Com o site no ar:

- **Android (Chrome):** abra o link do jogo, toque em ⋮ (três pontos, no canto de cima) e depois em **Instalar app** ou **Adicionar à tela inicial**. O ícone da fogueira aparece junto dos seus apps.
- **iPhone (Safari):** abra o link no Safari, toque em **Compartilhar** (quadrado com seta para cima) e depois em **Adicionar à Tela de Início**.
- **PC (Chrome ou Edge):** clique no ícone de instalar no canto direito da barra de endereço.

Depois da primeira abertura, o jogo funciona offline. As músicas de cada área ficam guardadas a partir da primeira vez que tocam.

## Rodar no computador

Qualquer servidor estático serve. Por exemplo:

```bash
python3 -m http.server 8000
```

Depois abra http://localhost:8000. Abrir o `index.html` direto também funciona, mas aí o navegador bloqueia os arquivos de áudio e o jogo usa só os sons gerados por ele mesmo.

## Arquivos

- `index.html`: o jogo inteiro (HTML, CSS e JavaScript, sem dependências)
- `audio/m/`: músicas; `audio/s/`: vozes, efeitos e ambientes
- `manifest.webmanifest` e `sw.js`: instalação como app e modo offline
- `icons/`: ícones do app
- `CREDITS.md`: autor e licença de cada áudio

## Licença

O código e os textos são MIT (veja [LICENSE](LICENSE)). Os arquivos em `audio/` mantêm as licenças dos seus autores (CC BY 3.0, CC BY-SA 3.0 ou CC0), listadas em [CREDITS.md](CREDITS.md).
