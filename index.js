const axios = require('axios');
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const PORT = process.env.PORT || 3000
require("dotenv").config();


// API key for OpenWatherMap
const apiWeatherKey = process.env.apiWeatherKey;

// Create a server object
const server = http.createServer(async (req, res) => {

    // Parse the URL and query string
    const parsedUrl = url.parse(req.url);
    const query = querystring.parse(parsedUrl.query);

    // Get the visitor's name from the query string
    const visitorName = query.visitor_name || "Guest";
    
    // Get the cleint's IP address
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    try {
        // Fetch location data using ip and use location to fetch temp data
        const getCity = await axios.get(`http://ip-api.com/json/102.88.71.33?fields=61439`);

        const city = getCity.data.city;

        const weatherUrl = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiWeatherKey}&units=metric`);

        // construct the greeting message
        let greeting = `Hello, ${visitorName}!, the temperature is ${weatherUrl.data.main.temp} degrees Celcius`;
        if (city) {
            greeting += ` in ${city}`;
        }
    
        // construct the response object
        const response = {
            client_ip: clientIp,
            location: city || 'Unknown',
            greeting: greeting
        };

        // Set the response header and send the response
        res.writeHead(200, {'content-Type': 'application/json'});
        res.end(JSON.stringify(response));

    } catch (error) {
        console.log('Error fetching data:', error);
        res.writeHead(500, {'content-Type': 'application/json'});
        res.end(JSON.stringify({ error: 'Failed to fetch required data'}));
    }

});

// start the server
server.listen(PORT, () => {
    console.log(`server started and running on http://localhost:${PORT}`);
});
