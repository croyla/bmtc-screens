export const getCurrentLocation = async (setCurrentPosition) => {
    const result = await navigator.permissions.query({name: 'geolocation'});
    if(result.state === 'granted' || result.state === 'prompt') {
        if(navigator.geolocation) {
            console.log('geolocation is supported');
            await navigator.geolocation.getCurrentPosition(
                setCurrentPosition,
                    error => {
                    console.error('Received error ', error);
                    return null;
                })
        }
        else {
            console.error('Geolocation is not supported');
            return null;
        }
    }
    else {
        console.error('Permission denied');
        return null;
    }
}

export const getDistance = (lat1, lng1, lat2, lng2) => {
    function deg2rad(deg){return deg * (Math.PI/180);}
    function square(x){return Math.pow(x, 2);}
    const r = 6371; // radius of the earth in km
    lat1=deg2rad(lat1);
    lat2=deg2rad(lat2);
    const lat_dif = lat2 - lat1;
    const lng_dif = deg2rad(lng2 - lng1);
    const a = square(Math.sin(lat_dif / 2)) + Math.cos(lat1) * Math.cos(lat2) * square(Math.sin(lng_dif / 2));
    return 2 * r * Math.asin(Math.sqrt(a));
}
