import PropTypes from 'prop-types';
import { STOPS } from '../utils/constants';
import ResultStop from './result-stop.jsx';

const Results = ({ searchResults }) => {
    return (
        <div className="results">
            {searchResults.length === 0 && (
                <div className="results-empty">Type out the name of a stop, or select the location search button!</div>
            )}
            {searchResults.flatMap((searchResult, index) => {
                const stops = STOPS[searchResult];
                if (!stops || !Array.isArray(stops)) {
                    return null;
                }
                return stops.map((stop, stopIndex) => (
                    <ResultStop key={`${searchResult}-${index}-${stopIndex}`} name={searchResult} stop={stop} />
                ));
            })}
        </div>
    );
};

Results.propTypes = {
    searchResults: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Results;