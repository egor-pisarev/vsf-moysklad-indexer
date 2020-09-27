module.exports = (indexName) => {
  return {
    index: indexName,
    type: "archived_product",
    body: {
      properties: {
        slug: { type: "keyword" },
        url_key: { type: "keyword" },
        url_path: { type: "keyword" },
        sku: { type: "keyword" },
        size: { type: "integer" },
        size_options: { type: "integer" },
        price: { type: "float" },
        originalPriceInclTax: { type: "float" },
        has_options: { type: "boolean" },
        special_price: { type: "float" },
        color: { type: "integer" },
        color_options: { type: "integer" },
        pattern: { type: "text" },
        id: { type: "integer" },
        status: { type: "integer" },
        weight: { type: "integer" },
        visibility: { type: "integer" },
        qty: { type: "integer" },
        stock: {
          properties: {
            is_in_stock: { type: 'boolean' },
          }
        },
        created_at: {
          type: "date",
          format: "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
        },
        updated_at: {
          type: "date",
          format: "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
        },
        special_from_date: {
          type: "date",
          format: "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
        },
        special_to_date: {
          type: "date",
          format: "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
        },
        news_from_date: {
          type: "date",
          format: "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
        },
        news_to_date: {
          type: "date",
          format: "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
        },
        description: { type: "text" },
        name: { type: "text" },
        configurable_children: {
          properties: {
            url_key: { type: "keyword" },
            has_options: { type: "boolean" },
            price: { type: "float" },
            sku: { type: "keyword" },
            special_price: { type: "float" }
          }
        },
        configurable_options: {
          properties: {
            attribute_id: { type: "keyword" },
            default_label: { type: "text" },
            label: { type: "text" },
            frontend_label: { type: "text" },
            store_label: { type: "text" },
            values: {
              properties: {
                default_label: { type: "text" },
                label: { type: "text" },
                frontend_label: { type: "text" },
                store_label: { type: "text" },
                value_index: { type: "keyword" }
              }
            }
          }
        },
        category_ids: { type: "keyword" },
        eco_collection: { type: "integer" },
        eco_collection_options: { type: "integer" },
        erin_recommends: { type: "integer" },
        tax_class_id: { type: "long" }
      }
    }
  }
}