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

let token = '';
let userId = 0;

// get Token first that used for test API endpoint that require auth
beforeAll(async () => {
  await queryInterface.bulkDelete('Users', {}, null);
  const user = await queryInterface.bulkInsert(
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
  userId = user[0].id;
  token = jwtHelper.sign({ id: userId });
});

// Clear all table that affected
afterAll(async () => {
  await queryInterface.bulkDelete('Users', {}, null);
  await queryInterface.bulkDelete('SocialMedia', {}, null);
});

describe('POST /socialmedias', () => {
  const url = '/socialmedias';
  const data = {
    name: 'my social media',
    social_media_url: 'socialmedia.test.com',
  };

  afterAll(async () => {
    await queryInterface.bulkDelete('SocialMedia', {}, null);
  });

  describe('Should success', () => {
    it('if send request correctly', async () => {
      const res = await request(app).post(url).set({ token }).send(data);
      expect(res.statusCode).toBe(201);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('social_media');
      const socialmedia = res.body.social_media;
      expect(Object.keys(socialmedia).sort()).toEqual(
        [
          'id',
          'name',
          'social_media_url',
          'UserId',
          'createdAt',
          'updatedAt',
        ].sort()
      );
      expect(socialmedia.name).toBe(data.name);
      expect(socialmedia.social_media_url).toBe(data.social_media_url);
      expect(socialmedia.UserId).toBe(userId);
    });
  });

  describe('Should fail', () => {
    it('if not send token', async () => {
      const res = await request(app).post(url).send(data);
      expect(res.statusCode).toBe(401);
    });
    it('if send invalid token', async () => {
      const res = await request(app)
        .post(url)
        .set({ token: 'randomstring' })
        .send(data);
      expect(res.statusCode).toBe(401);
    });
    it('if send name with empty string', async () => {
      const res = await request(app)
        .post(url)
        .set({ token })
        .send({ name: '', social_media_url: data.social_media_url });
      expect(res.statusCode).toBe(400);
    });
    it('if send social_media_url with empty string', async () => {
      const res = await request(app)
        .post(url)
        .set({ token })
        .send({ name: data.name, social_media_url: '' });
      expect(res.statusCode).toBe(400);
    });
    it('if send social_media_url with invalid url', async () => {
      const res = await request(app)
        .post(url)
        .set({ token })
        .send({ name: data.name, social_media_url: 'randomstring' });
      expect(res.statusCode).toBe(400);
    });
  });
});

describe('GET /socialmedias', () => {
  const url = '/socialmedias';

  beforeAll(async () => {
    await queryInterface.bulkInsert('SocialMedia', [
      {
        name: 'mygram',
        social_media_url: 'mygram.com',
        UserId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  });

  afterAll(async () => {
    await queryInterface.bulkDelete('SocialMedia', {}, null);
  });

  describe('Should success', () => {
    it('if send request correctly', async () => {
      const res = await request(app).get(url).set({ token });
      expect(res.statusCode).toBe(200);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('social_medias');
      const socialMedias = res.body.social_medias;
      expect(Array.isArray(socialMedias)).toBeTruthy();
      if (socialMedias.length > 0) {
        const socialMedia = socialMedias[0];
        expect(typeof socialMedia).toBe('object');
        expect(Object.keys(socialMedia).sort()).toEqual(
          [
            'id',
            'name',
            'social_media_url',
            'UserId',
            'createdAt',
            'updatedAt',
            'User',
          ].sort()
        );
        expect(typeof socialMedia.User).toBe('object');
        expect(Object.keys(socialMedia.User).sort()).toEqual(
          ['id', 'username', 'profile_image_url'].sort()
        );
      }
    });
  });

  describe('Should fail', () => {
    it('if not send token', async () => {
      const res = await request(app).get(url);
      expect(res.statusCode).toBe(401);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('message');
    });
    it('if send invalid token', async () => {
      const res = await request(app).get(url).set({ token: 'randomstring' });
      expect(res.statusCode).toBe(401);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('message');
    });
  });
});

describe('PUT /socialmedias/:socialMediaId', () => {
  const socialMediaData = {
    name: 'newMyGram',
    social_media_url: 'newmygram.com',
  };
  let socialMediaId = 0;
  let url = '/socialmedias/0';

  beforeEach(async () => {
    await queryInterface.bulkDelete('SocialMedia', {}, null);
    const socialMedias = await queryInterface.bulkInsert(
      'SocialMedia',
      [
        {
          name: 'mygram',
          social_media_url: 'mygram.com',
          UserId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {
        returning: ['id'],
      }
    );
    socialMediaId = socialMedias[0].id;
    url = '/socialmedias/' + socialMediaId;
  });

  afterAll(async () => {
    await queryInterface.bulkDelete('SocialMedia', {}, null);
  });

  describe('Should success', () => {
    it('if send request correctly', async () => {
      const res = await request(app)
        .put(url)
        .set({ token })
        .send(socialMediaData);
      expect(res.statusCode).toBe(200);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('social_media');
      const socialMedia = res.body.social_media;
      expect(Object.keys(socialMedia).sort()).toEqual(
        [
          'id',
          'name',
          'social_media_url',
          'UserId',
          'updatedAt',
          'createdAt',
        ].sort()
      );
      expect(socialMedia.name).toBe(socialMediaData.name);
      expect(socialMedia.social_media_url).toBe(
        socialMediaData.social_media_url
      );
    });
  });

  describe('Should fail', () => {
    it('if not send token', async () => {
      const res = await request(app).put(url).send(socialMediaData);
      expect(res.statusCode).toBe(401);
    });
    it('if send invalid token', async () => {
      const res = await request(app)
        .put(url)
        .set({ token: 'randomstring' })
        .send(socialMediaData);
      expect(res.statusCode).toBe(401);
    });
    it('if send name with empty string', async () => {
      const res = await request(app)
        .put(url)
        .set({ token })
        .send({ name: '', social_media_url: socialMediaData.social_media_url });
      expect(res.statusCode).toBe(400);
    });
    it('if send social_media_url with empty string', async () => {
      const res = await request(app)
        .put(url)
        .set({ token })
        .send({ name: socialMediaData.name, social_media_url: '' });
      expect(res.statusCode).toBe(400);
    });
    it('if send social_media_url with invalid url', async () => {
      const res = await request(app)
        .put(url)
        .set({ token })
        .send({ name: socialMediaData.name, social_media_url: 'randomstring' });
      expect(res.statusCode).toBe(400);
    });
    it("if request update to social media that doesn't exist", async () => {
      const res = await request(app)
        .put('/socialmedias/' + (socialMediaId + 1))
        .set({ token })
        .send(socialMediaData);
      expect(res.statusCode).toBe(404);
    });
  });
});

describe('DELETE /socialmedias/:socialMediaId', () => {
  let socialMediaId = 0;
  let url = '/socialmedias/0';

  beforeEach(async () => {
    await queryInterface.bulkDelete('SocialMedia', {}, null);
    const socialMedias = await queryInterface.bulkInsert(
      'SocialMedia',
      [
        {
          name: 'mygram',
          social_media_url: 'mygram.com',
          UserId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {
        returning: ['id'],
      }
    );
    socialMediaId = socialMedias[0].id;
    url = '/socialmedias/' + socialMediaId;
  });

  afterAll(async () => {
    await queryInterface.bulkDelete('SocialMedia', {}, null);
  });

  describe('Should success', () => {
    it('if send request correctly', async () => {
      const res = await request(app).delete(url).set({ token });
      expect(res.status).toBe(200);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('message');
      const message = res.body.message;
      expect(typeof message).toBe('string');
      expect(message).toBe('Your social media has been successfully deleted');
    });
  });

  describe('Should fail', () => {
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
    it("if delete social media that doesn't exist", async () => {
      const res = await request(app)
        .delete('/socialmedias/' + (userId + 1))
        .set({ token });
      expect(res.statusCode).toBe(404);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('message');
    });
  });
});
