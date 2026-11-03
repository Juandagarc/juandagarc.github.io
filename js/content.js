// All copy for the museum, in both languages. Real content from juandagarc.com.

export const LINKS = {
  github: 'https://github.com/Juandagarc',
  linkedin: 'https://www.linkedin.com/in/juandagarc',
  instagram: 'https://www.instagram.com/juanda_garc/',
  email: 'contact@juandagarc.com',
  // the contact form posts here (FormSubmit: no backend of my own, it forwards each message to the address)
  form: 'https://formsubmit.co/ajax/contact@juandagarc.com',
};

// Every piece on show, in tour order, with the tool it was made with. `img: null` shows a title card instead.
export const PROJECTS = [
  // featured
  { id: 'siv', inv: 'JDG-F01', url: null, img: 'assets/projects/siv.webp', name: 'SIV-IA', tech: 'FastAPI · Next.js · PostgreSQL · Docker', private: true },
  // work
  { id: 'reachmyleads', inv: 'JDG-W01', url: 'https://reachmyleads.com/', img: 'assets/projects/reachmyleads.webp', name: 'Reach My Leads', tech: 'Next.js · NestJS · AWS · Docker' },
  { id: 'elpaisa', inv: 'JDG-W02', url: 'https://elpaisamultiservices.com/', img: 'assets/projects/elpaisa.webp', name: 'El Paisa Multiservices', tech: 'Laravel' },
  { id: 'gmoscape', inv: 'JDG-W03', url: 'https://www.gmoscape.com/', img: 'assets/projects/gmoscape.webp', name: 'Gmoscape Contractor', tech: 'Laravel' },
  { id: 'mrpct', inv: 'JDG-W04', url: 'https://mrpct.org/', img: 'assets/projects/mrpct.webp', name: 'María Reina de la Paz', tech: 'Laravel' },
  // freelance
  { id: 'limo', inv: 'JDG-L01', url: 'https://1reliablelimo.com/', img: 'assets/projects/limo.webp', name: 'Reliable Luxury Car & Limousine', tech: 'Astro' },
  { id: 'stellar', inv: 'JDG-L02', url: 'https://stellargroupnyc.com/', img: 'assets/projects/stellar.webp', name: 'Stellar Group NYC', tech: 'PHP', year: 2026 },
  { id: 'reliable', inv: 'JDG-L03', url: 'https://reliabledevelopments.com/', img: 'assets/projects/reliable.webp', name: 'Reliable Developments', tech: 'Astro', year: 2025 },
  { id: 'box33', inv: 'JDG-L04', url: 'https://box33cf.com/', repo: 'https://github.com/Juandagarc/box-33', img: 'assets/projects/box33.webp', name: 'BOX33 CrossFit', tech: 'Next.js · NestJS · PostgreSQL' },
  { id: 'mavecure', inv: 'JDG-L05', url: 'https://mavecure.com/', img: 'assets/projects/mavecure.webp', name: 'Mavecure', tech: 'WordPress' },
  { id: 'mosh', inv: 'JDG-L06', url: 'https://moshandcorp.com.co/', img: 'assets/projects/mosh.webp', name: 'Mosh and Corp', tech: 'WordPress' },
  // ventures
  { id: 'resto', inv: 'JDG-V01', url: 'https://menu.juandagarc.com/', img: 'assets/projects/resto.webp', name: 'Resto', tech: 'NestJS · Next.js · PostgreSQL', founder: true },
  { id: 'tiki', inv: 'JDG-V02', url: 'https://tiki-col.com/', img: 'assets/projects/tiki.webp', name: 'TIKI', tech: 'Web3 · Solidity · ERC-4337', founder: true },
  // social work
  { id: 'bomberos', inv: 'JDG-S01', url: 'https://bomberos.juandagarc.com/', img: 'assets/projects/bomberos.webp', name: 'Bomberos La Virginia', tech: 'React · Vite', repo: 'https://github.com/Juandagarc/bomberos-la-virginia', social: true },
];
export const projectIndex = (id) => PROJECTS.findIndex((p) => p.id === id);

// One stop per showcase, in this order: the featured piece, work for companies, freelance, my own ventures, social work.
export const SHOWCASES = [
  { id: 'siv', room: 3, items: ['siv'], featured: true },
  { id: 'rml', room: 4, items: ['reachmyleads'] },
  { id: 'ingesoft', room: 4, items: ['elpaisa', 'gmoscape', 'mrpct'] },
  { id: 'custom', room: 5, items: ['limo', 'stellar', 'reliable', 'box33'] },
  { id: 'wordpress', room: 5, items: ['mavecure', 'mosh'] },
  { id: 'resto', room: 6, items: ['resto'] },
  { id: 'tiki', room: 6, items: ['tiki'] },
  { id: 'social', room: 7, items: ['bomberos'] },
];

export const WORK = [
  { key: 'wp', months: 12 },
  { key: 'lv', months: 12 },
  { key: 'nn', months: 7 },
  { key: 'fl', months: 6 },
];

export const EDU = [
  { year: 2023, key: 'utp' },
  { year: 2025, key: 'insa' },
  { year: 2027, key: 'grad', future: true },
];

export const ROOMS = ['entrance', 'about', 'journey', 'featured', 'career', 'freelance', 'ventures', 'social', 'contact'];

export const T = {
  en: {
    artist: 'Juan David (Juandagarc)',
    ui: {
      pageTitle: 'Juandagarc · Portfolio',
      loading: 'Loading the portfolio',
      loadingSub: 'Polishing the glass',
      scroll: 'Scroll to enter',
      viewPiece: 'View project',
      view: 'View',
      visit: 'Visit site',
      code: 'View code',
      close: 'Close',
      soundOn: 'Sound on',
      soundOff: 'Sound off',
      map: 'Journey',
      room: 'Room',
      medium: 'Medium',
      type: 'Type',
      duration: 'Duration',
      role: 'Role',
      collection: 'Portfolio',
      tryKeys: 'Play the keys',
      scale: 'Scale · 1 month = 20 cm',
      total: 'In total',
      expected: 'expected',
      dragHint: 'Hover the glass letters',
      write: 'Write to me',
      fallback: 'Your browser could not start the 3D view, so here is the text version.',
    },
    months: (m) => (m === 12 ? '1 year' : `${m} months`),
    monthsShort: (m) => `${m} mo`,
    rooms: { entrance: 'Entrance', about: 'About me', journey: 'Journey', featured: 'Featured', career: 'Work', freelance: 'Freelance', ventures: 'Ventures', social: 'Social work', contact: 'Contact' },
    sculptures: { venus: 'Venus de Milo', doryphoros: 'Doryphoros · Polykleitos', david: 'Head of David · Michelangelo' },
    game: {
      play: 'Play',
      cta: 'Play the minigame',
      kicker: 'Minigame',
      title: 'Break the glass',
      intro: 'David has come down from his pedestal with a gun. Every technology I work with is cast in glass: run, jump between walls and shoot them all down, as fast as you can.',
      controls: [['A D · ← →', 'run'], ['Space · W', 'jump, double jump with a flip, wall jump'], ['S · ↓ · C', 'crouch (running: slide)'], ['Mouse', 'aim and shoot, behind you too'], ['F', 'shoot ahead'], ['R', 'restart'], ['Esc', 'leave']],
      touch: 'On a phone: the arrows run, ⤒ jumps, ⤓ crouches (running, it slides), and a tap on the scene shoots there.',
      start: 'Start',
      loading: 'Waking the statue…',
      bricks: 'Glass',
      time: 'Time',
      best: 'Best',
      exit: 'Leave',
      done: 'All the glass is broken',
      newBest: 'New record',
      again: 'Play again',
    },
    hero: {
      eyebrow: 'Portfolio · Juandagarc',
      words: ['Building', 'experiences', 'that', 'last'],
      sub: 'Juan David — Full Stack & AI Engineer. Every project here is something I built.',
    },
    about: {
      title: 'About me',
      paragraphs: [
        "I'm Juan David, a full stack and AI engineer. I'm 21: the perfect age to hear “you're too young” while I ship AI systems to production.",
        "I like building things that solve real problems and, while I'm at it, change the world a little. These days I live in the backend, but I'll take on any stack, no drama. Away from code: water polo and music, piano first.",
      ],
      interests: ['AI', 'Backend', 'Water polo', 'Piano'],
      portrait: 'Portrait',
      piece: 'Grand piano, glass',
      pieceSub: 'Play the keys'
    },
    edu: {
      title: 'Education',
      lead: 'The years in blown glass, set on a line, two metres for every year. 2027 is only a rim of light: it has not happened yet.',
      utp: { name: 'Universidad Tecnológica de Pereira', note: 'Systems engineering' },
      insa: { name: 'INSA Toulouse', note: 'Exchange · France' },
      grad: { name: 'UTP graduation', note: 'Expected' },
    },
    work: {
      title: 'Experience',
      lead: 'A cluster of quartz: each crystal is exactly as tall as the time I spent in the role.',
      wp: 'WordPress developer',
      lv: 'Laravel + Vue.js developer',
      nn: 'Next.js + NestJS developer',
      fl: 'Full stack freelancer',
    },
    projects: {
      siv: { type: 'SaaS · AI sales agents on WhatsApp', role: 'Head of Development & Software Architect · Makeka Studios', desc: 'Multi-tenant SaaS of AI sales agents on WhatsApp Business with Wompi payments. Layered agents (RAG knowledge, behaviour, per-client customisation), Whisper voice notes and GPT-4o Vision, in-chat payment links reconciled by HMAC-SHA256 webhooks.' },
      reachmyleads: { type: 'Web app · AI calling', role: 'Full Stack Developer · Jun – Dec 2025', desc: 'Next.js and NestJS apps integrating AI with automated calling, deployed on AWS with Docker.' },
      elpaisa: { type: 'Business website', desc: 'Site for a money-transfer and multiservices business in Hartford, Connecticut.' },
      gmoscape: { type: 'Business website', desc: 'Site for a hardscape and masonry contractor in East Hartford, Connecticut.' },
      mrpct: { type: 'Shrine website', desc: 'Site for the María Reina de la Paz Shrine in Hartford, Connecticut.' },
      reliable: { type: 'Business website', role: 'Freelance · 2025', desc: 'Site for a certified flooring and general contracting company serving New York, the Tri-State area and Colombia.' },
      stellar: { type: 'Business website', role: 'Freelance · 2026', desc: 'Site for a professional residential and commercial cleaning company in New York City and New Jersey.' },
      box33: { type: 'Gym website & store', desc: 'Site and store for BOX33, a CrossFit box: plans, schedules and the daily WOD, a shop paid through Wompi and a panel where the coach runs it all. Bilingual, in a Turborepo monorepo with its own API.' },
      mavecure: { type: 'Online store', desc: 'Store for handmade jewellery made in Colombia, Miyuki and Swarovski certified, with collections inspired by nature.' },
      mosh: { type: 'Business website', desc: 'Site for Mosh and Corp SAS, a services company.' },
      limo: { type: 'Business website', desc: 'Site for a veteran-owned luxury car and limousine service in New York City, with booking for airport transfers, point-to-point, hourly and event rides. Rebuilt from WordPress.' },
      resto: { type: 'SaaS · Restaurants', role: 'Founder', desc: 'Multi-tenant SaaS in daily use by restaurants: QR menus, tables, kitchen orders, inventory, and checkout with Colombian DIAN e-invoicing and 80 mm thermal printing. 44 releases shipped through CI/CD with quality gates and vulnerability scanning.' },
      bomberos: { type: 'Volunteer fire brigade website', role: 'Volunteer developer', desc: 'Site for the Volunteer Fire Brigade of La Virginia, Risaralda, serving since 1963: its history, operations, crew, gallery and a call for new volunteers. Built for free, as social work.' },
      tiki: { type: 'Web3 ticketing platform', role: 'Founder', desc: 'Tickets for the best events in Colombia — music, sports, theatre — with an anti-fraud queued purchase flow and NFT tickets (ERC-4337).' },
    },
    showcase: {
      tool: 'Tool',
      madeWith: (t) => `Made with ${t}`,
      private: 'Private platform · no public access',
      inDev: 'In development',
      noCapture: 'No public capture',
      featured: 'Featured',
      live: 'In production',
      founder: 'Founder',
      socialBadge: 'Social work',
      siv: { title: 'SIV-IA', highlights: [['10+', 'clients in production'], ['11,000+', 'leads a month for the largest one'], ['2 devs', 'led, with 70%+ test coverage in CI/CD']] },
      rml: { title: 'Reach My Leads' },
      ingesoft: { title: 'Ingenuity & Solutions', kicker: 'Backend Developer · Jun 2024 – May 2025', lead: 'Remote for a consultancy in Connecticut: Laravel/PHP REST APIs and MySQL databases for US clients, around nine of them served continuously. These are the highlights.' },
      custom: { title: 'Astro, PHP & Next.js', kicker: 'Freelance · 2025 – 2026', lead: 'I work with whichever tool the job calls for, or the one that fits the business best. Reliable Limousine and Reliable Developments are built with Astro, Stellar Group with PHP, and BOX33 with Next.js and NestJS.' },
      wordpress: { title: 'WordPress', kicker: 'Freelance · 2023 – 2024', lead: 'Commissioned builds: sites I was paid to build and hand over to the client.' },
      resto: { title: 'Resto' },
      tiki: { title: 'TIKI' },
      social: { title: 'Bomberos La Virginia' },
    },
    contact: {
      title: "Let's connect",
      body: "I'm always open to discussing product design work or partnership opportunities.",
      piece: 'The mark, </>',
      pieceSub: 'Blown glass · my signature',
      credit: 'Sculptures: 3D scans of casts in the Royal Cast Collection, SMK – National Gallery of Denmark (CC0). Head of David: “Head Of Michelangelo\'s David, Optimised” by nebulousflynn1, Zenodo, CC BY 4.0, from an SMK scan. All reduced to low-poly meshes for this site.',
      music: ['Music: Frédéric Chopin, ', 'Ballade No. 1 in G minor, Op. 23', ', performed by Frank Lévy for Musopen (', 'CC BY 4.0', '), trimmed to start on the first note.'],
      form: {
        kicker: 'Contact', title: 'Write to me', lead: 'A project, a role or an idea: tell me about it. It lands straight in my inbox.',
        name: 'Name', email: 'Email', subject: 'Subject', optional: 'optional', message: 'Message',
        send: 'Send message', sending: 'Sending…', sent: "Sent! I'll write back soon.",
        invalid: 'Fill in your name, a valid email and a message.', error: "It didn't go through. You can write to me directly:",
        direct: 'Or straight to', copy: 'Copy', copied: 'Copied',
      },
    },
  },

  es: {
    artist: 'Juan David (Juandagarc)',
    ui: {
      pageTitle: 'Juandagarc · Portafolio',
      loading: 'Cargando el portafolio',
      loadingSub: 'Puliendo el vidrio',
      scroll: 'Desliza para entrar',
      viewPiece: 'Ver proyecto',
      view: 'Ver',
      visit: 'Visitar sitio',
      code: 'Ver código',
      close: 'Cerrar',
      soundOn: 'Sonido activo',
      soundOff: 'Sonido apagado',
      map: 'Trayectoria',
      room: 'Sala',
      medium: 'Técnica',
      type: 'Tipo',
      duration: 'Duración',
      role: 'Cargo',
      collection: 'Portafolio',
      tryKeys: 'Toca las teclas',
      scale: 'Escala · 1 mes = 20 cm',
      total: 'En total',
      expected: 'prevista',
      dragHint: 'Pasa el cursor por las letras',
      write: 'Escríbeme',
      fallback: 'Tu navegador no pudo iniciar la vista 3D, así que aquí tienes la versión en texto.',
    },
    months: (m) => (m === 12 ? '1 año' : `${m} meses`),
    monthsShort: (m) => `${m} m`,
    rooms: { entrance: 'Entrada', about: 'Sobre mí', journey: 'Trayectoria', featured: 'Destacado', career: 'Trabajo', freelance: 'Freelance', ventures: 'Emprendimientos', social: 'Obra social', contact: 'Contacto' },
    sculptures: { venus: 'Venus de Milo', doryphoros: 'Doríforo · Policleto', david: 'Cabeza del David · Miguel Ángel' },
    game: {
      play: 'Jugar',
      cta: 'Jugar el minijuego',
      kicker: 'Minijuego',
      title: 'Rompe el cristal',
      intro: 'David bajó de su pedestal con un arma. Cada tecnología con la que trabajo está hecha de cristal: corre, salta entre paredes y rómpelas todas, lo más rápido que puedas.',
      controls: [['A D · ← →', 'correr'], ['Espacio · W', 'saltar, doble salto con mortal, salto de pared'], ['S · ↓ · C', 'agacharse (corriendo: deslizarse)'], ['Mouse', 'apuntar y disparar, también hacia atrás'], ['F', 'disparar al frente'], ['R', 'reiniciar'], ['Esc', 'salir']],
      touch: 'En el celular: las flechas corren, ⤒ salta, ⤓ agacha (corriendo, desliza) y un toque en la escena dispara ahí.',
      start: 'Empezar',
      loading: 'Despertando la estatua…',
      bricks: 'Cristales',
      time: 'Tiempo',
      best: 'Récord',
      exit: 'Salir',
      done: 'Rompiste todo el cristal',
      newBest: 'Nuevo récord',
      again: 'Jugar otra vez',
    },
    hero: {
      eyebrow: 'Portafolio · Juandagarc',
      words: ['Construyendo', 'experiencias', 'que', 'perduran'],
      sub: 'Juan David — Full Stack & AI Engineer. Cada proyecto que ves aquí lo construí yo.',
    },
    about: {
      title: 'Sobre mí',
      paragraphs: [
        'Soy Juan David, ingeniero full stack y de IA. Tengo 21 años: la edad perfecta para que me digan «estás muy joven» mientras pongo sistemas de IA en producción.',
        'Me gusta construir cosas que resuelvan problemas reales y, de paso, cambien un poco el mundo. Hoy vivo en el backend, pero me adapto a cualquier stack sin drama. Fuera del código: waterpolo y música, con el piano a la cabeza.',
      ],
      interests: ['IA', 'Backend', 'Waterpolo', 'Piano'],
      portrait: 'Retrato',
      piece: 'Piano de cola, vidrio',
      pieceSub: 'Toca las teclas'
    },
    edu: {
      title: 'Educación',
      lead: 'Los años en vidrio soplado, sobre una línea, dos metros por cada año. 2027 es solo un borde de luz: todavía no ha pasado.',
      utp: { name: 'Universidad Tecnológica de Pereira', note: 'Ingeniería de sistemas' },
      insa: { name: 'INSA Toulouse', note: 'Intercambio · Francia' },
      grad: { name: 'Grado UTP', note: 'Previsto' },
    },
    work: {
      title: 'Experiencia',
      lead: 'Un racimo de cuarzo: cada cristal mide exactamente el tiempo que estuve en el cargo.',
      wp: 'Desarrollador WordPress',
      lv: 'Desarrollador Laravel + Vue.js',
      nn: 'Desarrollador Next.js + NestJS',
      fl: 'Freelancer full stack',
    },
    projects: {
      siv: { type: 'SaaS · Agentes de venta con IA en WhatsApp', role: 'Head of Development y arquitecto de software · Makeka Studios', desc: 'SaaS multi-empresa de agentes de venta con IA en WhatsApp Business con pagos Wompi. Agentes por capas (conocimiento RAG, comportamiento, personalización por cliente), notas de voz con Whisper y GPT-4o Vision, links de pago en el chat conciliados con webhooks HMAC-SHA256.' },
      reachmyleads: { type: 'App web · Llamadas con IA', role: 'Desarrollador full stack · jun – dic 2025', desc: 'Apps en Next.js y NestJS que integran IA con llamadas automáticas, desplegadas en AWS con Docker.' },
      elpaisa: { type: 'Sitio corporativo', desc: 'Sitio para un negocio de envíos de dinero y multiservicios en Hartford, Connecticut.' },
      gmoscape: { type: 'Sitio corporativo', desc: 'Sitio para un contratista de paisajismo y mampostería en East Hartford, Connecticut.' },
      mrpct: { type: 'Sitio de santuario', desc: 'Sitio del Santuario María Reina de la Paz en Hartford, Connecticut.' },
      reliable: { type: 'Sitio corporativo', role: 'Freelance · 2025', desc: 'Sitio para una empresa de pisos certificados y construcción general en Nueva York, el área Tri-State y Colombia.' },
      stellar: { type: 'Sitio corporativo', role: 'Freelance · 2026', desc: 'Sitio para una empresa de limpieza residencial y comercial en Nueva York y Nueva Jersey.' },
      box33: { type: 'Sitio y tienda de gimnasio', desc: 'Sitio y tienda para BOX33, un box de CrossFit: planes, horarios y el WOD del día, tienda con pagos por Wompi y un panel donde el coach administra todo. Bilingüe, en un monorepo con Turborepo y API propia.' },
      mavecure: { type: 'Tienda en línea', desc: 'Tienda de joyería artesanal hecha en Colombia, con certificación Miyuki y Swarovski y colecciones inspiradas en la naturaleza.' },
      mosh: { type: 'Sitio corporativo', desc: 'Sitio para Mosh and Corp SAS, una empresa de servicios.' },
      limo: { type: 'Sitio corporativo', desc: 'Sitio para un servicio de autos de lujo y limusinas en Nueva York, de dueños veteranos, con reservas para aeropuerto, traslados, servicio por horas y eventos. Rehecho desde WordPress.' },
      resto: { type: 'SaaS · Restaurantes', role: 'Fundador', desc: 'SaaS multi-empresa que usan restaurantes a diario: carta con QR, mesas, comandas a cocina, inventario y caja con factura electrónica DIAN e impresión térmica de 80 mm. 44 versiones publicadas con CI/CD, controles de calidad y escaneo de vulnerabilidades.' },
      bomberos: { type: 'Sitio de bomberos voluntarios', role: 'Desarrollador voluntario', desc: 'Sitio del Cuerpo de Bomberos Voluntarios de La Virginia, Risaralda, en servicio desde 1963: historia, operaciones, tripulación, galería y convocatoria de voluntarios. Hecho gratis, como obra social.' },
      tiki: { type: 'Boletería Web3', role: 'Fundador', desc: 'Boletas para los mejores eventos de Colombia — música, deportes, teatro — con compra en cola antifraude y boletas NFT (ERC-4337).' },
    },
    showcase: {
      tool: 'Herramienta',
      madeWith: (t) => `Hecho en ${t}`,
      private: 'Plataforma privada · sin acceso público',
      inDev: 'En desarrollo',
      noCapture: 'Sin captura pública',
      featured: 'Destacado',
      live: 'En producción',
      founder: 'Fundador',
      socialBadge: 'Obra social',
      siv: { title: 'SIV-IA', highlights: [['10+', 'clientes en producción'], ['11.000+', 'leads al mes en el cliente más grande'], ['2 devs', 'a cargo, con más de 70 % de cobertura de pruebas en CI/CD']] },
      rml: { title: 'Reach My Leads' },
      ingesoft: { title: 'Ingenuity & Solutions', kicker: 'Desarrollador backend · jun 2024 – may 2025', lead: 'En remoto para una consultora de Connecticut: APIs REST en Laravel/PHP y bases de datos MySQL para clientes en EE. UU., unos nueve atendidos de forma constante. Estos son los destacados.' },
      custom: { title: 'Astro, PHP y Next.js', kicker: 'Freelance · 2025 – 2026', lead: 'Trabajo con la herramienta que toque, o con la que mejor se adapte al negocio. Reliable Limousine y Reliable Developments están hechos en Astro, Stellar Group en PHP y BOX33 en Next.js con NestJS.' },
      wordpress: { title: 'WordPress', kicker: 'Freelance · 2023 – 2024', lead: 'Encargos: sitios por los que me pagaron para construirlos y entregarlos al cliente.' },
      resto: { title: 'Resto' },
      tiki: { title: 'TIKI' },
      social: { title: 'Bomberos La Virginia' },
    },
    contact: {
      title: 'Conectemos',
      body: 'Siempre estoy abierto a conversar sobre diseño de producto u oportunidades de colaboración.',
      piece: 'La firma, </>',
      pieceSub: 'Vidrio soplado · mi firma',
      credit: 'Esculturas: escaneos 3D de vaciados de la Royal Cast Collection, SMK – Galería Nacional de Dinamarca (CC0). Cabeza del David: “Head Of Michelangelo\'s David, Optimised” de nebulousflynn1, Zenodo, CC BY 4.0, a partir de un escaneo de SMK. Todas reducidas a mallas low-poly para este sitio.',
      music: ['Música: Frédéric Chopin, ', 'Balada n.º 1 en sol menor, Op. 23', ', interpretada por Frank Lévy para Musopen (', 'CC BY 4.0', '), recortada para empezar en la primera nota.'],
      form: {
        kicker: 'Contacto', title: 'Escríbeme', lead: 'Un proyecto, una oferta o una idea: cuéntame. Llega directo a mi correo.',
        name: 'Nombre', email: 'Correo', subject: 'Asunto', optional: 'opcional', message: 'Mensaje',
        send: 'Enviar mensaje', sending: 'Enviando…', sent: '¡Enviado! Te respondo pronto.',
        invalid: 'Escribe tu nombre, un correo válido y un mensaje.', error: 'No se pudo enviar. Puedes escribirme directo:',
        direct: 'O directo a', copy: 'Copiar', copied: 'Copiado',
      },
    },
  },
};

export function projectName(p, lang) {
  return p.name || T[lang].projects[p.id].name;
}

// The guided tour: one entry per camera stop. `side` is where the text panel sits.
export const STOPS = [
  { id: 'entrance', room: 0, side: 'hero' },
  { id: 'about', room: 1, side: 'left' },
  { id: 'edu', room: 2, side: 'left', shift: 0.24 },
  { id: 'work', room: 2, side: 'left' },
  ...SHOWCASES.map((sc, i) => ({ id: `s-${sc.id}`, room: sc.room, side: 'left', showcase: i, shift: sc.items.length > 1 ? 0.23 : undefined })),
  { id: 'contact', room: 8, side: 'left' },
];

// Camera keyframes: one per stop; a row of laptops gets an overview of the whole row first (item -1),
// then one key per laptop, while that stop's panel stays put.
export const KEYS = STOPS.flatMap((s, i) => {
  const n = s.showcase !== undefined ? SHOWCASES[s.showcase].items.length : 1;
  const items = n > 1 ? [-1, ...Array.from({ length: n }, (_, j) => j)] : [0];
  return items.map((item, sub) => ({ stop: i, sub, of: items.length, item }));
});
