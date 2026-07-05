/**
 * One-time script to create the first Organizer account.
 * Organizer accounts can't be self-registered (see authController.js) — 
 * they must be created directly like this, or by an existing organizer's
 * own tooling later. Run this once per organizer you need to bootstrap.
 *
 * Usage:
 *   node scripts/seedOrganizer.js
 *
 * Edit the values below before running, then delete/ignore this file
 * afterwards — it's not wired into any route.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

const ORGANIZER = {
  email: 'organizer@iiitdwd.ac.in', 
  password: 'organizer@123',  
  username: 'eventora_organizer',        
  name: 'Eventora Organizer',
  userType: 'organizer',
  adminClubId: null
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await User.findOne({
    $or: [{ email: ORGANIZER.email }, { username: ORGANIZER.username }]
  });

  if (existing) {
    console.log('A user with this email/username already exists:', existing.email);
    await mongoose.disconnect();
    return;
  }

  const user = await User.create(ORGANIZER); // password gets hashed by the User model's pre-save hook
  console.log('✅ Organizer account created:', user.email);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed to seed organizer:', err);
  process.exit(1);
});