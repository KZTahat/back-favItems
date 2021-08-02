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
  utilities.userModel.find((error, data) => {
    if (error) {
      console.log("ERROR GETTING DATA FROM MONGO DATABASE");
    } else {
      if (data.length !== 0) {
        res.send(data);
      } else {
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
    }
  });
}

// http://localhost:3008/addtofav?email=kztahat96@gmail.com$title='A Perfect Fit'
server.put("/addtofav", addToFav);
function addToFav(req, res) {
  const { email, title } = req.query;
  utilities.userModel.findOne({ original_title: title }, (error, foundData) => {
    if (error) {
      console.log("ERROR FINDING THE DATA POST", error);
    } else {
      utilities.favMovies.findOne({ email: email }, (error, data) => {
        if (error) {
          console.log("email data not found"); //ERROR
        } else {
          if (data === null) {
            const firstFav = new utilities.favMovies({
              email: email,
              itemData: foundData,
            });
            firstFav.save();
            res.send(firstFav);
          } else {
            data.itemData.push(foundData);
            data.save();
            res.send(data);
          }
        }
      });
    }
  });
}

// http://localhost:3008/getfavoraites?email=kztahat96@gmail.com
server.get("/getfavoraites", getfavoraites);
function getfavoraites(req, res) {
  const { email } = req.query;
  utilities.favMovies.findOne({ email: email }, (error, favData) => {
    if (error) {
      console.log("error finding email fav data");
    } else {
      if (favData !== null) {
        res.send(favData.itemData);
      } else {
        res.send("empty");
      }
    }
  });
}

// http://localhost:3008/deletefav/3?email=kztahat96@gmail.com
server.delete("/deletefav/:id", deleteFavoraites);
function deleteFavoraites(req, res) {
  const id = Number(req.params.id);
  const { email } = req.query;
  utilities.favMovies.findOne({ email: email }, (error, foundData) => {
    if (error) {
      console.log("ERROR GETTING DATA LINE 132", error);
    } else {
      let afterDeletion = foundData.itemData.filter((element, index) => {
        if (index !== id) {
          return element;
        }
      });
      foundData.itemData = afterDeletion;
      foundData.save();
      res.send(afterDeletion);
    }
  });
}

// http://localhost:3008/updatemovie?email=kztahat96@gmail.com&newdata=object
server.put("/updatemovie/:id", updateMovie);
function updateMovie(req, res) {
  const {
    movieName,
    overview,
    poster_path,
    vote_average,
    release_date,
    email,
  } = req.body;
  const { id } = req.params;
  console.log('vote_average: ', vote_average);

  utilities.favMovies.findOne({ email: email }, (error, updatedData) => {
    if (error) {
      console.log("ERROR FINDING DATA LINE 158");
    } else {
      let newData = updatedData.itemData.map((element, index) => {
        if (index == id) {
          element.original_title = movieName;
          element.overview = overview;
          element.poster_path = poster_path;
          element.vote_average = vote_average;
          element.release_date = release_date;
        }
        return element;
      });
      console.log("NEW DATA :", newData);
      updatedData.itemData = newData;
      updatedData.save();
      res.send(newData);
    }
  });
}

// Listining On PORT 3008
server.listen(PORT, () => {
  console.log(`Listening On PORT ${PORT}`);
});
