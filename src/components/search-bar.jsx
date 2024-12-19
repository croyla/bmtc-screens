import Fuse from 'fuse.js';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import copy from '../assets/images/copy-simple.svg';
import magnifyingGlass from '../assets/images/magnifying-glass.svg';
import navigationArrow from '../assets/images/navigation-arrow-duotone.svg';
import { getCurrentLocation, getDistance } from '../utils';
import { STOPS } from '../utils/constants.js';
import fuseIndex from '../utils/fuse-index.json';

import ALL_STOPS from '../utils/stops.json';

const stopNamesIndex = Fuse.parseIndex(fuseIndex)

const fuse = new Fuse(ALL_STOPS, {
    keys: ['stop_name'],
    includeScore: true,
    threshold: 0.5,
    index: stopNamesIndex
});

function SearchBar({setSearchResults}) {
    const locationThreshold = 0.2; // 200 meters
    const [searchValue, setSearchValue] = useState('');
    const [currentPosition, setCurrentPosition] = useState(null);
    const [positionToggled, setPositionToggled] = useState(false);
    // Handle search term change and update items
    const handleSearchChange = (e) => {
        const searchTerm = e.target ? e.target.value : (e.value ? e.value : e);
        const newSearchTerm = searchTerm ? searchTerm : '';
        setSearchValue(newSearchTerm);
        const searchFilter = newSearchTerm.length > 2 ? newSearchTerm : '';
        setSearchResults(
            // searchFilter.replaceAll(' ', '') === '' ? [] :
            // Object.keys(STOPS).filter((item) =>
            // item.toLowerCase().includes(searchFilter.toLowerCase())


            //Fuzzy Search with Fuse.js
            fuse.search(searchFilter).slice(0, 10).map((result) => result.item.stop_name)
        );
    };
    const handlePlatformsLocations = (platforms, coords) => {
        const actualThreshold = locationThreshold + (coords.accuracy/1000);
        if(!platforms){
            return false;
        }
        for(const platform of Object.values(platforms)) {
            if(!platform.coords){
                return false;
            }
            const distance = getDistance(platform.coords[1], platform.coords[0], coords.latitude, coords.longitude);
            if(actualThreshold >= distance) {
                return true;
            }
        }
        return false;
    };
    const handleStopLocation = (stopData, coords) => {
        const actualThreshold = locationThreshold + (coords.accuracy/1000);
        if(!stopData || !stopData.stop_lat || !stopData.stop_lon) {
            return false;
        }
        const distance = getDistance(coords.latitude, coords.longitude, stopData.stop_lat, stopData.stop_lon);
        // console.log(distance);
        return actualThreshold >= distance;

    };
    // Handle search by current location
    const handleLocationSearch =  () => {
        // Placeholder logic for location-based search
        if(positionToggled) {
            setCurrentPosition(null);
            setPositionToggled(false);
            handleSearchChange(searchValue);
        } else {
            getCurrentLocation(setCurrentPosition);
        }
    };
    if(currentPosition && !positionToggled) {
        const coords = currentPosition.coords;
        const items =
            Object.entries(STOPS).reduce((acc, [key, value]) =>
                {
                    if (!Array.isArray(value)) {
                        console.error(`Expected 'value' to be an array for key ${key}, but got:`, value);
                        return acc; // Skip if value is not an array
                    }
                    value.forEach((item) => {
                        if(acc.includes(key)){
                            return acc;
                        }
                        if(item.platforms) {
                            if(handlePlatformsLocations(item.platforms, coords)) {
                                acc.push(key);
                            }
                        }
                        if(handleStopLocation(item, coords)) {
                            acc.push(key);
                        }
                    });
                    return acc;
                }, []
            );
        setPositionToggled(true);
        setSearchResults(items ? items : []);
    }

    useEffect(() => {

        const urlParams = new URLSearchParams(window.location.search);
        if(urlParams.has('search')) {
            setSearchValue(urlParams.get('search'));
            handleSearchChange(urlParams.get('search'));
        }
        if(urlParams.has('lat') && urlParams.has('lon') && urlParams.has('acc')) {
            setCurrentPosition({coords: {
                    latitude: urlParams.get('lat'),
                    longitude: urlParams.get('lon'),
                    accuracy: urlParams.get('acc')
                }});
        }
    }, []);

    return (
        <div className="search-bar">
            <img
                src={magnifyingGlass}
                alt="SearchBar Icon"
                className="icon24-search"
            ></img>
            <input
                type="text"
                placeholder="Search Stops..."
                value={searchValue}
                onChange={handleSearchChange}
                className="search-input"
            />
            <button className="location-button" onClick={() => {
                const url = encodeURI(`${window.location.protocol}//` +
                    `${window.location.host}/?search=${searchValue}${positionToggled ?
                        `&lat=${currentPosition.coords.latitude}&lon=` +
                        `${currentPosition.coords.longitude}&acc=${currentPosition.coords.accuracy}` : ``}`);
                navigator.clipboard.writeText(url)
                    .then(() =>
                        window.open(url, '_self')
                    );
            }}>
                <img
                    src={copy}
                    alt="Copy/Refresh"
                    className="icon24"
                />
            </button>
            <button onClick={handleLocationSearch} className="location-button">
                <img
                    src={navigationArrow}
                    alt="User Location Input Icon"
                    className="icon24"
                />
            </button>
        </div>
    )
}

SearchBar.propTypes = {
    setSearchResults: PropTypes.func.isRequired,
}

export default SearchBar;