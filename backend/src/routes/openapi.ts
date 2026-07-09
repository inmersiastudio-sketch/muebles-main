import { Router } from "express";

const router = Router();

const spec = {
  openapi: "3.0.1",
  info: {
    title: "MueblesAR API",
    version: "0.1.0",
    description: "API para productos y mueblerías (mock + Prisma).",
  },
  servers: [{ url: "http://localhost:3001" }],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/products": {
      get: {
        summary: "Lista productos",
        parameters: [
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "room", in: "query", schema: { type: "string" } },
          { name: "style", in: "query", schema: { type: "string" } },
          { name: "store", in: "query", schema: { type: "string" } },
          { name: "priceMin", in: "query", schema: { type: "number" } },
          { name: "priceMax", in: "query", schema: { type: "number" } },
        ],
        responses: { "200": { description: "Listado de productos" } },
      },
    },
    "/api/products/{id}": {
      get: {
        summary: "Detalle de producto",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Producto" }, "404": { description: "No encontrado" } },
      },
    },
    "/api/stores": {
      get: {
        summary: "Lista mueblerías",
        responses: { "200": { description: "Listado de mueblerías" } },
      },
    },
    "/api/stores/{slug}": {
      get: {
        summary: "Detalle de mueblería",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Mueblería" }, "404": { description: "No encontrada" } },
      },
    },
  },
};

router.get("/openapi.json", (_req, res) => {
  res.json(spec);
});

export default router;
