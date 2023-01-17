// const multer = require('multer');
// const helpers = require('../config/helpers');
// const db = require('../database/db');
// const bodyparser = require('body-parser');
// const path = require('path');
// require('dotenv').config();


// const imageFilter =  (req, file, cb) => {
//     if (file.mimetype.startsWith("image")) {
//         cb(null, true);
//     } else {
//         cb("Please upload only images.", false);
//     }
// };
// var storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './uploads');
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     },
// });
// const uploadImg = multer({ storage: storage, imageFilter: imageFilter }).any();
// // var uploadFile = multer({ storage: storage, fileFilter: imageFilter });
// module.exports = { uploadImg };
