import axios from "axios";

export const addressValidator = async (address) => {
  try {
    const { placeName, postalcode, city, state, country } = address;

    if (!placeName || !postalcode || !city || !state || !country) {
      return { success: false, message: "Please Provide all address fields." };
    }

    // address validating
    let matchedLocation = undefined;
    let isValid = false;
    let response;

    // verifying location
    response = await axios.get(
      `http://api.geonames.org/postalCodeLookupJSON?postalcode=${postalcode}&username=${process.env.GeoUserName}`
    );
    const { postalcodes } = response.data;

    // when postalcode is wrong
    if (!postalcodes || postalcodes.length === 0) {
      return {
        success: false,
        message: `No data found for the postalcode ${postalcode}.`,
      };
    }
    let lng, lat;
    matchedLocation = postalcodes.find((data) => {
      const isMatched =
        placeName.toLowerCase() === data.placeName.toLowerCase() &&
        city.toLowerCase() === data.adminName2.toLowerCase() &&
        state.toLowerCase() === data.adminName1.toLowerCase();
      if (isMatched) {
        lng = data.lng;
        lat = data.lat;
      }
      return isMatched;
    });

    // verifying country-name
    if (matchedLocation) {
      response = await axios.get(
        `http://api.geonames.org/countryInfoJSON?country=${matchedLocation.countryCode}&username=${process.env.GeoUserName}`
      );
      const { geonames } = response.data;
      if (!geonames || geonames.length === 0) {
        return {
          success: false,
          message: `No data found for the country ${country}`,
        };
      }
      isValid = geonames.some(
        (data) => country.toLowerCase() === data.countryName.toLowerCase()
      );
    }

    // returing true if both is matched
    return isValid
      ? { success: true, message: "Address is valid", lng, lat }
      : { success: false, message: "Address does not match API data" };
  } catch (error) {
    return error;
  }
};

export const distanceTimeFinder = async (start, end) => {
  try {
    const point1 = `start=${start.lang},${start.lat}`;
    const point2 = `end=${end.lang},${end.lat}`;
    const res = await axios.get(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${process.env.OpenRouteKey}&${point1}&${point2}`
    );
    const segment = res.data.features?.[0]?.properties?.segments?.[0];
    if (!segment) throw new Error("No segment data");
    const { distance, duration } = segment;
    const distanceInKm = (distance / 1000).toFixed(2);
    return { success: true, distance: distanceInKm, duration };
  } catch (error) {
    return { success: false, Error: "Something went wrong." };
  }
};

export const getAddressbyPincode = async (postalcode) => {
  try {
    const res = await axios.get(
      `http://api.geonames.org/postalCodeLookupJSON?postalcode=${postalcode}&username=${process.env.GeoUserName}`
    );
    const { postalcodes } = response.data;

    // when postalcode is wrong
    if (!postalcodes || postalcodes.length === 0) {
      return {
        success: false,
        message: `No data found for the postalcode ${postalcode}.`,
      };
    }
    return {
      success: true,
      postalcodes,
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong.",
    };
  }
};
