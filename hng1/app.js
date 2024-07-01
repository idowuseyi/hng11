const https = require('https');
const http = require('http');
const url = require('url');
const querystring = require('querystring');
require("dotenv").config();

// API key for OpenWatherMap
const apiWeatherKey = process.env.apiWeatherKey;
const apiLocationKey = process.env.apiLocationKey;


// Create a server object
const server = http.createServer(async (req, res) => {

    // Parse the URL and query string
    const parsedUrl = url.parse(req.url);
    const query = querystring.parse(parsedUrl.query);

    // Get the visitor's name from the query string
    const visitorName = query.visitor_name;

    // Get the cleint's IP address
    const clientIp = req.socket.remoteAddress;
    const clientIp2 = '127.0.0.1'
    
    // Fetch location data from api.ipstack.com
    const locationUrl = "http://api.ipstack.com/" + clientIp + "?access_key=" + apiLocationKey;
    const options = {method: "GET",};

    const locationRes = await fetch(locationUrl, options);
    const result = await locationRes.json();
    const latitude = await result.latitude;
    const longitude = await result.longitude;
    const location = {city: result.city, country: result.country_name, continent: result.continent_name};
    
    // Fetch temperature data from OpenWeatherMap
    const temperatureResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiWeatherKey}`);
    const temperatureData = await temperatureResponse.json();
    const temperature = temperatureData.main.temp;
   

    // construct the greeting message
    const greeting = `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celcius in ${location.city}`;
   
    // construct the response object
    const response = {
        client_ip: clientIp,
        location,
        greeting
    };

    // Set the response header and send the response
    res.writeHead(200, {'content-Type': 'application/json'});
    res.end(JSON.stringify(response));
});

// start the server
server.listen(3000, () => {
    console.log('server started and listening on port 3000');
});
