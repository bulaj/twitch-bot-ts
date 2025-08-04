import { createTheme } from "@mui/material/styles";

// Tworzymy prosty, ciemny motyw
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9", // Jasnoniebieski akcent
    },
    background: {
      default: "#121212", // Ciemne tło
      paper: "#1e1e1e", // Tło dla "papierowych" elementów
    },
  },
  typography: {
    fontFamily: "var(--font-bruno-ace), sans-serif",
  },
});

export default theme;
