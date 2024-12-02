import ALL_STOPS from './stops.json';
import ALL_PLATFORMS from './platforms.json';


export const BMTC_API_ENDPOINT = import.meta.env.BMTC_API_ENDPOINT;
export const CORS_ANYWHERE = import.meta.env.CORS_ANYWHERE;

export const STOPS = ALL_STOPS.reduce((result, stop) => {
    if (!result[stop.stop_name]) {
        result[stop.stop_name] = [];
    }
    const stopData = { ...stop };
    if (ALL_PLATFORMS[stop.stop_id]) {
        stopData.platforms = Object.fromEntries(
            Object.entries(ALL_PLATFORMS[stop.stop_id]).map(([platform, data]) => {
                return [
                    platform,
                    {
                        coordinates: data.coordinates,
                        routes: Object.fromEntries(data.routes.map(route => [route.number, route.name]))
                    }
                ];
            })
        );
    }
    result[stop.stop_name].push(stopData);
    return result;
}, {});