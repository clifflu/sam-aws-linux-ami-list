# sam-aws-linux-ami-list

List latest Amazon Linux AMI ID from global regions as JSON.

## Requirements

* [aws-cli](https://aws.amazon.com/cli/)

## Usage


## Install

```
git clone https://github.com/clifflu/sam-aws-linux-ami-list
cd sam-aws-linux-ami-list
npm install
```

### Package

```
aws cloudformation package \
    --template-file template.yaml \
    --s3-bucket bucket-name \
    --output-template-file packaged-template.yaml
```

Replace **bucket-name** with bucket name for deploy artifact.

### Deploy

```
aws cloudformation deploy \
    --template-file packaged-template.yaml \
    --stack-name my-new-stack \
    --capabilities CAPABILITY_IAM

rm packaged-template.yaml
```

Replace **my-new-stack** with [CloudFormation](https://aws.amazon.com/cloudformation/) stack name.
