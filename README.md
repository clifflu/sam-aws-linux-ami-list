# sam-aws-linux-ami-list

List latest Amazon Linux AMI ID from deployed regions as JSON.

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
    --output-template-file packaged-template.yaml \
    --s3-bucket bucket-name
```

Replace **bucket-name** with bucket name for deploy artifact.

### Deploy

```
aws cloudformation deploy \
    --template-file packaged-template.yaml \
    --capabilities CAPABILITY_IAM \
    --stack-name my-new-stack

rm packaged-template.yaml
```

Replace **my-new-stack** with [CloudFormation](https://aws.amazon.com/cloudformation/) stack name.


## Usage

Note: Replace **my-new-stack** with [CloudFormation](https://aws.amazon.com/cloudformation/) stack name.

### Print Endpoint

```
aws cloudformation describe-stacks \
    --output text \
    --query "Stacks[0].Outputs[?OutputKey=='EndPoint'].OutputValue | [0]" \
    --stack-name my-new-stack
```

### Print AMI ID List

```
wget -qO- `aws cloudformation describe-stacks \
    --output text \
    --query "Stacks[0].Outputs[?OutputKey=='EndPoint'].OutputValue | [0]" \
    --stack-name my-new-stack`
```

## Sample Output

```
{
  "us-west-2": {
    "EcsHvm64": "ami-3702ca4f",
    "Ec2Hvm64":"ami-e689729e",
    "NatHvm64":"ami-d08b70a8"
  }
}
```

* EcsHvm64: ECS-Optimized, HVM x86_64
* Ec2Hvm64: Amazon Linux AMI, HVM x86_64
* NatHvm64: NAT instance, HVM x86_64

## License

MIT
