import type { Schema, Attribute } from '@strapi/strapi';

export interface EntryUserProductEntry extends Schema.Component {
  collectionName: 'components_shopping_user_product_entries';
  info: {
    displayName: 'entry';
    description: '';
  };
  attributes: {
    product: Attribute.Relation<
      'entry.user-product-entry',
      'oneToOne',
      'api::product.product'
    >;
    quantity: Attribute.Integer;
    users: Attribute.Relation<
      'entry.user-product-entry',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'entry.user-product-entry': EntryUserProductEntry;
    }
  }
}
