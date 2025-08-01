// Ten komponent musi być kliencki, ponieważ zarządza motywem za pomocą kontekstu
"use client";

import { CssBaseline, ThemeProvider as MUIThemeProvider } from "@mui/material";
import theme from "../theme";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MUIThemeProvider theme={theme}>
      {/* CssBaseline resetuje domyślne style przeglądarki i stosuje tło z motywu */}
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}