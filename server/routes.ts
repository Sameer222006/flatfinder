import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPropertySchema, propertySearchSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Property routes
  app.get("/api/properties", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const properties = await storage.getProperties({ limit, offset });
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/search", async (req, res) => {
    try {
      const location = req.query.location as string | undefined;
      const type = req.query.type as string | undefined;
      const priceRange = req.query.priceRange as string | undefined;
      const bedroomsStr = req.query.bedrooms as string | undefined;
      const bathroomsStr = req.query.bathrooms as string | undefined;
      const amenitiesStr = req.query.amenities as string | undefined;
      
      const bedrooms = bedroomsStr ? parseInt(bedroomsStr) : undefined;
      const bathrooms = bathroomsStr ? parseFloat(bathroomsStr) : undefined;
      
      const amenities = amenitiesStr 
        ? amenitiesStr.split(',').map(id => parseInt(id)) 
        : undefined;
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const searchParams = propertySearchSchema.parse({
        location,
        type,
        priceRange,
        bedrooms,
        bathrooms,
        amenities,
      });
      
      const properties = await storage.searchProperties(searchParams, limit, offset);
      res.json(properties);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error searching properties:", error);
      res.status(500).json({ message: "Failed to search properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Check if the user has favorited this property
      if (req.isAuthenticated()) {
        const userId = req.user!.id;
        const isFavorite = await storage.isFavorite(userId, propertyId);
        
        return res.json({
          ...property,
          isFavorite,
        });
      }
      
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post("/api/properties", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to create a property" });
    }
    
    try {
      const userId = req.user!.id;
      
      if (req.user!.role !== 'owner') {
        return res.status(403).json({ message: "Only property owners can create listings" });
      }
      
      const propertyData = insertPropertySchema.parse({
        ...req.body,
        ownerId: userId,
      });
      
      const property = await storage.createProperty(propertyData);
      
      // Handle amenities if provided
      if (req.body.amenities && Array.isArray(req.body.amenities)) {
        for (const amenityId of req.body.amenities) {
          await db.insert(propertyAmenities).values({
            propertyId: property.id,
            amenityId,
          });
        }
      }
      
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.put("/api/properties/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to update a property" });
    }
    
    try {
      const propertyId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Verify property exists and user is the owner
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (property.ownerId !== userId) {
        return res.status(403).json({ message: "You can only update your own properties" });
      }
      
      const updatedProperty = await storage.updateProperty(propertyId, req.body);
      res.json(updatedProperty);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete("/api/properties/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to delete a property" });
    }
    
    try {
      const propertyId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Verify property exists and user is the owner
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (property.ownerId !== userId) {
        return res.status(403).json({ message: "You can only delete your own properties" });
      }
      
      await storage.deleteProperty(propertyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Property image routes
  app.post("/api/properties/:id/images", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to add images" });
    }
    
    try {
      const propertyId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Verify property exists and user is the owner
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (property.ownerId !== userId) {
        return res.status(403).json({ message: "You can only add images to your own properties" });
      }
      
      const { url, isPrimary } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "Image URL is required" });
      }
      
      const image = await storage.addPropertyImage(propertyId, url, isPrimary);
      res.status(201).json(image);
    } catch (error) {
      console.error("Error adding property image:", error);
      res.status(500).json({ message: "Failed to add property image" });
    }
  });

  app.delete("/api/properties/images/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to delete images" });
    }
    
    try {
      const imageId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Verify image exists and user is the owner of the property
      const [image] = await db.select()
        .from(propertyImages)
        .where(eq(propertyImages.id, imageId))
        .limit(1);
      
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      const property = await storage.getProperty(image.propertyId);
      
      if (!property || property.ownerId !== userId) {
        return res.status(403).json({ message: "You can only delete images from your own properties" });
      }
      
      await storage.deletePropertyImage(imageId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property image:", error);
      res.status(500).json({ message: "Failed to delete property image" });
    }
  });

  // Favorites routes
  app.post("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to add favorites" });
    }
    
    try {
      const userId = req.user!.id;
      const { propertyId } = req.body;
      
      if (!propertyId) {
        return res.status(400).json({ message: "Property ID is required" });
      }
      
      // Verify property exists
      const property = await storage.getProperty(parseInt(propertyId));
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      const favorite = await storage.addFavorite(userId, parseInt(propertyId));
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:propertyId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to remove favorites" });
    }
    
    try {
      const userId = req.user!.id;
      const propertyId = parseInt(req.params.propertyId);
      
      await storage.removeFavorite(userId, propertyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  app.get("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view favorites" });
    }
    
    try {
      const userId = req.user!.id;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Messages routes
  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to send messages" });
    }
    
    try {
      const senderId = req.user!.id;
      const { receiverId, propertyId, content } = req.body;
      
      if (!receiverId || !propertyId || !content) {
        return res.status(400).json({ message: "Receiver ID, property ID, and content are required" });
      }
      
      // Verify receiver and property exist
      const receiver = await storage.getUser(parseInt(receiverId));
      const property = await storage.getProperty(parseInt(propertyId));
      
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      const message = await storage.sendMessage(
        senderId,
        parseInt(receiverId),
        parseInt(propertyId),
        content
      );
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/conversations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view conversations" });
    }
    
    try {
      const userId = req.user!.id;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:userId/:propertyId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view conversation" });
    }
    
    try {
      const currentUserId = req.user!.id;
      const otherUserId = parseInt(req.params.userId);
      const propertyId = parseInt(req.params.propertyId);
      
      const messages = await storage.getConversation(currentUserId, otherUserId, propertyId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Amenities routes
  app.get("/api/amenities", async (req, res) => {
    try {
      const amenities = await storage.getAmenities();
      res.json(amenities);
    } catch (error) {
      console.error("Error fetching amenities:", error);
      res.status(500).json({ message: "Failed to fetch amenities" });
    }
  });

  // User dashboard routes
  app.get("/api/dashboard/properties", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view your properties" });
    }
    
    try {
      const userId = req.user!.id;
      const properties = await storage.getProperties({ ownerId: userId });
      res.json(properties);
    } catch (error) {
      console.error("Error fetching user properties:", error);
      res.status(500).json({ message: "Failed to fetch user properties" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
