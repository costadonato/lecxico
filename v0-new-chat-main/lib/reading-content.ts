export interface ReadingQuestion {
  id: string
  type: "multiple-choice" | "true-false" | "reflection"
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation: string
  difficulty: "literal" | "inferential" | "vocabulary"
}

export interface ReadingContent {
  id: string
  title: string
  subtitle: string
  mode: "child" | "teen"
  text: string[]
  vocabulary?: { word: string; definition: string }[]
  questions: ReadingQuestion[]
  estimatedTime: string
}

export const GAUCHOS_READING: Record<"child" | "teen", ReadingContent> = {
  child: {
    id: "gauchos-child",
    title: "Los Gauchos Argentinos",
    subtitle: "Héroes de las pampas",
    mode: "child",
    estimatedTime: "8-10 min",
    text: [
      "Los gauchos eran hombres muy especiales que vivían en las grandes llanuras de Argentina, llamadas pampas. Estas pampas son enormes campos verdes donde casi no hay árboles.",
      "Los gauchos eran expertos jinetes. Pasaban todo el día montando a caballo, cuidando ganado y viviendo al aire libre. Su caballo era su mejor amigo y compañero.",
      "La ropa del gaucho era muy particular. Usaban un pañuelo en el cuello llamado 'pañuelo criollo', bombachas amplias para montar cómodamente, y botas de cuero. También llevaban un sombrero grande para protegerse del sol.",
      "Los gauchos eran famosos por su valentía y su amor a la libertad. No les gustaba estar encerrados. Preferían el cielo abierto y los campos sin fin.",
      "Alrededor del fuego, los gauchos compartían historias, tomaban mate y tocaban la guitarra. Estas reuniones se llamaban 'fogones' y eran momentos muy especiales.",
      "Hoy en día, los gauchos son un símbolo de Argentina. Representan el coraje, la amistad y el amor por la tierra. Su historia nos enseña a valorar la libertad y la naturaleza.",
    ],
    vocabulary: [
      { word: "pampas", definition: "Grandes llanuras o campos planos de Argentina" },
      { word: "jinetes", definition: "Personas que montan a caballo" },
      { word: "valentía", definition: "Ser muy valiente y no tener miedo" },
      { word: "fogones", definition: "Reuniones alrededor del fuego" },
    ],
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "¿Dónde vivían los gauchos?",
        options: ["En las montañas", "En las pampas", "En la ciudad", "En el mar"],
        correctAnswer: 1,
        explanation: "Los gauchos vivían en las pampas, que son grandes llanuras o campos verdes de Argentina.",
        difficulty: "literal",
      },
      {
        id: "q2",
        type: "true-false",
        question: "Los gauchos pasaban mucho tiempo montando a caballo.",
        correctAnswer: "true",
        explanation: "Correcto! Los gauchos eran expertos jinetes y pasaban todo el día montando a caballo.",
        difficulty: "literal",
      },
      {
        id: "q3",
        type: "multiple-choice",
        question: "¿Qué usaban los gauchos en el cuello?",
        options: ["Una corbata", "Un pañuelo criollo", "Una bufanda", "Un collar"],
        correctAnswer: 1,
        explanation: "Los gauchos usaban un pañuelo en el cuello llamado 'pañuelo criollo'.",
        difficulty: "literal",
      },
      {
        id: "q4",
        type: "multiple-choice",
        question: "¿Qué significa que los gauchos amaban la 'libertad'?",
        options: [
          "Les gustaba estar solos",
          "Preferían vivir al aire libre y no estar encerrados",
          "No tenían familia",
          "No trabajaban",
        ],
        correctAnswer: 1,
        explanation:
          "Amar la libertad significa que preferían vivir al aire libre, bajo el cielo abierto, sin estar encerrados.",
        difficulty: "inferential",
      },
      {
        id: "q5",
        type: "true-false",
        question: "Los gauchos tocaban la guitarra alrededor del fuego.",
        correctAnswer: "true",
        explanation: "Sí! En los fogones, los gauchos compartían historias, tomaban mate y tocaban la guitarra.",
        difficulty: "literal",
      },
      {
        id: "q6",
        type: "multiple-choice",
        question: "¿Qué son las 'pampas'?",
        options: ["Montañas muy altas", "Grandes llanuras o campos planos", "Ríos muy largos", "Ciudades grandes"],
        correctAnswer: 1,
        explanation: "Las pampas son grandes llanuras o campos planos donde vivían los gauchos.",
        difficulty: "vocabulary",
      },
      {
        id: "q7",
        type: "reflection",
        question: "¿Qué crees que es lo más importante que nos enseñan los gauchos?",
        options: [
          "A montar a caballo",
          "A valorar la libertad y la naturaleza",
          "A usar sombrero",
          "A vivir en el campo",
        ],
        correctAnswer: 1,
        explanation:
          "Excelente reflexión! Los gauchos nos enseñan a valorar la libertad, la amistad y el amor por la naturaleza.",
        difficulty: "inferential",
      },
    ],
  },
  teen: {
    id: "gauchos-teen",
    title: "Los Gauchos: Identidad y Libertad Argentina",
    subtitle: "Símbolos de la cultura nacional",
    mode: "teen",
    estimatedTime: "12-15 min",
    text: [
      "Los gauchos fueron personajes fundamentales en la historia y cultura argentina. Surgieron en el siglo XVIII en las vastas llanuras pampeanas, donde desarrollaron un estilo de vida único adaptado a las condiciones del territorio.",
      "El gaucho era esencialmente un jinete excepcional y un trabajador rural especializado en el cuidado del ganado. Su habilidad para domar caballos, enlazar animales y sobrevivir en condiciones adversas lo convirtió en una figura legendaria.",
      "La vestimenta gaucha no era simplemente funcional, sino que reflejaba su identidad cultural. El chiripá o las bombachas anchas facilitaban el movimiento al montar, mientras que las botas de potro protegían las piernas. El facón (cuchillo grande) era una herramienta multiuso indispensable, y el pañuelo criollo servía como protección contra el polvo y el viento.",
      "Los gauchos representaban valores profundos: la libertad individual, el coraje, la lealtad y un fuerte sentido del honor. Rechazaban las restricciones sociales y preferían la vida nómada en la pampa infinita.",
      "La cultura gauchesca se expresaba también en manifestaciones artísticas. El folklore, la payada (duelo de improvisación poética con guitarra), y la literatura gauchesca (especialmente el Martín Fierro de José Hernández) inmortalizaron su forma de vida.",
      "Durante las guerras de independencia y las luchas civiles argentinas, muchos gauchos participaron como soldados de caballería, demostrando su valentía y habilidades ecuestres.",
      "Con el tiempo, la modernización del campo y el cercamiento de las tierras transformaron radicalmente la vida gaucha. Sin embargo, su legado persiste como símbolo de la identidad nacional argentina, representando la conexión profunda entre el pueblo y su tierra.",
    ],
    vocabulary: [
      { word: "vastas", definition: "Muy grandes, extensas" },
      { word: "adversas", definition: "Difíciles, desfavorables" },
      { word: "nómada", definition: "Que no tiene residencia fija y se desplaza de un lugar a otro" },
      { word: "inmortalizaron", definition: "Hicieron que algo perdure para siempre en la memoria" },
      { word: "legado", definition: "Herencia cultural o histórica que deja una generación" },
    ],
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "¿En qué siglo surgieron los gauchos?",
        options: ["Siglo XVI", "Siglo XVII", "Siglo XVIII", "Siglo XIX"],
        correctAnswer: 2,
        explanation: "Los gauchos surgieron en el siglo XVIII en las llanuras pampeanas.",
        difficulty: "literal",
      },
      {
        id: "q2",
        type: "multiple-choice",
        question: "¿Cuál era la función principal del facón en la vida del gaucho?",
        options: [
          "Era solo un arma",
          "Era una herramienta multiuso indispensable",
          "Era un adorno decorativo",
          "Solo se usaba para comer",
        ],
        correctAnswer: 1,
        explanation: "El facón era una herramienta multiuso indispensable para el gaucho, no solo un arma.",
        difficulty: "literal",
      },
      {
        id: "q3",
        type: "true-false",
        question: "Los gauchos preferían vivir en ciudades con muchas comodidades.",
        correctAnswer: "false",
        explanation: "Falso. Los gauchos rechazaban las restricciones sociales y preferían la vida nómada en la pampa.",
        difficulty: "literal",
      },
      {
        id: "q4",
        type: "multiple-choice",
        question: "¿Qué es la 'payada' en la cultura gauchesca?",
        options: [
          "Un tipo de comida",
          "Una danza tradicional",
          "Un duelo de improvisación poética con guitarra",
          "Una celebración religiosa",
        ],
        correctAnswer: 2,
        explanation:
          "La payada es un duelo de improvisación poética con guitarra, parte importante del folklore gaucho.",
        difficulty: "vocabulary",
      },
      {
        id: "q5",
        type: "multiple-choice",
        question: "¿Por qué se dice que los gauchos 'inmortalizaron' su forma de vida?",
        options: [
          "Porque nunca murieron",
          "Porque su cultura perdura en la memoria colectiva a través del arte y la literatura",
          "Porque construyeron monumentos",
          "Porque escribieron leyes",
        ],
        correctAnswer: 1,
        explanation:
          "Se inmortalizó su forma de vida porque perdura en la memoria colectiva a través del folklore y la literatura gauchesca.",
        difficulty: "inferential",
      },
      {
        id: "q6",
        type: "true-false",
        question: "Los gauchos participaron en las guerras de independencia argentina.",
        correctAnswer: "true",
        explanation:
          "Verdadero. Muchos gauchos participaron como soldados de caballería en las guerras de independencia.",
        difficulty: "literal",
      },
      {
        id: "q7",
        type: "reflection",
        question: "¿Por qué crees que el gaucho sigue siendo un símbolo importante de Argentina en la actualidad?",
        options: [
          "Porque todavía hay muchos gauchos",
          "Porque representa valores fundamentales como libertad, coraje e identidad cultural",
          "Porque es un personaje de películas",
          "Porque todos usan su ropa",
        ],
        correctAnswer: 1,
        explanation:
          "El gaucho sigue siendo importante porque representa valores fundamentales de libertad, coraje y la conexión profunda entre el pueblo argentino y su tierra.",
        difficulty: "inferential",
      },
    ],
  },
}
