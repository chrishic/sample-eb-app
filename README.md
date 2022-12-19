# sample-eb-app
Example Elastic Beanstalk application

## Creating a basic RDS MySql instance

__TBD.__


## Creating your Elastic Beanstalk application

__TBD.__


## Configuring Secure Secrets

### Storing Database Password Secret Securely Using SSM

1. In the AWS Console, go to "AWS Systems Manager"
2. From left hand menu, choose "Application Manager->Parameter Store".
3. Click "Create parameter"
4. Fill out "Parameter details" form:
	* Name: /nodejs-mini-servizi/production/credentials/mysql-db-password.txt
	* Tier: Standard
	* Type: SecureString
	* KMS key source: My current account
		- KMS Key ID should be 'alias/aws/ssm'
* Value:  `your password for the MySQL database user`
5. Click "Create parameter" button to save.

### Create IAM policy that gives permission to read the stored secret

1. In the AWS Console, go to "Identity and Access Management (IAM)"
2. From left hand menu, choose "Access management->Policies".
3. Click "Create policy" button
4. Select JSON tab
5. Paste the following policy JSON:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ssm:GetParameter",
                "ssm:GetParameters"
            ],
            "Resource": "arn:aws:ssm:us-west-2:[AWS_ACCT_ID_GOES_HERE]:parameter/nodejs-mini-servizi/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "kms:Decrypt"
            ],
            "Resource": "*"
        }
    ]
}
```
6. Click "Next" button two times
7. Fill out "Review policy" form:
	* Name: nodejsMiniServiziSecretsReadOnly
	* Description: Allows for reading NodeJS Mini Servizi secrets
8. Click "Create policy" button to save the policy.

### Attach IAM policy to the EC2 instance role of the Elastic Beanstalk instance

1. In the AWS Console, go to "Identity and Access Management (IAM)"
2. From left hand menu, choose "Access management->Roles".
3. Click the "aws-elasticbeanstalk-ec2-role" role
4. Under "Permissions policies", select the "Add permissions" dropdown menu and choose "Attach policies"
5. Select the "nodejsMiniServiziSecretsReadOnly" policy and then click the "Attach policies" button


## Deploying

Create zip file archive for Elastic Beanstalk deployment:

```
$ zip -r sample-eb-app.zip .platform *
```

## Querying Logs (via CloudWatch Log Insights)

1. In the AWS Console, go to "CloudWatch"
2. From left hand menu, choose "Logs->Log Insights".
3. In "Select log groups" dropdown, choose the "web.stdout.log" listing for your Elastic Beanstalk application
4. In the query textbox, copy/paste any of the below queries and then click "Run query" button
	- In top right portion of form, you can choose the time period over which the query should run

```
filter (level="request") | fields timestamp, level, message, meta.operation, meta.elapsed_millis, meta.request.url, meta.user.ip_address, meta.user.user_agent
```

```
filter (level="notice") | fields timestamp, level, message
```

```
filter (level="warning" OR level="error") | fields timestamp, level, message, meta.operation, meta.elapsed_millis, meta.request.url, meta.user.ip_address, meta.user.user_agent
```
