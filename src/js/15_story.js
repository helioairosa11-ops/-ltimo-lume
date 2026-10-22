// ===================== HISTÓRIA: itens, inscrições, diálogos, bestiário, finais =====================
const ITEMS = {
  // ---- brasas ----
  brasa_lamento: { name: 'Brasa do Lamento', cat: 'brasas', icon: 'brasa', c: 0xbfd8ff, desc: 'Caiu no incensário da Irmã Odile na Noite da Separação. Ela cantava o funeral da rainha quando os mortos se levantaram, e continuou a cantar, um por um, até que todos voltassem a deitar-se. Nenhum voltou. A brasa ainda vibra com uma canção de embalar.' },
  brasa_juramento: { name: 'Brasa do Juramento', cat: 'brasas', icon: 'brasa', c: 0xdde6ff, desc: 'Arrancada do peito de Brigid, capitã da Guarda da Rainha. Jurou que nenhum vivo passaria o Portão Interior enquanto a rainha vivesse. A rainha não morreu, mas também não vive, e o juramento ficou preso entre as duas coisas.' },
  brasa_veu: { name: 'Brasa do Véu', cat: 'brasas', icon: 'brasa', c: 0xc8a8ff, desc: 'Vesper, irmã da rainha, tecia o véu que separa os vivos dos mortos. Quando o Lume se partiu o véu rasgou-se, e ela tentou cosê-lo com as próprias cinzas. Há fios de luz presos a esta brasa que nunca se soltam.' },
  brasa_lua: { name: 'Brasa da Lua Morta', cat: 'brasas', icon: 'brasa', c: 0xd8e8ff, desc: 'Selene, primogénita do rei, fugiu com esta brasa para que o pai nunca a recuperasse. O bosque ardeu à volta dela e ficou branco como osso. É fria como o luar, e cheira a pelo de lobo.' },
  brasa_forja: { name: 'Brasa da Forja', cat: 'brasas', icon: 'brasa', c: 0xff9a40, desc: 'Hilde forjou o Cálice da Separação a pedido do rei. Quando viu o que a sua obra fez, atirou-se à grande fornalha com esta brasa nas mãos. O metal da forja nunca mais arrefeceu.' },
  brasa_rei: { name: 'Brasa do Rei', cat: 'brasas', icon: 'brasa', c: 0xffd070, desc: 'Aldric guardou a última brasa junto ao véu da esposa. Temia a escuridão mais do que a morte, e por isso partiu a luz do mundo. A brasa treme quando a seguras. Ainda tem medo.' },
  // ---- chaves ----
  chave_cripta: { name: 'Chave da Galeria Funerária', cat: 'chaves', icon: 'chave', c: 0xa8a090, desc: 'Chave de ferro de um guarda da cripta. O guarda morreu de costas para a porta, como se a quisesse segurar fechada. Abre a galeria onde a Irmã Odile canta.' },
  chave_torre: { name: 'Chave da Torre de Vigia', cat: 'chaves', icon: 'chave', c: 0xb8b0a0, desc: 'Chave dos besteiros das Muralhas. Abre a torre onde a Guarda guardava as armas de longo alcance e as penas dos seus capacetes.' },
  chave_capela: { name: 'Chave da Capela Afogada', cat: 'chaves', icon: 'chave', c: 0x8ab090, desc: 'Chave coberta de algas. A capela do pântano foi fechada pelas bruxas das velas quando a água subiu, e elas ficaram do lado de dentro, a ler.' },
  chave_sacristia: { name: 'Chave da Sacristia', cat: 'chaves', icon: 'chave', c: 0xe0c070, desc: 'Chave dourada do bispo Ozias. Abre a sacristia da Catedral, onde ele guardava aquilo que não queria que o rei visse.' },
  // ---- cartas (final secreto) ----
  carta1: { name: 'Carta de Seraphine (I)', cat: 'cartas', icon: 'carta', c: 0xf0e0c0, desc: '«Aldric, meu amor. Hoje o Lume queimou-me as mãos e eu não senti nada. Não chores. Uma chama precisa de algo que arda, e eu escolhi ser eu. Cuida das meninas. Não deixes o Ozias falar-te ao ouvido à noite.»' },
  carta2: { name: 'Carta de Seraphine (II)', cat: 'cartas', icon: 'carta', c: 0xf0e0c0, desc: '«Ione pergunta-me porque brilho à noite. Disse-lhe que guardo uma estrela. Ela quer guardar uma também. Que o Lume nunca a escolha. E se escolher, que ela possa dizer que não. A mim nunca ninguém perguntou.»' },
  carta3: { name: 'Carta de Seraphine (III)', cat: 'cartas', icon: 'carta', c: 0xf0e0c0, desc: '«Se algum dia o Lume se partir, não o reacendas comigo. Deixa-me dormir. Mas se alguém tiver de arder, que seja por escolha, e não por medo. Esse é o único fogo que não se apaga.»' },
  // ---- melhorias e materiais ----
  lagrima: { name: 'Lágrima de Lume', cat: 'itens', icon: 'lagrima', c: 0xffc070, desc: 'Uma gota da Chama Primeira, endurecida em vidro. Diz-se que a rainha chorava luz. Aumenta em um o número de Frascos de Lume.' },
  cinza_bendita: { name: 'Cinza Bendita', cat: 'itens', icon: 'cinza', c: 0xf0e8d8, desc: 'Cinza recolhida no altar da rainha. Misturada nos frascos, torna a cura mais forte.' },
  fragmento: { name: 'Fragmento de Brasa', cat: 'itens', icon: 'fragmento', c: 0xff8a40, desc: 'Lasca de uma brasa que se partiu ao cair. Ainda queima um pouco. Hrolf, o ferreiro do Santuário, usa-os para reforçar armas.' },
  cinzas_pequenas: { name: 'Cinzas de um Desperto', cat: 'itens', icon: 'cinzas', c: 0xc8c0b0, n: 150, use: true, desc: 'Restos de alguém que, como tu, acordou sem saber porquê. Usa-as para ganhar 150 cinzas.' },
  cinzas_soldado: { name: 'Cinzas de um Soldado', cat: 'itens', icon: 'cinzas', c: 0xd8c8a0, n: 500, use: true, desc: 'Um soldado da Guarda da Rainha, que morreu de pé. Usa-as para ganhar 500 cinzas.' },
  cinzas_heroi: { name: 'Cinzas de um Herói Esquecido', cat: 'itens', icon: 'cinzas', c: 0xffd890, n: 1500, use: true, desc: 'Ninguém se lembra do nome dele. As cinzas lembram. Usa-as para ganhar 1500 cinzas.' },
  // ---- armas ----
  w_espada: { name: 'Espada do Desperto', cat: 'armas', icon: 'espada', wid: 'espada', c: 0xe8e4dc, desc: 'Encontraste-a espetada na terra ao lado do teu caixão. Não sabes se é tua. É leve, rápida, e não tem nome. Três golpes seguidos e o terceiro morde mais fundo.' },
  w_machado: { name: 'Machado do Carrasco', cat: 'armas', icon: 'machado', wid: 'machado', c: 0xd0c0a0, desc: 'O machado de Tobias, carrasco das Muralhas. Lento e pesado: só dois golpes por série, mas cada um conta como dois. O Grande Golpe faz o chão tremer e lança ondas de choque.' },
  w_adagas: { name: 'Adagas da Caçadora', cat: 'armas', icon: 'adagas', wid: 'adagas', c: 0xd8f0ff, desc: 'O par de adagas que Selene usava para terminar o que o arco começava. Golpes curtos e muito rápidos: cinco por série. Enchem o foco depressa.' },
  w_montante: { name: 'Espada do Rei Apagado', cat: 'armas', icon: 'montante', wid: 'montante', c: 0xffb070, desc: 'A espada grande de Aldric. A lâmina ficou negra na noite em que ele partiu o Lume, mas por dentro ainda arde. Longo alcance; o Grande Golpe queima.' },
  // ---- habilidades ----
  sk_arco: { name: 'Arco Longo de Vesperal', cat: 'habilidades', icon: 'arco', sid: 'arco', c: 0xd8c8a8, desc: 'Arco dos besteiros da torre, de teixo negro. Dispara flechas sem gastar foco. Segura para cima para disparar ao céu.' },
  sk_fogo: { name: 'Livro das Velas', cat: 'habilidades', icon: 'fogo', sid: 'fogo', c: 0xff8a30, desc: 'As bruxas do pântano aprenderam a acender velas sem lhes tocar, e depois a acender outras coisas. Lança uma bola de fogo que atravessa os inimigos.' },
  sk_giro: { name: 'Cinza de Guerra: Giro do Lobo', cat: 'habilidades', icon: 'giro', sid: 'giro', c: 0xd8d8f0, desc: 'Técnica dos caçadores do bosque: girar com a arma estendida, como um lobo cercado que morde para todos os lados.' },
  sk_salto: { name: 'Cinza de Guerra: Salto da Bigorna', cat: 'habilidades', icon: 'salto', sid: 'salto', c: 0xffc070, desc: 'Os ferreiros da forja diziam que um martelo só bate de verdade quando cai do alto. Mergulha a pique e esmaga o chão. Parte o chão frágil.' },
  sk_passo: { name: 'Passo Sombrio', cat: 'habilidades', icon: 'passo', sid: 'passo', c: 0x9a7aff, desc: 'O rei aprendeu a atravessar a sombra para estar sempre ao lado da rainha. Atravessa inimigos e véus negros, ferindo tudo pelo caminho.' },
  sk_luz: { name: 'Lança de Luz', cat: 'habilidades', icon: 'luz', sid: 'luz', c: 0xfff0c0, desc: 'Um fragmento da luz da rainha, ainda puro. Atira uma lança de luz que atravessa tudo o que encontra, até as paredes.' },
  // ---- capacidades ----
  asas: { name: 'Penas do Juramento', cat: 'habilidades', icon: 'asas', abil: 'asas', c: 0xf0f0ff, desc: 'O penacho branco do capacete de Brigid. Os guardas da rainha diziam que ela saltava as ameias como se tivesse asas. Permite um segundo salto no ar.' },
  // ---- talismãs ----
  tal_vigor: { name: 'Talismã do Coração de Pedra', cat: 'talismas', icon: 'talisma', tid: 'tal_vigor', c: 0xd06050, desc: 'Um coração esculpido em granito. Quem o usa demora mais a cair. Aumenta a vida máxima em 30.' },
  tal_folego: { name: 'Talismã do Fôlego de Lobo', cat: 'talismas', icon: 'talisma', tid: 'tal_folego', c: 0xb8c0d8, desc: 'Dente de lobo enfiado num cordão. O dash recupera mais depressa.' },
  tal_brasa: { name: 'Talismã da Brasa Fria', cat: 'talismas', icon: 'talisma', tid: 'tal_brasa', c: 0x7ac0ff, desc: 'Uma brasa que deixou de arder sem se apagar. Reduz o dano de fogo recebido.' },
  tal_pena: { name: 'Talismã da Pena Cinzenta', cat: 'talismas', icon: 'talisma', tid: 'tal_pena', c: 0xd8d8d0, desc: 'Pena de um corvo das Muralhas. A esquiva do dash dura mais tempo.' },
  tal_escudo: { name: 'Talismã do Juramento', cat: 'talismas', icon: 'talisma', tid: 'tal_escudo', c: 0xb8c8e8, desc: 'O selo da Guarda da Rainha. Pertenceu a Tobias antes de ele ser carrasco. Reduz todo o dano recebido.' },
  tal_foco: { name: 'Talismã da Vela Eterna', cat: 'talismas', icon: 'talisma', tid: 'tal_foco', c: 0xffd080, desc: 'Um coto de vela que não se gasta. Ganhas mais foco a cada golpe.' },
  tal_lua: { name: 'Talismã da Lua Morta', cat: 'talismas', icon: 'talisma', tid: 'tal_lua', c: 0xd8e8ff, desc: 'Uma pedra-da-lua rachada ao meio. Aumenta o dano das habilidades.' },
  tal_furia: { name: 'Talismã da Última Faísca', cat: 'talismas', icon: 'talisma', tid: 'tal_furia', c: 0xff6a3a, desc: 'Brilha mais quando estás quase a morrer. Com pouca vida, causas muito mais dano.' },
  tal_vampiro: { name: 'Talismã da Sanguessuga', cat: 'talismas', icon: 'talisma', tid: 'tal_vampiro', c: 0x8a3a5a, desc: 'Uma sanguessuga do pântano, seca e enrolada num anel. Golpes seguidos devolvem um pouco de vida.' },
  tal_corvo: { name: 'Talismã do Corvo Avaro', cat: 'talismas', icon: 'talisma', tid: 'tal_corvo', c: 0x3a3a4a, desc: 'Os corvos das Muralhas juntam tudo o que brilha. Ganhas mais cinzas ao matar.' },
};
const AREA_NAMES = { crypt: 'Cripta dos Esquecidos', hub: 'Santuário da Última Chama', walls: 'Muralhas de Vesperal', swamp: 'Pântano das Velas', forest: 'Bosque de Cinza', forge: 'Forja Profunda', cathedral: 'Catedral Apagada', heart: 'Coração do Lume' };
const AREA_SUBS = { crypt: 'Onde os mortos esperam pelo fim do cântico', hub: 'A última luz de Vesperal', walls: 'Onde o juramento ainda está de guarda', swamp: 'Onde o véu se rasgou', forest: 'Onde a caçadora se escondeu do pai', forge: 'Onde se forjou o cálice', cathedral: 'Onde o rei ainda espera', heart: 'Onde a rainha arde' };
const INTRO_TEXT = [
  'No princípio havia o Lume, a Chama Primeira. E enquanto ele ardia, os mortos dormiam.',
  'O Lume escolhia um receptáculo em cada geração. Na última, escolheu a rainha Seraphine de Vesperal.',
  'A chama queimava-a por dentro. Cada dia mais luz. Cada dia menos carne.',
  'O rei Aldric não suportou vê-la arder. O bispo Ozias falou-lhe ao ouvido de um cálice de metal, capaz de guardar o Lume sem ninguém ter de morrer.',
  'A mestra-ferreira Hilde forjou o cálice. E numa noite sem lua, tentaram arrancar a chama à rainha.',
  'Mas o Lume não aceita dono. Partiu-se em seis brasas, que caíram sobre os mais próximos da rainha e lhes roubaram o descanso.',
  'Vesperal cobriu-se de cinza. E os mortos... acordaram.',
  'Tu és um deles.'
];
const TIPS = [
  'Rola através do golpe, não para longe dele: o dash torna-te invulnerável por um instante.',
  'Esquivar mesmo em cima de um golpe abranda o tempo e dá foco.',
  'O terceiro golpe de uma série é mais forte. Golpes para baixo no ar fazem-te ressaltar.',
  'Segura o ataque para carregar o Grande Golpe.',
  'Os chefes têm uma barra dourada de postura. Quando enche, ajoelham-se.',
  'Golpes pelas costas fazem dano crítico.',
  'Ao morrer, as tuas cinzas ficam onde caíste. Volta para as buscar.',
  'Descansar numa fogueira cura-te, mas traz os mortos de volta.',
  'Os soldados com escudo bloqueiam de frente. Golpeia de cima, por trás, ou com um golpe forte.',
  'Hrolf, o ferreiro, reforça a tua arma com Fragmentos de Brasa.',
  'Diz-se que a rainha escrevia cartas que nunca enviou.',
  'Algumas paredes escondem caminhos. Bate nelas.',
  'Abre o inventário com o botão da mochila para ler tudo o que encontraste.',
];
// ---------- inscrições (lore espalhada pelo mundo) ----------
const LORE = {
  l_cripta1: { t: 'Inscrição num caixão', x: 'AQUI DORME QUEM SERVIU. O LUME VELA O SEU SONO.\n\nPor baixo, riscado com uma unha: «o lume já não vela nada»' },
  l_cripta2: { t: 'Placa da Ordem do Véu', x: 'A Ordem do Véu canta aos mortos para que não acordem. Cada irmã aprende uma canção só. A Irmã Odile aprendeu a última: a do funeral da rainha. Nunca chegou a acabá-la.' },
  l_cripta3: { t: 'Lápide quebrada', x: 'Os primeiros a acordar choraram. Os segundos tentaram voltar a deitar-se. Os terceiros pegaram nas espadas. Tu és dos terceiros.' },
  l_cripta4: { t: 'Registo do coveiro', x: 'Noite da Separação. Os sinos tocaram sozinhos. Seis luzes cruzaram o céu como estrelas a cair para o lado errado. Às três da manhã, os caixões começaram a bater por dentro.' },
  l_hub1: { t: 'Altar do Santuário', x: 'Aqui ardia uma das mil chamas menores que o Lume acendia em Vesperal. Todas se apagaram na Noite da Separação. Esta não. Uma menina sem olhos guarda-a com as mãos.' },
  l_hub2: { t: 'Estátua da rainha', x: 'SERAPHINE, RECEPTÁCULO DO LUME. ELA ARDE PARA QUE NÓS DURMAMOS.\n\nAlguém pôs flores secas aos pés da estátua. São recentes.' },
  l_hub3: { t: 'Placa da ponte', x: 'Ponte da Catedral. Levantada por ordem do rei na Noite da Separação. Ninguém entra. Ninguém sai.' },
  l_mur1: { t: 'Ordem de serviço', x: 'Por ordem do rei: os guardas que recusaram servir o cálice serão executados ao amanhecer no pátio das execuções. Carrasco: Tobias, filho de Ansel.' },
  l_mur2: { t: 'Gravado na ameia', x: 'Juramos à rainha, não ao rei. Quando ele mandou abrir o Portão ao bispo, a capitã Brigid fechou-o com o próprio corpo. Que o Lume a guarde.' },
  l_mur3: { t: 'Diário de um besteiro', x: 'Já não sei se disparo contra mortos ou contra vivos. Disparo contra o que mexe. A capitã diz que é o que mantém o juramento. A capitã já não fala.' },
  l_pan1: { t: 'Aviso pregado num poste', x: 'NÃO SIGAM AS VELAS. As velas acendem-se sozinhas desde que a senhora Vesper deixou o palácio. As bruxas dizem que ela está a coser o mundo. As bruxas mentem muito.' },
  l_pan2: { t: 'Página molhada', x: 'O véu não separa a vida da morte. Separa quem lembra de quem esquece. Os mortos que esquecem dormem. Os que lembram... acordam. — Vesper, Tratado do Véu' },
  l_pan3: { t: 'Inscrição na capela', x: 'Vesper era a irmã mais nova. Quando o Lume escolheu Seraphine, Vesper prometeu-lhe que teceria um véu tão fino que ninguém sentiria a dor de morrer. Teceu-o. Mas não foi a tempo para a irmã.' },
  l_bos1: { t: 'Marca num tronco', x: 'Riscado com uma faca de caça: «A princesa passou por aqui. Ninguém a segue. — O.»' },
  l_bos2: { t: 'Placa dos caçadores', x: 'Orin, mestre dos caçadores do rei, ensinou a princesa Selene a disparar antes de ela saber escrever. Quando ela fugiu com a brasa, foi ele quem apagou os rastos. O rei mandou-o procurá-la. Ele nunca voltou.' },
  l_bos3: { t: 'Pedra da clareira', x: 'O bosque ardeu numa só noite, mas não caiu. As árvores ficaram brancas, de pé, como ossos. Os lobos ficaram também. Seguem a lua morta.' },
  l_for1: { t: 'Regras da forja', x: 'PRIMEIRA REGRA: O FOGO NÃO PERDOA. SEGUNDA REGRA: O METAL LEMBRA-SE DE TUDO. TERCEIRA REGRA: NUNCA FORJES O QUE NÃO PODES DESFAZER.\n\nA terceira regra foi raspada.' },
  l_for2: { t: 'Encomenda real', x: 'Um cálice de ouro-negro, com selo de prata lunar. Forma pedida pelo bispo Ozias. Pagamento: o perdão de todas as dívidas da guilda. Assinado: Aldric, rei. Assinado por baixo, a tremer: Hilde.' },
  l_for3: { t: 'Nota de Hrolf (antiga)', x: 'Mestra, a fornalha não se apaga. Já atirei água, areia, cinza. Disseram-me que a vossa voz ainda canta lá dentro. Eu não oiço nada. Não quero ouvir nada.' },
  l_cat1: { t: 'Sermão do bispo', x: 'O Lume é de Deus e não de uma mulher. Se a chama pode ser guardada num cálice, pode ser guardada no altar. E o que está no altar pertence à Igreja. — Ozias, último sermão' },
  l_cat2: { t: 'Confissão (rasgada)', x: '...disse ao rei que a rainha não ia sentir nada. Disse-lhe que a chama passaria para o cálice como água de um copo para outro. Sabia que era mentira. Precisava que ele acreditasse...' },
  l_cat3: { t: 'Trono vazio', x: 'O rei Aldric não se sentou no trono desde a Noite da Separação. Fica de pé, ao lado, de espada na mão, a guardar uma cortina. Atrás da cortina não há nada.' },
  l_mur4: { t: 'Juramento da Guarda', x: 'Eu, guarda da rainha, juro: enquanto ela arder, eu velo. Enquanto ela dormir, eu velo. Se ela se apagar, que eu me apague com ela.\n\nPor baixo, noutra letra, mais recente e mais funda, como se a pedra tivesse sido riscada com a ponta de uma lança: «Ela não se apagou. Então eu também não posso.» — B.' },
  l_pan4: { t: 'Bastidor de Vesper', x: 'Num bastidor de bordar, um véu inacabado, tecido com fios de cinza. Em cada fio há um nome cosido: soldados, criadas, crianças, cães. Milhares.\n\nO último nome está a meio: «SERAPH—». A agulha ainda está espetada no pano, e o fio ainda está quente.' },
  l_bos4: { t: 'Acampamento da princesa', x: 'Uma fogueira apagada há muito, um arco partido, uma tigela de água para a loba.\n\nNum tronco, riscado à faca: «Pai, se leres isto, não venhas. A brasa não é tua. Nunca foi. A mãe deu-ma a mim para que tu não a usasses.»\n\nHá muitos riscos a contar os dias. Pararam no centésimo.' },
  l_for4: { t: 'Bigorna da Mestra', x: 'A bigorna está coberta de marcas de martelo que nunca chegaram a formar nada. A mestra Hilde batia no metal para não ouvir os gritos que vinham da catedral.\n\nJunto à fornalha há um molde de cálice, partido ao meio. Não foi partido com um martelo. Foi partido à mão.' },
  l_cat4: { t: 'Livro de contas do bispo', x: 'Cálice de ouro-negro: pago.\nSilêncio do capitão da guarda: comprado.\nSilêncio da capitã Brigid: recusado.\nSilêncio da mestra Hilde: aceite, com lágrimas.\nPerdão do rei: prometido.\nPerdão de Deus: \n\nA última linha está em branco. O bispo deixou de escrever ali muitas vezes: a página está gasta de tanto a apagar.' },
  l_cor3: { t: 'Altar do Lume', x: 'Foi aqui que a rainha bebeu do cálice, na Noite da Separação. O rei segurava-lhe a mão. O bispo rezava. As filhas estavam proibidas de entrar.\n\nQuando a chama saiu dela, não entrou no cálice. Partiu-se em seis e fugiu para aqueles que ela amava: a irmã que cantava, a capitã que a guardava, a irmã que tecia, a filha que caçava, a mestra que a temia, e o homem que a traiu por amor.\n\nNenhuma brasa foi para o bispo.' },
  l_cor1: { t: 'Voz na luz', x: 'Não há inscrições aqui. Há uma voz. Diz sempre a mesma coisa, em todas as línguas: «Estou tão cansada.»' },
  l_cor2: { t: 'Reflexo', x: 'No espelho de luz vês o teu reflexo. Ele não tem máscara. Por baixo da máscara, ele também não tem cara.' },
};
// ---------- diálogos ----------
const DIALOG = {
  teodoro: [
    { cond: () => !PROG.flags.teo1, lines: ['Ah. Mais um. Abriste o caixão por dentro, não foi? Como todos nós.', 'Chamo-me Teodoro. Era sacristão aqui, quando havia missas. Agora sou só mais um Desperto que não sabe ir embora.', 'Ouve bem, que só digo uma vez. Quando morreres, e vais morrer, acordas na última fogueira em que descansaste.', 'As cinzas que levas contigo ficam onde caíste. Vai buscá-las antes de morreres outra vez, ou perdes tudo.', 'E bebe dos frascos. A luz deles cura. A fogueira volta a enchê-los.', 'Mais à frente há uma galeria. Uma irmã canta lá dentro. Não lhe respondas quando ela cantar.'], set: 'teo1' },
    { cond: () => PROG.bossDown.odile && !PROG.flags.teo2, lines: ['O cântico parou. Foste tu?', 'Então já não há quem nos mande dormir. Isso devia assustar-me mais do que assusta.', 'Sobe ao Santuário. Há lá uma menina que ainda guarda uma chama. Fala com ela.'], set: 'teo2' },
    { lines: () => [pick(['Bate nas paredes. Algumas são mentira.', 'Os mortos voltam quando descansas. Não leves isso a peito. Eles também não.', 'Já fui à fogueira tantas vezes que perdi a conta. Perdi também o nome da minha mãe. Não sei qual dói mais.'])] },
  ],
  teodoro2: [
    { cond: () => !PROG.flags.teo3, lines: ['Desperto! Ainda estás inteiro. Eu também, mais ou menos.', 'Segui-te até aqui. Não me perguntes porquê. Talvez queira ver como isto acaba.', 'Cuidado com a água parada. Há coisas lá dentro que respiram devagar.'], set: 'teo3' },
    { lines: () => ['As bruxas lêem livros que se acendem sozinhos. Eu nunca aprendi a ler. Talvez seja melhor assim.'] },
  ],
  teodoro3: [
    { cond: () => !PROG.flags.teo4, lines: ['...', 'Desperto. És tu? Já não vejo bem as caras. As máscaras parecem-se todas.', 'Fui longe demais. Morri vezes demais. Já não me lembro do que vim fazer.', 'Se eu me levantar e te atacar... não hesites. Promete.'], set: 'teo4' },
    { lines: () => ['...cântico... alguém está a cantar...'] },
  ],
  ione: [
    { cond: () => !PROG.flags.ione1, lines: ['Estás aí? Ouço os teus passos, mas não o teu coração.', 'Chamo-me Ione. Sou a filha mais nova da rainha. Na noite em que o Lume se partiu apanhei uma faísca nas mãos. Foi a última coisa que vi.', 'Seis brasas caíram sobre os que amavam a minha mãe. Enquanto estiverem espalhadas, os mortos não dormem e a minha mãe não descansa.', 'Traz-mas, Desperto. Todas as seis. E o Lume voltará a arder.', 'Descansa junto à chama quando precisares. Ela fortalece a carne de quem lhe oferece cinzas.'], set: 'ione1' },
    { cond: () => PROG.bossDown.odile && !PROG.flags.ione1b, lines: ['A irmã Odile... ela cantava-me para eu adormecer. Tinha uma voz que fazia as velas tremer.', 'Obrigada por a teres calado. Não por mal. Ela estava cansada de cantar.', 'Agora as Muralhas. A capitã Brigid guarda o Portão Interior. Ela não deixa passar ninguém, nem a mim deixaria.'], set: 'ione1b' },
    { cond: () => PROG.bossDown.brigid && !PROG.flags.ione2, lines: ['Brigid... Ela ensinou-me a segurar uma espada de madeira. Dizia que um juramento é uma chama que não se apaga.', 'Para lá do Portão Interior há dois caminhos. Para baixo, o pântano, onde a minha tia Vesper tece o véu. Para cima, o bosque, onde a minha irmã Selene se escondeu.', 'Não sei qual delas te vai doer mais.'], set: 'ione2' },
    { cond: () => PROG.bossDown.vesper && PROG.bossDown.selene && !PROG.flags.ione3, lines: ['A minha tia. A minha irmã. Sinto o calor das brasas delas contigo.', 'O elevador da forja voltou a mexer-se. Lá em baixo está Hilde, a mestra-ferreira.', 'Foi ela que forjou o cálice que partiu a minha mãe. O meu pai pediu-lho. Ela não sabia dizer não ao rei. Ninguém sabia.'], set: 'ione3' },
    { cond: () => PROG.bossDown.hilde && !PROG.flags.ione4, lines: ['A ponte da catedral desceu. O meu pai espera lá dentro.', 'E o bispo Ozias. Foi ele quem lhe disse que a minha mãe não ia sentir nada.', 'Desperto... se vires o meu pai, diz-lhe... Não. Não lhe digas nada. Ele já não ouve.'], set: 'ione4' },
    { cond: () => PROG.bossDown.aldric && !PROG.flags.ione5, lines: ['Então acabou-se. O meu pai.', 'Tens as seis brasas. O selo no chão da capela abriu-se. Leva ao Coração do Lume.', 'Lá está o que restou da minha mãe. Não é ela. Já não é.', 'Quando chegares ao altar, vais perceber o preço. Eu soube-o sempre. Perdoa-me por não to ter dito.'], set: 'ione5' },
    { cond: () => PROG.letters >= 3 && !PROG.flags.ioneL, lines: ['Esse papel... cheira a ela. Lê-mo, por favor.', '...', '«Que seja por escolha, e não por medo.» Ela escreveu isso?', 'Então talvez eu também possa escolher. Se chegares ao altar... lembra-te de mim.'], set: 'ioneL' },
    { lines: () => [pick(['A chama está quente hoje. Deve ser de ti.', 'Às vezes ouço a minha mãe na chama. Diz o meu nome ao contrário.', 'Tem cuidado, Desperto. Gosto de ouvir os teus passos a voltar.'])] },
  ],
  hrolf: [
    { cond: () => !PROG.flags.hrolf1, lines: ['Hm. Mais um morto com uma espada torta.', 'Hrolf. Ferreiro. Aprendiz da mestra Hilde, quando ainda havia mestres.', 'Traz-me Fragmentos de Brasa e eu faço essa lâmina cortar como deve ser. É o que sei fazer. É o que me resta.'], set: 'hrolf1' },
    { cond: () => PROG.bossDown.hilde && !PROG.flags.hrolf2, lines: ['Foste à forja. Cheiras a ela.', '...Ela ensinou-me a não ter medo do fogo. E depois atirou-se para dentro dele.', 'Obrigado. Por a teres deixado descansar. Toma. Fiz isto com o que restava das ferramentas dela.'], set: 'hrolf2', gift: 'tal_brasa' },
    { lines: () => [pick(['Fragmentos. Traz-me fragmentos.', 'O ferro lembra-se de tudo. Por isso é que eu bebo.', 'A mestra dizia que uma boa lâmina tem de ser partida uma vez antes de ser boa. Eu acho que ela falava de pessoas.'])] },
  ],
  maren_walls: [
    { cond: () => !PROG.flags.maren1, lines: ['Alto! ...Ah. És um Desperto. Como eu.', 'Sou a Maren. Procuro o meu irmão, Tobias. Era carrasco nestas muralhas.', 'Se vires um homem enorme com um machado... não o mates logo. Por favor. Diz-lhe que a irmã está à espera.', 'E cuidado com a capitã Brigid, no Portão. O escudo dela pára tudo o que vem de frente.'], set: 'maren1' },
    { cond: () => PROG.bossDown.tobias && !PROG.flags.maren1b, lines: ['Ouvi o machado a cair. Daqui. Ouvi.', '...Ele já não era ele, pois não? Eu sei. Eu sabia.', 'Ele recusou matar os guardas da rainha, no primeiro dia. Mataram-lhe a mulher para o convencer. Depois disso ele nunca mais recusou nada.', 'Fica com isto. Era dele, de antes de ser carrasco. Um juramento que ele quebrou e eu guardei.'], set: 'maren1b', gift: 'tal_escudo' },
    { lines: () => ['Vai. Eu fico aqui mais um pouco.'] },
  ],
  maren_forest: [
    { cond: () => !PROG.flags.maren2, lines: () => PROG.bossDown.tobias ? ['Vim para longe das muralhas. Não conseguia ficar perto do pátio.', 'O bosque é bonito, não é? Branco. Parece que nevou cinza.', 'Há um caçador velho por aqui. Usa uma cabeça de veado. Ouvi-o a falar sozinho sobre uma princesa.'] : ['Ainda não encontrei o meu irmão. Talvez esteja no pátio das execuções, nas Muralhas. Tenho medo de ir ver.', 'Há um caçador velho neste bosque. Usa uma cabeça de veado. Fala sozinho sobre uma princesa.'], set: 'maren2' },
    { lines: () => ['A caçadora Selene era gentil, dizem. Dava de comer aos lobos com a mão.'] },
  ],
  maren_cath: [
    { cond: () => !PROG.flags.maren3, lines: ['Chegámos longe, tu e eu.', 'Não vou entrar na sala do trono. Não tenho coragem. Mas posso deixar-te isto.', 'Lágrima de Lume. Encontrei-a na nave. Bebe por mim.'], set: 'maren3', gift: 'lagrima' },
    { lines: () => ['Vai. O rei espera. E o bispo... o bispo não espera por ninguém.'] },
  ],
};
// ---------- bestiário ----------
const BESTIARY = {
  oco: 'Os primeiros mortos a acordar. Lembram-se de pegar numa espada, mas não de porquê. Atacam com uma estocada longa: espera que a lancem e responde.',
  rastejante: 'Crânios que aprenderam a andar sobre ossos de dedos. Não pensam. Andam até baterem em alguma coisa.',
  vela: 'Uma vela de funeral que não aceitou apagar-se. Lança chamas pequenas que seguem quem foge.',
  soldado: 'Soldados da Guarda da Rainha. O escudo bloqueia de frente: ataca de cima, por trás, ou quebra-lhes a guarda com golpes fortes.',
  besteiro: 'Mantêm a distância. Uma linha vermelha mostra para onde vão disparar.',
  cao: 'Os cães da guarda nunca deixaram de guardar. Saltam de longe; esquiva por baixo do salto.',
  corvo: 'Comem tudo o que cai das muralhas. Ultimamente cai muita coisa.',
  afogado: 'Os que morreram na cheia do pântano. Esperam debaixo da água, só com os olhos de fora.',
  bruxa: 'As bruxas das velas lêem livros que ardem. Desaparecem quando chegas perto: persegue-as depressa.',
  inchado: 'Incham com a água podre do pântano até rebentar. Não estejas por perto quando isso acontecer.',
  mosquito: 'Zumbem. Picam. Zumbem outra vez.',
  lobo: 'Lobos do bosque de cinza. Caçam em matilha e mordem de lado. Seguem a lua morta da princesa.',
  cacador: 'Os caçadores do rei, que procuraram a princesa e nunca voltaram. Disparam em arco e recuam com um salto.',
  ent: 'Árvores que arderam e se levantaram. Lentas, mas as raízes sobem do chão onde estás. Mexe-te.',
  mariposa: 'Mariposas feitas de cinza. O pó das asas pesa como chumbo.',
  ferreiro: 'Os aprendizes de Hilde ainda batem o ferro. O martelo deles levanta ondas de choque: salta-as.',
  salamandra: 'Lagartos de escória que vivem na lava. Cospem fogo em cone.',
  golem: 'Escória que ganhou forma. Quando cai, rebenta.',
  chama: 'Uma chama errante. Corre para ti e explode.',
  cavaleiro: 'Cavaleiros da Catedral, devotos do bispo. Golpes largos e um salto que esmaga.',
  clerigo: 'Os clérigos do Lume curam os aliados e chamam colunas de luz. Mata-os primeiro.',
  gargula: 'Estátuas da catedral que acordam quando passas. Voam e mergulham com lanças.',
  eco: 'O teu próprio eco. Faz o que tu fazes, um pouco antes de ti.',
  vigia: 'Os vigias do Lume guardam o Coração. A lança deixa um rasto de fogo.',
};
const BOSS_LORE = {
  odile: 'Irmã Odile, a Carpideira. Cantava aos mortos da Ordem do Véu. Na Noite da Separação, a brasa do lamento caiu no seu incensário e o cântico nunca mais acabou.',
  tobias: 'Tobias, o Carrasco. Recusou matar os guardas da rainha no primeiro dia; mataram-lhe a mulher. Depois disso, nunca mais recusou nada. A irmã, Maren, ainda o procura.',
  brigid: 'Brigid, a Lança Juramentada. Capitã da Guarda da Rainha. Fechou o Portão Interior ao bispo com o próprio corpo, e o juramento manteve-a de pé.',
  vesper: 'Vesper, Tecelã de Cinzas. Irmã da rainha e tecelã do véu entre a vida e a morte. Quando o véu se rasgou, tentou cosê-lo consigo própria.',
  orin: 'Orin, Mestre dos Caçadores. Ensinou a princesa Selene a disparar e ajudou-a a fugir com a brasa. Ainda apaga os rastos dela, muito depois de ela precisar.',
  selene: 'Selene, a Caçadora da Lua Morta. Primogénita do rei. Fugiu com uma brasa para que o pai não a voltasse a usar. A loba Garra nunca a deixou.',
  hilde: 'Hilde, a Mãe da Forja. Forjou o Cálice da Separação. Quando viu o que ele fez, atirou-se à fornalha com a brasa.',
  ozias: 'Bispo Ozias. Disse ao rei que a rainha não ia sentir nada. Queria o Lume para o altar, e não para Deus.',
  aldric: 'Aldric, o Rei Apagado. Partiu a luz do mundo por medo de a perder. Guarda uma cortina atrás da qual não há nada.',
  seraphine: 'Seraphine, a Rainha do Lume. O receptáculo. O que resta dela já não é ela: é a chama a tentar voltar a ser inteira.',
};
const ENDINGS = {
  lume: { title: 'A Era do Lume', music: 'end_lume', cls: '', text: 'Colocaste as seis brasas no altar e o Lume rugiu outra vez.\nMas o fogo pede algo que arda, e tu eras feito de cinza. Ardeste até não restar nome.\n\nOs mortos de Vesperal voltaram a deitar-se, um a um, como quem regressa a casa depois de uma guerra.\nMaren enterrou o machado do irmão no pátio das execuções. Hrolf apagou, por fim, a fornalha da mestra.\nTeodoro adormeceu sentado nos degraus da cripta, de mãos no colo, a sorrir.\n\nIone guardou a chama por mais mil anos. E às vezes, junto ao fogo, cantava para ti a canção da Irmã Odile.' },
  cinza: { title: 'A Era Cinzenta', music: 'end_cinza', cls: 'dark', text: 'Fechaste a mão sobre as brasas até que esfriassem.\nA escuridão desceu sobre Vesperal, mansa como um lençol.\n\nUm a um, os Despertos ergueram-se e caminharam para o escuro, sem medo e sem lume.\nO Santuário apagou-se. A forja calou-se. A catedral ficou finalmente vazia.\nIone ficou sentada onde antes ardia a chama, de mãos estendidas para um calor que já não vinha.\n\nNinguém voltou a arder por ninguém. Ninguém voltou a ser salvo.\nE, pela primeira vez, ninguém voltou a ser sacrificado.' },
  filha: { title: 'A Filha do Lume', music: 'end_filha', cls: 'light', text: 'Leste-lhe as cartas da mãe e ela escolheu.\nIone pegou nas seis brasas com as mãos que já tinham apanhado uma estrela, e o Lume acendeu-se nelas sem a queimar.\nPela primeira vez, a chama tinha sido aceite, e não tomada.\n\nNo Altar, a sombra de Seraphine pousou a mão na cabeça da filha e desfez-se em luz.\nOs mortos adormeceram. As velas do pântano apagaram-se sozinhas. Os lobos brancos voltaram a uivar à lua.\nMaren, Hrolf e Teodoro deitaram-se à volta da fogueira do Santuário, como uma família cansada.\n\nE tu, pela primeira vez desde que acordaste, sentiste sono.' },
};
