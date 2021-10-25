const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();
const { renderMessage } = require("./utils/misc")

app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use("/", require("./routes"));

app.all("*", (req, res) => {
    renderMessage(res, "404", "Page not found", 404)
})

app.listen(process.env.EXPRESS_PORT, () => {
	console.log(`Listening at port ${process.env.EXPRESS_PORT}`);
});
