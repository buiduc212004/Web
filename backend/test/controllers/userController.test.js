const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

describe('User Controller', () => {
    let testUser;
    let testToken;

    beforeEach(async () => {
        // Tạo user test
        testUser = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            fullName: 'Test User',
            phoneNumber: '0123456789',
            address: 'Test Address'
        });
        await testUser.save();

        // Tạo token test
        testToken = jwt.sign(
            { _id: testUser._id, role: testUser.role },
            process.env.JWT_SECRET || 'your-secret-key'
        );
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    describe('POST /api/users/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/users/register')
                .send({
                    username: 'newuser',
                    email: 'new@example.com',
                    password: 'password123',
                    fullName: 'New User',
                    phoneNumber: '0987654321',
                    address: 'New Address'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('user');
            expect(res.body).toHaveProperty('token');
        });

        it('should not register with existing email', async () => {
            const res = await request(app)
                .post('/api/users/register')
                .send({
                    username: 'testuser2',
                    email: 'test@example.com',
                    password: 'password123',
                    fullName: 'Test User 2',
                    phoneNumber: '0123456789',
                    address: 'Test Address 2'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/users/login', () => {
        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('user');
            expect(res.body).toHaveProperty('token');
        });

        it('should not login with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/users/profile', () => {
        it('should get user profile with valid token', async () => {
            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('username', 'testuser');
        });

        it('should not get profile without token', async () => {
            const res = await request(app)
                .get('/api/users/profile');

            expect(res.statusCode).toBe(401);
        });
    });
}); 