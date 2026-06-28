import express from "express";

const app = express();
const port = process.env.PORT ?? 8080;
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5173";

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", webOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "monabit-api",
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
