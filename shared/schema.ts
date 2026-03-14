import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const conversationParticipants = pgTable("conversation_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversation_id: varchar("conversation_id").notNull(),
  user_id: varchar("user_id").notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversation_id: varchar("conversation_id").notNull(),
  sender_id: varchar("sender_id").notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  read: boolean("read").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;

// Communities and channels
export const communities = pgTable("communities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(),
  visibility: varchar("visibility").default('public'), // public, private, hidden
  owner_id: varchar("owner_id").notNull(),
});

export const communityMembers = pgTable("community_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  community_id: varchar("community_id").notNull(),
  user_id: varchar("user_id").notNull(),
  role: varchar("role").default('member'), // member, moderator, admin
  joined_at: timestamp("joined_at").defaultNow(),
});

export const channels = pgTable("channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  community_id: varchar("community_id").notNull(),
  name: text("name").notNull(),
  type: varchar("type").default('text'), // text, voice, video, live
  created_at: timestamp("created_at").defaultNow(),
  is_private: boolean("is_private").default(false),
});

export const channelMembers = pgTable("channel_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channel_id: varchar("channel_id").notNull(),
  user_id: varchar("user_id").notNull(),
  joined_at: timestamp("joined_at").defaultNow(),
});

export const channelMessages = pgTable("channel_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channel_id: varchar("channel_id").notNull(),
  sender_id: varchar("sender_id").notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  read: boolean("read").default(false),
});

export const messageReactions = pgTable("message_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  message_id: varchar("message_id").notNull(),
  user_id: varchar("user_id").notNull(),
  reaction: varchar("reaction").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const liveSessions = pgTable("live_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channel_id: varchar("channel_id").notNull(),
  host_id: varchar("host_id").notNull(),
  title: text("title"),
  is_live: boolean("is_live").default(true),
  started_at: timestamp("started_at").defaultNow(),
  ended_at: timestamp("ended_at"),
});

// Posts and reactions
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  image_url: text("image_url"),
  likes_count: integer("likes_count").default(0),
  comments_count: integer("comments_count").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const postReactions = pgTable("post_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  post_id: varchar("post_id").notNull().references(() => posts.id),
  user_id: varchar("user_id").notNull().references(() => users.id),
  reaction: varchar("reaction", { length: 50 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export type LiveSession = typeof liveSessions.$inferSelect;
export type Community = typeof communities.$inferSelect;
export type CommunityMember = typeof communityMembers.$inferSelect;
export type Channel = typeof channels.$inferSelect;
export type ChannelMessage = typeof channelMessages.$inferSelect;
export type MessageReaction = typeof messageReactions.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type PostReaction = typeof postReactions.$inferSelect;

