import express from "express";
import { z } from "zod";
import cors from "cors";
import helmet from "helmet";
import { RetailSearchClient } from "./search";
import dotenv from "dotenv";
import { autocompleteQuerySchema, searchRequestSchema } from "./schema";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

const searchClient = new RetailSearchClient();

app.get("/ai/search/v2/indices/:indexId/query", async (req, res) => {
  try {
    const { indexId } = req.params;
    const {
      query,
      token,
      clientUUID,
      limit,
      page,
      includeMeta,
      facets,
      includeFacets,
    } = req.query;

    const decodedQuery = {
      query: decodeURIComponent(query as string),
      token,
      clientUUID,
      limit: parseInt(limit as string, 10),
      page: parseInt(page as string, 10),
      includeMeta: includeMeta === "true",
      facets,
      includeFacets,
      indexId,
    };

    const searchRequest = searchRequestSchema.parse(decodedQuery);

    const searchResponse = await searchClient.search(searchRequest);
    res.json(searchResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Invalid request parameters", details: error.errors });
    } else {
      console.error("Error during search:", error);
      res.status(500).json({ error: "An error occurred during the search" });
    }
  }
});

app.get("/autocomplete", async (req, res) => {
  try {
    const decodedQuery = {
      query: decodeURIComponent(req.query.query as string),
      visitorId: req.query.visitorId,
    };
    const { query, visitorId } = autocompleteQuerySchema.parse(decodedQuery);
    const autocompleteResponse = await searchClient.autocomplete(
      query,
      visitorId,
    );
    res.json(autocompleteResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Invalid query parameters", details: error.errors });
    } else {
      console.error("Error during autocomplete:", error);
      res.status(500).json({ error: "An error occurred during autocomplete" });
    }
  }
});

// Error handling middleware
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).send("");
  },
);

export const server = (port: number) =>
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
