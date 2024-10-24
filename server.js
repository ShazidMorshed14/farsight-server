const express = require("express");
const cors = require("cors");
const multer = require("multer");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file format"), false);
    }
  },
});

//importing mongodb connection function
const connecDB = require("./db/connect");

//importing the routes

//admin routes
const adminAuthRoutes = require("./routes/admin/auth");
const adminUserRoutes = require("./routes/admin/users");
const adminOrderRoutes = require("./routes/admin/order");

//vendor routes
const vendorAuthRoutes = require("./routes/vendor/auth");
const vendorUserRoutes = require("./routes/vendor/users");
const vendorOrderRoutes = require("./routes/vendor/order");

//other routes
const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/category");
const SubCategoryRoutes = require("./routes/subcategory");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const powerRoutes = require("./routes/power");
const colorRoutes = require("./routes/color");
const shapeRoutes = require("./routes/shape");
const brandRoutes = require("./routes/brand");

//importing the file upload controller
const fileUploader = require("./controllers/file-upload");
const { isAuth, isAdmin } = require("./middlewares/auth");

app.use("/api/v1/admin/auth", adminAuthRoutes);
app.use("/api/v1/admin/users", adminUserRoutes);
app.use("/api/v1/admin/order", adminOrderRoutes);
app.use("/api/v1/customer/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/subcategory", SubCategoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/user/cart", cartRoutes);
app.use("/api/v1/vendor/auth", vendorAuthRoutes);
app.use("/api/v1/power", powerRoutes);
app.use("/api/v1/color", colorRoutes);
app.use("/api/v1/brand", brandRoutes);
app.use("/api/v1/shape", shapeRoutes);
app.use("/api/v1/vendor/user", vendorUserRoutes);
app.use("/api/v1/vendor/order", vendorOrderRoutes);

app.post(
  "/api/v1/files/upload",
  isAuth,
  isAdmin,
  upload.array("images", 5),
  fileUploader.uploadImages
);

const start = async () => {
  try {
    await connecDB(process.env.MONGOURI);
    app.listen(PORT, () => {
      console.log(`
          ####################################
          🔥  Server listening on port: ${PORT} 🔥
          ####################################
    `);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
