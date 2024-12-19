import { get } from 'axios';
import { writeFileSync } from 'fs';

(async () => {
    const majesticGistURL = "https://gist.githubusercontent.com/croyla/6f0e128de90c49d016e6b15ebbf6d3c0" +
        "/raw/platforms-routes-majestic.geojson";
    const majesticGeoJSON =
        (await get(majesticGistURL)).data.features;
    const platforms = {};
    for (const i of majesticGeoJSON) {
        const location = i.geometry.coordinates;
        const platform = i.properties.Platform;
        for (const b of i.properties.Routes) {
            if (!platforms[b.From]) {
                platforms[b.From] = {};
            }
            if (!platforms[b.From][platform]) {
                platforms[b.From][platform] = {coordinates: location, routes: []};
            }
            platforms[b.From][platform].routes.push({number: b.Name, name: b.UniqueName});
        }
    }
    writeFileSync("src/utils/platforms.json", JSON.stringify(platforms), (error) => {
        // throwing the error
        // in case of a writing problem
        if (error) {
            // logging the error
            console.error(error);

            throw error;
        }

        console.log("platforms.json written correctly");
    });
})();
