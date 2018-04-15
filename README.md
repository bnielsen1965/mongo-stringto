# mongo-stringto

Transform strings in a query to another type of object.

Some API types may pass objects as strings, I.E. an HTTP REST interface will send
a Javascript Date object or MongoDB ObjectID as a string. These strings in some
cases need to be converted back to an object prior to use in a mongodb query.

The mongo-stringto module provides transforms for some objects by using special
operators for each object type. The transform methods can be used on a query object
or aggregate pipe array prior to processing in mongodb.



# Transform Operators

The value in a query or pipe where a transform is needed should be replaced with an object
representation containing the transform operator and value to be transformed.
I.E. An example of an aggregate $match pipe passed through a REST API where a
timestamp string needs to be transformed may look like the following...

```javascript
[
  {
    $match: {
      Created: { $stringToDate: "2010-01-22T18:34:52.352Z" }
    }
  }
]
```

On the server where the request is received the pipe would need to run through
the transform process before executing the aggregate method. The results of the
transform process on the previous example would produce the following result...

```javascript
[
  {
    $match: {
      Created: new Date("2010-01-22T18:34:52.352Z")
    }
  }
]
```

## $stringToDate

When passing a date or timestamp string that needs to be converted to a Date
object on the server for an aggregate process the $stringToDate operator should
be used.


## $stringToObjectID

Object IDs are commonly passed as a hex string. By using the $stringToObjectID
operator a string value can be passed to the server and then transformed into
a mongo ObjectID instance.


# Implementation

Transforms should be processed on the server where the request is received prior
to passing an aggregate pipe to the mongo aggregate method.

```javascript

const transform = require('mongo-stringto');

// method to run aggregate pipe on the provided mongoose model for a mongodb collection
function runAggregate(model, pipe) {
  // transform the pipe
  transform(pipe)
  .then(transformedPipe => {
    // use the transformed pipe in an aggregate request
    model.aggregate(transformedPipe).exec((error, result) => {
      if (error) {
        throw error;
      }

      console.log('Results: ', result);
    });
  })
  .catch(err => {
    console.log('Error: ', err.stack);
  });
}
```
