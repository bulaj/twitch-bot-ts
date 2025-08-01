import { getPointsDbNew, PointsUser } from "@twitch-bot-ts/shared";
import {
  Avatar,
  Box,
  Card,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SecurityIcon from "@mui/icons-material/Security";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import Link from "next/link";
import RouletteWidget from "./components/RouletteWidget";

// Definicje animacji (pozostają bez zmian)
const textGlow = {
  "0%, 100%": {
    textShadow:
      "0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 15px #00ffff, 0 0 20px #00ffff",
  },
  "50%": {
    textShadow:
      "0 0 10px #ff00ff, 0 0 15px #ff00ff, 0 0 20px #00ffff, 0 0 25px #00ffff",
  },
};

const MAX_DEBT = 2000;
const ALLOWED_ORDER_BY_COLUMNS = [
  "points",
  "wins",
  "losses",
  "robberies",
  "successfulRobberies",
  "debt",
];

// =============================================================================
// Komponent Podium (bez zmian, jest "głupi" - tylko wyświetla dane)
// =============================================================================
function Podium({ topThree }: { topThree: PointsUser[] }) {
  if (topThree.length === 0) return null;
  // ... (cały kod komponentu Podium pozostaje bez zmian)
  const podiumStyles = [
    {
      order: { xs: 1, md: 2 },
      mt: { xs: 0, md: -4 },
      transform: "scale(1.15)",
      glowColor: "rgba(255, 215, 0, 0.7)",
    },
    { order: { xs: 2, md: 1 }, mt: 0, glowColor: "rgba(192, 192, 192, 0.7)" },
    { order: { xs: 3, md: 3 }, mt: 0, glowColor: "rgba(205, 127, 50, 0.7)" },
  ];
  return (
    <Grid
      container
      spacing={2}
      justifyContent="center"
      alignItems="flex-end"
      sx={{ mb: 6 }}
    >
      {topThree.map((user, index) => (
        // @ts-ignore
        <Grid
          item
          xs={12}
          sm={4}
          md={3}
          key={user.username}
          sx={{ order: podiumStyles[index].order }}
        >
          <Box
            sx={{
              position: "relative",
              transition: "transform 0.3s ease",
              mt: podiumStyles[index].mt,
              transform: podiumStyles[index].transform,
              "&:hover": {
                transform: `scale(${index === 0 ? 1.25 : 1.2}) translateY(-10px)`,
              },
            }}
          >
            <Box
              sx={{
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: "12px",
                background: `radial-gradient(circle, ${podiumStyles[index].glowColor} 0%, transparent 70%)`,
                animation: `pulse-glow ${2 + index * 0.2}s ease-in-out infinite`,
                zIndex: -1,
                filter: "blur(20px)",
              }}
            />
            <Card
              sx={{
                background: "rgba(30, 30, 46, 0.9)",
                border: `2px solid`,
                borderColor: podiumStyles[index].glowColor,
                borderRadius: "12px",
                textAlign: "center",
                padding: 2,
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                className="gradient-border"
                style={{
                  margin: "auto",
                  marginBottom: "1rem",
                  width: "fit-content",
                }}
              >
                <Avatar sx={{ width: 80, height: 80, background: "#626262" }}>
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
              </div>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "white" }}
              >
                {index === 0 ? "🥇 " : index === 1 ? "🥈 " : "🥉 "}
                {user.username}
              </Typography>
              <Typography
                sx={{
                  fontWeight: "bold",
                  color: podiumStyles[index].glowColor,
                  fontSize: "1.5rem",
                }}
              >
                {user.points.toLocaleString("pl-PL")}
              </Typography>
            </Card>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

// =============================================================================
// Główny Komponent Strony (z całą logiką wewnątrz)
// =============================================================================
export default async function HomePage({
  searchParams,
}: {
  searchParams: { orderBy?: string; order?: string };
}) {
  // --- KROK 1: "Rozpakuj" searchParams na samym początku i tylko tutaj. ---
  const orderBy = searchParams.orderBy || "points";
  const order = searchParams.order || "desc";

  // --- KROK 2: Logika pobierania danych jest teraz wewnątrz komponentu. ---
  const safeOrderBy = ALLOWED_ORDER_BY_COLUMNS.includes(orderBy)
    ? orderBy
    : "points";
  const safeOrder = ["asc", "desc"].includes(order)
    ? order.toUpperCase()
    : "DESC";
  let users: PointsUser[] = [];
  try {
    const db = getPointsDbNew();
    const query = `SELECT * FROM users WHERE points > 0 OR debt > 0 ORDER BY ${safeOrderBy} ${safeOrder} LIMIT 50`;
    users = db.prepare(query).all() as PointsUser[];
  } catch (error) {
    console.error("Błąd pobierania danych:", error);
  }

  const topThreeForPodium = users.slice(0, 3);

  const getTrophyStyle = (index: number) => {
    if (index === 0)
      return { color: "#ffd700", textShadow: "0 0 10px #ffd700" };
    if (index === 1)
      return { color: "#c0c0c0", textShadow: "0 0 10px #c0c0c0" };
    if (index === 2)
      return { color: "#cd7f32", textShadow: "0 0 10px #cd7f32" };
    return { color: "#a9a9d2" };
  };

  return (
    <Box
      sx={{
        background: "#0d0d1a",
        minHeight: "100vh",
        color: "white",
        paddingTop: "2rem",
      }}
    >
      <Container maxWidth="xl" sx={{ paddingBottom: "2rem" }}>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          alignItems="center"
        >
          <WhatshotIcon sx={{ fontSize: "3rem", color: "#ff7961" }} />
          <Typography
            variant="h2"
            component="h1"
            align="center"
            sx={{
              "@keyframes textGlow": textGlow,
              fontWeight: "bold",
              mb: 4,
              animation: "textGlow 2s ease-in-out infinite alternate",
            }}
          >
            PODZIEMNY KRĄG HAZARDU
          </Typography>
        </Stack>

        <Podium topThree={topThreeForPodium} />

        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ mb: 2, fontWeight: "bold" }}
        >
          Pełny Ranking
        </Typography>

        <Paper
          sx={{ background: "rgba(20, 20, 35, 0.85)", borderRadius: "16px" }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ border: "none", color: "#a9a9d2" }}>
                    Rank
                  </TableCell>
                  <TableCell sx={{ border: "none", color: "#a9a9d2" }}>
                    Gracz
                  </TableCell>
                  {/* --- KROK 3: Logika linków jest teraz wewnątrz JSX --- */}
                  <TableCell sx={{ border: "none" }}>
                    <Link
                      href={`/?orderBy=points&order=${orderBy === "points" && order === "desc" ? "asc" : "desc"}`}
                      style={{ textDecoration: "none", color: "#a9a9d2" }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EmojiEventsIcon sx={{ color: "#ffd700" }} />
                        <span>Punkty</span>
                      </Stack>
                    </Link>
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    <Link
                      href={`/?orderBy=debt&order=${orderBy === "debt" && order === "desc" ? "asc" : "desc"}`}
                      style={{ textDecoration: "none", color: "#a9a9d2" }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <MoneyOffIcon sx={{ color: "#f44336" }} />
                        <span>Dług</span>
                      </Stack>
                    </Link>
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    <Link
                      href={`/?orderBy=wins&order=${orderBy === "wins" && order === "desc" ? "asc" : "desc"}`}
                      style={{ textDecoration: "none", color: "#a9a9d2" }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <SportsKabaddiIcon sx={{ color: "#f48fb1" }} />
                        <span>Pojedynki (W/L)</span>
                      </Stack>
                    </Link>
                  </TableCell>
                  <TableCell sx={{ border: "none" }}>
                    <Link
                      href={`/?orderBy=successfulRobberies&order=${orderBy === "successfulRobberies" && order === "desc" ? "asc" : "desc"}`}
                      style={{ textDecoration: "none", color: "#a9a9d2" }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <SecurityIcon sx={{ color: "#81c784" }} />
                        <span>Napady (S/T)</span>
                      </Stack>
                    </Link>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow
                    key={user.username}
                    sx={{
                      "&:hover": { background: "rgba(144, 202, 249, 0.1)" },
                      ...(index < 3 && {
                        background: "rgba(255, 255, 255, 0.05)",
                      }),
                    }}
                  >
                    <TableCell
                      sx={{
                        border: "none",
                        fontWeight: "bold",
                        fontSize: "1.4rem",
                        ...getTrophyStyle(index),
                      }}
                    >
                      {index + 1}
                    </TableCell>
                    <TableCell sx={{ border: "none" }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <div className="gradient-border">
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              background: "#626262",
                            }}
                          >
                            {user.username.charAt(0).toUpperCase()}
                          </Avatar>
                        </div>
                        <Typography sx={{ color: "white" }}>
                          {user.username}
                        </Typography>
                        {index === 0 && (
                          <Chip
                            size="small"
                            label="👑"
                            sx={{ background: "transparent", color: "#ffd700" }}
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ border: "none", color: "white" }}>
                      {user.points.toLocaleString("pl-PL")}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "none",
                        color: user.debt > 0 ? "#ff7961" : "inherit",
                      }}
                    >
                      <Tooltip
                        title={
                          user.debt >= MAX_DEBT
                            ? "Maksymalny dług! Spłać go, aby móc dalej grać."
                            : `Dług do spłacenia: ${user.debt}`
                        }
                        arrow
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          {user.debt >= MAX_DEBT && <span>🚨</span>}
                          <span>{user.debt.toLocaleString("pl-PL")}</span>
                        </Stack>
                      </Tooltip>
                    </TableCell>
                    <TableCell
                      sx={{ border: "none", color: "white" }}
                    >{`${user.wins} / ${user.losses}`}</TableCell>
                    <TableCell
                      sx={{ border: "none", color: "white" }}
                    >{`${user.successfulRobberies} / ${user.robberies}`}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      <RouletteWidget />
    </Box>
  );
}

export const dynamic = "force-dynamic";
