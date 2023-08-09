var fs = require("fs");
var path = require('path');
var Handlebars = require("handlebars");

Handlebars.registerHelper('formatDate', (dateString) => {
    let dateStrArr = dateString.split('-');

    if (dateStrArr.length == 3)
        return new Date(dateString).toLocaleDateString('en', {
            month: 'short',
            year: 'numeric',
            day: 'numeric',
        });

    if (dateStrArr.length == 2)
        return new Date(dateString).toLocaleDateString('en', {
            month: 'short',
            year: 'numeric',
        });

    return dateString;
});

Handlebars.registerHelper('formatUrl', (url) => {
    if (url.startsWith('http://')) return url.substring(7);
    if (url.startWith('htts://')) return url.substring(8);
    return url;
});

COURSES_COLUMNS = 3;

PREPEND_SUMMARY_CATEGORIES = [
  "work",
  "volunteer",
  "awards",
  "publications"
];

function validateArray(arr) {
  return arr !== undefined && arr !== null && arr instanceof Array && arr.length > 0;
}

function render(resume) {
    var css = fs.readFileSync(__dirname + "/style.css", "utf-8");
    var tpl = fs.readFileSync(__dirname + "/resume.hbs", "utf-8");
    var partialsDir = path.join(__dirname, 'partials');
    var filenames = fs.readdirSync(partialsDir);

    // Split courses into 3 columns
    if (validateArray(resume.education)) {
        resume.education.forEach((block) => {
            if (validateArray(block.courses)) {
                splitCourses = [];
                columnIndex = 0;
                for (var i = 0; i < COURSES_COLUMNS; i++) {
                    splitCourses.push([]);
                }
                block.courses.forEach((course) => {
                    splitCourses[columnIndex].push(course);
                    columnIndex++;
                    if (columnIndex >= COURSES_COLUMNS) {
                        columnIndex = 0;
                    }
                });
                block.courses = splitCourses;
            }
        });
    }

    PREPEND_SUMMARY_CATEGORIES.forEach((category) => {
        if (resume[category] !== undefined) {
            resume[category].forEach((block) => {
                if (block.highlights === undefined) {
                    block.highlights = [];
                }
                if (block.summary) {
                    block.highlights.unshift(block.summary);
                    delete block.summary;
                }
            });
        }
    });

    filenames.forEach((filename) => {
        var matches = /^([^.]+).hbs$/.exec(filename);
        if (!matches) {
            return;
        }
        var name = matches[1];
        var filepath = path.join(partialsDir, filename)
        var template = fs.readFileSync(filepath, 'utf8');

        Handlebars.registerPartial(name, template);
    });

    return Handlebars.compile(tpl)({
        css: css,
        resume: resume
    });
}

module.exports = {
    render: render
};