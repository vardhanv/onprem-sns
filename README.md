
# A Sample on-prem SNS Reciever

A Skelton On-Prem AWS-SNS receiver (for StorageGRID)
Also Available as a docker container
```
$ docker run -p <your-local-port>:8080 vardhanv/onprem-sns:latest
```


## Demo Steps

### Setting up the receiver

1. Create a server using ubuntu on AWS preferably use ami-b5ed9ccd
2. Make sure you "ssh-add" your pem file, so ssh, scp etc work
3. Open inbound port 80 into your ec2 server
4. Note the public dns name of your server
5. Execute the following
```
$ git clone https://github.com/vardhanv/onprem-sns.git 
$ cd onprem-sns
$ ./prepare-app <ec2-public-dns-name>
$ ./deploy-app  <ec2-public-dns-name>
$ ssh           <ec2-public-dns-name>
$ cd not
$ sudo nodejs index.js
On-prem Notifications is ready on port:  80
```
6. Your On-Prem AWS SNS Receiver is now ready. You can test reachability by
```
$ curl http://<ec2-public-dns-name>
```


### Setting up StorageGRID

1. Let's configure StorageGRID
2. Go to your tenant page on StorageGRID
3. Create an endpoint with the following values, and click save
```
Display Name: S3 Notifications
URI: http://<ec2-public-dns-name>
URN: urn:mytext:sns:us-east::my_topic
Access Key: <blank>
Secret Key: <blank>
Certificate Validation: <Do not verify>
```

4. You should see a test message on your SNS endpoint

5. Go to the bucket for which you want to configure notifications
6. Enter the following xml string, and click save
```
<NotificationConfiguration>
    <TopicConfiguration>
        <Id>Object-Event</Id>
        <Topic>urn:mytext:sns:us-east::my_topic</Topic>
        <Event>s3:ObjectCreated:*</Event>
        <Event>s3:ObjectRemoved:*</Event>
    </TopicConfiguration>
</NotificationConfiguration>
```

7. Put or delete objects into your bucket. You should see notifications appear on your on-prem SNS receiver

8. If you find issues, report them via github

9. Have fun, and send me $10 on my paypal account :)


