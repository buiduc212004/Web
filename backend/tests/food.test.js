jest.mock('mssql', () => {
  const mssql = {
    connect: jest.fn().mockResolvedValue({
      request: () => ({
        query: jest.fn().mockResolvedValue({ recordset: [{ id: 1, Name: 'Test Food', Price: 10000, category: 'Test' }] })
      })
    }),
    Int: jest.fn(),
    NVarChar: jest.fn(),
    Float: jest.fn()
  };
  return mssql;
});

const app = require('../server');
const request = require('supertest');

describe('GET /api/foods', () => {
  it('should return list of foods', async () => {
    const res = await request(app).get('/api/foods');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
}); 