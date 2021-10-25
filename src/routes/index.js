const express = require('express');
const router = express.Router();

// router.get("/", booksIndex);
// router.use("/", require("./books"));
router.use('/register', require('./register'));

module.exports = router;
