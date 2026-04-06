const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Routing based on user-agent', () => {
  test('Should display React page for standard desktop browsers', async () => {
    const response = await request(app)
      .get('/')
      .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0');
    
    expect(response.text).toContain('<div id="root">');
    expect(response.statusCode).toBe(200);
  });

});