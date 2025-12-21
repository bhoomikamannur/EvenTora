const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Club = require('../models/Club');
const User = require('../models/User');
const Post = require('../models/Post');
const Event = require('../models/Event');
const Member = require('../models/Member');
const Media = require('../models/Media');

dotenv.config();

const clubs = [
  { name: 'Tech Club', logo: '💻', color: '#ab83c3', type: 'technical', members: 4, communityMembers: 450 },
  { name: 'Robotics Club', logo: '🤖', color: '#ff85b4', type: 'technical', members: 3, communityMembers: 380 },
  { name: 'AI/ML Club', logo: '🧠', color: '#ff337e', type: 'technical', members: 4, communityMembers: 520 },
  { name: 'Cybersecurity Club', logo: '🔒', color: '#86c6fd', type: 'technical', members: 3, communityMembers: 410 },
  { name: 'Web Dev Club', logo: '🌐', color: '#70baff', type: 'technical', members: 4, communityMembers: 560 },
  { name: 'Drama Society', logo: '🎭', color: '#ff85b4', type: 'cultural', members: 4, communityMembers: 340 },
  { name: 'Music Band', logo: '🎸', color: '#ff337e', type: 'cultural', members: 3, communityMembers: 290 },
  { name: 'Dance Crew', logo: '💃', color: '#70baff', type: 'cultural', members: 4, communityMembers: 310 },
  { name: 'Photography Club', logo: '📷', color: '#ab83c3', type: 'cultural', members: 3, communityMembers: 430 },
  { name: 'Art Circle', logo: '🎨', color: '#ff85b4', type: 'cultural', members: 3, communityMembers: 270 }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await Club.deleteMany({});
    await User.deleteMany({});
    await Post.deleteMany({});
    await Event.deleteMany({});
    await Member.deleteMany({});
    await Media.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create clubs
    const createdClubs = await Club.insertMany(clubs);
    console.log(`✅ Created ${createdClubs.length} clubs`);

    // Create admin user - Tech Club
    const adminUser = await User.create({
      email: 'admin@iiitdwd.ac.in',
      password: 'admin123',
      name: 'Tech Club Admin',
      userType: 'admin',
      adminClubId: createdClubs[0]._id,
      joinedClubs: [createdClubs[0]._id]
    });
    console.log('✅ Created Tech Club admin');

    // Create Dynamight admin
    const dynamightAdmin = await User.create({
      email: 'dynamight@iiitdwd.ac.in',
      password: 'dynamight123',
      name: 'Dynamight Admin',
      userType: 'admin',
      adminClubId: createdClubs[7]._id,
      joinedClubs: [createdClubs[7]._id]
    });
    console.log('✅ Created Dynamight admin');

    // Create Music Club admin
    const musicAdmin = await User.create({
      email: 'musicclub@iiitdwd.ac.in',
      password: 'music123',
      name: 'Music Club Admin',
      userType: 'admin',
      adminClubId: createdClubs[6]._id,
      joinedClubs: [createdClubs[6]._id]
    });
    console.log('✅ Created Music Club admin');

    // Create student user 1
    const studentUser = await User.create({
      email: 'student@iiitdwd.ac.in',
      password: 'student123',
      name: 'John Doe',
      userType: 'student',
      joinedClubs: [createdClubs[0]._id, createdClubs[1]._id, createdClubs[5]._id]
    });
    console.log('✅ Created student 1');

    // Create student user 2
    const studentUser2 = await User.create({
      email: 'student2@iiitdwd.ac.in',
      password: 'student456',
      name: 'Sarah Smith',
      userType: 'student',
      joinedClubs: [createdClubs[2]._id, createdClubs[6]._id, createdClubs[8]._id]
    });
    console.log('✅ Created student 2');

    // Create sample posts
    const posts = [
      {
        clubId: createdClubs[0]._id,
        eventTitle: 'Hackathon 2024 Winners',
        caption: 'Congratulations to Team Alpha for winning first place! Amazing projects from all teams.',
        images: ['https://via.placeholder.com/600x400/ab83c3/ffffff?text=Hackathon+Winners'],
        author: 'Tech Club',
        authorId: adminUser._id,
        likes: 124
      },
      {
        clubId: createdClubs[5]._id,
        eventTitle: 'Hamlet Performance',
        caption: 'Our annual Shakespeare performance was a huge success! Thank you to everyone who attended.',
        images: ['https://via.placeholder.com/600x400/ff85b4/ffffff?text=Hamlet+Show'],
        author: 'Drama Society',
        authorId: adminUser._id,
        likes: 89
      }
    ];
    await Post.insertMany(posts);
    console.log('✅ Created sample posts');

    // Create sample events
    const events = [
      {
        clubId: createdClubs[0]._id,
        title: 'Annual Tech Fest',
        description: 'The biggest tech event of the year with competitions, workshops, and prizes!',
        venue: 'Main Auditorium',
        date: '2025-12-15',
        time: '10:00 AM',
        rsvps: 156
      },
      {
        clubId: createdClubs[5]._id,
        title: 'Drama Workshop',
        description: 'Learn method acting from professional theater artists.',
        venue: 'Theatre Room',
        date: '2025-12-01',
        time: '4:00 PM',
        rsvps: 45
      },
      {
        clubId: createdClubs[6]._id,
        title: 'Music Jam Session',
        description: 'Open jam session for all musicians. Bring your instruments!',
        venue: 'Music Room',
        date: '2025-12-05',
        time: '6:00 PM',
        rsvps: 67
      }
    ];
    await Event.insertMany(events);
    console.log('✅ Created sample events');

    // Create sample members
    const members = [
      { clubId: createdClubs[0]._id, name: 'Rahul Sharma', position: 'Lead', email: 'rahul@iiitdwd.ac.in' },
      { clubId: createdClubs[0]._id, name: 'Priya Patel', position: 'Co-Lead', email: 'priya@iiitdwd.ac.in' },
      { clubId: createdClubs[0]._id, name: 'Arjun Kumar', position: 'Team Lead', email: 'arjun@iiitdwd.ac.in' },
      { clubId: createdClubs[0]._id, name: 'Sneha Reddy', position: 'Member', email: 'sneha@iiitdwd.ac.in' }
    ];
    await Member.insertMany(members);
    console.log('✅ Created sample members');

    // Create sample media
    const media = [
      {
        clubId: createdClubs[0]._id,
        title: 'Hackathon Highlights',
        description: 'Amazing projects from our annual hackathon',
        type: 'youtube',
        link: 'https://youtube.com/watch?v=example',
        thumbnail: 'https://via.placeholder.com/400x300/ab83c3/ffffff?text=Hackathon+Video'
      },
      {
        clubId: createdClubs[5]._id,
        title: 'Behind the Scenes',
        description: 'Drama rehearsal moments',
        type: 'instagram',
        link: 'https://instagram.com/p/example',
        thumbnail: 'https://via.placeholder.com/400x300/ff85b4/ffffff?text=Drama+BTS'
      }
    ];
    await Media.insertMany(media);
    console.log('✅ Created sample media');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin@iiitdwd.ac.in / admin123');
    console.log('Student: student@iiitdwd.ac.in / student123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();