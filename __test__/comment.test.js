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
let photoId = 0;

// create user & photo
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

  await queryInterface.bulkDelete('Photos', {}, null);
  const photos = await queryInterface.bulkInsert(
    'Photos',
    [
      {
        title: 'ini title',
        caption: 'ini caption',
        poster_image_url: 'iniposter.com',
        UserId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    {
      returning: ['id'],
    }
  );
  photoId = photos[0].id;
});

// Clear all table that affected after this comment tests done
afterAll(async () => {
  await queryInterface.bulkDelete('Users', {}, null);
  await queryInterface.bulkDelete('Comments', {}, null);
});

describe('POST /comments', () => {
  const url = '/comments';
  const requestBody = {
    comment: 'ini komen',
    PhotoId: 0,
  };

  // make sure PhotoId updated
  beforeAll(() => {
    requestBody.PhotoId = photoId;
  });

  afterAll(async () => {
    await queryInterface.bulkDelete('Comments', {}, null);
  });

  describe('Should success', () => {
    it('if send request correctly', async () => {
      const res = await request(app).post(url).set({ token }).send(requestBody);
      expect(res.statusCode).toBe(201);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('comment');
      const comment = res.body.comment;
      expect(Object.keys(comment).sort()).toEqual(
        ['id', 'comment', 'UserId', 'PhotoId', 'updatedAt', 'createdAt'].sort()
      );
      delete comment.id;
      delete comment.UserId;
      delete comment.updatedAt;
      delete comment.createdAt;
      expect(comment).toEqual(requestBody);
    });
  });

  describe('Should error', () => {
    it('if not send token', async () => {
      const res = await request(app).post(url).send(requestBody);
      expect(res.statusCode).toBe(401);
    });
    it('if send invalid token', async () => {
      const res = await request(app)
        .post(url)
        .set({ token: 'randomstring' })
        .send(requestBody);
      expect(res.statusCode).toBe(401);
    });
    it('if not send request body / data', async () => {
      const res = await request(app).post(url).set({ token });
      expect(res.statusCode).toBe(400);
    });
    it('if not send all required data', async () => {
      const res = await request(app)
        .post(url)
        .set({ token })
        .send({ comment: requestBody.comment });
      expect(res.statusCode).toBe(400);
    });
    it('if send data with foreign key that does not exist', async () => {
      const res = await request(app)
        .post(url)
        .set({ token })
        .send({
          comment: requestBody.comment,
          PhotoId: requestBody.PhotoId + 1,
        });
      expect(res.statusCode).toBe(400);
    });
  });
});

describe('GET /comments', () => {
  const url = '/comments';

  beforeAll(async () => {
    await queryInterface.bulkInsert('Comments', [
      {
        comment: 'ini komen [bulkinsert]',
        PhotoId: photoId,
        UserId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  });

  afterAll(async () => {
    await queryInterface.bulkDelete('Comments', {}, null);
  });

  describe('Should success', () => {
    it('if send request correctly', async () => {
      const res = await request(app).get(url).set({ token });
      expect(res.statusCode).toBe(200);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('comments');
      const comments = res.body.comments;
      expect(Array.isArray(comments)).toBeTruthy();
      if (comments.length > 0) {
        const comment = comments[0];
        expect(Object.keys(comment).sort()).toEqual(
          [
            'id',
            'UserId',
            'PhotoId',
            'comment',
            'createdAt',
            'updatedAt',
            'Photo',
            'User',
          ].sort()
        );
      }
    });
  });

  describe('Should error', () => {
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

describe('PUT /comments/:commentId', () => {
  let requestBody = { comment: 'ini komen' };
  let url = '/comments/0';
  let commentId = 0;

  beforeAll(async () => {
    const comments = await queryInterface.bulkInsert(
      'Comments',
      [
        {
          comment: 'ini komen [bulkinsert]',
          PhotoId: photoId,
          UserId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {
        returning: ['id'],
      }
    );
    commentId = comments[0].id;
    url = '/comments/' + commentId;
  });

  afterAll(async () => {
    await queryInterface.bulkDelete('Comments', {}, null);
  });

  describe('Should success', () => {
    it('if send request correctly', async () => {
      const res = await request(app).put(url).set({ token }).send(requestBody);
      expect(res.statusCode).toBe(200);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('comment');
      const comment = res.body.comment;
      expect(typeof comment).toBe('object');
      expect(Object.keys(comment).sort()).toEqual(
        ['id', 'comment', 'UserId', 'PhotoId', 'updatedAt', 'createdAt'].sort()
      );
    });
  });
  describe('Should error', () => {
    it('if not send token', async () => {
      const res = await request(app).put(url).send(requestBody);
      expect(res.statusCode).toBe(401);
    });
    it('if send invalid token', async () => {
      const res = await request(app)
        .put(url)
        .set({ token: 'randomstring' })
        .send(requestBody);
      expect(res.statusCode).toBe(401);
    });
    it('if not send request body / data', async () => {
      const res = await request(app).put(url).set({ token });
      expect(res.statusCode).toBe(400);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('message');
    });
    it('if update comment that does not exist', async () => {
      const res = await request(app)
        .put('/comments/' + (commentId + 1))
        .set({ token })
        .send(requestBody);
      expect(res.statusCode).toBe(404);
    });
  });
});

// TODO: will added soon
describe('DELETE /comments/:commentId', () => {
  describe('Should success', () => {});
  describe('Should error', () => {});
});
