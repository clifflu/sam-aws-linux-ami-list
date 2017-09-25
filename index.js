'use strict';

const AWS = require('aws-sdk')

const _ttl = process.env.TTL || 30 * 60 * 1000

function log(msg) {
  console.log(msg)
}

function pickImageWinner(images, options) {
  let winner
  let winnerTimestamp = 0
  let filterRc = /[^\w]rc[^\w]/

  images.map(image => {
    let ts = Date.parse(image.CreationDate)

    if (ts <= winnerTimestamp) {
      return log(`drop old image ${image.Name}`)
    }

    if (image.Name.match(filterRc)) {
      return log(`skip rc image ${image.Name}`)
    }

    log(`take winner ${image.Name}`)

    winner = image
    winnerTimestamp = ts
  })

  winner._Region = options.region
  winner._Family = options.family

  return winner
}

function harvestHvmRegionNameWinner(options, ec2) {
  return new Promise((resolve, reject) => {
    const param = {
      Owners: ['amazon'],
      Filters: [
        {Name: 'name', Values: [options.nf]},
        {Name: 'virtualization-type', Values: ['hvm']},
        {Name: 'root-device-type', Values: ['ebs']},
        {Name: 'architecture', Values: ['x86_64']},
      ]
    }

    ec2.describeImages(param, (err, result) => {
      return err
        ? reject(err)
        : resolve(pickImageWinner(result.Images, options))
    })
  })
}

function harvestRegion(region) {
  const ec2 = new AWS.EC2({region})

  const nameFilters = [
    {region, family: 'EcsHvm64', nf: 'amzn-ami-*-amazon-ecs-optimized'},
    {region, family: 'Ec2Hvm64', nf: 'amzn-ami-*-gp2'},
    {region, family: 'NatHvm64', nf: 'amzn-ami-vpc-nat-*'},
  ]

  log(`reading from ${region}`)

  let subQueries = nameFilters.map(
    options => harvestHvmRegionNameWinner(options, ec2)
  )
  return Promise.all(subQueries).then(
    r => log(`complete ${region}`) || r
  )
}

function formatImages(results) {
  const output = {}
  results.map(r => {
    output[r._Region] = output[r._Region] || {}
    output[r._Region][r._Family] = r.ImageId
  })
  return output
}

function collectAmi() {
  return harvestRegion(process.env.AWS_REGION)
    .then(formatImages)
}

function collectAmiAllRegions() {
  return findRegions()
      .then(regions => Promise.all(regions.map(harvestRegion)))
      .then(lst => lst.reduce((a, b) => a.concat(b))) // flatten List
      .then(formatImages)
}

function replyGen(cb) {
  return obj => {
    cb(null, {
      statusCode: 200,
      body: JSON.stringify(obj)
    })
  }
}

const _cache = {}

function mainGen(func) {
  return (evt, ctx, cb) => {
    const now = Date.now()
    const reply = replyGen(cb)
    return _cache.expires && _cache.expires > now
      ? reply(_cache.payload)
      : func()
        .then(r => {
          _cache.expires = now + _ttl
          return _cache.payload = r
        }).then(reply)
  }
}

module.exports = {
  collectAmi: mainGen(collectAmi),
  collectAmiAllRegions: mainGen(collectAmiAllRegions),
}
