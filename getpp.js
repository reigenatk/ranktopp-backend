const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

app.use(bodyParser.json());
app.use(cors());

mongoose.connect(
  "mongodb+srv://rma2002:" +
    process.env.ATLAS_PASS +
    "@cluster0-omtan.mongodb.net/osuproject?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
  }
);

const connection = mongoose.connection;

connection.once("open", function () {
  console.log("MongoDB database connection established successfully");
});

var TimeSchema = new mongoose.Schema({
  day: String,
  time: String,
  oneDigitpp: Number,
  oneDigitHolder: String,
  twoDigitpp: Number,
  twoDigitHolder: String,
  threeDigitpp: Number,
  threeDigitHolder: String,
  fourDigitpp: Number,
  fourDigitHolder: String,
});

// create mongoose model
// capitalize collection name
const PPOverTime = mongoose.model("PPOverTime", TimeSchema);

let today = new Date();

console.log("Old Data Deleted...");
console.log("Fetching New Data");
let monthword = today.toLocaleString("default", { month: "short" });
let timee = today.getHours() + ":" + today.getMinutes();
let dayy = monthword + " " + today.getDate() + " " + today.getFullYear();
let access_token = "";
let body = {
  client_id: 2128,
  client_secret: process.env.API_KEY,
  grant_type: "client_credentials",
  scope: "public",
};

// these are the current pp requirements for each milestone
let oneDigit, twoDigit, threeDigit, fourDigit;

// this is the name of the person holding the milestone
let oneDigitHolder, twoDigitHolder, threeDigitHolder, fourDigitHolder;

// immediately invoked function
(getAuthToken = async () => {
  let response = await axios.post("https://osu.ppy.sh/oauth/token", body);
  access_token = response.data.access_token;
  console.log("access token received");
  await getAllPPValues();
  saveValuesIntoDB();
})();

getAllPPValues = async () => {
  await getOneDigitPP();
  await getTwoDigitPP();
  await getThreeDigitPP();
  await getFourDigitPP();
};

getOneDigitPP = async () => {
  let response = await axios.get(
    "https://osu.ppy.sh/api/v2/rankings/osu/performance?cursor[page]=1",
    {
      headers: {
        Authorization: "Bearer " + access_token,
      },
    }
  );
  oneDigit = response.data.ranking[8].pp;
  oneDigitHolder = response.data.ranking[8].user.username;
  console.log("One digit pp acquired");
};

getTwoDigitPP = async () => {
  let response = await axios.get(
    "https://osu.ppy.sh/api/v2/rankings/osu/performance?cursor[page]=2",
    {
      headers: {
        Authorization: "Bearer " + access_token,
      },
    }
  );
  twoDigit = response.data.ranking[49].pp;
  twoDigitHolder = response.data.ranking[49].user.username;
  console.log("Two digit pp acquired");
};

getThreeDigitPP = async () => {
  let response = await axios.get(
    "https://osu.ppy.sh/api/v2/rankings/osu/performance?cursor[page]=20",
    {
      headers: {
        Authorization: "Bearer " + access_token,
      },
    }
  );
  threeDigit = response.data.ranking[49].pp;
  threeDigitHolder = response.data.ranking[49].user.username;
  console.log("Three digit pp acquired");
};

getFourDigitPP = async () => {
  let response = await axios.get(
    "https://osu.ppy.sh/api/v2/rankings/osu/performance?cursor[page]=200",
    {
      headers: {
        Authorization: "Bearer " + access_token,
      },
    }
  );
  fourDigit = response.data.ranking[49].pp;
  fourDigitHolder = response.data.ranking[49].user.username;
  console.log("Four digit pp acquired");
};

saveValuesIntoDB = () => {
  let newObject = new PPOverTime({
    day: dayy,
    oneDigitpp: oneDigit,
    oneDigitHolder: oneDigitHolder,
    twoDigitpp: twoDigit,
    twoDigitHolder: twoDigitHolder,
    threeDigitpp: threeDigit,
    threeDigitHolder: threeDigitHolder,
    fourDigitpp: fourDigit,
    fourDigitHolder: fourDigitHolder,
  });
  newObject.save(function (err, db) {
    if (!err) {
      console.log("Saved new values into DB");
    }
  });
};

/* Ugly callback hell version that i had before
axios
  .post("https://osu.ppy.sh/oauth/token", body)
  .then((response) => {
    access_token = response.data.access_token;
    let oneDigit, twoDigit, threeDigit, fourDigit;
    let oneDigitHolder, twoDigitHolder, threeDigitHolder, fourDigitHolder;
    oneDigit = twoDigit = threeDigit = fourDigit = 0;

    console.log("access token receieved");
    // now make a get request for each amount
    axios
      .get(
        "https://osu.ppy.sh/api/v2/rankings/osu/performance?cursor[page]=1",
        {
          headers: {
            Authorization: "Bearer " + access_token,
          },
        }
      )
      .then((response) => {
        let currentppRequired = response.data.ranking[8].pp;
        oneDigit = currentppRequired;
        oneDigitHolder = response.data.ranking[8].user.username;

        console.log("One digit pp acquired");

        axios
          .get(
            "https://osu.ppy.sh/api/v2/rankings/osu/performance?cursor[page]=2",
            {
              headers: {
                Authorization: "Bearer " + access_token,
              },
            }
          )
          .then((response) => {
            let currentppRequired = response.data.ranking[49].pp;
            console.log("Two digit pp acquired");
            twoDigit = currentppRequired;
            twoDigitHolder = response.data.ranking[49].user.username;

            axios
              .get(
                "https://osu.ppy.sh/api/v2/rankings/osu/performance?cursor[page]=20",
                {
                  headers: {
                    Authorization: "Bearer " + access_token,
                  },
                }
              )
              .then((response) => {
                let currentppRequired = response.data.ranking[49].pp;
                threeDigit = currentppRequired;
                threeDigitHolder = response.data.ranking[49].user.username;

                console.log("Three digit pp acquired");
                axios
                  .get(
                    "https://osu.ppy.sh/api/v2/rankings/osu/performance?cursor[page]=200",
                    {
                      headers: {
                        Authorization: "Bearer " + access_token,
                      },
                    }
                  )
                  .then((response) => {
                    let currentppRequired = response.data.ranking[49].pp;
                    fourDigit = currentppRequired;
                    fourDigitHolder = response.data.ranking[49].user.username;

                    console.log("Four digit pp acquired");
                    let newObject = new PPOverTime({
                      day: dayy,
                      oneDigitpp: oneDigit,
                      oneHolder: oneDigitHolder,
                      twoDigitpp: twoDigit,
                      twoHolder: twoDigitHolder,
                      threeDigitpp: threeDigit,
                      threeHolder: threeDigitHolder,
                      fourDigitpp: fourDigit,
                      fourHolder: fourDigitHolder,
                    });
                    newObject.save(function (err, db) {
                      if (!err) {
                        console.log("Saved new values into DB");
                      }
                    });
                  });
              });
          });
      });
  })
  .catch((error) => {
    console.log(error);
  });
  */
