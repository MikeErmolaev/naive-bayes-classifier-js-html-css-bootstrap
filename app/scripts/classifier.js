'use strict';

function Classifier() {
	this.vocabulary = [];
	this.trainingSet = {};
	this.docCount = 0;
}
Classifier.prototype.train = function(group, features) {
	var featuresArray,
		that = this;
	if (!group || !features) {
		throw new Error("need some data to work")
	}
	if (typeof group != 'string' || typeof features != 'string') {
		throw new Error('wrong input!');
	}
	featuresArray = makeBagOfWords(features);
	if (Object.keys(that.trainingSet).indexOf(group) > -1) {
		that.trainingSet[group].concat(featuresArray);
		that.trainingSet[group].classPrior++;
	} else {
		that.trainingSet[group] = featuresArray;
		that.trainingSet[group].classPrior = 1;
	}
	that.docCount++;
	featuresArray.forEach(function(feature) {
		if (that.vocabulary.indexOf(feature) == -1) {
			that.vocabulary.push(feature);
		}
	});

};
Classifier.prototype.classify = function(text) {
	var textArray,
		that = this;
	if (!text) {
		throw new Error("need some data to work")
	}
	if (typeof text != 'string') {
		throw new Error('wrong input!');
	}
	textArray = makeBagOfWords(text);
	if (textArray.every(function(word) {
			if (that.vocabulary.indexOf(word) == -1) {
				return true;
			} else {
				return false;
			}
		})) {
		return 'unknown category';
	}
	Object.keys(that.trainingSet).forEach(function(group) {
		that.trainingSet[group].probability = 1;
		textArray.forEach(function(word) {
			that.trainingSet[group].probability *= (countWordRepetitions(word, that.trainingSet[group]) + 1) / (that.trainingSet[group].length + that.vocabulary.length);
		});
		that.trainingSet[group].probability *= that.trainingSet[group].classPrior / that.docCount;
	});
	return Object.keys(that.trainingSet).reduce(function(a, b) {
		if (that.trainingSet[a].probability > that.trainingSet[b].probability) {
			return a;
		} else {
			return b;
		}
	});
};
Classifier.prototype.getProbabilityToClass = function(group, text) {
	var textArray,
		probability=1,
		that=this;
	if (!text && !group) {
		throw new Error("need some data to work")
	}
	if (!text) {
		if (typeof group != 'string') {
			throw new Error('wrong input!');
		}
		return that.trainingSet[group].classPrior / that.docCount;
	} else {
		if (typeof group != 'string' || typeof text != 'string') {
			throw new Error('wrong input!');
		}
		textArray = makeBagOfWords(text);
		textArray.forEach(function(word){
			probability*=(that.trainingSet[group].classPrior / that.docCount) * (countWordRepetitions(word, that.trainingSet[group]) + 1) / (that.trainingSet[group].length + that.vocabulary.length);
		});
		return probability;
	}
}

function countWordRepetitions(word, array) {
	var count = 0;
	array.forEach(function(item) {
		if (item === word) {
			count++;
		}
	});
	return count;
}

function makeBagOfWords(text) {
	return text.replace(/[\W\d]/g, ' ').replace(/\s{2,}/g, ' ').trim().toLowerCase().split(' ');
}