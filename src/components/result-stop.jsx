import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ResultList from './result-list.jsx';
// import ResultPlatform from './result-platform.jsx';
import {BMTC_API_ENDPOINT} from '../utils/constants.js';
import stopIcon from '../assets/images/signpost-fill.svg';
import openLinkIcon from '../assets/images/arrow-square-out-thin.svg';

const ResultStop = ({ name, stop }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [busDataList, setBusDataList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [busDataFiltered, setBusDataFiltered] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    useEffect(() => {
        let intervalId;
        if (isExpanded) {
            const fetchBusData = async () => {
                if(initialLoading) {
                    setLoading(true);
                }
                try {
                    const response = await fetch(`${BMTC_API_ENDPOINT}/GetMobileTripsData/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 'stationid': stop.stop_id, 'triptype': 1 }),
                    });
                    const data = (await response.json())['data'];
                    if(data && stop.platforms) {
                        // Handle platform data, add platform tags
                        for (let i = 0; i < busDataList.length; i++) {
                            busDataList[i].platform = '';
                                // stop.platforms.filter(p => p.routes);
                        }
                    }
                    setBusDataList(data ? data : []);
                } catch (error) {
                    console.error('Error fetching bus data:', error);
                } finally {
                    setInitialLoading(false);
                    setLoading(false);
                }
            };

            fetchBusData();
            intervalId = setInterval(fetchBusData, 30000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isExpanded, stop.stop_id]);

    const handleSearchChange = (e) => {
        const newSearchText = e.target ? e.target.value : (e.value ? e.value : '');
        setSearchText(newSearchText);
        setBusDataFiltered(newSearchText.replaceAll(' ', '') === '' ? null :
        busDataList.filter((busData) =>
                (
                    busData.routeno.toLowerCase().includes(newSearchText.toLowerCase())
                    || busData.tostationname.toLowerCase().includes(newSearchText.toLowerCase())
                    || busData.busno.toLowerCase().includes(newSearchText.toLowerCase())
                )
        )
        );
    };

    return (
        <div className={`result-stop${isExpanded ? '-expanded' : ''}`}>
            <div
                className="stop-bar"
                onClick={toggleExpanded}
            >
                <div className="results-stop-name">
                    <img src={stopIcon} className="icon24" alt="stop icon"/>
                    <span>{name}</span>
                    <div className="results-stop-id">#{stop.stop_id}</div>
                </div>
            </div>
            {isExpanded &&
                // Open in google maps, blue button with white text.
                (
                <div className="google-maps-stop-button" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${stop.stop_lat},${stop.stop_lon}`, '_blank')}>
                    Open in Google Maps
                    <img src={openLinkIcon} alt="Open Link" className='icon24'/>
                </div>
            )}
            {isExpanded &&
                (loading && initialLoading ? (
                <div className="loading-stop-results">Loading...</div>
            ) : (
                <div className={"stop-results-loaded"}>
                    <input
                        type="text"
                        placeholder="Search Results..."
                        value={searchText}
                        onChange={handleSearchChange}
                        className="stops-search-input"
                    />
                    {(busDataFiltered !== null) && (busDataFiltered !== undefined) ? (<ResultList busDataList={busDataFiltered} />) : <ResultList busDataList={busDataList} />}
                </div>
                ))}
        </div>
    );
};

ResultStop.propTypes = {
    name: PropTypes.string.isRequired,
    stop: PropTypes.shape({
        platforms: PropTypes.objectOf(
            PropTypes.shape({
                coordinates: PropTypes.arrayOf(PropTypes.number),
                routes: PropTypes.objectOf(PropTypes.string),
            })
        ),
        stop_lat: PropTypes.number.isRequired,
        stop_lon: PropTypes.number.isRequired,
        stop_id: PropTypes.number.isRequired,
    }).isRequired,
};

export default ResultStop;
