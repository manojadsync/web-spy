export const GRADIANT_COLOR =
  "linear-gradient(62.72deg, #903AD9 6.2%, #4170E5 46.41%, #11BCC6 76.75%)";

export const roleTextMap = {
  admin: "Admin",
  user: "User",
  manager: "Manager",
};

const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFD93D",
  "#1A535C",
  "#FF8C00",
  "#6A5ACD",
  "#00BFA5",
  "#FF4081",
];

export const getRandomColor = (name = "") => {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};
