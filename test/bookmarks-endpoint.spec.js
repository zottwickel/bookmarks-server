require('dotenv').config()
const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures')

describe.only('Bookmarks GET endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('bookmarks').truncate())

  afterEach('cleanup', () => db('bookmarks').truncate())

  describe(`GET /bookmarks`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/bookmarks')
          .set({ Authorization: 'Bearer ' + process.env.API_TOKEN })
          .expect(200, [])
      })
    })
    context(`Given database has bookmarks`, () => {
      const bookmarksArray = makeBookmarksArray()

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(bookmarksArray)
      })

      it('responds with 200 and all of the bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .set({ Authorization: 'Bearer ' + process.env.API_TOKEN })
          .expect(200, bookmarksArray)
      })
    })
  })

  describe(`GET /bookmarks/:id`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const bookmarkId = 404
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set({ Authorization: 'Bearer ' + process.env.API_TOKEN })
          .expect(404, { error: { message: `Bookmark doesn't exist` }})
      })
    })
    context(`Given there are bookmarks in the database`, () => {
      const bookmarksArray = makeBookmarksArray()

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(bookmarksArray)
      })

      it(`responds with 200 and the specific bookmark`, () => {
        const bookmarkId = 2
        const expectedBookmark = bookmarksArray[bookmarkId - 1]
        return supertest(app)
        .get(`/bookmarks/${bookmarkId}`)
        .set({ Authorization: 'Bearer ' + process.env.API_TOKEN })
        .expect(200, expectedBookmark)
      })
    })
  })
})