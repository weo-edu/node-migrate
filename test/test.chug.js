var db = require('lib/db');
var chug = require('../lib/vinyl-mongo');
var should = require('should');

var test = db.get('test');
test.remove({});
test.insert({test: 1});
test.insert({test: 2});
test.insert({test: 3});


chug.src('test', {})
  .pipe(chug.transform({test: 'test.a'}))
  .pipe(chug.dest('test', 1))
  .on('end', function() {
    test.find({}, {stream: true})
      .each(function(doc) {
        doc.test.should.have.property('a');
      })
      .success(function() {
        test.remove({});
        db.close();
      })
  });


process.on('exit', function(){
  console.log('\n   ok\n');
});