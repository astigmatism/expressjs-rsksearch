const NodeCache = require( "node-cache" );
const myCache = new NodeCache();
var fs = require('fs-extra');
var async = require('async');
var config = require('config');
var line = require('../models/line')

ParseService = function() {
};

ParseService.Parse = function(callback) {

    var _pathToScripts = __dirname + '/../' + config.get('scriptPath');

    fs.readdir(_pathToScripts, function(err, scripts) {
        if (err) {
            return callback(err);
        }

        async.eachSeries(scripts, function(script, nextscript) {

            fs.readFile(_pathToScripts + '/' + script, 'utf8', function(err, data) {
                if (err) {
                    return nextscript(err);
                }
                ParseService.ReadScript(data, function(err) {
                    if (err) {
                        return nextscript(err);
                    }
                    return nextscript();
                });
            });

        }, function(err, result) {
            if (err) {
                return callback(err);
            }
            
            return callback();
        });
    });
};

ParseService.ReadScript = function(data, callback) {

    var lines = data.split('\n');
    var linecounter = 0;
    var currentSegment = null;
    var show;
    var series;
    var episode;
    var date;
    var title;
    var parsed = [];

    for (var i = 0, len = lines.length; i < len; ++i) {

        if (lines[i].trim().length == 0)
        {
            continue;
        }

        var regex = /(.*?):(.*)/i;
        var match = regex.exec(lines[i]);
        
        if (match && match.length > 2)
        {
            var subject = match[1].trim();
            var content = match[2].trim();
            var wordcontent = content.replace(/[^\w\s]/g, '');

            switch(subject.toLocaleLowerCase())
            {
                case 'show':
                    show = content;
                    break;
                case 'series':
                    series = content;
                    break;
                case 'episode':
                    episode = content;
                    break;
                case 'date':
                    date = new Date(content);
                    break;
                case 'title':
                    title = content;
                    break;

                case 'ricky':
                case 'steve':
                case 'karl':
                case 'ricky and steve':
                case 'steve and ricky':
                case 'ricky and karl':
                case 'steve and karl':
                case 'claire':
                case 'claire and steve':
                case 'karl and steve':

                    var line = new Line(show, series, episode, date, title, subject, linecounter, 'host', currentSegment, content, wordcontent);
                    parsed.push(line);
                    linecounter++;
                    break;

                case 'fella':
                case 'sombre announcer':
                case 'jonathan':
                case 'dermot':
                case 'co-presenter':
                case 'steve taylor':
                case 'boy':
                case 'boys':
                case 'tarrin':

                    var line = new Line(show, series, episode, date, title, subject, linecounter, 'in-studio guest', currentSegment, content, wordcontent);
                    parsed.push(line);
                    linecounter++;
                    break;

                case 'neil':
                case 'lindsey':
                case 'dan':
                case 'david':
                case 'male caller':
                case 'female caller':
                case 'christina':
                case 'male caller #2':
                case 'male caller #3':
                case 'male caller #4':
                case 'dee':
                case 'mark':
                case 'richard':
                case 'shelley':
                case 'chris':
                case 'woman caller':
                case 'sarah':
                case 'owen':
                case 'sam':
                case 'tim':
                case 'vicky':
                case 'jessica':
                case 'caller #1':
                case 'caller #2':
                case 'expert':
                case 'fish shop guy':
                    
                    var line = new Line(show, series, episode, date, title, subject, linecounter, 'call-in guest', currentSegment, content, wordcontent);
                    parsed.push(line);
                    linecounter++;
                    
                    break;
                
                case 'trail':
                case 'tape of dilated peoples':
                case 'tape of dilated peoples played over song':

                    var line = new Line(show, series, episode, date, title, subject, linecounter, 'recording', currentSegment, content, wordcontent);
                    parsed.push(line);
                    linecounter++;
                    
                    break;
                
                case 'rod stewart':
                case 'luther vandross':

                    var line = new Line(show, series, episode, date, title, subject, linecounter, 'music', currentSegment, content, wordcontent);
                    parsed.push(line);
                    linecounter++;
                    
                    break;

                case 'segment':
                    currentSegment = content;
                    break;
                case 'song':
                    
                    var line = new Line(show, series, episode, date, title, subject, linecounter, 'song', currentSegment, content, wordcontent);
                    parsed.push(line);
                    linecounter++;

                    break;
                case 'classic link':
                    //in "best of episodes" this would link to the correct transcript. i'm not bothered
                    break;  

                default:
                    console.log('unknown subject in ' + title + ' --> ' + subject + ': ' + content);
            }
        
        } else {

            //if there was no match to the line having a :, then its a stage direction or audible sound (not searchable but will appear with results)

            var line = new Line(show, series, episode, date, title, null, linecounter, 'audible', lines[i]);
            parsed.push(line);
            linecounter++;
        }

    }

    //cache these
    for (var i = 0, len = parsed.length; i < len; ++i) {

        var cacheTitle = parsed[i].show + 's' + parsed[i].series + 'e' + parsed[i].episode + 'l' + parsed[i].linenumber;

        //myCache.set(cacheTitle, parsed[i]);
        if (!global.hasOwnProperty('everything')) {
            global.everything = {};
        }

        global.everything[cacheTitle] = parsed[i];
    }

    console.log('all cached');

    callback();
};

module.exports = ParseService;
