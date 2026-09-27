// Dev-only: organización del catálogo. Los textos técnicos vienen de products-raw.json
// (extraídos de la web anterior). Para sumar o editar un producto, cambiar acá y correr:
//   node tools/build.js
module.exports = {
  lines: [
    { id: "antiinfecciosos",   name: "Antiinfecciosos",               short: "Antibióticos y antibacterianos de amplio espectro.", tone: "plum" },
    { id: "antiparasitarios",  name: "Antiparasitarios",              short: "Control interno y externo: pulgas, garrapatas y helmintos.", tone: "peri" },
    { id: "antiinflamatorios", name: "Antiinflamatorios y antialérgicos", short: "Corticoides y antihistamínicos de uso clínico.", tone: "lilac" },
    { id: "endocrino",         name: "Endocrinología y reproducción", short: "Hormona tiroidea y control del celo.", tone: "deep" },
    { id: "neuro",             name: "Sistema nervioso",              short: "Tranquilizantes, preanestésicos y anticonvulsivantes.", tone: "ink" },
    { id: "digestivo",         name: "Aparato digestivo",             short: "Antieméticos, antidiarreicos y laxantes.", tone: "peri" },
    { id: "respiratorio",      name: "Aparato respiratorio",          short: "Expectorantes y fluidificantes bronquiales.", tone: "lilac" },
    { id: "soporte",           name: "Dermatología y soporte",        short: "Antimicóticos y soluciones parenterales.", tone: "plum" },
  ],
  // key = nombre en products-raw.json
  products: [
    { key: "AMOXICILINA",      name: "Amoxicilina",      line: "antiinfecciosos",   tipo: "Antibiótico",        formas: ["Comprimidos 100, 250 y 500 mg", "Suspensión"], especie: "ambos" },
    { key: "CELAM",            name: "Celam",            line: "antiinfecciosos",   tipo: "Antibiótico · Cefalexina", formas: ["Comprimidos 500 y 1.000 mg", "Suspensión"], especie: "ambos" },
    { key: "CLINDAMICINA",     name: "Clindamicina",     line: "antiinfecciosos",   tipo: "Antibiótico",        formas: ["Comprimidos 110, 220 y 440 mg"], especie: "ambos" },
    { key: "ENROFLOXACINA",    name: "Enrofloxacina",    line: "antiinfecciosos",   tipo: "Quimioterápico",     formas: ["Comprimidos 50, 150 y 250 mg"], especie: "ambos" },
    { key: "SULFATRIM",        name: "Sulfatrim",        line: "antiinfecciosos",   tipo: "Antibacteriano",     formas: ["Comprimidos"], especie: "ambos" },
    { key: "SULFATRIM F",      name: "Sulfatrim F",      line: "antiinfecciosos",   tipo: "Antibacteriano",     formas: ["Comprimidos"], especie: "ambos" },
    { key: "ENTERO SULFATRIM", name: "Entero Sulfatrim", line: "antiinfecciosos",   tipo: "Antidiarreico · Coccidicida", formas: ["Suspensión"], especie: "ambos" },

    { key: "KNOCK OUT PERROS", name: "Knock Out Perros", line: "antiparasitarios",  tipo: "Pulguicida · Garrapaticida", formas: ["Pipetas", "Multidosis"], especie: "perros" },
    { key: "KNOCK OUT GATOS",  name: "Knock Out Gatos",  line: "antiparasitarios",  tipo: "Pulguicida",         formas: ["Pipetas", "Multidosis"], especie: "gatos" },
    { key: "STRONG",           name: "Strong",           line: "antiparasitarios",  tipo: "Pulguicida oral",    formas: ["Comprimidos 10, 20, 40 y 60"], especie: "perros" },
    { key: "SINPAR PERROS",    name: "Sin Par Perros",   line: "antiparasitarios",  tipo: "Antihelmíntico",     formas: ["Comprimidos 10, 20, 40 y 60"], especie: "perros" },
    { key: "SINPAR GATOS",     name: "Sin Par Gatos",    line: "antiparasitarios",  tipo: "Antihelmíntico",     formas: ["Comprimidos"], especie: "gatos" },
    { key: "PRAZIQUANTEL",     name: "Praziquantel",     line: "antiparasitarios",  tipo: "Cestodicida",        formas: ["Comprimidos 50 y 100 mg"], especie: "ambos" },
    { key: "LEVAMISOL",        name: "Levamisol",        line: "antiparasitarios",  tipo: "Antiparasitario · Inmunoestimulante", formas: ["Comprimidos"], especie: "ambos" },
    { key: "LEVAMISOL GOTAS",  name: "Levamisol Gotas",  line: "antiparasitarios",  tipo: "Antiparasitario · Inmunoestimulante", formas: ["Gotas"], especie: "ambos" },

    { key: "PREDNISOLONA",     name: "Prednisolona",     line: "antiinflamatorios", tipo: "Glucocorticoide",    formas: ["Comprimidos 10, 20 y 40 mg"], especie: "ambos" },
    { key: "DEXAMETASONA",     name: "Dexametasona",     line: "antiinflamatorios", tipo: "Corticoide",         formas: ["Comprimidos 0,5 y 1 mg"], especie: "ambos" },
    { key: "DEXAMETASONA INYECTABLE", name: "Dexametasona Inyectable", line: "antiinflamatorios", tipo: "Corticoide", formas: ["Inyectable"], especie: "ambos" },
    { key: "HIDROXICINA",      name: "Hidroxicina",      line: "antiinflamatorios", tipo: "Antihistamínico",    formas: ["Comprimidos 50 mg"], especie: "ambos" },

    { key: "T4",               name: "T4",               line: "endocrino",         tipo: "Hormona tiroidea",   formas: ["Comprimidos 0,3 mg"], especie: "ambos" },
    { key: "T4 F",             name: "T4 F",             line: "endocrino",         tipo: "Hormona tiroidea",   formas: ["Comprimidos 0,9 mg"], especie: "ambos" },
    { key: "CLORMADINONA",     name: "Clormadinona",     line: "endocrino",         tipo: "Inhibidor del celo", formas: ["Comprimidos 2 y 4 mg"], especie: "ambos" },
    { key: "MEGESTROL PERRAS", name: "Megestrol Perras", line: "endocrino",         tipo: "Inhibidor del celo", formas: ["Comprimidos"], especie: "perros" },
    { key: "MEGESTROL GATAS",  name: "Megestrol Gatas y Razas Toy", line: "endocrino", tipo: "Inhibidor del celo", formas: ["Comprimidos"], especie: "gatos" },

    { key: "DIAZEPAN",         name: "Diazepan",         line: "neuro",             tipo: "Tranquilizante · Anticonvulsivante", formas: ["Inyectable"], especie: "ambos" },
    { key: "SEDAGOTAS",        name: "Sedagotas",        line: "neuro",             tipo: "Tranquilizante · Antiemético", formas: ["Gotas"], especie: "ambos" },

    { key: "METOCLOPRAMIDA GOTAS",      name: "Metoclopramida Gotas",      line: "digestivo", tipo: "Antiemético", formas: ["Gotas"], especie: "ambos" },
    { key: "METOCLOPRAMIDA INYECTABLE", name: "Metoclopramida Inyectable", line: "digestivo", tipo: "Antiemético", formas: ["Inyectable"], especie: "ambos" },
    { key: "VASELINA",         name: "Vaselina Líquida", line: "digestivo",         tipo: "Laxante · Lubricante", formas: ["Frasco"], especie: "ambos" },

    { key: "BRONCO TOS",       name: "Bronco Tos",       line: "respiratorio",      tipo: "Expectorante",       formas: ["Jarabe"], especie: "ambos" },
    { key: "BRONCO TOS FORTE", name: "Bronco Tos Forte", line: "respiratorio",      tipo: "Expectorante",       formas: ["Jarabe"], especie: "ambos" },

    { key: "GRISEOFULVINA",    name: "Griseofulvina",    line: "soporte",           tipo: "Antimicótico",       formas: ["Comprimidos 250 mg"], especie: "ambos" },
    { key: "GLUCOSA HIPERTÓNICA", name: "Glucosa Hipertónica", line: "soporte",     tipo: "Energizante · Diurético", formas: ["Inyectable"], especie: "ambos" },
  ],
  featured: ["knock-out-perros", "amoxicilina", "strong", "prednisolona"],
};
