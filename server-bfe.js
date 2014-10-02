/*
Minimal BIBFRAME Editor Node.js server. To run from the command-line:
node server-bfe.js

 */
var port = 8000;
var connect = require('connect');
var util = require('util');
var http = require('http');
var querystring = require('querystring');
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');

connect.createServer(connect.static (__dirname), function (request, response) {
    if (request.method == 'POST') {
        processPost(request, response, function () {
            // Use request.post here
            //console.log(request.post);

            var parse = request.post.jsonLd;
            var jParse = JSON.parse(parse);
            var WorkDataId = jParse[0]['@id'];
            var WorkId = WorkDataId.substring(19);
            var InstanceDataId = jParse[1]['@id']            
            var InstanceId = InstanceDataId.substring(19);
            var ItemDataId = jParse[2]['@id']
            var ItemId = ItemDataId.substring(19);
            var title = jParse[0]['http://bibframe.org/vocab/workTitle'][0]['@value'];
            
            //console.log(jParse[1]);
            //console.log(jParse[2]);
            //console.log(parse);

            //parse.pipe(filed('data.json')).pipe(jParse);

            fs.writeFile('output/data' + WorkId + '.json', parse, function (err) {
              if (err) throw err;
              console.log('It\'s saved!');
            });

            /*

            var fileData = {
                read: fs.readFile('dataIndex.json', function (err, data) {
                    if (err) throw err;            
                    return data;
                })
            };
            */
            //console.log(fileData.read);

            var index = {
                "WorkUri":WorkId,
                "InstanceUri":InstanceId,
                "ItemUri":ItemId,
                "title":title
            }   
 
            function readContent(callback) {    // http://stackoverflow.com/questions/10058814/get-data-from-fs-readfile
                fs.readFile("dataIndex.json", function (err, content) {
                    if (err) return callback (err)
                    callback(null, content)
                });
            }

            readContent(function (err, content) {

                if (Buffer.isBuffer(content)) { 
                    result = content.toString('utf8'); 
                }
                var dupe;
                var jResult = JSON.parse(result);

                //console.log(jResult[2].WorkUri);
                //console.log(index.WorkUri);
  
                for (var i = 0; i < jResult.length; i++) {
                    if (jResult[i].WorkUri == index.WorkUri) {
                        dupe = "true";
                    } 
                }
                if (dupe !== "true") {
                    appendContent(jResult, index);
                }
            });

            function appendContent(data, newData) {     // http://stackoverflow.com/questions/13552261/nodejs-write-json-to-a-file
                try {
                    data.push(newData);
                    var newFile = JSON.stringify(data);
                    fs.writeFile('dataIndex.json', newFile, function (err) {
                      if (err) throw err;
                      console.log('Data was appended to file!');
                    });

                }
                catch (err) {
                    data = [];
                }                 
            }
            
            /*
            MongoClient.connect('mongodb://127.0.0.1:27017/test', function (err, db) {
                if (err) throw err;
                var collection = db.collection('new_test');
                collection.insert(request.post, function (err, docs) {
                    // Locate all the entries using find
                    collection.find().toArray(function (err, results) {
                        console.log(results);
                        // Let's close the db
                        db.close();
                    });
                });
            });
        */
            
            
            response.writeHead(200, "OK", {
                'Content-Type': 'text/plain'
            });
            

            /*
            response.writeHead(301, {
              'Location': 'http://localhost:8000/test_page.html'
              'Content-Type': 'text/plain'
              //add other headers here...
            });
            */
            
            response.end();
        });
    } else {

        
        response.writeHead(200, "OK", {
            'Content-Type': 'text/plain'
        });
        

        /*
        response.writeHead(301, {
              'Location': 'http://localhost:8000/test_page.html'
              'Content-Type': 'text/plain'
              //add other headers here...
        });
        */

        response.end();
    }
}).listen(port);

// Function from http://stackoverflow.com/questions/4295782/how-do-you-extract-post-data-in-node-js. 
function processPost(request, response, callback) {
    var queryData = "";
    if (typeof callback !== 'function') return null;
    if (request.method == 'POST') {
        request.on('data', function (data) {
            queryData += data;
            if (queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {
                    'Content-Type': 'text/plain'
                }).end();
                request.connection.destroy();
            }
        });
        request.on('end', function () {
            request.post = querystring.parse(queryData);
            callback();
        });
    } else {
        response.writeHead(405, {
            'Content-Type': 'text/plain'
        });
        response.end();
    }
}



util.puts('BIBFRAME Editor running on ' + port);
util.puts('Press Ctrl + C to stop.');