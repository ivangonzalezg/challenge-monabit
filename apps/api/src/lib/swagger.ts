import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const servers = [{ url: "http://localhost:8080", description: "Development" }];

if (
  process.env.BETTER_AUTH_URL &&
  process.env.BETTER_AUTH_URL !== "http://localhost:8080"
) {
  servers.push({ url: process.env.BETTER_AUTH_URL, description: "Production" });
}

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MonaBit API",
      version: "1.0.0",
      description: "REST API for the MonaBit crypto platform",
    },
    servers,
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    path.join(__dirname, "../modules/**/*.ts"),
    path.join(__dirname, "../docs/auth.yaml"),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
