const request = require('supertest');
const app = require('./../app');
const { sequelize } = require('./../models/index');
const { queryInterface } = sequelize;
const bcryptHelper = require('../helpers/bcryptHelper');
const jwtHelper = require('../helpers/jwtHelper');

const defaultUser = {
  email: 'testing@mail.com',
  full_name: 'ngetesting api',
  username: 'test',
  password: bcryptHelper.hashPassword('password'),
  profile_image_url: 'http://image.com/profile.png',
  age: 20,
  phone_number: '+62823111111',
  createdAt: new Date(),
  updatedAt: new Date(),
};

let token = '';
let UserId = 0;

const defaultPhoto = {
  title: 'default photo',
  caption: 'ini default photo',
  poster_image_url: 'http://image.com/defaultphoto.png',
  UserId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const dataPhoto = {
  title: 'photo baru',
  caption: 'Photo ini baru',
  poster_image_url: 'http://image.com/photobaru.png',
};

const editPhoto = {
  title: 'photo diedit',
  caption: 'Photo ini baru diedit',
  poster_image_url: 'http://image.com/photoedit.png',
};

beforeAll(async () => {
  await queryInterface.bulkDelete('Photos', null, {
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  await queryInterface.bulkDelete('Users', null, {
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  const user = await queryInterface.bulkInsert('Users', [defaultUser], {
    returning: ['id'],
  });
  UserId = user[0].id;
  token = jwtHelper.sign({ id: UserId });
  await queryInterface.bulkInsert('Photos', [defaultPhoto]);
});

afterAll(async () => {
  sequelize.close();
});

describe('GET /photos/', () => {
  describe('Should success', () => {
    test('HTTP status code 200 when success get all photos', async () => {
      const res = await request(app).get('/photos').set({ token });
      expect(res.status).toEqual(200);
      expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
      expect(typeof res.body).toEqual('object');
      expect(res.body).toHaveProperty('photos');
      expect(res.body).toEqual({
        photos: [
          {
            id: 1,
            title: defaultPhoto.title,
            caption: defaultPhoto.caption,
            poster_image_url: defaultPhoto.poster_image_url,
            UserId: defaultPhoto.UserId,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            User: {
              id: 1,
              username: defaultUser.username,
              profile_image_url: defaultUser.profile_image_url,
            },
            Comments: [],
          },
        ],
      });
    });
  });

  describe('Should failure', () => {
    test('HTTP status code 401 when no token provided', async () => {
      const res = await request(app).get('/photos');
      expect(res.status).toEqual(401);
      expect(res.body.message).toEqual('Memerlukan header token');
    });

    test('HTTP status code 401 when no token provided', async () => {
      const res = await request(app).get('/photos').set({ token: 'wrong.token.input' });
      expect(res.status).toEqual(401);
      expect(res.body.message).toEqual('Invalid Token');
    });
  });
});

describe('POST /photos', () => {
  describe('Should Success', () => {
    test('HTTP status code 201 success post photo', async () => {
      const res = await request(app).post('/photos').set({ token }).send(dataPhoto);
      expect(res.status).toEqual(201);
      expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
      expect(typeof res.body).toEqual('object');
      expect(res.body).toEqual({
        id: 2,
        title: dataPhoto.title,
        poster_image_url: dataPhoto.poster_image_url,
        caption: dataPhoto.caption,
        UserId: 1,
      });
    });
  });

  describe('Should Failure', () => {
    test('HTTP status code 401 when no token provided', async () => {
      const res = await request(app).post('/photos');
      expect(res.status).toEqual(401);
      expect(res.body.message).toEqual('Memerlukan header token');
    });

    test('HTTP status code 401 when wrong token provider', async () => {
      const res = await request(app).post('/photos').set({ token: 'wrong.token.input' });
      expect(res.status).toEqual(401);
      expect(res.body.message).toEqual('Invalid Token');
    });

    test('HTTP status code 400 when all field not set ', async () => {
      const res = await request(app).post('/photos').set({ token }).send({});
      expect(res.status).toEqual(400);
      expect(res.body.message).toEqual(['Title cannot be ommitted', 'Caption cannot be ommitted', 'Url poster image cannot be ommitted']);
    });

    test('HTTP status code 400 when field title is empty string', async () => {
      const photo = { ...dataPhoto };
      photo.title = '';
      const res = await request(app).post('/photos').set({ token }).send(photo);
      expect(res.status).toEqual(400);
      expect(res.body.message).toEqual(['Title cannot be an empty string']);
    });

    test('HTTP status code 400 when field caption is empty string', async () => {
      const photo = { ...dataPhoto };
      photo.caption = '';
      const res = await request(app).post('/photos').set({ token }).send(photo);
      expect(res.status).toEqual(400);
      expect(res.body.message).toEqual(['Caption cannot be an empty sting']);
    });

    test('HTTP status code 400 when field poster_image_url is empty string', async () => {
      const photo = { ...dataPhoto };
      photo.poster_image_url = '';
      const res = await request(app).post('/photos').set({ token }).send(photo);
      expect(res.status).toEqual(400);
      expect(res.body.message).toEqual(['Wrong url format', 'Url poster image cannot be an empty string']);
    });
  });
});

describe('PUT /photos/:photoId', () => {
  describe('Should success', () => {
    test('HTTP status code 200 when success to edit photos', async () => {
      const res = await request(app).put('/photos/1').set({ token }).send(editPhoto);
      expect(res.status).toEqual(200);
      expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
      expect(typeof res.body).toEqual('object');
      expect(res.body).toHaveProperty('photo');
      expect(res.body).toEqual({
        photo: {
          id: 1,
          title: editPhoto.title,
          caption: editPhoto.caption,
          poster_image_url: editPhoto.poster_image_url,
          UserId: 1,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });
  });

  describe('Should failure', () => {
    test('HTTP status code 401 when no token provided', async () => {
      const res = await request(app).put('/photos/1');
      expect(res.status).toEqual(401);
      expect(res.body.message).toEqual('Memerlukan header token');
    });

    test('HTTP status code 401 when no token provided', async () => {
      const res = await request(app).put('/photos/1').set({ token: 'wrong.token.input' });
      expect(res.status).toEqual(401);
      expect(res.body.message).toEqual('Invalid Token');
    });

    test("HTTP status code 404 when photo doesn't exist", async () => {
      const res = await request(app).put('/photos/99').set({ token });
      expect(res.status).toEqual(404);
      expect(res.body.message).toEqual("photo doesn't exist");
    });

    test('HTTP status code 400 when all field not set ', async () => {
      const res = await request(app).post('/photos').set({ token }).send({});
      expect(res.status).toEqual(400);
      expect(res.body.message).toEqual(['Title cannot be ommitted', 'Caption cannot be ommitted', 'Url poster image cannot be ommitted']);
    });

    test('HTTP status code 400 when field title is empty string', async () => {
      const photo = { ...dataPhoto };
      photo.title = '';
      const res = await request(app).put('/photos/1').set({ token }).send(photo);
      expect(res.status).toEqual(400);
      expect(res.body.message).toEqual(['Title cannot be an empty string']);
    });

    test('HTTP status code 400 when field caption is empty string', async () => {
      const photo = { ...dataPhoto };
      photo.caption = '';
      const res = await request(app).put('/photos/1').set({ token }).send(photo);
      expect(res.status).toEqual(400);
      expect(res.body.message).toEqual(['Caption cannot be an empty sting']);
    });

    test('HTTP status code 400 when field poster_image_url is empty string', async () => {
      const photo = { ...dataPhoto };
      photo.poster_image_url = '';
      const res = await request(app).put('/photos/1').set({ token }).send(photo);
      expect(res.status).toEqual(400);
      expect(res.body.message).toEqual(['Wrong url format', 'Url poster image cannot be an empty string']);
    });
  });
});

describe('DELETE /photos/:photoId', () => {
  describe('Should success', () => {
    test('HTTP status code 200 when success delete photos', async () => {
      const res = await request(app).delete('/photos/1').set({ token });
      expect(res.status).toEqual(200);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('message');
      const message = res.body.message;
      expect(typeof message).toBe('string');
      expect(message).toBe('Your photo has been successfully deleted');
    });
  });

  describe('Should failure', () => {
    test('HTTP status code 401 when no token provided', async () => {
      const res = await request(app).delete('/photos/1');
      expect(res.status).toEqual(401);
      expect(res.body.message).toEqual('Memerlukan header token');
    });

    test('HTTP status code 401 when no token provided', async () => {
      const res = await request(app).delete('/photos/1').set({ token: 'wrong.token.input' });
      expect(res.status).toEqual(401);
      expect(res.body.message).toEqual('Invalid Token');
    });

    test("HTTP status code 404 when photo doesn't exist", async () => {
      const res = await request(app).delete('/photos/99').set({ token });
      expect(res.status).toEqual(404);
      expect(res.body.message).toEqual("photo doesn't exist");
    });
  });
});
