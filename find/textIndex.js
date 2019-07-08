var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;
require('dotenv').config();
var mongoose = require('mongoose')
const MongoClient = require('mongodb').MongoClient;
Promise.all([
	mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser: true }),
	MongoClient.connect(process.env.DATABASE_URL,{useNewUrlParser:true})	
]).then((clients) => {
	var db = mongoose.connection;
	var Schema = mongoose.Schema;
	var recordSchema = new Schema({
		name: String,
		interest: String,
		job: String
	});
	recordSchema.path('name').index({text: true})
	var recordModel = mongoose.model('records', recordSchema);
	var nativeCollection = clients[1].db().collection('records')
	suite
	.add('Mongoose', {
		defer: true,
		fn: function(def) {
			recordModel.find({$text :{ $search: "bugwheels90544"}}).exec().then(function (e) {
				def.resolve();
			});
		}
	})
	.add('MongoDB', {
		defer: true,
		fn: function(def) {
			nativeCollection.find({name: {$text :{ $search: 'bugwheels90544'}}}).toArray((r) => {
				def.resolve();
				// console.log(r)
			})
		}
	})
	.on('cycle', function(event) {
  		console.log(String(event.target));
	})
	.on('complete', function() {
  		console.log('Fastest is ' + this.filter('fastest').map('name'));
	})
	.run({ 'async': true });


})
