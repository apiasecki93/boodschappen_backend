'use strict';

/**
 * aanbieder router
 */

 module.exports = {
  routes: [
    { // Path defined with an URL parameter
      method: 'DELETE',
      path: '/aanbieders/:id/deleteThumbnail', 
      handler: 'aanbieder.deleteThumbnail',
    },
  ]
}