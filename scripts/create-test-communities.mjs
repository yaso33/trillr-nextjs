
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// --- Configuration ---
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Supabase URL and Service Key must be provided.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- Data ---
const TEST_COMMUNITIES = [
    { name: 'Gamers Assembly', description: 'A place for gamers to unite and conquer. Discuss the latest titles, find teammates, and share epic moments.' },
    { name: 'Coders Hub', description: 'Connect with fellow developers. Share code, solve problems, and explore the latest in software development.' },
    { name: 'Foodies Corner', description: 'For the love of food! Share recipes, review restaurants, and discuss everything delicious.' },
    { name: 'Travel Enthusiasts', description: 'Share your travel stories, get recommendations, and plan your next adventure with a community of explorers.' },
    { name: 'Bookworms Society', description: 'A cozy corner for book lovers. Discuss your favorite books, authors, and genres.' },
    { name: 'Fitness Fanatics', description: 'Your daily dose of motivation. Share workout tips, healthy recipes, and celebrate fitness milestones.' },
    { name: 'Musicians Lair', description: 'A space for musicians to collaborate, share their work, and find inspiration.' },
    { name: 'Artists Collective', description: 'Showcase your art, get feedback, and connect with a vibrant community of artists.' },
    { name: 'Movie Buffs', description: 'Discuss everything about movies, from the latest blockbusters to hidden gems.' },
    { name: 'Startup Founders', description: 'Connect with fellow entrepreneurs. Share challenges, celebrate wins, and build the future together.' }
];

// --- Main Function ---
async function main() {
    console.log('Starting to create test communities...');

    // 1. Get a user to be the owner
    const { data: users, error: userError } = await supabase.from('users').select('id').limit(1);
    if (userError) {
        console.error('Error fetching a user:', userError.message);
        return;
    }
    if (!users || users.length === 0) {
        console.error('No users found in the database. Please create a user first.');
        return;
    }
    const ownerId = users[0].id;
    console.log(`Using user ${ownerId} as the owner for test communities.`);

    // 2. Create communities
    for (const community of TEST_COMMUNITIES) {
        console.log(`Creating community: "${community.name}"...`);
        const { data, error } = await supabase
            .from('communities')
            .insert([{
                id: uuidv4(), // Generate a new UUID for each community
                owner_id: ownerId,
                name: community.name,
                description: community.description,
                visibility: 'public',
            }]);

        if (error) {
            if (error.code === '23505') { // unique constraint violation
                console.warn(`Community "${community.name}" already exists. Skipping.`);
            } else {
                console.error(`Error creating community "${community.name}":`, error.message);
            }
        } else {
            console.log(`Community "${community.name}" created successfully.`);
        }
    }

    console.log('Test communities creation process finished.');
}

main().catch(console.error);
