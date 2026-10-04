const svg = (s) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);

window.BIOIMG_ICONS = [
  { name: "Cellule", tags: "cell cellule", src: svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="46" ry="40" fill="#ffd7d7" stroke="#d9534f" stroke-width="3"/><circle cx="55" cy="48" r="15" fill="#b05aa8"/></svg>`) },
  { name: "Bactérie", tags: "bacteria bacterie", src: svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect x="5" y="10" width="90" height="40" rx="20" fill="#9fd89f" stroke="#3c8d3c" stroke-width="3"/></svg>`) },
  { name: "Virus", tags: "virus", src: svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g stroke="#c0392b" stroke-width="4">${[...Array(12)].map((_, i) => { const a = i * Math.PI / 6; return `<line x1="${50 + 30 * Math.cos(a)}" y1="${50 + 30 * Math.sin(a)}" x2="${50 + 44 * Math.cos(a)}" y2="${50 + 44 * Math.sin(a)}"/>`; }).join("")}</g><circle cx="50" cy="50" r="30" fill="#f5a9a0" stroke="#c0392b" stroke-width="3"/></svg>`) },
  { name: "ADN", tags: "dna adn", src: svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 120"><path d="M10 0 C50 30 50 30 10 60 C-30 90 50 90 10 120" fill="none" stroke="#3b6fe0" stroke-width="4"/><path d="M50 0 C10 30 10 30 50 60 C90 90 10 90 50 120" fill="none" stroke="#e05a3b" stroke-width="4"/></svg>`) },
  { name: "Tube", tags: "tube eppendorf labo", src: svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 120"><path d="M5 5 H35 V90 L20 115 L5 90 Z" fill="#e8f1ff" stroke="#555" stroke-width="3"/><rect x="5" y="55" width="30" height="35" fill="#7fb2ff"/></svg>`) },

  // Tes icônes :
  // { name: "Neurone", tags: "neuron neurone", src: "icons/neuron.svg" },
];