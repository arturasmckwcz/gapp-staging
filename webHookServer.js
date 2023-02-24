const express = require('express');
const { spawn } = require('child_process');
const app = express();
require('dotenv').config();

app.use(express.json());

const buildFolder = process.env.BUILD_FOLDER;
const buildScript = process.env.BUILD_SCRIPT;
const webhookUrl = process.env.WEBHOOK_SERVER_URL;
const repoOwner = process.env.WEBHOOK_REPO_OWNER;
const repo = process.env.WEBHOOK_REPO;
const accessToken = process.env.WEBHOOK_SERVER_ACCESS_TOKEN;
const webhookSecret = process.env.WEBHOOK_SECRET;

let isRegistered = false;

if (
  !(
    buildFolder &&
    buildScript &&
    webhookUrl &&
    webhookSecret &&
    repoOwner &&
    repo &&
    accessToken
  )
)
  throw new Error('No sufficient data provided.');

// Register with GitHub
app.post('/register', (req, res) => {
  const active = req.body.active;
  if (webhookSecret != req.headers.authorization.substring(7)) {
    console.log('Unauthorized, ignoring...');
    return res.end();
  }
  if (active && isRegistered) {
    console.log('Already registered, ignoring...');
    return res.end();
  }
  if (!active && !isRegistered) {
    console.log('Already unregistered, ignoring...');
    return res.end();
  }

  isRegistered = active;

  const repoUrl = `https://api.github.com/repos/${repoOwner}/${repo}/hooks`;

  const webhookContentType = 'json';
  const webhookEvents = ['push', 'pull_request'];

  fetch(repoUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name: 'web',
      active,
      events: webhookEvents,
      config: {
        url: webhookUrl,
        content_type: webhookContentType,
        secret: webhookSecret,
      },
    }),
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error(error);
    });

  console.log(active ? 'Registered' : 'Unregistered');
  return res.status(200).end();
});

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
      console.error(error.message);
    }
  } else {
    res.status(200).send('Notification ignored');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Webhook server is listening on port: ${port}`);
});
