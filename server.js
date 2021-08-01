"use strict";

const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const { default: axios } = require("axios");
const utilities = require("./Modules");

const server = express();
const PORT = process.env.PORT;
server.use(cors());
server.use(express.json());

mongoose.connect(`${process.env.MONGO_DATABASE}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Proof Of Life
server.get("/", (req, res) => {
  res.send("All Good");
});

// getting Items
//https://api.themoviedb.org/3/search/movie?api_key=ae0ca69f9eb0ab3ac060ece6ae1c35e9&query=a
server.get("/getitems", getIiemsFromAPI);
function getIiemsFromAPI(req, res) {
  const { email } = req.query;
  axios
    .get(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIES_DB_API_KEY}&query=a`
    )
    .then((apiData) => {
      let filteredData = apiData.data.results.map((element) => {
        const {
          original_title,
          overview,
          poster_path,
          release_date,
          vote_average,
        } = element;
        const addedObject = {
          original_title: original_title,
          overview: overview,
          poster_path: poster_path,
          release_date: release_date,
          vote_average: vote_average,
        };
        new utilities.userModel({
          original_title: original_title,
          overview: overview,
          poster_path: poster_path,
          release_date: release_date,
          vote_average: vote_average,
        }).save();
        return addedObject;
      });
      res.send(filteredData);
    })
    .catch((error) => {
      console.log("ERROR IN GETTING MOVIES", error);
    });
}

// http://localhost:3008/addtofav/2?email=kztahat96@gmail.com
server.put("/addtofav/:id", addToFav);
function addToFav(req, res) {
  const id = Number(req.params.id);
  const { email } = req.query;
  utilities.userModel.find((error, data) => {
    if (error) {
      console.log("ERROR FINDING THE DATA POST", error);
    } else {
      data.map((element, index) => {
        if (index === id) {
          new utilities.favMovies({
            email: email,
            itemData: element,
          }).save();
        }
      });
      res.send(data);
    }
  });
}

// Listining On PORT 3008
server.listen(PORT, () => {
  console.log(`Listening On PORT ${PORT}`);
});
