const express = require('express');
const { spawn } = require('child_process');
const app = express();

app.use(express.json());

const script = process.env.BUILD_SCRIPT;
const url = process.env.WEBHOOK_SERVER_URL;
const access_token = process.env.WEBHOOK_SERVER_ACCESS_TOKEN;
const event = process.env.WEBHOOK_SERVER_EVENT;

if (!(script && url && access_token && event))
  throw new Error('No sufficient data provided, ignoring.');

// Register with GitHub

app.post('/webhook', (req, res) => {
  if (
    req.headers['x-github-event'] === 'pull_request' &&
    req.body.action === 'closed' &&
    req.body.pull_request.merged
  ) {
    // A pull request was merged, so run the script
    const buildProcess = spawn(script);

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
  } else {
    res.status(200).send('Notification ignored');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Webhook server listening on port: ${port}`);
});
