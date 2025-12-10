import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scrapeArticles, type Category } from "./scraper";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // API endpoint to get articles (optionally filtered by category)
  app.get("/api/articles", async (req, res) => {
    try {
      const category = req.query.category as Category | undefined;
      
      // Validate category if provided
      const validCategories: Category[] = ["International", "Sports", "Technology", "Health", "Science"];
      if (category && !validCategories.includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
      }

      // Scrape articles
      const articles = await scrapeArticles(category, 10);
      
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  // API endpoint to get a single article by ID
  app.get("/api/articles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Since we're scraping fresh data, we'll need to scrape and find the article
      // In a real app with a database, we'd just query by ID
      const articles = await scrapeArticles();
      const article = articles.find(a => a.id === id);
      
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  return httpServer;
}
