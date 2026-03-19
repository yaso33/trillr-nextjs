
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./shared/schema.ts",
  out: "./supabase/migrations",
  dbCredentials: {
    url: process.env.SUPABASE_DB_URL!,
  },
});
