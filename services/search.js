var fs = require('fs-extra');
var async = require('async');
var config = require('config');

/**
 * Constructor
 */
SearchService = function() {
};

/**
 * Given a search term, searches and returns the most valid games
 * @param  {string} term
 * @param  {number} maximum number of results returned
 * @return {Array}
 */
SearchService.search = function(term, maximum, callback) {

    maximum = maximum || 20; //return 20 results unless otherwise stated
    term = term || '';
    term = term.replace(/\s+/g,' ').trim().replace(/[^a-zA-Z0-9\s]/gi,''); //sanitize term by trimming, removing invalid characters
    var result = [];
    var i;
    var system;
    var file;
    var rank;
    var words = term.split(' '); //split all search terms

    for (line in global.everything)
    {

        var content = global.everything[line].wordcontent;

        if (content) {

            /**
             * search scoring
             * hundreds digit: the strength of the regex scoring
             * tens digit: the order of the search query words (first is more relevant)
             * ones digit: the length of the content's content. a smaller content more closely matches the search making it more revelant
             * precision: the playability score of the content. this elevates contents that are (U) and [!] over ones that are hacks etc.
             */
            //the higher the search score, the more likely it is to show at the top of the auto complete list
            var searchscore = 0;

            //pass over all search terms
            for (i = 0; i < words.length; ++i) {

                var contentwords = content.split(' '); //split content's terms

                var wholeterm = new RegExp('^' + words[i] + '(\\s|$)','i');        //word is a whole word at at the beginning of the result
                var wordinside = new RegExp('\\s' + words[i] + '(\\s|$)', 'i');     //word is a whole word someplace in the result (space or endstring after word)
                var beginswith = new RegExp('(^|\\s)' + words[i],'i');              //is a partial word at at the beginning of the result or one of the words within
                var partof     = new RegExp(words[i], 'i');                         //word is partial word anyplace in the result

                var termdepthscore = (words.length - i) * 10; //word path score gives highest score to first term in entry (most likely what user is searching for)

                //check each word against possible location in content and give score based on position
                //continue at each check to prevent same word scoring mutliple times
                if (content.match(wholeterm)) {
                    searchscore += (300 + termdepthscore); //most points awarded to first word in query
                    //log += words[i] + '=' + (300 + termdepthscore) + ' wholeterm (' + termdepthscore + '). ';
                    continue;
                }
                if (content.match(wordinside)) {
                    
                    var  wordinsidescore = 200;

                    //ok, which whole word inside content? more depth determines score
                    for (var j = 0; j < contentwords.length; ++j) {
                        if (words[i].toLowerCase() === contentwords[j].toLowerCase()) {
                            wordinsidescore -= (10 * j);
                        }
                    }

                    searchscore += (wordinsidescore + termdepthscore);
                    //log += words[i] + '=' + (wordinsidescore + termdepthscore) + ' wordinside (' + termdepthscore + '). ';
                    continue;
                }
                if (content.match(beginswith) && !content.match(wholeterm)) {
                    
                    var beginswithscore = 150;

                    //ok, which word inside content? more depth lessens score
                    for (var j = 0; j < contentwords.length; ++j) {
                        var match = new RegExp(words[i],'i');
                        if (contentwords[j].match(match)) {
                            beginswithscore -= (10 * j);
                        }
                    }

                    searchscore += (beginswithscore + termdepthscore);
                    //log += words[i] + '=' + (beginswithscore + termdepthscore) + ' beginswith (' + termdepthscore + '). ';
                    continue;
                }
                if (content.match(partof)) {
                    searchscore += (100 + termdepthscore);
                    //log += words[i] + '=' + (100 + termdepthscore) + ' partof (' + termdepthscore + '). ';
                    continue;
                }
            }

            if (searchscore > 0) {

                //the one's digit is a score based on how many words the content's content is. The fewer, the beter the match given the terms
                searchscore += (10 - contentwords.length);
                //log += 'content penalty: ' + (10 - contentwords.length) + '. ';

                //the decimal places in the score represent the "playability" of the content. This way, contents with (U) and [!] will rank higher than those that are hacks or have brackets
                //searchscore += (rank * 0.1); //between 9.9 and 0.0

                result.push([global.everything[line], searchscore]);
            }
        }
    }

    //sort according to score
    result.sort(function(a, b) {
        if (a[1] > b[1]) {
            return -1;
        }
        if (a[1] < b[1]) {
            return 1;
        }
        return 0;
    });

    //if over max, splice out
    if (result.length > maximum) {
        result.splice(maximum, result.length - 1);
    }

    return callback(null, result);
};

module.exports = SearchService;
