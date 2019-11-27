const uuid = require('uuid/v4')

const bookmarks = [
  { id: uuid(),
    title: 'GitHub',
    url: 'https://github.com',
    description: 'Host your code here',
    rating: 5 }
]

module.exports = bookmarks