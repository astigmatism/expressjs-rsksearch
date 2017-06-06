

Line = function(show, series, episode, date, title, subject, linenumber, type, segment, content) {

    this.show = show;
    this.series = series;
    this.episode = episode;
    this.date = date;
    this.title = title;

    this.subject = subject;
    this.linenumber = linenumber;
    this.type = type;
    this.segment = segment;
    this.content = content;
};

module.exports = Line;
