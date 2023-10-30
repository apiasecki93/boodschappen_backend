import type { Schema, Attribute } from '@strapi/strapi';

export interface UsersTest extends Schema.Component {
  collectionName: 'components_users_tests';
  info: {
    displayName: 'test';
  };
  attributes: {
    users: Attribute.Relation<
      'users.test',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    quantity: Attribute.Integer & Attribute.DefaultTo<0>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'users.test': UsersTest;
    }
  }
}
