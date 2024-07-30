const slugify = require("slugify");

//importing the category model
const Product = require("../models/product");
const { generateUniqueCode, isArrayAndHasContent } = require("../utils/utils");
const { uploadImagesToCloudinary } = require("../utils/file-upload-helper");

const MODEL_NAME = "Product";

const getAllProduct = async (req, res) => {
  try {
    let { page, pageSize, pageLess, name, sku, status, category } = req.query;

    page = page ? parseInt(page) : 1;
    pageSize = pageSize ? parseInt(pageSize) : 10;

    let query = {};
    let totalCount = 0;

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (sku) {
      query.sku = { $regex: sku, $options: "i" };
    }

    if (status) {
      query.status = { $regex: status, $options: "i" };
    }
    if (category) {
      query.category = category;
    }

    if (pageLess) {
      // If pageLess is true, return all patients
      const products = await Product.find(query)
        .populate([
          {
            path: "createdBy",
            select: "_id name role",
          },
          {
            path: "categories",
            select: "_id name",
          },
          {
            path: "subCategories",
            select: "_id name",
          },
          {
            path: "colors",
            select: "_id name value",
          },
          {
            path: "shape",
            select: "_id name ",
          },
          {
            path: "reviews",
          },
        ])
        .sort({ _id: -1 });
      totalCount = products.length;

      if (pageLess !== undefined && pageLess === "true") {
        return res.status(200).json({
          status: 200,
          message: "Products fetched successfully!",
          data: {
            products: products,
            total: totalCount,
          },
        });
      }
    } else {
      // If pageLess is false or not provided, apply pagination
      const skip = (parseInt(page) - 1) * parseInt(pageSize);
      const limit = parseInt(pageSize);

      const paginatedProducts = await Product.find(query)
        .populate([
          {
            path: "createdBy",
            select: "_id name role",
          },
          {
            path: "categories",
          },
          {
            path: "subCategories",
          },
          {
            path: "colors",
          },
          {
            path: "shape",
          },
          {
            path: "reviews",
          },
        ])
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

      totalCount = await Product.countDocuments(query);

      return res.status(200).json({
        status: 200,
        message: `${MODEL_NAME} fetched successfully!`,
        data: {
          products: paginatedProducts,
          total: totalCount,
        },
      });
    }
  } catch (error) {
    console.error(`Error fetching ${MODEL_NAME}:`, error);
    return res.status(500).json({ meassge: `Error fetching ${MODEL_NAME}` });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      quantity,
      price,
      discount_amount,
      description,
      productPictures,
      categories,
      subCategories,
      shape,
      colors,
      supportedPowers,
      offer_type,
      status,
      isFeatured,
    } = req.body;

    const productObj = {
      name: name,
      slug: slugify(name),
      sku: `${slugify(name)}-${generateUniqueCode()}`,
      quantity: quantity ? quantity : 0,
      price: price ? price : 0,
      discount_amount: discount_amount ? discount_amount : 0,
      description: description ? description : null,
      productPictures: productPictures ? productPictures : [],
      categories: categories ? categories : [],
      subCategories: subCategories ? subCategories : [],
      shape: shape ? shape : null,
      colors: colors ? colors : [],
      supportedPowers: supportedPowers ? supportedPowers : [],
      offer_type: offer_type ? offer_type : "default",
      createdBy: req.user._id,
      status: status ? status : "active",
      isFeatured: isFeatured ? isFeatured : false,
    };

    const isProductExists = await Product.findOne({ slug: slugify(name) });

    if (isProductExists)
      return res.status(409).json({
        status: 409,
        message: "Product Already Exists",
        data: null,
      });

    const files = isArrayAndHasContent(req?.files) ? req?.files : [];

    const productPicturesResponse = await uploadImagesToCloudinary(
      files,
      res,
      5,
      null
    );

    if (productPicturesResponse.status == 200) {
      productObj.productPictures = productPicturesResponse.data;
    } else if (productPicturesResponse.status == 409) {
      return res.status(409).json({
        status: 409,
        message: productPicturesResponse.message,
        data: null,
      });
    } else {
      return res.status(productPicturesResponse.status || 500).json({
        status: productPicturesResponse.status,
        message: productPicturesResponse.message,
        data: null,
      });
    }

    const newProduct = new Product(productObj);

    await newProduct
      .save()
      .then((productData) => {
        return res.status(200).json({
          status: 200,
          message: "Product Created successfully",
          data: productData,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(422).json({ message: err });
      });
  } catch (error) {
    console.log(error);
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { name } = req.body;

    let productObj = {
      ...req.body,
    };

    const selectedProduct = await Product.findOne({ _id: id });

    //check if the category actually exists or not
    if (!selectedProduct) {
      return res.status(404).json({ message: "Product Doesn't Exists!" });
    }

    if (name) {
      if (selectedProduct?.name !== name) {
        const checkProduct = await Product.findOne({ name: name });

        if (checkProduct) {
          return res
            .status(409)
            .json({ message: "Same Product Already Exists!" });
        }

        productObj.name = name;
        productObj.slug = `${slugify(name)}-${generateUniqueCode()}`;
      }
    }

    const files = isArrayAndHasContent(req?.files) ? req?.files : [];
    if (isArrayAndHasContent(files)) {
      const productPicturesResponse = await uploadImagesToCloudinary(
        files,
        res,
        5,
        null
      );

      if (productPicturesResponse.status == 200) {
        productObj.productPictures = productPicturesResponse.data;
      } else if (productPicturesResponse.status == 409) {
        return res.status(409).json({
          status: 409,
          message: productPicturesResponse.message,
          data: null,
        });
      } else {
        return res.status(productPicturesResponse.status || 500).json({
          status: productPicturesResponse.status,
          message: productPicturesResponse.message,
          data: null,
        });
      }
    }

    await Product.findByIdAndUpdate(id, productObj, { new: true })
      .then((productData) => {
        return res.status(200).json({
          status: 200,
          message: "Product Updated successfully",
          data: productData,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(422).json({ message: err });
      });
  } catch (error) {
    console.log(error);
  }
};

const productDetails = async (req, res) => {
  try {
    let { sku } = req.params;

    const productDetails = await Product.findOne({ sku: sku }).populate([
      {
        path: "createdBy",
        select: "_id name role",
      },
      {
        path: "categories",
        select: "_id name",
      },
      {
        path: "subCategories",
        select: "_id name",
      },
    ]);

    if (!productDetails) {
      return res.status(404).json({
        message: `${MODEL_NAME} details couldn't found!`,
      });
    }

    return res.status(200).json({
      status: 200,
      message: `${MODEL_NAME} details fetched successfully!`,
      data: productDetails,
    });
  } catch (error) {
    console.error(`Error fetching ${MODEL_NAME}:`, error);
    return res.status(500).json({ meassge: `Error fetching ${MODEL_NAME}` });
  }
};

const featuredProducts = async (req, res) => {
  try {
    let totalCount = 0;

    const productList = await Product.find({ isFeatured: true })
      .populate([
        {
          path: "createdBy",
          select: "_id name role",
        },
        {
          path: "categories",
          select: "_id name",
        },
        {
          path: "subCategories",
          select: "_id name",
        },
      ])
      .sort({ _id: -1 });

    totalCount = productList.length;

    return res.status(200).json({
      status: 200,
      message: `${MODEL_NAME} (featured) fetched successfully!`,
      data: {
        products: productList,
        total: totalCount,
      },
    });
  } catch (error) {
    console.error(`Error fetching ${MODEL_NAME}:`, error);
    return res.status(500).json({ meassge: `Error fetching ${MODEL_NAME}` });
  }
};

module.exports = {
  getAllProduct,
  createProduct,
  editProduct,
  productDetails,
  featuredProducts,
};
