export const products = [
  {
    id: 1,
    name: "Toalha de Mesa Clássica",
    category: "toalhas",
    description: "Toalha de mesa em tecido premium com acabamento refinado. (Consulte medidas e cores disponíveis)",
    image: "https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5690+%281%29-1920w.JPG",
  },
  {
    id: 2,
    name: "Guardanapo de Linho",
    category: "guardanapos",
    description: "Guardanapos em linho puro com bordas delicadas na cor vinho.",
    image: "https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5654-1920w.JPG",
  },
  {
    id: 3,
    name: "Trilho de Mesa Bordado",
    category: "trilhos",
    description: "Trilho de mesa com bordados artesanais exclusivos.",
    image: "https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5607-a3c2d77d-1920w.JPG",
  },
  {
    id: 4,
    name: "Toalha de Mesa Adamascada",
    category: "toalhas",
    description: "Toalha de mesa em tecido Adamascado na cor Tiffany.",
    image: "https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5843-1920w.JPG",
  },
  {
    id: 5,
    name: "Toalha de Mesa Adamascada",
    category: "toalhas",
    description: "Toalha de mesa em tecido Adamascado Dupla Face",
    image: "https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_58641-1920w.JPG",
  },
  {
    id: 6,
    name: "Trilho de Mesa Bordado",
    category: "trilhos",
    description: "Trilho de mesa com bordados artesanais exclusivos.",
    image: "https://lirp.cdn-website.com/f46edd80/dms3rep/multi/opt/IMG_5629-1920w.JPG",
  },
  // Add more products as needed
];

export type Product = (typeof products)[number];