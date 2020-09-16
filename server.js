
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
const distPath = path.join(__dirname, 'dist');

const staticResources = path.join(__dirname, 'static');
app.use('/dist', express.static(distPath));
app.use('/static', express.static(staticResources));

app.get('/', (req, res) => {
    console.log('/ invoked');
    const htmlPath = path.join(__dirname, './index.html')
    res.sendFile(htmlPath);
})

app.listen(process.env.PORT, () => console.log(`app started at ${process.env.PORT}`));