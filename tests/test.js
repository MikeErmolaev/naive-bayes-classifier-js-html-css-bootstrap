"use strict";
describe("Classifier", function() {
	beforeEach(function() {
		var classifier = new Classifier();
	});
	describe("constructor", function() {
		it("should have vocabulary and trainingSet properties", function() {
			expect(classifier).to.have.property('vocabulary').with.property('trainingSet');
			expect(classifier.trainingSet).to.be.an('object')
		});
		it("should have empty properties as default at creation", function() {
			expect(classifier.vocabulary).to.be.empty;
			expect(classifier.trainingSet).to.be.empty;
			classifier = new Classifier('asdf', 235425, 'fsdf');
			expect(classifier.vocabulary).to.be.empty;
			expect(classifier.trainingSet).to.be.empty;
		});
	});
	describe("#train", function() {
		it("should throw error if provided arguments aren't string",function(){
			expect(function(){
				classifier.train(1,{asd:'asd'});
			}).to.throw(Error);
		});
		it("should update vocabulary length by count of unique words",function(){
			expect(classifier.vocabulary).to.have.length(0);
			classifier.train("spam","hello buy some viagra");
			expect(classifier.vocabulary).to.have.length(4);
			classifier.train("not spam","hello morning good day");
			expect(classifier.vocabulary).to.have.length(7);
		});
		it("should increase trainingSet length when adding new class and add this class as new property to trainingSet",function(){
			expect(Object.keys(classifier.trainingSet)).to.have.length(0);
			classifier.train("classA","qwerty asdf hfd");
			expect(Object.keys(classifier.trainingSet)).to.have.length(1);
			expect(classifier.trainingSet).to.have.property('classA',['qwerty','asdf','hfd']);

		});
		it("should add only words to trainingSet",function(){
			classifier.train("classA","qwerty asdf hfd");
			expect(classifier.trainingSet['classA']).to.have.length(3);
			classifier.train("classB","123 qwerty !@#%,.");
			expect(classifier.trainingSet['classB']).to.have.length(1);
		});
	});
	describe("#classify",function(){
		before(function(){
			var res;
			classifier.train("not spam","hello morning good day");
			classifier.train("spam","hello buy some viagra");
		});
		it("should throw error if provided argument isn't string",function(){
			expect(function(){
				res=classifier.classify(1);
			}).to.throw(Error);
			expect(function(){
				res=classifier.classify({lol:"lol"});
			}).to.throw(Error);
		})
		it("should decide to which class goes provided text",function(){
			res=classifier.classify("good day, i am viagra seller. Do you want to buy some?");
			expect(res).to.be.equal("spam");
		});
		it("should return 'unknown category'",function(){
			res=classifier.classify("unknown words here");
			expect(res).to.be.equal("unknown category");
		});
	});

});