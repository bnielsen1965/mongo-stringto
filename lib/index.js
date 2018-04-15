const ObjectID = require('mongodb').ObjectID;

const MongoStringTo = {
  transformAggregatePipe: pipe => {
    if (Array.isArray(pipe)) {
      return Promise.all(pipe.map(p => { return MongoStringTo.transformQuery(p); }));
    } else {
      return MongoStringTo.transformQuery(pipe);
    }
  },

  transformQuery: o => {
    return new Promise((resolve, reject) => {
      if (typeof o === 'object' && o !== null && typeof o.hasOwnProperty === 'function') {
        if (o.hasOwnProperty('$stringToDate') && typeof o['$stringToDate'] === 'string') {
          // this object's value is a conversion target
          var oDate = new Date(o['$stringToDate']);
          if (!isNaN(oDate)) {
            o = oDate;
            resolve(o);
          } else {
            reject(new Error('Invalid date string format: ' + o['$stringToDate']));
          }
        } else if (o.hasOwnProperty('$stringToObjectID') && typeof o['$stringToObjectID'] === 'string') {
          // this object's value is a conversion target
          if (ObjectID.isValid(o['$stringToObjectID'])) {
            var oObjectID = new ObjectID(o['$stringToObjectID']);
            o = oObjectID;
            resolve(o);
          } else {
            reject(new Error('Invalid ObjectID string format: ' + o['$stringToObjectID']));
          }
        } else {
          let properties = Object.keys(o).filter(p => { return o.hasOwnProperty(p); });
          let transformProperties = i => {
            if (i >= properties.length) {
              resolve(o);
            } else {
              MongoStringTo.transformQuery(o[properties[i]])
                .then(newO => {
                  o[properties[i]] = newO;
                  transformProperties(i + 1);
                })
                .catch(err => { reject(err); });
            }
          };
          transformProperties(0);
        }
      } else {
        resolve(o);
      }
    });
  }
};

module.exports = MongoStringTo;
