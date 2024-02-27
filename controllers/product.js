const slugify = require("slugify");

//importing the category model
const Product = require("../models/product");
const { generateUniqueCode } = require("../utils/utils");
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
            path: "category",
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
            path: "category",
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
      price,
      description,
      category,
      inStock,
      hasVariants,
      colorVariants,
      size_type,
      sizeVariants,
      featureVariants,
      otherVariants,
      promo_code,
      offer_type,
      discount_amount,
      outSideRegionAllowed,
      insideDeliveryCharge,
      outsideDeliveryCharge,
      defaultDeliveryCharge,
      status,
      isFeatured,
    } = req.body;

    const productObj = {
      name: name,
      slug: slugify(name),
      sku: `${slugify(name)}-${generateUniqueCode()}`,
      price: price ? price : 0,
      description: description ? description : null,
      category: category,
      createdBy: req.user._id,
      inStock: inStock ? inStock : 0,
      hasVariants: hasVariants ? hasVariants : false,
      colorVariants: colorVariants ? colorVariants : [],
      size_type: size_type ? size_type : "US",
      sizeVariants: sizeVariants ? sizeVariants : [],
      featureVariants: featureVariants ? featureVariants : [],
      otherVariants: otherVariants ? otherVariants : [],
      promo_code: promo_code ? promo_code : null,
      offer_type: offer_type ? offer_type : "default",
      discount_amount: discount_amount ? discount_amount : 0,
      outSideRegionAllowed: outSideRegionAllowed ? outSideRegionAllowed : false,
      insideDeliveryCharge: insideDeliveryCharge ? insideDeliveryCharge : 0,
      outsideDeliveryCharge: outsideDeliveryCharge ? outsideDeliveryCharge : 0,
      defaultDeliveryCharge: defaultDeliveryCharge ? defaultDeliveryCharge : 0,
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

    const productPicturesResponse = await uploadImagesToCloudinary(
      req,
      res,
      5,
      300
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

module.exports = { getAllProduct, createProduct };
