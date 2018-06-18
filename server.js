const path = require('path');
const express = require('express');


let app = express();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(express.static('.'));

app.listen(3000, () => {
    console.log('Server running at port 3000')
});
