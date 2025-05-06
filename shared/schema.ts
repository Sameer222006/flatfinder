import { pgTable, text, serial, integer, boolean, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Enum for user roles
export const userRoleEnum = pgEnum('user_role', ['tenant', 'owner']);

// Base tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  phone: text("phone"),
  role: userRoleEnum("role").notNull().default('tenant'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // apartment, house, studio, condo, etc.
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: numeric("bathrooms", { precision: 3, scale: 1 }).notNull(),
  area: integer("area").notNull(), // in sq ft
  available: boolean("available").notNull().default(true),
  latitude: numeric("latitude", { precision: 10, scale: 6 }).notNull(),
  longitude: numeric("longitude", { precision: 10, scale: 6 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const propertyImages = pgTable("property_images", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  url: text("url").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const amenities = pgTable("amenities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
});

export const propertyAmenities = pgTable("property_amenities", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  amenityId: integer("amenity_id").references(() => amenities.id).notNull(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  content: text("content").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedProperties: many(properties, { relationName: "owner" }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  favorites: many(favorites),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, { fields: [properties.ownerId], references: [users.id], relationName: "owner" }),
  images: many(propertyImages),
  propertyAmenities: many(propertyAmenities),
  favorites: many(favorites),
  messages: many(messages),
}));

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, { fields: [propertyImages.propertyId], references: [properties.id] }),
}));

export const amenitiesRelations = relations(amenities, ({ many }) => ({
  propertyAmenities: many(propertyAmenities),
}));

export const propertyAmenitiesRelations = relations(propertyAmenities, ({ one }) => ({
  property: one(properties, { fields: [propertyAmenities.propertyId], references: [properties.id] }),
  amenity: one(amenities, { fields: [propertyAmenities.amenityId], references: [amenities.id] }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  property: one(properties, { fields: [favorites.propertyId], references: [properties.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: "sender" }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id], relationName: "receiver" }),
  property: one(properties, { fields: [messages.propertyId], references: [properties.id] }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  email: (schema) => schema.email("Must provide a valid email"),
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
});

export const insertPropertySchema = createInsertSchema(properties, {
  title: (schema) => schema.min(5, "Title must be at least 5 characters"),
  description: (schema) => schema.min(20, "Description must be at least 20 characters"),
  price: (schema) => schema.refine((val) => Number(val) > 0, "Price must be greater than 0"),
  bedrooms: (schema) => schema.refine((val) => Number(val) >= 0, "Bedrooms cannot be negative"),
  bathrooms: (schema) => schema.refine((val) => Number(val) >= 0, "Bathrooms cannot be negative"),
  area: (schema) => schema.refine((val) => Number(val) > 0, "Area must be greater than 0"),
});

export const insertPropertyImageSchema = createInsertSchema(propertyImages);
export const insertAmenitySchema = createInsertSchema(amenities);
export const insertPropertyAmenitySchema = createInsertSchema(propertyAmenities);
export const insertFavoriteSchema = createInsertSchema(favorites);
export const insertMessageSchema = createInsertSchema(messages, {
  content: (schema) => schema.min(1, "Message cannot be empty"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const propertySearchSchema = z.object({
  location: z.string().optional(),
  type: z.string().optional(),
  priceRange: z.string().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  amenities: z.array(z.number()).optional(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type PropertyWithRelations = Property & {
  owner: User;
  images: typeof propertyImages.$inferSelect[];
  amenities: typeof amenities.$inferSelect[];
};
export type PropertyImage = typeof propertyImages.$inferSelect;
export type Amenity = typeof amenities.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MessageWithSender = Message & {
  sender: User;
};
export type LoginData = z.infer<typeof loginSchema>;
export type PropertySearch = z.infer<typeof propertySearchSchema>;
