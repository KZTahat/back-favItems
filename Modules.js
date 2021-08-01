"use strict";

const mongoose = require("mongoose");

const movieShcema = new mongoose.Schema({
  original_title: String,
  overview: String,
  poster_path: String,
  vote_average: Number,
  release_date: String,
});

const userSchema = new mongoose.Schema({
  email: String,
  itemData: [movieShcema],
});

const userModel = mongoose.model("movie", movieShcema);
const favMovies = mongoose.model("fav", userSchema);

let utilities = {userModel, favMovies}
module.exports = utilities;