
A Sample on-prem SNS Reciever

This program provides a skelton that to create an on-prem SNS receiver, for StorageGRID


Prerequisites / steps:

1. Create a server using ubuntu - preferably use ami: ami-b5ed9ccd
2. Make sure you "ssh-add" your pem file, so ssh, scp etc work
3. Find the public dns name of your server
4. Open inbound port 80 into your ec2 server
5. execute the following
$ git clone https://github.com/vardhanv/onprem-sns.git 
$ cd onprem-sns
$ ./prepare-app <ec2-public-dns-name>
$ ./deploy-app  <ec2-public-dns-name>
$ ssh           <ec2-public-dns-name>
$ cd not
$ sudo nodejs index.js
On-prem Notifications is ready on port:  80

6. Your on-prem SNS is ready. Now, lets configure StorageGRID
7. Go to your tenant page on StorageGRID
8. Create an endpoint with the following values, and click save
Display Name: S3 Notifications
URI: http://<ec2-public-dns-name>
URN: urn:mytext:sns:us-east::my_topic
Access Key: <blank>
Secret Key: <blank>
Certificate Validation: <Do not verify>

9. You should see a test message on your SNS endpoint

10. Go to the bucket you want to configure notifications for
11. Enter the following xml string, and click save
<NotificationConfiguration>
    <TopicConfiguration>
        <Id>Object-Event</Id>
        <Topic>urn:mytext:sns:us-east::my_topic</Topic>
        <Event>s3:ObjectCreated:*</Event>
        <Event>s3:ObjectRemoved:*</Event>
    </TopicConfiguration>
</NotificationConfiguration>

12. Put or delete objects into your bucket. You should see notifications appear on your on-prem SNS receiver







