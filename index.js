"use strict"

var http=require('http')
var debug=require('debug')
var qs=require('querystring')
var uuid=require('uuid4')
const util = require('util')

var sPort = 80

const cmdTable = {
  "ObjectCreated:Put"  : putObject,
  "ObjectCreated:Post" : unSupportedEvent,
  "ObjectCreated:Copy" : unSupportedEvent,
  "ObjectCreated:CompleteMultipartUpload" : unSupportedEvent,
  "ObjectRemoved:Delete"                  : delObject,
  "ObjectRemoved:DeleteMarkerCreated"     : unSupportedEvent,
  "ReducedRedundancyLostObject"           : unSupportedEvent
}



var httpServer = http.createServer(function(req,res) {

   console.log("----------")

   let body = []

   req.on('data', (chunk) => {
      body.push(chunk)
   })

   req.on('end', () => {

      let resBody = "OK"
      
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
                    cmdTable[record.eventName]( record )


                 resBody = `
                 <PublishResponse xmlns="http://vishnus-sns-server/">
                    <PublishResult> <MessageId>` + uuid() + `</MessageId> </PublishResult> 
                    <ResponseMetadata>
                       <RequestId>` + uuid() + `</RequestId>
                    </ResponseMetadata> 
                </PublishResponse>`
             } catch (err) {
                resBody = "Got a non-JSON Message"
                console.log("-----" + resBody + "-----")
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
      console.log("----------\n")
   })
})

httpServer.listen({port: sPort})

console.log ("On-prem Notifications is ready on port: ", httpServer.address().port)



// Put Object Events

function putObject( snsRecord ) {
    let myEvent = {
       eventName       : snsRecord.eventName,
       sourceIpAddress : snsRecord.requestParameters.sourceIPAddress,
       bucketName      : snsRecord.s3.bucket.name,
       objectKey       : snsRecord.s3.object.key
    }
    console.log(myEvent)
}

function delObject( snsRecord ) {
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
