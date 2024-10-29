const Product = require("../../models/product");

const MODEL_NAME = "Product";

const getAllProduct = async (req, res) => {
  try {
    let {
      page,
      pageSize,
      pageLess,
      search,
      status,
      category,
      subCategory,
      brand,
      shape,
      color,
      isFeatured,
    } = req.query;

    page = page ? parseInt(page) : 1;
    pageSize = pageSize ? parseInt(pageSize) : 10;

    let query = {};
    let totalCount = 0;

    // Filters
    // Search in both `name` and `sku` fields
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      query.status = { $regex: status, $options: "i" };
    }
    if (category) {
      query.categories = {
        $in: Array.isArray(category) ? category : [category],
      };
    }
    if (subCategory) {
      query.subCategories = {
        $in: Array.isArray(subCategory) ? subCategory : [subCategory],
      };
    }
    if (brand) {
      query.brand = brand;
    }
    if (shape) {
      query.shape = shape;
    }
    if (color) {
      query["colors.color"] = color;
    }
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true";
    }

    // Conditional pagination
    if (pageLess) {
      const products = await Product.find(query)
        .populate([
          { path: "createdBy", select: "_id name role" },
          { path: "categories", select: "_id name" },
          { path: "subCategories", select: "_id name" },
          { path: "colors.color", select: "_id name value" },
          { path: "brand", select: "_id name" },
          { path: "shape", select: "_id name" },
          { path: "reviews" },
        ])
        .sort({ _id: -1 });

      totalCount = products.length;

      return res.status(200).json({
        status: 200,
        message: "Products fetched successfully!",
        data: { products, total: totalCount },
      });
    } else {
      const skip = (page - 1) * pageSize;
      const limit = pageSize;

      const paginatedProducts = await Product.find(query)
        .populate([
          { path: "createdBy", select: "_id name role" },
          { path: "categories", select: "_id name" },
          { path: "subCategories", select: "_id name" },
          { path: "colors.color", select: "_id name value" },
          { path: "brand", select: "_id name" },
          { path: "shape", select: "_id name" },
          { path: "reviews" },
        ])
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

      totalCount = await Product.countDocuments(query);

      return res.status(200).json({
        status: 200,
        message: "Products fetched successfully!",
        data: { products: paginatedProducts, total: totalCount },
      });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ message: "Error fetching products" });
  }
};

module.exports = {
  getAllProduct,
};
