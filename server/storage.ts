import { db } from "@db";
import { eq, and, ilike, gte, lte, desc, or, SQL, sql } from "drizzle-orm";
import { 
  users, 
  properties, 
  propertyImages, 
  amenities, 
  propertyAmenities,
  favorites,
  messages,
  InsertUser,
  User,
  PropertyWithRelations,
  PropertySearch
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Property methods
  createProperty(propertyData: any): Promise<any>;
  getProperty(id: number): Promise<PropertyWithRelations | undefined>;
  getProperties(options?: { 
    ownerId?: number;
    limit?: number;
    offset?: number;
  }): Promise<any[]>;
  searchProperties(searchParams: PropertySearch, limit?: number, offset?: number): Promise<any[]>;
  updateProperty(id: number, propertyData: any): Promise<any>;
  deleteProperty(id: number): Promise<void>;
  
  // Property images
  addPropertyImage(propertyId: number, imageUrl: string, isPrimary?: boolean): Promise<any>;
  getPropertyImages(propertyId: number): Promise<any[]>;
  deletePropertyImage(imageId: number): Promise<void>;
  
  // Favorites
  addFavorite(userId: number, propertyId: number): Promise<any>;
  removeFavorite(userId: number, propertyId: number): Promise<void>;
  getUserFavorites(userId: number): Promise<any[]>;
  isFavorite(userId: number, propertyId: number): Promise<boolean>;
  
  // Messages
  sendMessage(senderId: number, receiverId: number, propertyId: number, content: string): Promise<any>;
  getConversations(userId: number): Promise<any[]>;
  getConversation(userId: number, otherUserId: number, propertyId: number): Promise<any[]>;
  markMessagesAsRead(messageIds: number[]): Promise<void>;
  
  // Amenities
  getAmenities(): Promise<any[]>;
  
  // Session store
  sessionStore: session.Store;
}

class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL
      },
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    
    if (!result) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(users.username, username),
    });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  // Property methods
  async createProperty(propertyData: any): Promise<any> {
    const [property] = await db.insert(properties)
      .values({
        ownerId: propertyData.ownerId,
        title: propertyData.title,
        description: propertyData.description,
        type: propertyData.type,
        address: propertyData.address,
        city: propertyData.city,
        state: propertyData.state,
        zipCode: propertyData.zipCode,
        price: propertyData.price,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        area: propertyData.area,
        available: propertyData.available ?? true,
        latitude: propertyData.latitude,
        longitude: propertyData.longitude,
      })
      .returning();
    
    return property;
  }

  async getProperty(id: number): Promise<PropertyWithRelations | undefined> {
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, id),
      with: {
        owner: true,
        images: true,
      },
    });

    if (!property) return undefined;

    // Get amenities for the property
    const propertyAmenitiesList = await db.query.propertyAmenities.findMany({
      where: eq(propertyAmenities.propertyId, id),
      with: {
        amenity: true,
      },
    });

    const amenitiesList = propertyAmenitiesList.map(pa => pa.amenity);

    return {
      ...property,
      amenities: amenitiesList,
    };
  }

  async getProperties(options?: { 
    ownerId?: number;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    let query = db.select().from(properties);
    
    if (options?.ownerId) {
      query = query.where(eq(properties.ownerId, options.ownerId));
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset || 0);
    }
    
    query = query.orderBy(desc(properties.createdAt));
    
    const propertiesList = await query;
    
    // Get images for each property
    const propertyIds = propertiesList.map(p => p.id);
    
    const images = await db.select()
      .from(propertyImages)
      .where(
        sql`${propertyImages.propertyId} IN (${sql.join(propertyIds, sql`, `)})`
      );
    
    const imagesByPropertyId = images.reduce((acc, img) => {
      if (!acc[img.propertyId]) {
        acc[img.propertyId] = [];
      }
      acc[img.propertyId].push(img);
      return acc;
    }, {} as Record<number, typeof propertyImages.$inferSelect[]>);
    
    return propertiesList.map(property => ({
      ...property,
      images: imagesByPropertyId[property.id] || [],
    }));
  }

  async searchProperties(searchParams: PropertySearch, limit = 10, offset = 0): Promise<any[]> {
    const whereConditions: SQL[] = [];
    
    if (searchParams.location) {
      whereConditions.push(
        or(
          ilike(properties.city, `%${searchParams.location}%`),
          ilike(properties.address, `%${searchParams.location}%`),
          ilike(properties.state, `%${searchParams.location}%`),
          ilike(properties.zipCode, `%${searchParams.location}%`)
        )
      );
    }
    
    if (searchParams.type && searchParams.type !== 'any') {
      whereConditions.push(eq(properties.type, searchParams.type));
    }
    
    if (searchParams.priceRange && searchParams.priceRange !== 'any') {
      const [min, max] = searchParams.priceRange.split('-').map(Number);
      
      if (max) {
        whereConditions.push(
          and(
            gte(properties.price, min),
            lte(properties.price, max)
          )
        );
      } else if (min) {
        // For ranges like "3000+" that don't have a max
        whereConditions.push(gte(properties.price, min));
      }
    }
    
    if (typeof searchParams.bedrooms === 'number') {
      whereConditions.push(gte(properties.bedrooms, searchParams.bedrooms));
    }
    
    if (typeof searchParams.bathrooms === 'number') {
      whereConditions.push(gte(properties.bathrooms, searchParams.bathrooms));
    }
    
    let query = db.select().from(properties);
    
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }
    
    // Add amenities filter if provided
    let amenitiesSubquery;
    if (searchParams.amenities && searchParams.amenities.length > 0) {
      const amenityIds = searchParams.amenities;
      
      // We'll do additional filtering after fetching the results
      amenitiesSubquery = db.select(propertyAmenities.propertyId)
        .from(propertyAmenities)
        .where(sql`${propertyAmenities.amenityId} IN (${sql.join(amenityIds, sql`, `)})`);
    }
    
    query = query.orderBy(desc(properties.createdAt))
      .limit(limit)
      .offset(offset);
    
    const propertiesList = await query;
    
    // If amenities were specified, filter properties that have all the required amenities
    let filteredProperties = propertiesList;
    if (amenitiesSubquery && searchParams.amenities && searchParams.amenities.length > 0) {
      const amenityMatches = await amenitiesSubquery;
      
      const propertyAmenityCount = amenityMatches.reduce((acc, curr) => {
        acc[curr.propertyId] = (acc[curr.propertyId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      filteredProperties = propertiesList.filter(property => 
        propertyAmenityCount[property.id] === searchParams.amenities!.length
      );
    }
    
    // Get images for the filtered properties
    const propertyIds = filteredProperties.map(p => p.id);
    
    const images = await db.select()
      .from(propertyImages)
      .where(
        sql`${propertyImages.propertyId} IN (${sql.join(propertyIds, sql`, `)})`
      );
    
    const imagesByPropertyId = images.reduce((acc, img) => {
      if (!acc[img.propertyId]) {
        acc[img.propertyId] = [];
      }
      acc[img.propertyId].push(img);
      return acc;
    }, {} as Record<number, typeof propertyImages.$inferSelect[]>);
    
    // Get owners for the properties
    const ownerIds = filteredProperties.map(p => p.ownerId);
    
    const owners = await db.select()
      .from(users)
      .where(
        sql`${users.id} IN (${sql.join(ownerIds, sql`, `)})`
      );
    
    const ownersById = owners.reduce((acc, owner) => {
      acc[owner.id] = owner;
      return acc;
    }, {} as Record<number, typeof users.$inferSelect>);
    
    return filteredProperties.map(property => ({
      ...property,
      images: imagesByPropertyId[property.id] || [],
      owner: ownersById[property.ownerId],
    }));
  }

  async updateProperty(id: number, propertyData: any): Promise<any> {
    const [updatedProperty] = await db.update(properties)
      .set(propertyData)
      .where(eq(properties.id, id))
      .returning();
    
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<void> {
    // First delete all related data
    await db.delete(propertyImages).where(eq(propertyImages.propertyId, id));
    await db.delete(propertyAmenities).where(eq(propertyAmenities.propertyId, id));
    await db.delete(favorites).where(eq(favorites.propertyId, id));
    await db.delete(messages).where(eq(messages.propertyId, id));
    
    // Then delete the property
    await db.delete(properties).where(eq(properties.id, id));
  }

  // Property images
  async addPropertyImage(propertyId: number, imageUrl: string, isPrimary = false): Promise<any> {
    // If this is a primary image, update all other images for this property to be non-primary
    if (isPrimary) {
      await db.update(propertyImages)
        .set({ isPrimary: false })
        .where(eq(propertyImages.propertyId, propertyId));
    }
    
    const [image] = await db.insert(propertyImages)
      .values({
        propertyId,
        url: imageUrl,
        isPrimary,
      })
      .returning();
    
    return image;
  }

  async getPropertyImages(propertyId: number): Promise<any[]> {
    return await db.select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, propertyId))
      .orderBy(sql`${propertyImages.isPrimary} DESC`);
  }

  async deletePropertyImage(imageId: number): Promise<void> {
    await db.delete(propertyImages).where(eq(propertyImages.id, imageId));
  }

  // Favorites
  async addFavorite(userId: number, propertyId: number): Promise<any> {
    // Check if already favorited
    const existing = await db.select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.propertyId, propertyId)
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
      return existing[0];
    }
    
    const [favorite] = await db.insert(favorites)
      .values({
        userId,
        propertyId,
      })
      .returning();
    
    return favorite;
  }

  async removeFavorite(userId: number, propertyId: number): Promise<void> {
    await db.delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.propertyId, propertyId)
        )
      );
  }

  async getUserFavorites(userId: number): Promise<any[]> {
    const userFavorites = await db.select()
      .from(favorites)
      .where(eq(favorites.userId, userId));
    
    const propertyIds = userFavorites.map(fav => fav.propertyId);
    
    if (propertyIds.length === 0) return [];
    
    const favProperties = await db.select()
      .from(properties)
      .where(sql`${properties.id} IN (${sql.join(propertyIds, sql`, `)})`);
    
    // Get images for the properties
    const images = await db.select()
      .from(propertyImages)
      .where(sql`${propertyImages.propertyId} IN (${sql.join(propertyIds, sql`, `)})`);
    
    const imagesByPropertyId = images.reduce((acc, img) => {
      if (!acc[img.propertyId]) {
        acc[img.propertyId] = [];
      }
      acc[img.propertyId].push(img);
      return acc;
    }, {} as Record<number, typeof propertyImages.$inferSelect[]>);
    
    // Get owners
    const ownerIds = favProperties.map(p => p.ownerId);
    
    const owners = await db.select()
      .from(users)
      .where(sql`${users.id} IN (${sql.join(ownerIds, sql`, `)})`);
    
    const ownersById = owners.reduce((acc, owner) => {
      acc[owner.id] = owner;
      return acc;
    }, {} as Record<number, typeof users.$inferSelect>);
    
    return favProperties.map(property => ({
      ...property,
      images: imagesByPropertyId[property.id] || [],
      owner: ownersById[property.ownerId],
      favorite: true,
    }));
  }

  async isFavorite(userId: number, propertyId: number): Promise<boolean> {
    const result = await db.select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.propertyId, propertyId)
        )
      )
      .limit(1);
    
    return result.length > 0;
  }

  // Messages
  async sendMessage(senderId: number, receiverId: number, propertyId: number, content: string): Promise<any> {
    const [message] = await db.insert(messages)
      .values({
        senderId,
        receiverId,
        propertyId,
        content,
      })
      .returning();
    
    return message;
  }

  async getConversations(userId: number): Promise<any[]> {
    // Get all unique combinations of users and properties where this user is involved
    const userMessages = await db.select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(desc(messages.createdAt));
    
    const conversations = new Map<string, any>();
    
    for (const message of userMessages) {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const key = `${otherUserId}_${message.propertyId}`;
      
      if (!conversations.has(key)) {
        conversations.set(key, {
          otherUserId,
          propertyId: message.propertyId,
          lastMessage: message,
          unreadCount: message.senderId !== userId && !message.read ? 1 : 0,
        });
      } else if (message.senderId !== userId && !message.read) {
        const convo = conversations.get(key)!;
        convo.unreadCount = (convo.unreadCount || 0) + 1;
      }
    }
    
    const conversationList = Array.from(conversations.values());
    
    // Get user details for the other users
    const otherUserIds = conversationList.map(c => c.otherUserId);
    
    if (otherUserIds.length === 0) return [];
    
    const otherUsers = await db.select()
      .from(users)
      .where(sql`${users.id} IN (${sql.join(otherUserIds, sql`, `)})`);
    
    const userById = otherUsers.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<number, typeof users.$inferSelect>);
    
    // Get property details
    const propertyIds = conversationList.map(c => c.propertyId);
    
    const propertyDetails = await db.select()
      .from(properties)
      .where(sql`${properties.id} IN (${sql.join(propertyIds, sql`, `)})`);
    
    const propertyById = propertyDetails.reduce((acc, property) => {
      acc[property.id] = property;
      return acc;
    }, {} as Record<number, typeof properties.$inferSelect>);
    
    // Get property images (just the primary ones)
    const propertyImageList = await db.select()
      .from(propertyImages)
      .where(
        and(
          sql`${propertyImages.propertyId} IN (${sql.join(propertyIds, sql`, `)})`,
          eq(propertyImages.isPrimary, true)
        )
      );
    
    const imageByPropertyId = propertyImageList.reduce((acc, img) => {
      acc[img.propertyId] = img;
      return acc;
    }, {} as Record<number, typeof propertyImages.$inferSelect>);
    
    return conversationList.map(convo => ({
      ...convo,
      otherUser: userById[convo.otherUserId],
      property: {
        ...propertyById[convo.propertyId],
        primaryImage: imageByPropertyId[convo.propertyId],
      },
    }));
  }

  async getConversation(userId: number, otherUserId: number, propertyId: number): Promise<any[]> {
    const conversationMessages = await db.select()
      .from(messages)
      .where(
        and(
          or(
            and(
              eq(messages.senderId, userId),
              eq(messages.receiverId, otherUserId)
            ),
            and(
              eq(messages.senderId, otherUserId),
              eq(messages.receiverId, userId)
            )
          ),
          eq(messages.propertyId, propertyId)
        )
      )
      .orderBy(messages.createdAt);
    
    // Mark any unread messages as read
    const unreadMessageIds = conversationMessages
      .filter(msg => msg.senderId === otherUserId && !msg.read)
      .map(msg => msg.id);
    
    if (unreadMessageIds.length > 0) {
      await this.markMessagesAsRead(unreadMessageIds);
    }
    
    // Get user details
    const userDetails = await db.select()
      .from(users)
      .where(
        or(
          eq(users.id, userId),
          eq(users.id, otherUserId)
        )
      );
    
    const userById = userDetails.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<number, typeof users.$inferSelect>);
    
    // Get property details
    const property = await db.select()
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);
    
    return conversationMessages.map(msg => ({
      ...msg,
      sender: userById[msg.senderId],
      read: msg.read || unreadMessageIds.includes(msg.id), // Mark as read in the response
      property: property[0],
    }));
  }

  async markMessagesAsRead(messageIds: number[]): Promise<void> {
    if (messageIds.length === 0) return;
    
    await db.update(messages)
      .set({ read: true })
      .where(sql`${messages.id} IN (${sql.join(messageIds, sql`, `)})`);
  }

  // Amenities
  async getAmenities(): Promise<any[]> {
    return await db.select().from(amenities);
  }
}

export const storage = new DatabaseStorage();
