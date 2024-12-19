
import Fuse from 'fuse.js';
import ALL_STOPS from '../src/utils/stops.json' with { type: "json" };

import fs from 'fs';


const stopNamesIndex = Fuse.createIndex(['stop_name'], ALL_STOPS);
// Serialize and save it
fs.writeFile('src/utils/fuse-index.json', JSON.stringify(stopNamesIndex.toJSON()),()=>{});