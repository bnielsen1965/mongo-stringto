const MongoStringTo = require('../lib/index.js');
const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.should();

const ObjectID = require('mongodb').ObjectID;

describe('MongoStringTo transforms', () => {
  describe('transformQuery(query)', () => {
    it('should transform $stringToDate to Date object', () => {
      let timestampString = '2010-01-01T12:00:30.000Z';
      let timestampDate = new Date(timestampString);
      let query = { timestamp: { $stringToDate: timestampString } };

      return MongoStringTo.transformQuery(query).should.eventually.deep.equal({ timestamp: timestampDate });
    });

    it('should fail for non-timestamp string', () => {
      let query = { timestamp: { $stringToDate: 'not a timestamp' } };

      return MongoStringTo.transformQuery(query).should.eventually.be.rejected;
    });

    it('should transform $stringToObjectID string to ObjectID instance', () => {
      let oid = new ObjectID();
      let query = { id: { $stringToObjectID : oid.toString() } };

      return MongoStringTo.transformQuery(query).should.eventually.satisfy(o => { return o.id.toString() === oid.toString(); });
    });

    it('should fail for non-ObjectID string', () => {
      let query = { id: { $stringToObjectID: 'not an ObjectID' } };

      return MongoStringTo.transformQuery(query).should.eventually.be.rejected;
    });

    it('should transform deep objects', () => {
      let timestampString = '2010-01-01T12:00:30.000Z';
      let timestampDate = new Date(timestampString);
      let oid = new ObjectID();
      let query = {
        deep: {
          level: {
            timestamp: {
              $stringToDate: timestampString
            },
            id: {
              $stringToObjectID: oid.toString()
            }
          }
        }
      };

      return MongoStringTo.transformQuery(query).should.eventually
        .satisfy(o => { return o.deep.level.timestamp.getTime() === timestampDate.getTime(); })
        .satisfy(o => { return o.deep.level.id.toString() === oid.toString(); });
    });

    it('should not transform non-stringTo properties', () => {
      let timestampString = '2010-01-01T12:00:30.000Z';
      let timestampDate = new Date(timestampString);
      let oid = new ObjectID();
      let query = {
        prop1: "a string",
        deep: {
          prop2: 123,
          level: {
            prop3: [1, 2, 3],
            timestamp: {
              $stringToDate: timestampString
            },
            id: {
              $stringToObjectID: oid.toString()
            }
          }
        }
      };

      return MongoStringTo.transformQuery(query).should.eventually
        .satisfy(o => { return o.deep.level.timestamp.getTime() === timestampDate.getTime(); })
        .satisfy(o => { return o.deep.level.id.toString() === oid.toString(); })
        .satisfy(o => { return o.prop1 === 'a string' && o.deep.prop2 === 123; })
        .satisfy(o => { return [1, 2, 3].reduce((a, n) => { return -1 === o.deep.level.prop3.indexOf(n) ? false : a; }, true) });
    });
  });


  describe('transformPipe(pipe)', () => {
    it('should transform pipe array', () => {
      let timestampString = '2010-01-01T12:00:30.000Z';
      let timestampDate = new Date(timestampString);
      let oid = new ObjectID();
      let pipe = [
        { timestamp: { $stringToDate: timestampString } },
        { id: { $stringToObjectID : oid.toString() } }
      ];

      return MongoStringTo.transformAggregatePipe(pipe).should.eventually
        .satisfy(o => { return o[0].timestamp.getTime() === timestampDate.getTime(); })
        .satisfy(o => { return o[1].id.toString() === oid.toString(); });
    });

    it('should transform query passed as pipe', () => {
      let timestampString = '2010-01-01T12:00:30.000Z';
      let timestampDate = new Date(timestampString);
      let oid = new ObjectID();
      let query = {
        deep: {
          level: {
            timestamp: {
              $stringToDate: timestampString
            },
            id: {
              $stringToObjectID: oid.toString()
            }
          }
        }
      };

      return MongoStringTo.transformAggregatePipe(query).should.eventually
        .satisfy(o => { return o.deep.level.timestamp.getTime() === timestampDate.getTime(); })
        .satisfy(o => { return o.deep.level.id.toString() === oid.toString(); });
    });
  });

});
