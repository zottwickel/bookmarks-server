const express = require('express')
const uuid = require('uuid/v4')
const logger = require('./logger')
// const bookmarks = require('./store')
const BookmarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => {
        res.json(bookmarks)
      })
      .catch(next)
  })

  /*
  .post(bodyParser, (req, res) => {
    const { title, url, description, rating } = req.body

    if(!title || !url || !description || !rating) {
      logger.error(`Title, url, description and rating are required`)
      return res
        .status(400)
        .send('Invalid data')
    }

    const id = uuid();

    const bookmark = {
      id,
      title,
      url,
      description,
      rating
    }

    bookmarks.push(bookmark)
    logger.info(`Bookmark with id ${id} created`)

    res
      .status(201)
      .location(`http://localhost:8000/bookmark/${id}`)
      .json(bookmark)
  })
  */

  bookmarksRouter
    .route('/bookmarks/:id')
    .get((req, res, next) => {
      const knexInstance = req.app.get('db')
      const { id } = req.params
      BookmarksService.getById(knexInstance, id)
        .then(bookmark => {
          if(!bookmark) {
            return res.status(404).json({
              error: { message: `Bookmark doesn't exist` }
            })
          }
          res.json(bookmark)
        })
        .catch(next)
    })

    /*
    .delete((req, res) => {
      const { id } = req.params;
      
      const bookmarkIndex = bookmarks.findIndex(bm => bm.id == id)
      if (bookmarks === -1) {
        logger.error(`Bookmark with ${id} not found`)

        return res
          .status(404)
          .send('Not found')
      }

      bookmarks.splice(bookmarkIndex, 1)

      logger.info(`Bookmark with id ${id} deleted`)

      res
        .status(204)
        .end()
    })
    */

    module.exports = bookmarksRouter
