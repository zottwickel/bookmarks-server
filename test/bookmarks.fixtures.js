function makeBookmarksArray() {
  return [
    { 
      id: 1,
      title: 'First Test',
      url: 'some-url',
      description: 'First description',
      rating: '5.00'
    },
    {
      id: 2,
      title: 'Second Test',
      url: 'some-url',
      description: 'Second description',
      rating: '4.50'
    },
    {
      id: 3,
      title: 'Third Test',
      url: 'some-url',
      description: 'Third description',
      rating: '3.14'
    }
  ]
}

module.exports = { makeBookmarksArray }