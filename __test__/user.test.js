const request = require('supertest');
const app = require('../app');

describe('POST /users/register', () => {
  let userData = {
    email: undefined,
    full_name: undefined,
    password: undefined,
    profile_image_url: undefined,
    age: undefined,
    phone_number: undefined,
  };

  beforeEach(() => {
    userData.email = 'mail@test.com';
    userData.full_name = 'mail bin mail';
    userData.password = '12345678';
    userData.profile_image_url = 'image.test.com';
    userData.age = 21;
    userData.phone_number = '0821111111';
  });

  it('Should create new user', async () => {
    const res = await request(app).post('/users/register').send(userData);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user');
    const user = res.body.user;
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('full_name');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('profile_image_url');
    expect(user).toHaveProperty('age');
    expect(user).toHaveProperty('phone_number');
    delete userData.password;
    expect(user).toEqual(userData);
  });

  it('Should error if not send any data', async () => {
    const res = await request(app).post('/users/register');
    expect(res.statusCode).toBe(400);
  });

  describe('Should error if there are missing datas', () => {
    it('No email', async () => {
      delete userData.email;
      const res = await request(app).post('/users/register');
      expect(res.statusCode).toBe(400);
    });
    it('No full_name', async () => {
      delete userData.full_name;
      const res = await request(app).post('/users/register');
      expect(res.statusCode).toBe(400);
    });
    it('No username', async () => {
      delete userData.username;
      const res = await request(app).post('/users/register');
      expect(res.statusCode).toBe(400);
    });
    it('No password', async () => {
      delete userData.password;
      const res = await request(app).post('/users/register');
      expect(res.statusCode).toBe(400);
    });
    it('No profile_image_url', async () => {
      delete userData.profile_image_url;
      const res = await request(app).post('/users/register');
      expect(res.statusCode).toBe(400);
    });
    it('No age', async () => {
      delete userData.age;
      const res = await request(app).post('/users/register');
      expect(res.statusCode).toBe(400);
    });

    it('No phone_number', async () => {
      delete userData.phone_number;
      const res = await request(app).post('/users/register');
      expect(res.statusCode).toBe(400);
    });
  });

  it('Should error if email not valid email', async () => {
    userData.email = 'This is invalid email';
    const res = await request(app).post('/users/register').send(userData);
    expect(res.statusCode).toBe(400);
  });

  it('Should error if profile_image_url not valid url', async () => {
    userData.profile_image_url = 'This is invalid url';
    const res = await request(app).post('/users/register').send(userData);
    expect(res.statusCode).toBe(400);
  });

  it('Should error if age not a number', async () => {
    userData.age = 'abc';
    const res = await request(app).post('/users/register').send(userData);
    expect(res.statusCode).toBe(400);
  });

  it('Should error if phone_number not a number', async () => {
    userData.phone_number = 'abc';
    const res = await request(app).post('/users/register').send(userData);
    expect(res.statusCode).toBe(400);
  });
});
