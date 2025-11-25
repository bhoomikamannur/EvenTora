const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

dotenv.config({ path: './.env' });

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB. Querying users...');
    const users = await User.find({}).select('email userType name');
    console.log(`Found ${users.length} users:`);
    users.forEach(u => console.log(`- ${u.email} (${u.userType}) - ${u.name}`));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error querying users:', err.message);
    process.exit(1);
  }
})();
