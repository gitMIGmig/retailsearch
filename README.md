# Retail Search MIG

## Setup

0. Set up the Retail Search API and create a service account, add key to the
   service account (JSON format), add `retail.editor` permissions to the service
   account

1.

```sh
npm i
```

2.

```sh
touch .env
```

Inside of `.env` file, add the following:

```
PROJECT_NUMBER=[PROJECT_NUMBER]
SERVICE_ACCOUNT_PATH=[SERVICE_ACCOUNT_PATH]
```

Service account path is the path to a service account with `retail.editor`
permissions

3.

```sh
tsc && node dist/index.js
```

```txt
Usage: index [options]

Retail Search Sizeer PoC

Options:
  -e, --example        Run sample search
  -q, --query <query>  Search query
  -s, --service        Run in service mode
  -i, --import         Import products
  -h, --help           Display help information
```

- Import products (requires `all_products.json` in the root directory):

```sh
tsc && node dist/index.js -i
```

After importing, the products have to be flagged as retrievable in the Google
Cloud console, [as per documentation](https://cloud.google.com/retail/docs/attribute-config#console)

Fields used in this demo can be found in the `validateRetailProduct` function
in the `src/schema.ts` file, it can take ~12 hours for them to get indexed and
ready for retrieval

- Run a sample search:

```sh
tsc && node dist/index.js -e -q "airmax"
```

- Run a service that matches the Synerise API interface:

  - Start the API

    ```sh
    tsc && node dist/index.js -s
    ```

  - Send requests, exact same format from the frontend is satisifed

  ```sh
  curl "http://localhost:6969/ai/search/v2/indices/fb1fc9785e920f33a7ca1ef2cc706e761614277015/query?query=buty&token=2BA26361-980C-7E9A-909F-566C4629B4B4&clientUUID=64e5256d-d437-4745-a021-e04478900ad1&limit=5&page=1&includeMeta=true&facets=*&includeFacets=all"

  ```
