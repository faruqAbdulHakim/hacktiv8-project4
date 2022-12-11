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

// const defaultUser = {
//   email: 'test@mail.com',
//   full_name: 'testfull',
//   password: 'passwors123',
//   profile_image_url: 'image.test.com',
//   age: 21,
//   phone_number: '081268100183',
//   createdAt: new Date(),
//   updatedAt: new Date(),
// };

// const defaultPhoto = {
//   title: 'ini photo 1 asdasd',
//   caption: 'ini caption photo 1',
//   poster_image_url: 'http://image.com/posteyaaa.png',
//   createdAt: new Date(),
//   updatedAt: new Date(),
//   UserId: 0,
// };

// const testComment = {
//   comment: 'ini comment yagesyak',
//   PhotoId: 1,
// };

let token = '';
let userId = 0;
let photoId = 0;

beforeAll(async () => {
  await queryInterface.bulkDelete('Users', null);
  const user = await queryInterface.bulkInsert(
    'Users',
    [
      {
        email: 'test@mail.com',
        full_name: 'testfull',
        password: bcryptHelper.hashPassword('password123'),
        profile_image_url: 'image.test.com',
        age: 21,
        phone_number: '081268100183',
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

beforeAll(async () => {
  await queryInterface.bulkDelete('Photos', {}, null);
  const photo = await queryInterface.bulkInsert(
    'Photos',
    [
      {
        title: 'ini photo 1 asdasd',
        caption: 'ini caption photo 1',
        poster_image_url: 'http://image.com/posteyaaa.png',
        UserId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    {
      returning: ['id'],
    }
  );
  photoId = photo[0].id;
});

afterAll(async () => {
  await queryInterface.bulkDelete('Users', {}, null);
  await queryInterface.bulkDelete('Comments', {}, null);
});

describe('POST /comments', () => {
  const commentData = {
    comment: 'inicoment yaaa',
    PhotoId: photoId,
  };

  afterAll(async () => {
    await queryInterface.bulkDelete('Comments', {}, null);
  });

  describe('Should success', () => {
    it('successfull to post comment', async () => {
      const res = await request(app)
        .post('/comments')
        .set({ token })
        .send(commentData);
      expect(res.statusCode).toBe(201);
      expect(typeof res.body).toBe('object');
      expect(res.body).toHaveProperty('comment');
      const comment = res.body.comment;
      expect(Object.keys(comment)).toEqual(
        expect.arrayContaining([
          'id',
          'comment',
          'UserId',
          'PhotoId',
          'createdAt',
          'updatedAt',
        ])
      );
      expect(comment.comment).toBe(commentData.comment);
      expect(comment.PhotoId).toBe(photoId);
      expect(comment.UserId).toBe(userId);
    });
  });
});

// describe('GET /comments', () => {
//   beforeAll(async () => {
//     await queryInterface.bulkInsert('Comments', [
//       {
//         UserId: 1,
//         PhotoId: 1,
//         comment: 'ini comment yagayas',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//     ]);
//   });
//   test('successfull to get comments', async () => {
//     const res = await request(app).get('/comments').set({ token });
//     expect(res.statusCode).toBe(200);
//     expect(typeof res.body).toBe('object');
//     expect(res.body).toHaveProperty('comments');
//     const comments = res.body.comments;
//     expect(Array.isArray(comments)).toBeTruthy();
//     if (comments.length > 0) {
//       const comment = comments[0];
//       expect(typeof comment).toBe('object');
//       expect(Object.keys(comment)).toEqual(
//         expect.arrayContaining([
//           'id',
//           'UserId',
//           'PhotoId',
//           'comment',
//           'createdAt',
//           'updatedAt',
//           'Photo',
//           'User',
//         ])
//       );
//       expect(typeof comment.Photo).toBe('object');
//       expect(Object.keys(comment.Photo)).toEqual(
//         expect.arrayContaining(['id', 'title', 'caption', 'profile_image_url'])
//       );
//       expect(typeof comment.User).toBe('object');
//       expect(Object.keys(comment.User)).toEqual(
//         expect.arrayContaining(['id', 'username', 'profile_image_url'])
//       );
//     }
//   });
// });
