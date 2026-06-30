import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./lib/swagger";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import meRouter from "./modules/me/me.router";


const app = express();
const port = process.env.PORT ?? 8080;
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", corsOrigin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Better Auth handler — must come before express.json()
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "monabit-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/me", meRouter);


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
