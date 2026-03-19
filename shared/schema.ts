
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========= Custom Data Types (ENUMs) =========
export const role = pgEnum("role", ['admin', 'moderator', 'member']);
export const verificationCategory = pgEnum("verification_category", ['content_creator', 'celebrity', 'brand_business', 'influencer']);
export const followerRelationship = pgEnum("follower_relationship", ['follower', 'following']);
export const notificationType = pgEnum("notification_type", ['like', 'comment', 'follow', 'mention', 'community_invite']);
export const savedItemType = pgEnum("saved_item_type", ['post', 'video', 'article']);
export const storyType = pgEnum("story_type", ['image', 'video']);


// ========= Tables =========

// --- Users ---
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  username: text("username").unique(),
  name: text("name"),
});

// --- Communities ---
export const communities = pgTable("communities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  image_url: text("image_url"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// --- Community Members ---
export const communityMembers = pgTable("community_members", {
  community_id: uuid("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: role("role").notNull().default('member'),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => {
    return {
        pk: sql`PRIMARY KEY("community_id", "user_id")`
    }
});

// --- Posts ---
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  community_id: uuid("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  author_id: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content"),
  image_url: text("image_url"),
  parent_post_id: uuid("parent_post_id").references(():any => posts.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// --- Post Reactions ---
export const postReactions = pgTable("post_reactions", {
    post_id: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    reaction: text("reaction").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => {
    return {
        pk: sql`PRIMARY KEY("post_id", "user_id", "reaction")`
    }
});


// --- Conversations ---
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  last_message_at: timestamp("last_message_at", { withTimezone: true }).defaultNow(),
});

// --- Conversation Participants ---
export const conversationParticipants = pgTable("conversation_participants", {
    conversation_id: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
}, (table) => {
    return {
        pk: sql`PRIMARY KEY("conversation_id", "user_id")`
    }
});

// --- Messages ---
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  conversation_id: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  author_id: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content"),
  image_url: text("image_url"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// --- Message Reactions ---
export const messageReactions = pgTable("message_reactions", {
    message_id: uuid("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
    user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    reaction: text("reaction").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => {
    return {
        pk: sql`PRIMARY KEY("message_id", "user_id", "reaction")`
    }
});


// --- Channels ---
export const channels = pgTable("channels", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  community_id: uuid("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  is_private: boolean("is_private").default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// --- Channel Members ---
export const channelMembers = pgTable("channel_members", {
    channel_id: uuid("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
    user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
}, (table) => {
    return {
        pk: sql`PRIMARY KEY("channel_id", "user_id")`
    }
});

// --- Channel Messages ---
export const channelMessages = pgTable("channel_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  channel_id: uuid("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  author_id: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content"),
  image_url: text("image_url"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// --- Live Sessions ---
export const liveSessions = pgTable("live_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  channel_id: uuid("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  created_by: uuid("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  active: boolean("active").default(true),
  started_at: timestamp("started_at", { withTimezone: true }).defaultNow(),
  ended_at: timestamp("ended_at", { withTimezone: true }),
});

// --- Verification Requests ---
export const verificationRequests = pgTable("verification_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").unique().notNull().references(() => users.id, { onDelete: "cascade" }),
  category: verificationCategory("category").notNull(),
  full_name: text("full_name").notNull(),
  id_document_url: text("id_document_url").notNull(),
  status: text("status").default('pending'),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// --- User Links ---
export const userLinks = pgTable("user_links", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  request_id: uuid("request_id").notNull().references(() => verificationRequests.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// --- Followers ---
export const followers = pgTable("followers", {
    user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    target_user_id: uuid("target_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    relationship_type: followerRelationship("relationship_type").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => {
    return {
        pk: sql`PRIMARY KEY("user_id", "target_user_id", "relationship_type")`
    }
});


// --- Notifications ---
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: notificationType("type").notNull(),
  actor_id: uuid("actor_id").references(() => users.id, { onDelete: "cascade" }),
  entity_id: uuid("entity_id"),
  entity_type: text("entity_type"),
  read: boolean("read").default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// --- Saved Items ---
export const savedItems = pgTable("saved_items", {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    item_id: uuid("item_id").notNull(),
    item_type: savedItemType("item_type").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => {
    return {
        unq: sql`UNIQUE("user_id", "item_id", "item_type")`
    }
});

// --- Videos ---
export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  author_id: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  video_url: text("video_url").notNull(),
  thumbnail_url: text("thumbnail_url"),
  description: text("description"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// --- Stories ---
export const stories = pgTable("stories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  author_id: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  media_url: text("media_url").notNull(),
  story_type: storyType("story_type").notNull(),
  expires_at: timestamp("expires_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ========= Zod Schemas for Validation =========
export const insertUserSchema = createInsertSchema(users);

// ========= Type Definitions for Inference =========
export type User = typeof users.$inferSelect;
export type Community = typeof communities.$inferSelect;
export type CommunityMember = typeof communityMembers.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type PostReaction = typeof postReactions.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MessageReaction = typeof messageReactions.$inferSelect;
export type Channel = typeof channels.$inferSelect;
export type ChannelMember = typeof channelMembers.$inferSelect;
export type ChannelMessage = typeof channelMessages.$inferSelect;
export type LiveSession = typeof liveSessions.$inferSelect;
export type VerificationRequest = typeof verificationRequests.$inferSelect;
export type UserLink = typeof userLinks.$inferSelect;
export type Follower = typeof followers.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type SavedItem = typeof savedItems.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type Story = typeof stories.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
