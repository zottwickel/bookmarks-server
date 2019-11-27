const express = require('express')
const uuid = require('uuid/v4')
const logger = require('./logger')
const bookmarks = require('./store')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {
    res.json(bookmarks)
  })
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

  bookmarksRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
      const { id } = req.params
      const bookmark = bookmarks.find(bm => bm.id == id)

      if (!bookmark) {
        logger.error(`Bookmark with id ${id} not found`)
        return res
          .status(404)
          .send('Not Found')
      }

      res.json(bookmark)
    })
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

    module.exports = bookmarksRouter
