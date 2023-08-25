const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");

const planets = require("./planets.mongo");

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const allPlanets = await getAllPlanets();
        const countPlanetsFound = allPlanets.length;
        console.log(`${countPlanetsFound} habitable planets found!`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  // We pass empty object to return all the planets
  // Second argument to exlude these values from returned data
  return await planets.find({}, { _id: 0, __v: 0 });
}

async function savePlanet(planet) {
  // This would create a new document and cause duplicates, each time we restart our server or for each cluster
  // await planets.create({keplerName:data.kepler_name})

  /* 
    updateOne: adds or updates only one document
    First argument: Find all of the documents with a kepler name
      that matches the kepler name from the csv file. That's to make
      sure we are only inserting planets that don't already exist
    Second argument: We insert this object if the document in the first argument
      is not exist 
  */

  //Set upsert to true to add the data only if it doesn't already exist
  try {
    await planets.updateOne(
      { keplerName: planet.kepler_name },
      { keplerName: planet.kepler_name },
      { upsert: true }
    );
  } catch (err) {
    console.log(`Could not save planet ${err}`);
  }
}

module.exports = { getAllPlanets, loadPlanetsData };
