require("dotenv").config();
const { spawn } = require('child_process');
const cron = require('node-cron');
const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
});

cron.schedule(process.env.BACKUPTIME, () => backupMongoDB());

function backupMongoDB() {
  const backupTimestamp=new Date().getTime();
  const ARCHIVE_PATH = './public/' + `${backupTimestamp}.gzip`;
  const child = spawn('mongodump', [
    `--uri=${process.env.DATABASE_URL_ONLINE}`,
    `--archive=${ARCHIVE_PATH}`,
    '--gzip',
  ]);

  child.stdout.on('data', (data) => {
    console.log('stdout:\n', data);
  });
  child.stderr.on('data', (data) => {
    console.log('stderr:\n', Buffer.from(data).toString());
  });
  child.on('error', (error) => {
    console.log('error:\n', error);
  });
  child.on('exit', async(code, signal) => {
    if (code)
    {
      console.log('Process exit with code:', code);
    } 
    else if (signal) 
    {
      console.log('Process killed with signal:', signal);
    }
    else 
    {
      console.log('Backup is successfull ✅');
      await uploadtToS3Bucket(ARCHIVE_PATH,backupTimestamp);
    }
  });
}

async function uploadtToS3Bucket(pathToBinary,backupTimestamp) {

  const file = fs.readFileSync(pathToBinary);
  console.log("Database's Data: ",file);
  
  const uploadedImage = await s3.upload({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: backupTimestamp.toString(),
    Body: file,
  }).promise();

  console.log("uploadedImage: ",uploadedImage.Location);
  console.log("file uploaded to AWS S3 Bucket...");

  fs.unlinkSync(pathToBinary);
  console.log("file deleted from local public folder...");
}
