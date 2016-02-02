function promotionsIntegration(querystring, fs, path){

  var http = require("https"),
      bowerFolder = path.resolve(__dirname, "../../");


  function promotionsApi(request, response){
      var username = "APITest",
          password = "APITest1234",
          key = "yDEaxRuvuDFvGBCAv1byA",
          secret = "dshOkJwn8rImGPK3PpCCV0vL3UD3IPJ2J5EWn7cow",
          host = "promotionsmanagerapiqa.fishbowl.com",
          grantAccessPath = "/oauth/access_token",
          promotionsPath = "/promotion/",
          accessToken;

      // get access token
      function getAccessToken(callback){
          var postData = querystring.stringify({
              'grant_type':'password',
              'username' : username,
              'password': password
          });


          var options = {
            hostname: host,
            path: grantAccessPath,
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization':  "Basic " + new Buffer(key + ":" + secret).toString("base64"),
              'Content-Length': postData.length
            }
          };

          var req = http.request(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
              accessToken = JSON.parse(chunk)['access_token'];
              if(callback && typeof callback === 'function'){
                  callback();
              }
            });
          });

          req.on('error', (e) => {
            console.log('problem with request: ', e.message);
          });

          // write data to request body
          req.write(postData);
          req.end();
      }

      function randomizeArray(arr){
          function randomOrdinal(){
              return (Math.round(Math.random())-0.5);
          }

          return arr.sort(randomOrdinal);
      }

      function getPromotions(){
          var data = JSON.stringify({
              "brandid":"1173",
              "status":1
          });

          var options = {
            hostname: host,
            path: promotionsPath,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization':  "Bearer " + accessToken,
              'Content-Length': data.length
            }
          };

          var promotions = '';

          var req = http.request(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
              promotions += chunk; 
            });
            res.on('end', () => {
              promotions = JSON.parse(promotions).promotions;
              promotions = randomizeArray(promotions).slice(0,5);
              promotions = promotions.map(function(el){ 
                  return {
                      name: el.name,
                      description: el.description,
                      type: el.type
                  };
              });
              getContentBlocks(promotions);
            })
          });

          req.on('error', (e) => {
            console.log('problem with request: ${e.message}', e.message);
          });

          // write data to request body
          req.write(data);
          req.end();
      }

      function getContentBlocks(promotions){
          var contentBlockPattern = "<li><strong>{{name}}</strong><br/><span>{{description}}</span><br/><span>{{type}}</span></li>",
              contentHtml = '';


          for (var i = 0; i < promotions.length; i++) {
              contentHtml+= contentBlockPattern.replace('{{name}}', promotions[i].name)
                  .replace('{{description}}', promotions[i].description)
                  .replace('{{type}}', promotions[i].type);
          };


          fs.readFile(bowerFolder + '/app/test/get-content-blocks.json', 'utf8', function (err, data) {
            if (err) throw err;
            data = JSON.parse(data);
            data[data.length-1].html = data[data.length-1].html.replace('##content##', contentHtml);
            response.end(JSON.stringify(data), 'utf-8');
          });
      }

      getAccessToken(getPromotions);
  }

  return {
    getPromotions: promotionsApi
  };
}

module.exports = promotionsIntegration;