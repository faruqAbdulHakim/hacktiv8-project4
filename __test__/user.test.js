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
  const url = '/users/register/';
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

  describe('Should success', () => {
    it('if send request correctly', async () => {
      const res = await request(app).post(url).send(userData);
      expect(res.statusCode).toBe(201);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('user');
      const user = res.body.user;
      expect(Object.keys(user).sort()).toEqual(
        [
          'email',
          'full_name',
          'username',
          'profile_image_url',
          'age',
          'phone_number',
        ].sort()
      );
      delete userData.password;
      expect(user).toEqual(userData);
    });
  });

  describe('Should error', () => {
    it('if not send any data', async () => {
      const res = await request(app).post(url);
      expect(res.statusCode).toBe(400);
    });
    it('if there are missing data', async () => {
      delete userData.email;
      const res = await request(app).post(url).send(userData);
      expect(res.statusCode).toBe(400);
    });
    it('if email already registered', async () => {
      userData.username = 'random unregistered username';
      const res = await request(app).post(url).send(userData);
      expect(res.statusCode === 400);
    });
    it('username already registered', async () => {
      userData.email = 'random_unregistered_email@test.com';
      const res = await request(app).post(url).send(userData);
      expect(res.statusCode === 400);
    });
    it('if email has invalid email format', async () => {
      userData.email = 'This is invalid email';
      const res = await request(app).post(url).send(userData);
      expect(res.statusCode).toBe(400);
    });

    it('if profile_image_url has invalid url format', async () => {
      userData.profile_image_url = 'This is invalid url';
      const res = await request(app).post(url).send(userData);
      expect(res.statusCode).toBe(400);
    });

    it('if age not a number', async () => {
      userData.age = 'abc';
      const res = await request(app).post(url).send(userData);
      expect(res.statusCode).toBe(400);
    });

    it('phone_number not a number', async () => {
      userData.phone_number = 'abc';
      const res = await request(app).post(url).send(userData);
      expect(res.statusCode).toBe(400);
    });
  });
});

describe('POST /users/login', () => {
  const url = '/users/login/';
  const email = 'mail@test.com';
  const password = '12345678';

  beforeAll(async () => {
    try {
      await queryInterface.bulkDelete('Users', {}, null);
      await queryInterface.bulkInsert('Users', [
        {
          email: email,
          full_name: 'mail bin mail',
          username: 'mail',
          password: bcryptHelper.hashPassword(password),
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

  describe('Should success', () => {
    it('if send request correctly', async () => {
      const res = await request(app).post(url).send({ email, password });
      expect(res.statusCode).toBe(200);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
      const user = jwtHelper.verify(res.body.token);
      expect(user).toHaveProperty('id');
      expect(typeof user.id).toBe('number');
    });
  });

  describe('Should fail', () => {
    it('if not send datas', async () => {
      const res = await request(app).post(url);
      expect(res.statusCode).toBe(400);
    });
    it('if not send email data', async () => {
      const res = await request(app).post(url).send({ password });
      expect(res.statusCode).toBe(400);
    });
    it('if not send password data', async () => {
      const res = await request(app).post(url).send({ email });
      expect(res.statusCode).toBe(400);
    });
    it('if email not registered', async () => {
      const res = await request(app)
        .post(url)
        .send({ email: 'randommail@test.com', password });
      expect(res.statusCode).toBe(400);
    });
    it("if password doesn't match", async () => {
      const res = await request(app)
        .post(url)
        .send({ email, password: 'randompassword' });
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
  let url = '/users/0';

  beforeEach(async () => {
    try {
      await queryInterface.bulkDelete('Users', {}, null);
      const users = await queryInterface.bulkInsert(
        'Users',
        [
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
        ],
        {
          returning: ['id'],
        }
      );
      userId = users[0].id;
      token = jwtHelper.sign({ id: userId });
      url = '/users/' + userId;
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

  describe('Should success', () => {
    it('if send request correctly', async () => {
      const res = await request(app).put(url).set({ token }).send(userData);
      expect(res.statusCode).toBe(200);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('user');
      const user = res.body.user;
      expect(Object.keys(user).sort()).toEqual(
        [
          'email',
          'full_name',
          'username',
          'profile_image_url',
          'age',
          'phone_number',
        ].sort()
      );
      expect(user).toEqual(userData);
    });
  });

  describe('Should error', () => {
    it('if not send data', async () => {
      const res = await request(app).put(url).set({ token });
      expect(res.statusCode).toBe(400);
    });
    it('if not send all data required', async () => {
      const res = await request(app)
        .put(url)
        .set({ token })
        .send({ email: userData.email });
      expect(res.statusCode).toBe(400);
    });
    it('if not send token', async () => {
      const res = await request(app).put(url).send(userData);
      expect(res.statusCode).toBe(401);
    });
    it('if send invalid token', async () => {
      const res = await request(app)
        .put(url)
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
  let url = '/users/0';

  beforeEach(async () => {
    try {
      await queryInterface.bulkDelete('Users', {}, null);
      const users = await queryInterface.bulkInsert(
        'Users',
        [
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
        ],
        {
          returning: ['id'],
        }
      );
      userId = users[0].id;
      token = jwtHelper.sign({ id: userId });
      url = '/users/' + userId;
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

  describe('Should success', () => {
    it('if send request correctly', async () => {
      const res = await request(app).delete(url).set({ token });
      expect(res.statusCode).toBe(200);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('message');
      const message = res.body.message;
      expect(typeof message).toBe('string');
      expect(message).toBe('Your account has been successfully deleted');
    });
  });

  describe('Should error', () => {
    it('if not send token', async () => {
      const res = await request(app).delete(url);
      expect(res.statusCode).toBe(401);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('message');
    });
    it('if send invalid token', async () => {
      const res = await request(app).delete(url).set({ token: 'randomstring' });
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
