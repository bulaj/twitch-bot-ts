"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";

function RouletteWheel() {
  return (
    <Box
      className="roulette-spinner"
      sx={{
        width: 60,
        height: 60,
      }}
    >
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="#ffd700"
          strokeWidth="4"
        />
        {Array.from({ length: 18 }).map((_, i) => (
          <path
            key={i}
            d={`M 50 50 L ${50 + 48 * Math.cos((i * 20 * Math.PI) / 180)} ${50 + 48 * Math.sin((i * 20 * Math.PI) / 180)} A 48 48 0 0 1 ${50 + 48 * Math.cos(((i + 1) * 20 * Math.PI) / 180)} ${50 + 48 * Math.sin(((i + 1) * 20 * Math.PI) / 180)} Z`}
            fill={i % 2 === 0 ? "#b71c1c" : "#1a1a1a"}
          />
        ))}
        <circle cx="50" cy="50" r="15" fill="#ffd700" />
        <circle
          cx="50"
          cy="50"
          r="10"
          fill="#a1887f"
          stroke="#4e342e"
          strokeWidth="2"
        />
      </svg>
    </Box>
  );
}

export default function RouletteWidget() {
  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        padding: "12px 16px",
        background: "rgba(30, 30, 46, 0.9)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(144, 202, 249, 0.2)",
        borderRadius: "16px",
        zIndex: 1000,
        color: "white",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        transition: "transform 0.3s ease-in-out",
        "&:hover": {
          transform: "scale(1.1)",
        },
      }}
    >
      <RouletteWheel />
      <Stack>
        <Typography
          variant="body2"
          sx={{ fontWeight: "bold", color: "#a9a9d2" }}
        >
          Podziemny Krąg
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: "bold", lineHeight: 1.2 }}>
          W Grze
        </Typography>
      </Stack>
    </Paper>
  );
}
