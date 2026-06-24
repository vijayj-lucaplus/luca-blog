// Dev-only helper: list posts (id, status, views, slug) from MongoDB.
// Usage: node scripts/db-peek.mjs
import { readFileSync } from 'node:fs';
import { MongoClient } from 'mongodb';

const envText = readFileSync('.env.local', 'utf8');
const uri = (envText.match(/MONGODB_URI="?([^"\n]+)"?/) || [])[1];
if (!uri) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db();
const posts = await db
  .collection('posts')
  .find({}, { projection: { title: 1, slug: 1, status: 1, views: 1 } })
  .sort({ createdAt: -1 })
  .toArray();

console.log(`POSTS: ${posts.length}`);
for (const p of posts) {
  console.log(`${p._id}\t${p.status}\tviews=${p.views ?? 0}\t${p.slug}`);
}
await client.close();
