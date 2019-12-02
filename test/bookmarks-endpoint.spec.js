require('dotenv').config()
const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures')

describe('Bookmarks endpoints', function() {
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

  describe('POST /bookmarks endpoint', function() {
    it(`creates a bookmark, responding with 201 and the new bookmark`, function() {
      this.retries(3)
      const newBookmark = {
        title: 'Test new bookmark',
        url: 'new URL',
        description: 'A test for a new bookmark',
        rating: '4.25'
      }
      return supertest(app)
        .post('/bookmarks')
        .set({ Authorization: 'Bearer ' + process.env.API_TOKEN })
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title)
          expect(res.body.url).to.eql(newBookmark.url)
          expect(res.body.description).to.eql(newBookmark.description)
          expect(res.body.rating).to.eql(newBookmark.rating)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
        })
        .then(postRes => {
          supertest(app)
            .get(`/bookmarks/${postRes.body.id}`)
            .set({ Authorization: 'Bearer ' + process.env.API_TOKEN })
            .expect(postRes.body)
        })
    })
  })

  describe(`DELETE /bookmark/:id endpoint`, function() {
    context(`given no items in bookmarks`, function() {
      it(`responds with 404`, () => {
        const bookmarkId = 404
        return supertest(app)
          .delete(`/bookmarks/${bookmarkId}`)
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
      
      it(`responds with 204 and removes the bookmark`, () => {
        const idToRemove = 2
        const expectedBookmarks = bookmarksArray.filter(bookmark => bookmark.id !== idToRemove)
        return supertest(app)
          .delete(`/bookmarks/${idToRemove}`)
          .set({ Authorization: 'Bearer ' + process.env.API_TOKEN })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/bookmarks`)
              .set({ Authorization: 'Bearer ' + process.env.API_TOKEN })
              .expect(expectedBookmarks)
          )
      })
    })
  })
})