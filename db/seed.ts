import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting seed process...");

    // Check if amenities exist, otherwise seed them
    const existingAmenities = await db.select().from(schema.amenities);
    
    if (existingAmenities.length === 0) {
      console.log("Seeding amenities...");
      
      await db.insert(schema.amenities).values([
        { name: "WiFi", icon: "wifi" },
        { name: "Air Conditioning", icon: "air-conditioning" },
        { name: "Heating", icon: "heating" },
        { name: "Washing Machine", icon: "washing-machine" },
        { name: "Dryer", icon: "dryer" },
        { name: "Kitchen", icon: "kitchen" },
        { name: "Parking", icon: "parking" },
        { name: "Elevator", icon: "elevator" },
        { name: "Pool", icon: "pool" },
        { name: "Gym", icon: "gym" },
        { name: "Pets Allowed", icon: "pets" },
        { name: "TV", icon: "tv" },
        { name: "Balcony", icon: "balcony" },
        { name: "Garden", icon: "garden" },
        { name: "Security System", icon: "security" },
      ]);
    }
    
    // Check if users exist, otherwise seed them
    const existingUsers = await db.select().from(schema.users);
    
    let owner1Id, owner2Id, tenant1Id, tenant2Id;
    
    if (existingUsers.length === 0) {
      console.log("Seeding users...");
      
      const hashedPassword = await hashPassword("password123");
      
      const [owner1] = await db.insert(schema.users).values({
        username: "owner1",
        email: "owner1@example.com",
        password: hashedPassword,
        name: "Michael Chen",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
        bio: "Property owner with multiple listings in San Francisco",
        phone: "+1 (555) 123-4567",
        role: "owner",
      }).returning();
      
      const [owner2] = await db.insert(schema.users).values({
        username: "owner2",
        email: "owner2@example.com",
        password: hashedPassword,
        name: "Jessica Brown",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
        bio: "Real estate investor with properties in Oakland and San Jose",
        phone: "+1 (555) 234-5678",
        role: "owner",
      }).returning();
      
      const [tenant1] = await db.insert(schema.users).values({
        username: "tenant1",
        email: "tenant1@example.com",
        password: hashedPassword,
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
        bio: "Looking for a nice apartment in San Francisco",
        phone: "+1 (555) 345-6789",
        role: "tenant",
      }).returning();
      
      const [tenant2] = await db.insert(schema.users).values({
        username: "tenant2",
        email: "tenant2@example.com",
        password: hashedPassword,
        name: "Jason Rodriguez",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop",
        bio: "Moving to the Bay Area, searching for a place to call home",
        phone: "+1 (555) 456-7890",
        role: "tenant",
      }).returning();
      
      owner1Id = owner1.id;
      owner2Id = owner2.id;
      tenant1Id = tenant1.id;
      tenant2Id = tenant2.id;
    } else {
      // Get existing user IDs for seeding properties
      const owners = await db.select().from(schema.users).where(schema.eq(schema.users.role, "owner")).limit(2);
      const tenants = await db.select().from(schema.users).where(schema.eq(schema.users.role, "tenant")).limit(2);
      
      if (owners.length >= 2) {
        owner1Id = owners[0].id;
        owner2Id = owners[1].id;
      }
      
      if (tenants.length >= 2) {
        tenant1Id = tenants[0].id;
        tenant2Id = tenants[1].id;
      }
    }
    
    // Check if properties exist, otherwise seed them
    const existingProperties = await db.select().from(schema.properties);
    
    if (existingProperties.length === 0 && owner1Id && owner2Id) {
      console.log("Seeding properties...");
      
      // Property 1: Luxury Studio in Downtown
      const [property1] = await db.insert(schema.properties).values({
        ownerId: owner1Id,
        title: "Luxury Studio in Downtown",
        description: "Beautiful studio apartment in the heart of downtown. Featuring modern furniture, high ceilings, and great natural lighting. Walking distance to restaurants, shops, and public transportation.",
        type: "studio",
        address: "123 Main St",
        city: "San Francisco",
        state: "CA",
        zipCode: "94105",
        price: 1450,
        bedrooms: 1,
        bathrooms: 1,
        area: 650,
        latitude: 37.7897,
        longitude: -122.3972,
      }).returning();
      
      // Property 2: Modern Family House with Garden
      const [property2] = await db.insert(schema.properties).values({
        ownerId: owner1Id,
        title: "Modern Family House with Garden",
        description: "Spacious family home with a beautiful garden. Features 3 bedrooms, 2 bathrooms, a modern kitchen, and a cozy living area. Great neighborhood with excellent schools nearby.",
        type: "house",
        address: "456 Park Ave",
        city: "Oakland",
        state: "CA",
        zipCode: "94611",
        price: 2850,
        bedrooms: 3,
        bathrooms: 2,
        area: 1450,
        latitude: 37.8122,
        longitude: -122.2583,
      }).returning();
      
      // Property 3: Cozy 1BR with City Views
      const [property3] = await db.insert(schema.properties).values({
        ownerId: owner2Id,
        title: "Cozy 1BR with City Views",
        description: "Charming one-bedroom apartment with stunning city views. Features a renovated kitchen, modern bathroom, and spacious living area. Located in a quiet neighborhood with easy access to public transportation.",
        type: "apartment",
        address: "789 Broadway",
        city: "San Jose",
        state: "CA",
        zipCode: "95112",
        price: 1750,
        bedrooms: 1,
        bathrooms: 1,
        area: 750,
        latitude: 37.3359,
        longitude: -121.8914,
      }).returning();
      
      // Property 4: Luxury Penthouse Suite
      const [property4] = await db.insert(schema.properties).values({
        ownerId: owner2Id,
        title: "Luxury Penthouse Suite",
        description: "Exquisite penthouse apartment with panoramic views. Features 2 spacious bedrooms, 2 luxury bathrooms, a gourmet kitchen, and a large balcony. Located in a premier building with 24/7 security, a fitness center, and a rooftop pool.",
        type: "apartment",
        address: "101 Market St",
        city: "San Francisco",
        state: "CA",
        zipCode: "94103",
        price: 3200,
        bedrooms: 2,
        bathrooms: 2,
        area: 1200,
        latitude: 37.7937,
        longitude: -122.3965,
      }).returning();
      
      // Add property images
      await db.insert(schema.propertyImages).values([
        {
          propertyId: property1.id,
          url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
          isPrimary: true,
        },
        {
          propertyId: property1.id,
          url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        },
        {
          propertyId: property1.id,
          url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        },
        {
          propertyId: property2.id,
          url: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=600&fit=crop",
          isPrimary: true,
        },
        {
          propertyId: property2.id,
          url: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop",
        },
        {
          propertyId: property2.id,
          url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
        },
        {
          propertyId: property3.id,
          url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
          isPrimary: true,
        },
        {
          propertyId: property3.id,
          url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        },
        {
          propertyId: property3.id,
          url: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop",
        },
        {
          propertyId: property4.id,
          url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
          isPrimary: true,
        },
        {
          propertyId: property4.id,
          url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
        },
        {
          propertyId: property4.id,
          url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        },
      ]);
      
      // Get amenities for adding to properties
      const allAmenities = await db.select().from(schema.amenities);
      
      if (allAmenities.length > 0) {
        // Add amenities to properties
        const propertyAmenitiesValues = [
          // Property 1 amenities
          { propertyId: property1.id, amenityId: allAmenities[0].id }, // WiFi
          { propertyId: property1.id, amenityId: allAmenities[1].id }, // Air Conditioning
          { propertyId: property1.id, amenityId: allAmenities[5].id }, // Kitchen
          { propertyId: property1.id, amenityId: allAmenities[7].id }, // Elevator
          
          // Property 2 amenities
          { propertyId: property2.id, amenityId: allAmenities[0].id }, // WiFi
          { propertyId: property2.id, amenityId: allAmenities[1].id }, // Air Conditioning
          { propertyId: property2.id, amenityId: allAmenities[2].id }, // Heating
          { propertyId: property2.id, amenityId: allAmenities[3].id }, // Washing Machine
          { propertyId: property2.id, amenityId: allAmenities[4].id }, // Dryer
          { propertyId: property2.id, amenityId: allAmenities[5].id }, // Kitchen
          { propertyId: property2.id, amenityId: allAmenities[6].id }, // Parking
          { propertyId: property2.id, amenityId: allAmenities[13].id }, // Garden
          
          // Property 3 amenities
          { propertyId: property3.id, amenityId: allAmenities[0].id }, // WiFi
          { propertyId: property3.id, amenityId: allAmenities[2].id }, // Heating
          { propertyId: property3.id, amenityId: allAmenities[5].id }, // Kitchen
          { propertyId: property3.id, amenityId: allAmenities[11].id }, // TV
          { propertyId: property3.id, amenityId: allAmenities[12].id }, // Balcony
          
          // Property 4 amenities
          { propertyId: property4.id, amenityId: allAmenities[0].id }, // WiFi
          { propertyId: property4.id, amenityId: allAmenities[1].id }, // Air Conditioning
          { propertyId: property4.id, amenityId: allAmenities[2].id }, // Heating
          { propertyId: property4.id, amenityId: allAmenities[5].id }, // Kitchen
          { propertyId: property4.id, amenityId: allAmenities[7].id }, // Elevator
          { propertyId: property4.id, amenityId: allAmenities[8].id }, // Pool
          { propertyId: property4.id, amenityId: allAmenities[9].id }, // Gym
          { propertyId: property4.id, amenityId: allAmenities[11].id }, // TV
          { propertyId: property4.id, amenityId: allAmenities[12].id }, // Balcony
          { propertyId: property4.id, amenityId: allAmenities[14].id }, // Security System
        ];
        
        await db.insert(schema.propertyAmenities).values(propertyAmenitiesValues);
      }
      
      // Add favorites (if tenants exist)
      if (tenant1Id && tenant2Id) {
        await db.insert(schema.favorites).values([
          { userId: tenant1Id, propertyId: property3.id },
          { userId: tenant2Id, propertyId: property1.id },
          { userId: tenant2Id, propertyId: property4.id },
        ]);
        
        // Add some messages
        await db.insert(schema.messages).values([
          {
            senderId: tenant1Id,
            receiverId: owner2Id,
            propertyId: property3.id,
            content: "Hi, I'm interested in your apartment. Is it still available?",
          },
          {
            senderId: owner2Id,
            receiverId: tenant1Id,
            propertyId: property3.id,
            content: "Yes, it's still available. Would you like to schedule a viewing?",
          },
          {
            senderId: tenant2Id,
            receiverId: owner1Id,
            propertyId: property1.id,
            content: "Hello, I'm interested in renting your studio. What's the earliest move-in date?",
          },
          {
            senderId: owner1Id,
            receiverId: tenant2Id,
            propertyId: property1.id,
            content: "It's available from the 1st of next month. Would that work for you?",
          },
        ]);
      }
    }
    
    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
