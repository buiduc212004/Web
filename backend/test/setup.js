const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Kết nối tới MongoDB test
mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/restaurant_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Xóa tất cả collections sau mỗi test
afterAll(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
    await mongoose.connection.close();
}); 