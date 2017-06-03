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

                case 'ricky':
                case 'steve':
                case 'karl':
                case 'ricky and steve':
                case 'steve and ricky':
                case 'fella':
                case 'sombre announcer':
                    
                    var line = new Line(show, series, episode, date, subject, linecounter, 'spoken', currentSegment, content);
                    parsed.push(line);
                    linecounter++;
                    
                    

                    break;
                
                case 'title':
                    currentSegment = content;
                    break;
                case 'song':
                    
                    var line = new Line(show, series, episode, date, subject, linecounter, 'song', currentSegment, content);
                    parsed.push(line);
                    linecounter++;

                    break;
                default:
                    console.log('unknown subject: ' + subject);
            }
        
        } else {

            //if there was no match to the line having a :, then its a stage direction or audible sound

            var line = new Line(show, series, episode, date, null, linecounter, 'audible', lines[i]);
            parsed.push(line);
            linecounter++;
        }

    }

    //cache these
    for (var i = 0, len = parsed.length; i < len; ++i) {

        var cacheTitle = parsed[i].show + 's' + parsed[i].series + 'e' + parsed[i].episode + 'l' + parsed[i].linenumber;

        myCache.set(cacheTitle, parsed[i]);
    }

    console.log('all cached');

    callback();
};

module.exports = ParseService;
