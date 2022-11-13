require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));

const sites = [];

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/shorturl/:index', function(req, res) {
	res.redirect(sites[req.params.index]);
});

function cleanUrl(url) {
	try {
		const cleanedUrl = new URL(url);
		return cleanedUrl.hostname;
	} catch (error) {
		return 'susan';
	}
}

async function validateUrl(url) {
	return new Promise((resolve, reject) => {
		const cleanedUrl = cleanUrl(url)
		dns.lookup(cleanedUrl, (err, address, family) => {
			if (err) resolve(false);
			resolve(true);
		})
	})
}

app.post('/api/shorturl', async function (req, res) {
	const url = req.body.url;
	
	const isValidUrl = await validateUrl(url);
	if (!isValidUrl) {
		res.json({ error: 'invalid url' });
	} else {
		res.json({
			original_url: url,
			short_url: sites.length,
		})
		sites.push(url);
	}
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
