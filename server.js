
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
var DB_FILE = path.join(__dirname, '/data/data.json');
var aws = require('aws-lib');
var USlocaleIndexes_salesrank = [ 'UnboxVideo', 'Appliances', 'ArtsAndCrafts', 'Automotive',	'Baby', 'Beauty', 'Books', 'Music', 'Wireless', 'Collectibles', 'PCHardware', 'MP3Downloads', 'Electronics', 'GiftCards', 'Grocery', 'HealthPersonalCare', 'HomeGarden', 'Industrial', 'KindleStore', 'MusicalInstruments', 'OfficeProducts', 'LawnAndGarden', 'PetSupplies', 'Software', 'SportingGoods', 'Tools', 'Toys', 'VideoGames'] // All Amazon Indexes for US locale which are sortable by salesrank<]<]<]
var USlocaleIndexes_reviewrank = ['Appliances', 'MobileApps', 'ArtsAndCrafts', 'Books', 'Wireless', 'Fashion', 'FashionBaby', 'FashionBoys', 'FashionGirls', 'FashionMen', 'FashionWomen', 'Collectibles', 'Electronics', 'GiftCards', 'KindleStore', 'Luggage', 'Magazines', 'Movies', 'OfficeProducts', 'LawnAndGarden', 'PetSupplies', 'Pantry', 'Wine']
var data = {}

var QUEUE_FILE = path.join(__dirname, '/data/queue.json');
var HEADER_TEMPLATE = {
	"__header" : {
		"status" : "idle",
		"job" : ""
	}
}
var queue = {}
fs.readFile(QUEUE_FILE, function(err,data){
	if(err) console.log(err);
	queue = JSON.parse(data)
})
/*fs.writeFile(QUEUE_FILE, JSON.stringify(HEADER_TEMPLATE, null, 4), function(err){

	})*/
var MostSR = 0
var MostSR_Index = ''
var MostTotal = 0
var MostTotal_Index = ''
var flagTR = true
var resFlag = false
var flagSR = true
var awsConnections = [
	aws.createProdAdvClient("AKIAJO23CANB5S2IRKJA", "gLTaWQNjqWvTu6YIRjTuVdKFuNnkglABktXKJ8KZ", "none"),
	aws.createProdAdvClient("AKIAJ4GQCRXZHPU5TNRQ", "I6UONgJuk7MtSua+PXZXg/6gGnBB4zGn57lhUEQE", "none"), 
	aws.createProdAdvClient("AKIAJ4FXGBTX3CNWZFNA", "MVrDOr5Xb1s5KlzMV3/24dUQL0PifxgkibjV2MIh", "none"),
	aws.createProdAdvClient("AKIAJV2DXIQAXOH26M5Q", "590Iq35TzgvGvComNmaXj4NqlXkibUdHe5tIvwr1", "none"), 
	aws.createProdAdvClient("AKIAJJV74TF7WKMXMPEQ", "KZjc9haCmSzFiCUgd4fd5kNg6URodrPoHSbgj+fN", "none"),
	aws.createProdAdvClient("AKIAILURQN3CUZGAMMAA", "VbtlUEndo4gvJitctgwc3c9LjlBbDuYay01TO4Ud", "none"), 
	aws.createProdAdvClient("AKIAJQDACO7GNZRRRGHA", "25ogxlpAgl6fS+znJB8llOMbVyKb7hVzYS+UNpK+", "none"),
	aws.createProdAdvClient("AKIAJCQJXJHVYSEWR76A", "+wiF4WMRbsDssa41zyK6VWHdinhJvnX9dkOUTUG9", "none"), 
	aws.createProdAdvClient("AKIAIJFBFXBFV7SE6XOA", "udqOKtEe3BcJ3r4spe5VNkw3aiAZYRkIQ52LEAUo", "none"), 
	aws.createProdAdvClient("AKIAJXA27KHGBIQNVTIA", "nxPqSq2jIriIVZ4B+0MA5lfYrHPqTo4TsSDzbgUU", "none"),
	aws.createProdAdvClient("AKIAJZSGSF5H2CZS6Z7A", "iED3pTkIkI2mmCfCiAIByM++Zpe8FvnF1xW/jsME", "none"),
	aws.createProdAdvClient("AKIAJXNR3BLVHXSWPBJQ", "5KaggsceIDB1U/5BtCCu5SOLwpDMIduZNiJs3j4N", "none"),
	aws.createProdAdvClient("AKIAIR5Y62N4L3HIRBEA", "/9GIQKOBfQ+bcBkTLpW/BHe2XjNySAHxXPHHFfAX", "none"),
	aws.createProdAdvClient("AKIAJLXX52VCF5WR4COQ", "KW9m/LifPMLe7kmekptbwkQX69zn3a20oy0DiOIM", "none"),
	aws.createProdAdvClient("AKIAIH5UAERFHQXTDWZA", "0tEjaVN7zQ8KvjCiSbqr5eIBGLxlyzmEEyHtEtDn", "none"),
	aws.createProdAdvClient("AKIAIAIBVF32OF6BTDIA", "8g7fuZevLbrka2KbLlInSxB759ph3AtWb7XoIFrd", "none"),
	aws.createProdAdvClient("AKIAIAQY2HABS6Z7LZZQ", "pqe9XtwyCcTTUgoQo5JDzOOQCr6yhzN2Z5k3ivun", "none"),
	aws.createProdAdvClient("AKIAJ2C6ZF2R5OYV7MCA", "sofMgtmpJK7SPHjdtmf/hudkq5fF741dh8/zgIBx", "none"),
	aws.createProdAdvClient("AKIAIGFSQ5H6QIL6726A", "ZBx0fhmZJvF1ocDXuRWEMVTU87MjnCbt3J4Tv6mm", "none"),
	aws.createProdAdvClient("AKIAIKGMQJALKDHPCYJQ", "1SVjfuWsBAHJ21b5dJjO8RdigGlT04nrg3knKNRQ", "none"),
	aws.createProdAdvClient("AKIAJHI3AQTGEK7OCYFA", "vMMrj3M6zbilF5oC7dgWfg6mKCkErGwjjvJkzKnJ", "none"),
	aws.createProdAdvClient("AKIAIY67B6B25LOFFW4A", "tIxLwp/vJWRBeTgw/kYAZVwkgpT//woD0gHrit9H", "none"),
	aws.createProdAdvClient("AKIAIJDVQGLEY7UZAOWQ", "dJhS92vmvbJ8RwyiHsbanJwtBgEntb1+oqaksPMz", "none"),
	aws.createProdAdvClient("AKIAIMWFY742DS5PFCIQ", "tNd1keHd7apX2RbBWKz8mbRa7q4OuETWPiAr4lLy", "none"),
	aws.createProdAdvClient("AKIAJSPMBHQL2I7AUGLA", "a5DLkaKWpqrDb3y4zmq5E4ZmVdflmr0Oed4bH4WP", "none"),
	aws.createProdAdvClient("AKIAI6V2MLZRFGQL5PBA", "zq/SzlmPpf0tSmv/7Z5efkiY0MMmhwDC/emB/8la", "none"),
	aws.createProdAdvClient("AKIAJ3EJWKVSNLLVEDIQ", "ELNRuo+EA+6AMFGif9ZhJYdlwUziocVuI5SyqsJs", "none")
] 

function continueJobs() {
	fs.readFile(QUEUE_FILE, function(err,q){
		if(err) console.error(err);
		queue = JSON.parse(q)
		if(queue["__header"].status == 'processing'){
			console.log("Resuming jobs left from previous lifecycle...")
			startCollecting(queue["__header"].job)
		}
	})
}

//connect to Amazon Product Advertisement API with aws ID and aws Secret Key
function clearVars() {
	MostSR = 0
	MostTotal = 0
	MostTotal_Index = ''
	MostSR_Index = ''
	flagSR = true
	flagTR = true
}

function startCollecting(keyword){
	data = {}
	queue["__header"].status = 'processing'
	queue["__header"].job = keyword
	queue[keyword].status = 'processing'
	fs.writeFile(QUEUE_FILE, JSON.stringify(queue, null, 4), function(err){
		request('http://completion.amazon.com/search/complete?method=completion&mkt=1&client=amazon-search-ui&x=String&search-alias=aps&q=' + keyword + '&qs=&cf=1&noCacheIE=1454112726317&fb=1&sc=1&', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var resClipped = response.body.substring(12,response.body.length - 11)  				
				var jsonResult = JSON.parse(resClipped)																
				jsonResult = jsonResult[1]		
				initiateTimeOut(0,ReqAmazonWithTimeout_ALL,jsonResult,'',0)      
			};
		});

	})

}


function initiateTimeOut(i, func, array, index, j) {
	setTimeout(function() { func(i, array, index, j) }, 500);
}

function ReqAmazonWithTimeout_ALL(i, array, index, j){
	console.log("Collecting TotalResults data about " + array[i] + "...  [" + i + "/" + (array.length - 1) + "]")
	var options = {SearchIndex: "All", Keywords: array[i]}
	awsConnections[i].call("ItemSearch", options, function(err, result) {
		if(typeof result.Items != 'undefined'){
			data[array[i]] = {"TotalResults": result.Items.TotalResults, "MostCommonIndex": "", "HighestSalesRank": 0, "ReviewRank": 0, "BestSellingIndex": ""}
			i++
				if(i < array.length){
					/*queue[queue["__header"].job].progress += 1
						fs.writeFile(QUEUE_FILE, JSON.stringify(queue, null, 4), function(err){
						if(err) console.log(err);
						});*/
					initiateTimeOut(i, ReqAmazonWithTimeout_ALL, array, index, j)
				}else{
					ReqAmazonWithTimeout_SR(0, array, USlocaleIndexes_salesrank[0], 0)
					console.log("writing to file data/" + queue["__header"].job + '.json')
					fs.writeFile(path.join(__dirname, 'data', queue["__header"].job + '.json'), JSON.stringify(data, null, 4), function(err){
						if(err) console.error(err);
					});
				}

		}else{
			console.error("Error: " + result.Error.Message)
		}	
	});
}
function ReqAmazonWithTimeout_SR(i, array, index, j){
	console.log("Collecting SalesRank Data about " + array[i] + "... [" + i + "/" + (array.length - 1) + "]")
	console.log("Index is " + index + "[" + j + "/" + (USlocaleIndexes_salesrank.length - 1)+ "]")
	var options = {SearchIndex: index, Keywords: array[i], ResponseGroup: "SalesRank, VariationSummary", Sort: "salesrank"}
	awsConnections[j%26].call("ItemSearch", options, function(err, result) {
		/*console.log(JSON.stringify(result, null, 4))*/
		if(typeof result.Items != 'undefined'){
			if(typeof result.Items.Item != 'undefined'){
				if(typeof result.Items.Item[0] != 'undefined'){
					if(typeof result.Items.Item[0].SalesRank != 'undefined'){
						var SR = parseInt(result.Items.Item[0].SalesRank)
						var TR = parseInt(result.Items.TotalResults)
						if (flagSR){
							MostSR = SR
							MostSR_Index = index
							flagSR = false
						}		
						if (SR < MostSR && flagSR == false) {
							MostSR = SR
							MostSR_Index = index
						}else{
						}
						if(flagTR){
							MostTotal = TR
							MostTotal_Index = index
							flagTR = false
						}
						if (TR > MostTotal && flagTR == false){
							MostTotal = TR
							MostTotal_Index = index
						}	
					}
				}else{
					if(typeof result.Items.Item.SalesRank != 'undefined'){
						var SR = parseInt(result.Items.Item.SalesRank)
						var TR = parseInt(result.Items.TotalResults)
						if (flagSR){
							MostSR = SR
							MostSR_Index = index
							flagSR = false
						}		
						if (SR < MostSR && !flagSR) {
							MostSR = SR							
							MostSR_Index = index
						}
						if(flagTR){
							MostTotal = TR
							MostTotal_Index = index
							flagTR = false
						}
						if (TR > MostTotal && !flagTR){
							MostTotal = TR
							MostTotal_Index = index
						}	
					}
				}
			}
		}else{
			console.error("Error: " + result.Error.Message)
		}
		j++
			if(j < USlocaleIndexes_salesrank.length){
				/*queue[queue["__header"].job].progress += 1
					fs.writeFile(QUEUE_FILE, JSON.stringify(queue, null, 4), function(err){
					if(err) console.log(err);
					});*/
				initiateTimeOut(i, ReqAmazonWithTimeout_SR, array, USlocaleIndexes_salesrank[j], j)
			}else{
				i++
					if(i < array.length){
						data[array[i - 1]].HighestSalesRank = MostSR
						data[array[i - 1]].MostCommonIndex = MostTotal_Index 
						data[array[i - 1]].BestSellingIndex = MostSR_Index
						initiateTimeOut(i, ReqAmazonWithTimeout_SR, array, USlocaleIndexes_salesrank[0], 0)
						clearVars()

						fs.writeFile(path.join(__dirname, 'data', queue["__header"].job + '.json'), JSON.stringify(data, null, 4), function(err){
							if(err) console.error(err);
						});
					}else{
						data[array[i - 1]].HighestSalesRank = MostSR
						data[array[i - 1]].MostCommonIndex = MostTotal_Index
						data[array[i - 1]].BestSellingIndex = MostSR_Index
						fs.writeFile(path.join(__dirname, 'data', queue["__header"].job + '.json'), JSON.stringify(data, null, 4), function(err){
							if(err) console.error(err);
							clearVars()
							queue[queue["__header"].job].status = "cached"
							queue["__header"].status = "idle"
							queue["__header"].job = ''
							fs.writeFile(QUEUE_FILE, JSON.stringify(queue, null, 4), function(err){
								Object.keys(queue).some(function(el,l,arr){
									console.log(queue[el])
									if(queue[el].status == 'scheduled'){
										startCollecting(el)
										return true;
									}
								});
							})
						});
					}
			}
	});
}

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.post('/data', function(req, res) {         
	fs.readFile(QUEUE_FILE, function(err,data){
		if(err){

		}
		queue = JSON.parse(data)
		if(queue.hasOwnProperty(req.body.keyword))
			{
				var cachePath = path.join(__dirname, 'data', req.body.keyword + '.json')
				fs.access(cachePath, fs.F_OK, function(err){
					if(err){
						res.send('{"Error: "Request not yet processed}')
					}else{
						fs.readFile(cachePath, function(err,cache){
							cache = JSON.parse(cache)
							res.send(cache)
						});
					}
				});
			}else{
				var cachePath = path.join(__dirname, 'data', req.body.keyword + '.json')
				fs.access(cachePath, fs.F_OK, function(err){
					if(!err){
						console.log("Repairing broken queue.json with missing cached files")
						queue[req.body.keyword] = {
							'status' : 'cached'
						}
						fs.writeFile(QUEUE_FILE, JSON.stringify(queue, null, 4), function(err){
							if(err) console.error(err);
						});
					}else{
						queue[req.body.keyword] = {
							'status' : 'new',
							'date' : Date.now(),
							'progress' : 0
						}
						if(queue["__header"].status == 'idle'){
							queue["__header"].job = req.body.keyword
							startCollecting(req.body.keyword)
						}else{
							queue[req.body.keyword].status = 'scheduled'	
						}
						fs.writeFile(QUEUE_FILE, JSON.stringify(queue, null, 4), function(err){
							if(err) console.error(err);
						});
					}
				})


			}

	});

});


app.get('/data', function(req,res){
	/*fs.readFile(DB_FILE, function(err, data){
		if(err) console.log(err);
		data = JSON.parse(data)
		res.send(data)
		});*/
});
app.get('/queue', function(req,res){
	fs.readFile(QUEUE_FILE, function(err,data){
		if(!err) res.send(JSON.parse(data))
	})
});

app.listen(app.get('port'), function() {
	console.log('Server started at port ' + app.get('port') + '');
	continueJobs()
});


