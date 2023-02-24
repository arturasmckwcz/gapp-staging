const express = require('express');
const { spawn } = require('child_process');
const app = express();
require('dotenv').config();

app.use(express.json());

const buildFolder = process.env.BUILD_FOLDER;
const buildScript = process.env.BUILD_SCRIPT;
const url = process.env.WEBHOOK_SERVER_URL;
const access_token = process.env.WEBHOOK_SERVER_ACCESS_TOKEN;

if (!(buildFolder && buildScript && url && access_token))
  throw new Error('No sufficient data provided.');

// Register with GitHub

app.post('/webhook', (req, res) => {
  if (
    req.headers['x-github-event'] === 'pull_request' &&
    req.body.action === 'closed' &&
    req.body.pull_request.merged
  ) {
    // A pull request was merged, so run the script
    try {
      const buildProcess = spawn('sh', [
        '-c',
        `cd ${buildFolder};${buildScript}`,
      ]);

      buildProcess.stdout.on('data', data => {
        console.log(`stdout: ${data}`);
      });

      buildProcess.stderr.on('data', data => {
        console.error(`stderr: ${data}`);
      });

      buildProcess.on('close', code => {
        console.log(`child process exited with code ${code}`);
      });

      res.status(200).send('Build triggered');
    } catch (error) {
      throw new Error(error.message);
    }
  } else {
    res.status(200).send('Notification ignored');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Webhook server is listening on port: ${port}`);
});
