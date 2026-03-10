export const endpoints = {
  public: {
    categories: "/public/categories",
    productsByCategorySlug: (slug: string) =>
      `/public/categories/${slug}/products`,
    productById: (id: number) => `/public/products/${id}`,
  },

  admin: {
    products: "/admin/products",

    uploads: "/admin/uploads",
    uploadProductImage: "/admin/uploads/product-image",
    deleteProductImage: "/admin/uploads/product-image",
  },
};