// ===================== HISTÓRIA, ITENS E DIÁLOGOS =====================
const ITEMS = {
  // brasas
  brasa_lamento: { name: 'Brasa do Lamento', kind: 'brasa', desc: 'Caiu no incensário da Irmã Odile na Noite da Separação. Ela cantou o funeral da rainha, e quando os mortos acordaram continuou a cantar, um por um, até não lhe restar voz. A brasa ainda cheira a incenso.' },
  brasa_juramento: { name: 'Brasa do Juramento', kind: 'brasa', desc: 'Arrancada do peito de Brigid, capitã da Guarda da Rainha. Jurou que nenhum vivo passaria o Portão enquanto a rainha vivesse. A rainha morreu; o juramento não. A brasa bate como um coração.' },
  brasa_veu: { name: 'Brasa do Véu', kind: 'brasa', desc: 'Vesper teceu o véu que separava os vivos dos mortos. Quando o Lume se partiu, o véu rasgou-se, e ela tentou cosê-lo com as próprias cinzas. Há fios de luz presos a esta brasa.' },
  brasa_lua: { name: 'Brasa da Lua Morta', kind: 'brasa', desc: 'Selene, primogénita do rei, fugiu com esta brasa para que o pai nunca a encontrasse. O bosque ardeu em volta dela. A brasa é fria como luar.' },
  brasa_forja: { name: 'Brasa da Forja', kind: 'brasa', desc: 'Hilde forjou o Cálice da Separação a pedido do rei. Quando viu o que a sua obra fez, atirou-se à forja com esta brasa. O metal nunca mais arrefeceu.' },
  brasa_rei: { name: 'Brasa do Rei', kind: 'brasa', desc: 'O rei Aldric guardou a última brasa junto ao véu da esposa. Temia a escuridão mais do que a morte, e por isso partiu a luz do mundo. A brasa ainda tem medo.' },
  // chaves
  chave_cripta: { name: 'Chave da Cripta', kind: 'key', desc: 'Chave de ferro de um guarda da cripta. Abre o portão da galeria funerária.' },
  chave_torre: { name: 'Chave da Torre de Vigia', kind: 'key', desc: 'Chave dos besteiros das Muralhas. Abre a torre onde guardavam as armas de longo alcance.' },
  chave_capela: { name: 'Chave da Capela Afogada', kind: 'key', desc: 'Chave coberta de algas. A capela do pântano foi fechada quando a água subiu, com as bruxas lá dentro.' },
  chave_sacristia: { name: 'Chave da Sacristia', kind: 'key', desc: 'Chave dourada dos clérigos do Lume. Abre a sacristia da Catedral.' },
  // cartas (final secreto)
  carta1: { name: 'Carta de Seraphine (I)', kind: 'lore', desc: '«Aldric, meu amor. Hoje o Lume queimou-me as mãos. Não chores. Uma chama precisa de algo que arda, e eu escolhi ser eu. Cuida das meninas.»' },
  carta2: { name: 'Carta de Seraphine (II)', kind: 'lore', desc: '«Ione pergunta porque brilho à noite. Disse-lhe que guardo uma estrela. Ela quer guardar uma também. Que o Lume nunca a escolha. Que nunca escolha a minha filha.»' },
  carta3: { name: 'Carta de Seraphine (III)', kind: 'lore', desc: '«Se algum dia o Lume se partir, não o reacendas comigo. Deixa-me dormir. Mas se alguém tiver de arder, que seja por escolha, e não por medo. Esse é o único fogo que dura.»' },
  // melhorias e materiais
  lagrima: { name: 'Lágrima de Lume', kind: 'upgrade', desc: 'Uma gota da Chama Primeira, endurecida em vidro. Aumenta em um o número de Frascos de Lume.' },
  cinza_bendita: { name: 'Cinza Bendita', kind: 'upgrade', desc: 'Cinza recolhida no altar da rainha. Misturada aos frascos, torna a cura mais forte.' },
  fragmento: { name: 'Fragmento de Brasa', kind: 'mat', desc: 'Lasca de uma brasa que se partiu ao cair. Hrolf, o ferreiro, usa-os para reforçar armas.' },
  cinzas_pequenas: { name: 'Cinzas de um Desperto', kind: 'cinzas', n: 250, desc: 'Restos de alguém que, como tu, acordou sem saber porquê. Concede 250 cinzas.' },
  cinzas_soldado: { name: 'Cinzas de um Soldado', kind: 'cinzas', n: 800, desc: 'Um soldado da guarda, que morreu de pé. Concede 800 cinzas.' },
  cinzas_heroi: { name: 'Cinzas de um Herói Esquecido', kind: 'cinzas', n: 2500, desc: 'Ninguém se lembra do nome dele. As cinzas lembram. Concede 2500 cinzas.' },
  // armas
  w_axe: { name: 'Machado do Carrasco', kind: 'weapon', wid: 'axe', desc: 'Machado de duas mãos do carrasco das Muralhas. Lento e pesado. Cada golpe forte faz o chão tremer.' },
  w_daggers: { name: 'Adagas da Caçadora', kind: 'weapon', wid: 'daggers', desc: 'Par de adagas leves que Selene usava para terminar o que o arco começava. Golpes rápidos e encadeados.' },
  w_greatsword: { name: 'Espada do Rei Apagado', kind: 'weapon', wid: 'greatsword', desc: 'A espada grande de Aldric. A lâmina ficou negra na noite em que ele partiu o Lume, e ainda arde por dentro.' },
  // habilidades
  sk_arco: { name: 'Arco Longo de Vesperal', kind: 'skill', sid: 'arco', desc: 'Arco dos besteiros da torre. Dispara flechas no alvo travado. Não gasta foco.' },
  sk_fogo: { name: 'Livro das Velas', kind: 'skill', sid: 'fogo', desc: 'As bruxas do pântano aprenderam a acender as velas sem as tocar. Lança uma bola de fogo que explode.' },
  sk_giro: { name: 'Cinza de Guerra: Giro do Lobo', kind: 'skill', sid: 'giro', desc: 'Técnica dos caçadores do bosque: girar duas vezes com a arma estendida, como um lobo cercado.' },
  sk_salto: { name: 'Cinza de Guerra: Salto da Bigorna', kind: 'skill', sid: 'salto', desc: 'Os ferreiros da forja diziam que um martelo só bate de verdade quando cai do alto. Salta sobre o inimigo e esmaga o chão.' },
  sk_passo: { name: 'Passo Sombrio', kind: 'skill', sid: 'passo', desc: 'O rei aprendeu a atravessar a sombra para estar sempre ao lado da rainha. Teletransporta-te para as costas do inimigo e golpeia.' },
  sk_luz: { name: 'Lança de Luz', kind: 'skill', sid: 'luz', desc: 'Um fragmento da luz da rainha, ainda puro. Atira uma lança de luz que atravessa tudo o que encontra.' },
  // talismãs
  tal_vigor: { name: 'Talismã do Coração de Pedra', kind: 'tal', tid: 'tal_vigor', desc: 'Aumenta a vida máxima.' },
  tal_folego: { name: 'Talismã do Fôlego de Lobo', kind: 'tal', tid: 'tal_folego', desc: 'Recuperas a energia mais depressa.' },
  tal_brasa: { name: 'Talismã da Brasa Fria', kind: 'tal', tid: 'tal_brasa', desc: 'Reduz o dano de fogo recebido.' },
  tal_pena: { name: 'Talismã da Pena Cinzenta', kind: 'tal', tid: 'tal_pena', desc: 'A rolagem dura mais tempo invulnerável.' },
  tal_escudo: { name: 'Talismã do Juramento', kind: 'tal', tid: 'tal_escudo', desc: 'Reduz todo o dano recebido.' },
  tal_foco: { name: 'Talismã da Vela Eterna', kind: 'tal', tid: 'tal_foco', desc: 'Aumenta o foco e a sua recuperação.' },
  tal_lua: { name: 'Talismã da Lua Morta', kind: 'tal', tid: 'tal_lua', desc: 'Aumenta o dano das habilidades.' },
  tal_furia: { name: 'Talismã da Última Faísca', kind: 'tal', tid: 'tal_furia', desc: 'Com pouca vida, causas muito mais dano.' },
};
const AREA_NAMES = { crypt: 'Cripta dos Esquecidos', hub: 'Santuário da Última Chama', walls: 'Muralhas de Vesperal', swamp: 'Pântano das Velas', forest: 'Bosque de Cinza', forge: 'Forja Profunda', cathedral: 'Catedral Apagada', heart: 'Coração do Lume' };
const INTRO_TEXT = [
  'No princípio havia o Lume. E enquanto ele ardia, os mortos dormiam.',
  'A rainha Seraphine guardava a chama dentro de si. Cada dia mais luz. Cada dia menos carne.',
  'O rei Aldric não suportou vê-la arder. Mandou forjar um cálice para lhe arrancar o Lume.',
  'Mas o Lume não aceita dono. Partiu-se em seis brasas, que caíram sobre os mais próximos da rainha.',
  'O reino de Vesperal cobriu-se de cinza. E os mortos... acordaram.',
  'Tu és um deles.'
];
const TIPS = [
  'Rola através do golpe, não para longe dele.', 'Cada chefe tem uma barra dourada de postura. Quando enche, ataca: o próximo golpe é crítico.', 'Golpes pelas costas causam dano crítico.',
  'Ao morrer, as tuas cinzas ficam onde caíste. Volta para as buscar.', 'Descansar numa fogueira cura-te, mas traz os mortos de volta.', 'Segura o botão de rolar para correr.',
  'Mantém o ataque pesado premido para o carregar.', 'Os inimigos com escudo bloqueiam golpes de frente. Contorna-os ou quebra-lhes a guarda.',
  'Hrolf, o ferreiro, reforça a tua arma com Fragmentos de Brasa.', 'Diz-se que a rainha escrevia cartas que nunca enviou.', 'As fogueiras acesas permitem viajar entre si.',
  'Um chefe que te vê a beber um frasco ataca sem piedade.', 'Algumas paredes escondem caminhos. Algumas portas só abrem por dentro.'
];
// ---------- diálogos ----------
const DIALOG = {
  ione: [
    { cond: () => !PROG.flags.ione1, lines: ['Estás aí? Ouço os teus passos, mas não o teu coração.', 'Chamo-me Ione. Guardo esta chama, a última. Apanhei-a nas mãos na noite em que o Lume se partiu. Foi a última coisa que vi.', 'Seis brasas caíram sobre os que amavam a minha mãe. Enquanto estiverem espalhadas, os mortos não dormem.', 'Traz-mas, Desperto. Todas. E o Lume voltará a arder.', 'Descansa junto à chama quando precisares. Ela fortalece a carne de quem lhe oferece cinzas.'], set: 'ione1' },
    { cond: () => PROG.bossDown.brigid && !PROG.flags.ione2, lines: ['Brigid... Ela ensinou-me a segurar uma espada de madeira. Dizia que um juramento é uma chama que não se apaga.', 'Para lá do Portão Interior há dois caminhos. O pântano, onde a minha tia Vesper tece o véu. E o bosque, onde a minha irmã Selene se escondeu.', 'Não sei qual delas te vai doer mais.'], set: 'ione2' },
    { cond: () => PROG.bossDown.vesper && PROG.bossDown.selene && !PROG.flags.ione3, lines: ['A minha tia. A minha irmã. Sinto o calor das brasas delas contigo.', 'O elevador da forja voltou a mexer-se. Lá em baixo está Hilde, a mestra-ferreira.', 'Foi ela que forjou o cálice que partiu a minha mãe. O meu pai pediu-lho. Ela não sabia dizer não ao rei.'], set: 'ione3' },
    { cond: () => PROG.bossDown.hilde && !PROG.flags.ione4, lines: ['A ponte da catedral desceu. O meu pai espera lá dentro.', 'Desperto... se o vires, diz-lhe... Não. Não lhe digas nada. Ele já não ouve.'], set: 'ione4' },
    { cond: () => PROG.bossDown.aldric && !PROG.flags.ione5, lines: ['Então acabou-se. O meu pai.', 'Tens as seis brasas. O caminho para o Coração do Lume abriu-se atrás de mim.', 'Lá está o que restou da minha mãe. Não é ela. Já não é.', 'Quando chegares ao altar, vais perceber o preço. Eu soube-o sempre. Perdoa-me por não to ter dito.'], set: 'ione5' },
    { cond: () => PROG.letters >= 3 && !PROG.flags.ioneL, lines: ['Esse papel... cheira a ela. Lê-mo, por favor.', '...', '«Que seja por escolha, e não por medo.» Ela escreveu isso?', 'Então talvez eu também possa escolher.'], set: 'ioneL' },
    { lines: () => [pick(['A chama está quente hoje. Deve ser por tua causa.', 'Descansa. A cinza espera.', 'Ouço o vento nas Muralhas. Soa como alguém a chamar.', 'A minha mãe cantava enquanto ardia. Lembras-te de alguma canção?'])] },
  ],
  hrolf: [
    { cond: () => !PROG.flags.hrolf1, lines: ['Hm. Mais um morto com uma espada torta.', 'Hrolf. Ferreiro. Aprendiz da mestra Hilde, quando ainda havia mestres.', 'Traz-me Fragmentos de Brasa e eu faço essa lâmina cortar como deve ser.'], set: 'hrolf1' },
    { cond: () => PROG.bossDown.hilde && !PROG.flags.hrolf2, lines: ['Foste à forja. Cheiras a ela.', '...Ela ensinou-me a não ter medo do fogo. E depois atirou-se para dentro dele.', 'Obrigado. Por a teres deixado descansar.'], set: 'hrolf2', gift: 'tal_brasa' },
    { lines: () => ['Fragmentos de Brasa. É isso que eu preciso.'] },
  ],
  maren_walls: [{ cond: () => !PROG.flags.maren1, lines: ['Alto! ... Ah, és um Desperto. Como eu.', 'Sou a Maren. Procuro o meu irmão, Tobias. Era carrasco nestas muralhas.', 'Se vires um homem enorme com um machado... não o mates logo. Por favor.', 'E cuidado com a capitã Brigid no Portão. Ela bloqueia tudo o que vem de frente. Rodeia-a.'], set: 'maren1' }, { lines: () => ['O meu irmão... já o viste?'] }],
  maren_forest: [{ cond: () => !PROG.flags.maren2, lines: () => PROG.flags.carrasco ? ['Encontraste o Tobias, não foi? Vejo nos teus olhos.', '...Ele já não era ele. Eu sei. Obrigada por o teres libertado.', 'Toma. Era dele. Um juramento que ele cumpriu até ao fim.'] : ['Ainda não encontrei o meu irmão.', 'Este bosque está cheio de lobos. Ouve-os antes de os veres.'], set: 'maren2', gift: () => PROG.flags.carrasco ? 'tal_escudo' : null }, { lines: () => ['A caçadora Selene era gentil, dizem. Antes do fogo.'] }],
  maren_cath: [{ cond: () => !PROG.flags.maren3, lines: ['Chegámos longe, tu e eu.', 'Não vou entrar na sala do trono. Não tenho coragem. Mas posso deixar-te isto.', 'Lágrima de Lume. Encontrei-a no caminho. Bebe por mim.'], set: 'maren3', gift: 'lagrima' }, { lines: () => ['Vai. O rei espera.'] }],
};
const ENDINGS = {
  lume: { title: 'A Era do Lume', music: 'end_lume', text: 'Colocaste as seis brasas no altar e o Lume rugiu outra vez. Mas o fogo pede algo que arda, e tu eras feito de cinza. Ardeste até não restar nome. Os mortos de Vesperal voltaram a dormir. Ione guardou a chama por mais mil anos e, às vezes, junto ao fogo, cantava para ti.' },
  cinza: { title: 'A Era Cinzenta', music: 'end_cinza', text: 'Fechaste a mão sobre as brasas até que esfriassem. A escuridão desceu sobre Vesperal, mansa como um lençol. Um a um, os Despertos ergueram-se e ajoelharam-se diante do novo senhor das cinzas. Ione não se ajoelhou. Ficou junto à última fogueira, até que ela também se apagou.' },
  filha: { title: 'A Filha do Lume', music: 'end_filha', text: 'Leste-lhe as cartas da mãe e ela escolheu. Ione pegou nas seis brasas com as mãos que já tinham apanhado uma estrela, e o Lume acendeu-se dentro dela, sem medo. Pela primeira vez desde aquela noite, ela viu: viu-te a ti. Os mortos dormiram. Tu também. E no Santuário, a chama nunca mais tremeu.' },
};
