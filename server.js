
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
var DB_FILE = path.join(__dirname, '/data/data.json');
var aws = require('aws-lib');
var USlocaleIndexes_salesrank = [ 'UnboxVideo', 'Appliances', 'ArtsAndCrafts', 'Automotive', 'Baby', 'Beauty', 'Books', 'Music', 'Wireless', 'Collectibles', 'PCHardware', 'MP3Downloads', 'Electronics', 'GiftCards', 'Grocery', 'HealthPersonalCare', 'HomeGarden', 'Industrial', 'KindleStore', 'MusicalInstruments', 'OfficeProducts', 'LawnAndGarden', 'PetSupplies', 'Software', 'SportingGoods', 'Tools', 'Toys', 'VideoGames'] // All Amazon Indexes for US locale which are sortable by salesrank
var USlocaleIndexes_reviewrank = ['Appliances', 'MobileApps', 'ArtsAndCrafts', 'Books', 'Wireless', 'Fashion', 'FashionBaby', 'FashionBoys', 'FashionGirls', 'FashionMen', 'FashionWomen', 'Collectibles', 'Electronics', 'GiftCards', 'KindleStore', 'Luggage', 'Magazines', 'Movies', 'OfficeProducts', 'LawnAndGarden', 'PetSupplies', 'Pantry', 'Wine']
var data = {}
var prodAdv = aws.createProdAdvClient("AKIAJO23CANB5S2IRKJA", "gLTaWQNjqWvTu6YIRjTuVdKFuNnkglABktXKJ8KZ", "none"); 
//connect to Amazon Product Advertisement API with aws ID and aws Secret Key

function initiateTimeOut(i, func, array, index, j) {
setTimeout(function() { func(i, array, index, j) }, 1000);
}

function ReqAmazonWithTimeout_ALL(i, array){
		console.log("Collecting TotalResults data...  [" + i + "/" + (array.length - 1) + "]")
		var options = {SearchIndex: "All", Keywords: array[i]}
		prodAdv.call("ItemSearch", options, function(err, result) {
			if(typeof result.Items != 'undefined'){
				data[array[i]] = {"TotalResults": result.Items.TotalResults, "MostCommonIndex": "", "HighestSalesRank": 0, "ReviewRank": 0}
			}else{
				console.error("Error: " + result.Error.Message)
			}
		});
		i++
		if(i < array.length){
			initiateTimeOut(i, ReqAmazonWithTimeout_ALL, array)
		}else{
			console.log(data)
			initiateTimeOut(0, ReqAmazonWithTimeout_SR, array, USlocaleIndexes_salesrank[0], 0)
		}
}
function ReqAmazonWithTimeout_SR(i, array, index, j){
		console.log("Collecting SalesRank Data... [" + i + "/" + array.length + "]")
		console.log("Index is " + index + "[" + j + "/" + (USlocaleIndexes_salesrank.length - 1)+ "]")
		var MostResults = 0
		var options = {SearchIndex: index, Keywords: array[i], ResponseGroup: "SalesRank", Sort: "salesrank"}
		prodAdv.call("ItemSearch", options, function(err, result) {
			if(typeof result.Items != 'undefined'){
				console.log(result.Items.Item)
			}else{
				console.error("Error: " + result.Error.Message)
			}
		});
		i++
		if(i < array.length){
			initiateTimeOut(i, ReqAmazonWithTimeout_SR, array, index, j)
		}else{
			if(j < USlocaleIndexes_salesrank.length){
				j++
				initiateTimeOut(0, ReqAmazonWithTimeout_SR, array, USlocaleIndexes_salesrank[j], j)
			}
		}
}

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/data', function(req, res) {                                        //making post req to amazon completion here for completion results.
	request('http://completion.amazon.com/search/complete?method=completion&mkt=1&client=amazon-search-ui&x=String&search-alias=aps&q=' + req.body.keyword + '&qs=&cf=1&noCacheIE=1454112726317&fb=1&sc=1&', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var resClipped = response.body.substring(12,response.body.length - 11)  //cut extra parts of amazon response 'completion = ' .. 'String();' for JSON to parse this properly
			var jsonResult = JSON.parse(resClipped)																  //parsing amazon response
			jsonResult = jsonResult[1]																					  	//[1] is the needed completion array
			initiateTimeOut(0,ReqAmazonWithTimeout_ALL,jsonResult)
						/*USlocaleIndexes_salesrank.forEach(function(el,j,arr){
				jsonResult.forEach( function(el, i, jsonResult){                                         //Now call Amazon Product Advertisement API for every completion                                                                                                      with all indexes which are sortable by salesrank to retrieve maximu																																																	m salesrank
					var options = {SearchIndex: arr[j], Keywords: jsonResult[i], ResponseGroup: "SalesRank", Sort:'salesrank'}
					prodAdv.call("ItemSearch", options, function(err, result) {
						if(typeof result.Items != 'undefined'){
							console.log(result.Items)
							[>data[jsonResult[i]].SRhi = result.Items.Item[0].SalesRank <]
						}else{
							console.error("Error: " + result.Error.Message)
						}
					});
				});

				});*/
			};
		});
});

app.listen(app.get('port'), function() {
	console.log('Server started: http://localhost:' + app.get('port') + '/');
});


