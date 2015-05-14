"use strict";
describe("Classifier", function() {
	var classifier;
	beforeEach(function() {
		classifier = new Classifier();
	});
	describe("constructor", function() {

		it("should have vocabulary, trainingSet and docCount properties", function() {
			expect(classifier).to.have.property('vocabulary');
			expect(classifier).to.have.property('trainingSet');
			expect(classifier).to.have.property('docCount');
			expect(classifier.trainingSet).to.be.an('object')
			expect(classifier.docCount).to.be.equal(0);
		});
		it("should have empty properties as default at creation", function() {
			expect(classifier.vocabulary).to.be.empty;
			expect(classifier.trainingSet).to.be.empty;
			expect(classifier.docCount).to.be.equal(0);
			classifier = new Classifier('asdf', 235425, 'fsdf');
			expect(classifier.vocabulary).to.be.empty;
			expect(classifier.trainingSet).to.be.empty;
			expect(classifier.docCount).to.be.equal(0);
		});
	});
	describe("#train", function() {
		it("should throw error if some of arguments aren't provided", function() {
			expect(function() {
				classifier.train('a');
			}).to.throw(Error("need some data to work").message);

			expect(function() {
				classifier.train();
			}).to.throw(Error("need some data to work").message);
		});
		it("should throw error if provided arguments aren't string", function() {
			expect(function() {
				classifier.train(1, {
					asd: 'asd'
				});
			}).to.throw(Error("wrong input!").message);
		});
		it("should update vocabulary length by count of unique words and docCount by count of new docs", function() {
			expect(classifier.vocabulary).to.have.length(0);
			expect(classifier.docCount).to.be.equal(0);
			classifier.train("spam", "hello buy some viagra");
			expect(classifier.docCount).to.be.equal(1);
			expect(classifier.vocabulary).to.have.length(4);
			expect(classifier.docCount).to.be.equal(1);
			classifier.train("not spam", "hello morning good day");
			expect(classifier.docCount).to.be.equal(2);
			expect(classifier.vocabulary).to.have.length(7);
		});
		it("should increase trainingSet length when adding new class and add this class as new property to trainingSet", function() {
			expect(Object.keys(classifier.trainingSet)).to.have.length(0);
			classifier.train("classA", "qwerty asdf hfd");
			expect(Object.keys(classifier.trainingSet)).to.have.length(1);
			expect(classifier.trainingSet).to.have.property('classA');
			expect(JSON.stringify(classifier.trainingSet.classA)).to.be.equal(JSON.stringify(['qwerty', 'asdf', 'hfd']));
		});
		it("should add only words to trainingSet", function() {
			classifier.train("classA", "qwerty asdf hfd");
			expect(classifier.trainingSet['classA']).to.have.length(3);
			classifier.train("classB", "123 qwerty !@#%,.");
			expect(classifier.trainingSet['classB']).to.have.length(1);
		});
		it("should create one megadoc from a lot of docs of one class", function() {
			classifier.train("classA", "qwerty asdf hfd");
			expect(Object.keys(classifier.trainingSet)).to.have.length(1);
			classifier.train("classA", "tyrt we");
			expect(Object.keys(classifier.trainingSet)).to.have.length(1);
			classifier.train("classA", "gh s");
			expect(Object.keys(classifier.trainingSet)).to.have.length(1);
		});
	});
	describe("#classify", function() {
		var res;
		beforeEach(function() {
			classifier.train("not spam", "hello morning good day");
			classifier.train("spam", "hello buy some viagra");
		});
		it("should throw error if no arguments are provided", function() {
			expect(function() {
				res = classifier.classify();
			}).to.throw(Error("need some data to work").message);
		});
		it("should throw error if provided argument isn't string", function() {
			expect(function() {
				res = classifier.classify(1);
			}).to.throw(Error("wrong input").message);
			expect(function() {
				res = classifier.classify({
					lol: "lol"
				});
			}).to.throw(Error("wrong input").message);
		});
		it("should decide to which class goes provided text", function() {
			res = classifier.classify("good day, i am viagra seller. Do you want to buy some?");
			expect(res).to.be.equal("spam");
		});
		it("should return 'unknown category'", function() {
			res = classifier.classify("unknown words here");
			expect(res).to.be.equal("unknown category");
		});
		it("should be able to train further after classification and return correct result", function() {
			res = classifier.classify("good day, i am viagra seller. Do you want to buy some?");
			expect(res).to.be.equal("spam");
			classifier.train("invitaion", "come at pm evening dinner");
			res = classifier.classify("Good evening! Come to dinner at 6 pm!");
			expect(res).to.be.equal("invitaion");
			classifier.train("spam", "porn porn porn buy drugs");
			res = classifier.classify("Watch porn, eat drugs and buy viagra!");
			expect(res).to.be.equal("spam");
		});
	});
	describe("#getProbabilityToClass", function() {
		var res;
		beforeEach(function() {
			classifier.train("not spam", "hello morning good day");
			classifier.train("spam", "hello buy some viagra");
		});
		it("should throw error if no arguments are provided", function() {
			expect(function() {
				classifier.getProbabilityToClass();
			}).to.throw(Error("need some data to work").message);
		});
		it("should return class probability(class prior) if only class is provided",function(){
			res = classifier.getProbabilityToClass("spam");
			expect(res).to.be.equal(0.5);
		});
		it("should return probability number of provided text to belong to provided class", function() {
			res = classifier.getProbabilityToClass("spam", "hello good evening buy chips come to me");
			expect(res).to.be.a('number');
		});
	});
});