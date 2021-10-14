const express = require('express');
const http = require('http');
const cors = require('cors');


const port = process.env.PORT || 5000;

//Builds Server
const app = express();
const clientPath = `${__dirname}/client`;
app.use(cors());
app.use(express.static(clientPath));
const server = http.createServer(app);

//Starts Server
server.on('error', (err) => {
    console.error('Server error:', err);
});
  
server.listen(port, () => {
    console.log(`app started at http://localhost:${port}`);
});