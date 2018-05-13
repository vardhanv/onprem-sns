
# A Sample on-prem SNS Reciever

A Skelton On-Prem AWS-SNS receiver (for StorageGRID)


## Steps

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

6. Your On-Prem AWS SNS Receiver is now ready. Let's configure StorageGRID
7. Go to your tenant page on StorageGRID
8. Create an endpoint with the following values, and click save
```
Display Name: S3 Notifications
URI: http://<ec2-public-dns-name>
URN: urn:mytext:sns:us-east::my_topic
Access Key: <blank>
Secret Key: <blank>
Certificate Validation: <Do not verify>
```

9. You should see a test message on your SNS endpoint

10. Go to the bucket for which you want to configure notifications
11. Enter the following xml string, and click save
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

12. Put or delete objects into your bucket. You should see notifications appear on your on-prem SNS receiver

13. If you find issues, report them via github

14. Have fun, and send me $10 on my paypal account :)


