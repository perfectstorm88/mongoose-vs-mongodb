var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;
var mongodbCollectionName='testrecord1'
var mongooseCollectionName='testrecord2'
require('dotenv').config();
var mongoose = require('mongoose')
const MongoClient = require('mongodb').MongoClient;
var record = {
	name: 'bugwheels',
	interest: 'Not Many',
	job: 'Useless'
}
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
	var recordModel = mongoose.model(mongooseCollectionName, recordSchema);
	var nativeCollection = clients[1].db().collection(mongodbCollectionName)
	suite
	.add('Mongoose', {
		defer: true,
		fn: function(def) {
			new recordModel(record).save(() => {
				def.resolve()
			})
		}
	})
	.add('MongoDB', {
		defer: true,
		fn: function(def) {
			nativeCollection.insert(record, (e, r) => {
				def.resolve();
				// console.log(r)
			})
		}
	})
	.on('cycle', function(event) {
  		console.log(String(event.target));
	})
	.on('complete', function() {
		nativeCollection.drop();
		db.dropCollection(mongooseCollectionName);
  		console.log('Fastest is ' + this.filter('fastest').map('name'));
	})
	.run({ 'async': true });
})
