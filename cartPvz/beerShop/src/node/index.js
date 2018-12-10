const MONGO_ClIENT = require('mongodb').MongoClient;
const MONGO = require('mongodb');
const RESTIFY = require('restify');

var corsMiddleware = require('restify-cors-middleware');


var url = 'mongodb://localhost:27017';

var collections = {
    beers: 'beers'
};

function connect(callback) {
    MONGO_ClIENT.connect(url, function(err, client) {
        if (err) throw err;
        var dbo = client.db("");
        callback(dbo, client);
    });
}

function add(obj, collection) {
    connect(function(dbo, client) {
        dbo.collection(collection).insertOne(obj, function(err, res) {
            if (err) throw err;
            console.log("Beer inserted");
            client.close();
        });
    });
}

function get(collection, callback) {
    connect(function(dbo, client) {
        dbo.collection(collection).find({}).toArray(function(err, result) {
            if (err) throw err;
            client.close();
            callback(result);
        });
    });
}

function put(_id, newObj, collection, callback) {
    connect(function(dbo, client) {
        return dbo.collection(collection).update(
            {"_id": new MONGO.ObjectID(_id)},
            newObj,
            function(err, result) {
                if (err) throw err;
                callback();
                client.close();
            }
        );
    });
}
function del(ids, collection, callback) {
    connect(function(dbo, client) {

        dbo.collection("beers").deleteOne({_id: new MONGO.ObjectID(_id)}, function(err, obj) {
            if (err) throw err;
            console.log("Beer deleted");
            callback();
            client.close();
        });
    });
}

var server = RESTIFY.createServer();
server.pre((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});
server.use(RESTIFY.plugins.bodyParser());

// START cors
var cors = corsMiddleware({
    origins: ['*']
});
server.use(cors.actual);
server.opts(/.*/, function(req, res, next) {
    res.header('Access-Control-Allow-Methods', req.header('Access-Control-Request-Method'));
    res.header('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers'));
    res.send(200);
    return next();
});
// END cors


server.get('/api/beers', function(req, resp, next) {
    try {
        get(collections.beers, function (result) {
            console.log(result);
            resp.send(result);
            next();
        });
    } catch (err) {
        console.log(err);
    }
});
server.post('/api/beers', function(req, resp, next) {
    let body = req.body;

    let counter = 0;
    try {
        add(body, collections.beers);
        counter++;
    } catch (err) {
        console.log(err);
    }

    resp.end('Beers added: ' + counter);
    next();
});
server.put('/api/beers/:id', function(req, resp, next) {
    let _id = req.params.id;
    let body = req.body;

    let counter = 0;
    try {
        put(_id, body, collections.beers, function() {
            counter++;
            resp.end('Beers updated: ' + counter);
            next();
        });

    } catch (err) {
        console.log(err);
    }
});
server.del('/api/beers', function(req, resp, next) {
    let ids = req.body;

    try {
        del(ids, collections.beers, function() {
            resp.send('');
            next();
        });
    } catch (err) {
        console.log(err);
    }

});

server.listen(8080, function() {
    console.log('Listening on 8080');
});