import { initDatabase } from '../config/db';
import { runDatabaseSeed } from './seedData';

async function main() {
  initDatabase();
  await runDatabaseSeed();
  process.exit(0);
}

main().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
