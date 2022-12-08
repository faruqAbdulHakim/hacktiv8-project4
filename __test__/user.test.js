const request = require('supertest');
const app = require('../app');
const { Sequelize } = require('sequelize');
const sequelizeConfig = require('../config/config.json')[
  process.env.NODE_ENV || 'test'
];
const bcryptHelper = require('../helpers/bcryptHelper');
const jwtHelper = require('../helpers/jwtHelper');

const sequelize = new Sequelize(sequelizeConfig);
const queryInterface = sequelize.getQueryInterface();

afterAll(async () => {
  try {
    await queryInterface.bulkDelete('Users', {}, null);
  } catch (e) {
    console.warn(e.name, e.message);
  }
});

describe('POST /users/register', () => {
  let userData = {
    email: undefined,
    full_name: undefined,
    username: undefined,
    password: undefined,
    profile_image_url: undefined,
    age: undefined,
    phone_number: undefined,
  };

  beforeEach(() => {
    userData.email = 'mail@test.com';
    userData.full_name = 'mail bin mail';
    userData.username = 'mail';
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
      const res = await request(app).post('/users/register').send(userData);
      expect(res.statusCode).toBe(400);
    });
    it('No full_name', async () => {
      delete userData.full_name;
      const res = await request(app).post('/users/register').send(userData);
      expect(res.statusCode).toBe(400);
    });
    it('No username', async () => {
      delete userData.username;
      const res = await request(app).post('/users/register').send(userData);
      expect(res.statusCode).toBe(400);
    });
    it('No password', async () => {
      delete userData.password;
      const res = await request(app).post('/users/register').send(userData);
      expect(res.statusCode).toBe(400);
    });
    it('No profile_image_url', async () => {
      delete userData.profile_image_url;
      const res = await request(app).post('/users/register').send(userData);
      expect(res.statusCode).toBe(400);
    });
    it('No age', async () => {
      delete userData.age;
      const res = await request(app).post('/users/register').send(userData);
      expect(res.statusCode).toBe(400);
    });

    it('No phone_number', async () => {
      delete userData.phone_number;
      const res = await request(app).post('/users/register').send(userData);
      expect(res.statusCode).toBe(400);
    });
  });

  describe('Should error if user already registered', () => {
    it('email already registered', async () => {
      userData.username = 'mail2'; // prevent username error
      const res = await request(app).post('/users/register').send(userData);
      expect(res.statusCode === 400);
    });
    it('username already registered', async () => {
      userData.email = 'mail2@test.com'; // prevent email error
      const res = await request(app).post('/users/register').send(userData);
      expect(res.statusCode === 400);
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

describe('POST /users/login', () => {
  beforeAll(async () => {
    try {
      await queryInterface.bulkDelete('Users', {}, null);
      await queryInterface.bulkInsert('Users', [
        {
          email: 'mail@test.com',
          full_name: 'mail bin mail',
          username: 'mail',
          password: bcryptHelper.hashPassword('12345678'),
          profile_image_url: 'image.test.com',
          age: 21,
          phone_number: '0821111111',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    } catch (e) {
      console.warn(e.name, e.message);
    }
  });

  afterAll(async () => {
    try {
      await queryInterface.bulkDelete('Users', {}, null);
    } catch (e) {
      console.warn(e.name, e.message);
    }
  });

  it('Should success and return token', async () => {
    const data = {
      email: 'mail@test.com',
      password: '12345678',
    };
    const res = await request(app).post('/users/login').send(data);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    const user = jwtHelper.verify(res.body.token);
    expect(user).toHaveProperty('id');
    expect(typeof user.id).toBe('number');
  });

  describe('Should fail', () => {
    it('if not send any datas', async () => {
      const res = await request(app).post('/users/login');
      expect(res.statusCode).toBe(400);
    });

    it('if not send email data', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({ password: '12345678' });
      expect(res.statusCode).toBe(400);
    });

    it('if not send password data', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({ email: 'randommail@test.com' });
      expect(res.statusCode).toBe(400);
    });

    it('if email not registered', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({ email: 'randommail@test.com', password: '12345678' });
      expect(res.statusCode).toBe(400);
    });

    it("if password doesn't match", async () => {
      const res = await request(app)
        .post('/users/login')
        .send({ email: 'mail@test.com', password: 'random password' });
      expect(res.statusCode).toBe(400);
    });
  });
});

describe('PUT /users/:userId', () => {
  const userData = {
    email: 'newemail@test.com',
    full_name: 'new fullname',
    username: 'new username',
    profile_image_url: 'newprofileimgurl.test.com',
    age: '24',
    phone_number: '0888888',
  };
  let token = '';
  let userId = 0;

  beforeEach(async () => {
    try {
      await queryInterface.bulkDelete('Users', {}, null);
      await queryInterface.bulkInsert('Users', [
        {
          email: 'mail@test.com',
          full_name: 'mail bin mail',
          username: 'mail',
          password: bcryptHelper.hashPassword('12345678'),
          profile_image_url: 'image.test.com',
          age: 21,
          phone_number: '0821111111',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const res = await request(app)
        .post('/users/login')
        .send({ email: 'mail@test.com', password: '12345678' });
      const user = jwtHelper.verify(res.body.token);
      token = res.body.token;
      userId = user.id;
    } catch (e) {
      console.warn(e.name, e.message);
    }
  });

  afterAll(async () => {
    try {
      await queryInterface.bulkDelete('Users', {}, null);
    } catch (e) {
      console.warn(e.name, e.message);
    }
  });

  it('Should success', async () => {
    const res = await request(app)
      .put('/users/' + userId)
      .set({ token })
      .send(userData);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    const user = res.body.user;
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('full_name');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('profile_image_url');
    expect(user).toHaveProperty('age');
    expect(user).toHaveProperty('phone_number');
    expect(user).toEqual(userData);
  });

  describe('Should error', () => {
    it('if not send data', async () => {
      const res = await request(app)
        .put('/users/' + userId)
        .set({ token });
      expect(res.statusCode).toBe(400);
    });
    it('if not send all data required', async () => {
      const res = await request(app)
        .put('/users/' + userId)
        .set({ token })
        .send({ email: userData.email });
      expect(res.statusCode).toBe(400);
    });
    it('if not send token', async () => {
      const res = await request(app)
        .put('/users/' + userId)
        .send(userData);
      expect(res.statusCode).toBe(401);
    });
    it('if send invalid token', async () => {
      const res = await request(app)
        .put('/users/' + userId)
        .set({ token: 'randomstring' })
        .send(userData);
      expect(res.statusCode).toBe(401);
    });
    it('if change other user data', async () => {
      const res = await request(app)
        .put('/users/' + (userId + 1))
        .set({ token })
        .send(userData);
      expect(res.statusCode).toBe(403);
    });
  });
});

describe('DELETE /users/:userId', () => {
  let token = '';
  let userId = 0;

  beforeEach(async () => {
    try {
      await queryInterface.bulkDelete('Users', {}, null);
      await queryInterface.bulkInsert('Users', [
        {
          email: 'mail@test.com',
          full_name: 'mail bin mail',
          username: 'mail',
          password: bcryptHelper.hashPassword('12345678'),
          profile_image_url: 'image.test.com',
          age: 21,
          phone_number: '0821111111',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const res = await request(app)
        .post('/users/login')
        .send({ email: 'mail@test.com', password: '12345678' });
      const user = jwtHelper.verify(res.body.token);
      token = res.body.token;
      userId = user.id;
    } catch (e) {
      console.warn(e.name, e.message);
    }
  });

  afterAll(async () => {
    try {
      await queryInterface.bulkDelete('Users', {}, null);
    } catch (e) {
      console.warn(e.name, e.message);
    }
  });

  it('Should success to delete user', async () => {
    const res = await request(app)
      .delete('/users/' + userId)
      .set({ token });
    expect(res.statusCode).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(res.body).toHaveProperty('message');
    const message = res.body.message;
    expect(typeof message).toBe('string');
    expect(message).toBe('Your account has been successfully deleted');
  });

  describe('Should error', () => {
    it('if not send token', async () => {
      const res = await request(app).delete('/users/' + userId);
      expect(res.statusCode).toBe(401);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('message');
    });
    it('if send invalid token', async () => {
      const res = await request(app)
        .delete('/users/' + userId)
        .set({ token: 'randomstring' });
      expect(res.statusCode).toBe(401);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('message');
    });
    it('if delete other user account', async () => {
      const res = await request(app)
        .delete('/users/' + (userId + 1))
        .set({ token });
      expect(res.statusCode).toBe(403);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('message');
    });
  });
});
