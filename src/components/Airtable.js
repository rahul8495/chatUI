var Airtable = require('airtable');
var base = new Airtable({apiKey: 'keyOd53fnHtzBiXlD'}).base('appfu0OkQaXemy6t7');

const writer = (project, sessionId, from, message) => {
    base(project).create({
        "From": from,
        "Session": sessionId,
        "Text": message
      }, function(err, record) {
        if (err) {
          console.error(err);
          return;
        }
        console.log(record.getId());
      });
}

module.exports = {
    writer
}
