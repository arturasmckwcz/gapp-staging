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

Once server is up'n'running register it with GitHub (change PORT and WEBHOOK_SECRET with corresponding values from `.env`)

```
$ curl -i -X 'POST' \
  -H "Authorization: Bearer WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{ active: true}' \
  localhost:PORT/register
```
