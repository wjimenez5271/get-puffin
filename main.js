var _ = require('lodash');
var express = require('express')
var app = express()
app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'pug')


var Flickr = require("node-flickr");
var keys = {"api_key": process.env.FLICKR_API_KEY,
            "secret": process.env.FLICKR_SECRET }
flickr = new Flickr(keys);


app.get('/', function (req, res) {
  console.log('Querying flickr for photos...')
  // flickr search
  flickr.get("photos.search", {"tags":"puffin", "safe_search": 1, "text": "puffin"}, function(err, result){
      if (err) {
        console.error(err);
        res.status(500).send('Error querying flickr')
        return false;
      }
      rand_puffin_photo = _.sample(result.photos.photo)
      title = rand_puffin_photo.title
      console.log('Selected random photo from results with ID: ' + rand_puffin_photo.id);
      console.log('Looking up photo URLs')
      // use photo id from flickr search to find direct URLs to an image
      flickr.get("photos.getSizes", {"photo_id": rand_puffin_photo.id}, function(err, result){
        if (err) {
          console.error(err);
          res.status(500).send('Error querying flickr')
          return false;
        }
        r = _.find(result.sizes.size, {"label": "Medium 800"})
        if ( typeof r == 'undefined' ) {
          console.log(r)
          r = _.sample(result.sizes.size)
          if ( typeof r == 'undefined' ) {
            console.error("Unable to find URL for image")
            res.status(500).send('Error querying flickr')
            return false;
          }
        }
        console.log("rendering template")
        // return response to client
        res.render('index', { url: r.url, source: r.source, title: title })
      });
  });
});

app.get('/about', function (req, res) {
  res.render('about')
});

app.listen(app.get('port'), function () {
  console.log('Starting get-puffin app...')
})
