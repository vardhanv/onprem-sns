"use strict"

var http=require('http')
var debug=require('debug')
var qs=require('querystring')
var uuid=require('uuid4')
const util = require('util')


if (process.argv.length == 2)
   var sPort = 80
else
   var sPort = process.argv[2]


// Modify these function to do your own custom integration
const cmdTable = {
  "ObjectCreated:Put"  : putObject,
  "ObjectCreated:Post" : unSupportedEvent,
  "ObjectCreated:Copy" : unSupportedEvent,
  "ObjectCreated:CompleteMultipartUpload" : unSupportedEvent,
  "ObjectRemoved:Delete"                  : delObject,
  "ObjectRemoved:DeleteMarkerCreated"     : unSupportedEvent,
  "ReducedRedundancyLostObject"           : unSupportedEvent
}



// Modify these functions for your custom integration
function putObject( snsRecord ) {
    // modify to intercept puts
    let myEvent = {
       eventName       : snsRecord.eventName,
       sourceIpAddress : snsRecord.requestParameters.sourceIPAddress,
       bucketName      : snsRecord.s3.bucket.name,
       objectKey       : snsRecord.s3.object.key
    }
    console.log(myEvent)
}

function delObject( snsRecord ) {
    // modify to intercept deletes
    let myEvent = {
       eventName       : snsRecord.eventName,
       sourceIpAddress : snsRecord.requestParameters.sourceIPAddress,
       bucketName      : snsRecord.s3.bucket.name,
       objectKey       : snsRecord.s3.object.key
    }
    console.log(myEvent)
}

// Unsuppported event
function unSupportedEvent( snsRecord ) {
    console.log("Received unSupportedEvent")
    console.log(snsRecord)
}


var httpServer = http.createServer(function(req,res) {
   console.log("Incoming msg:")
   let body = []

   req.on('data', (chunk) => { body.push(chunk) })

   req.on('end', () => {

      let resBody = `
<PublishResponse xmlns="http://vishnus-sns-server/">
    <PublishResult> 
        <MessageId>` + uuid() + `</MessageId> 
    </PublishResult> 
    <ResponseMetadata>
       <RequestId>` + uuid() + `</RequestId>
    </ResponseMetadata> 
</PublishResponse>\n`

      switch(req.method) {
         case 'HEAD': 
            resBody = ""
            console.log(req.method)
            console.log(req.headers)
            break

          case 'POST':
          case 'PUT': 
              let  myBody = qs.parse(decodeURIComponent(Buffer.concat(body).toString()))
              try { 
                  myBody.Message = JSON.parse(myBody.Message)
                  //console.log(util.inspect(myBody, {showHidden: false, depth: null}))
                  for (let record of myBody.Message.Records) 
                     (record.eventName in cmdTable) ? 
                         cmdTable[record.eventName](record) :  unSupportedEvent (record)

             } catch (err) {
                //resBody = "Got a non-JSON Message"
                console.log("Got a non-JSON Message")
                console.log(myBody)
             }
             break
          default:
             console.log(req.method)
             console.log(req.headers)
      }

      // framing the response
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(resBody)
      console.log("msg handling complete.")
   })
})

httpServer.listen({port: sPort})

console.log ("On-Prem-SNS ready on port: ", httpServer.address().port)

