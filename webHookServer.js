const express = require('express');
const { spawn } = require('child_process');
const app = express();
require('dotenv').config();

app.use(express.json());

const buildFolder = process.env.BUILD_FOLDER;
const buildScript = process.env.BUILD_SCRIPT;
const webhookUrl = process.env.WEBHOOK_SERVER_URL;
const webhookSecret = process.env.WEBHOOK_SECRET;
const repoOwner = process.env.GITHUB_REPO_OWNER;
const repo = process.env.GITHUB_REPO;
const accessToken = process.env.GITHUB_ACCESS_TOKEN;
let repoHookId = process.env.GITHUB_REPO_HOOKID;

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

app.post('/register', (req, res) => {
  if (webhookSecret != req.headers.authorization.substring(7)) {
    console.log('Unauthorized, ignoring...');
    return res.end();
  }

  const repoUrl = `https://api.github.com/repos/${repoOwner}/${repo}`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };

  if (!repoHookId)
    fetch(repoUrl + '/hooks', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'web',
        active: true,
        events: ['push', 'pull_request'],
        config: {
          url: webhookUrl,
          content_type: 'json',
          secret: webhookSecret,
        },
      }),
    })
      .then(response => response.json())
      .then(data => {
        repoHookId = data.id;
        console.log('Registered');
      })
      .catch(error => {
        console.error(error);
      });
  else {
    fetch(repoUrl + '/hooks/' + repoHookId, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ active }),
    });
    console.log(active ? 'Activated' : 'Inactivated');
  }
  return res.status(200).end();
});

app.post('/webhook', (req, res) => {
  if (
    req.headers['x-github-event'] === 'pull_request' &&
    req.body.action === 'closed' &&
    req.body.pull_request.merged
  ) {
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
