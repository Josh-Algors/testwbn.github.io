const db = require('../database/db');
const express = require('express');
const app = express();
// const fs = require('fs');
// var pdf = require("pdf-creator-node");
const Joi = require('joi');
const bcrypt = require('bcryptjs');
var uuid = require('node-uuid');
const helpers = require('../config/helpers');
const base64topdf = require('base64topdf');
const { fileURLToPath } = require('url');
const { uploadImg } = require('../middleware/upload');
const { Op, QueryTypes } = require('sequelize');
const multer = require('multer');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const fsa = require('fs-extra');
var cloudinary = require('cloudinary').v2;
const puppeteer = require('puppeteer');
const hbs = require('handlebars');
const { User } = require('../database/db');
const { devNull } = require('os');
const { del, get } = require('request');
const { open } = require('fs/promises');
// const { compile } = require('handlebars');
require('dotenv').config();

module.exports = {



}
