# gapp-staging

This is a simple utility to keep local files of a project up to date.

The first thing after cloning one needs to create `.env` in the root and fill it in according to the sample in `env.example`

then

```
$ yarn
```

```
$ yarn start
```

or if in a docker container

```
$ yarn docker:run
```

Once server is up'n'running and `GITHUB_REPO_HOOKID` is unset, register hook on GitHub (change `PORT`, `WEBHOOK_SECRET` and `WEBHOOK_SERVER_URL` with corresponding values from `.env`)

```
$ curl -i -X 'POST' \
  -H "Authorization: Bearer WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  WEBHOOK_SERVER_URL
```

If it has been registered activate/inactivate it

```
$ curl -i -X 'POST' \
  -H "Authorization: Bearer WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d `{active:true}` \
  WEBHOOK_SERVER_URL
```
