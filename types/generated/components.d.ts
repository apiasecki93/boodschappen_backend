import type { Schema, Attribute } from '@strapi/strapi';

export interface GlobalTest extends Schema.Component {
  collectionName: 'components_global_tests';
  info: {
    displayName: 'test';
  };
  attributes: {
    users: Attribute.Relation<
      'global.test',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    quantity: Attribute.Integer;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'global.test': GlobalTest;
    }
  }
}
