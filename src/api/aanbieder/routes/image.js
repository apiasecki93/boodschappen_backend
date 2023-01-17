'use strict';

/**
 * aanbieder router
 */

 module.exports = {
  routes: [
    { // Path defined with an URL parameter
      method: 'DELETE',
      path: '/aanbieders/:id/image/:imageId', 
      handler: 'aanbieder.deleteImage',
    },
  ]
}