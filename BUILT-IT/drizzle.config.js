export default {
    schema: "./src/schema.js",
    out: "./migrations",
    driver: "pg",
    dbCredentials: {
      connectionString: process.env.DATABASE_URL
    }
  }
  