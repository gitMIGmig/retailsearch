# Retail Search MIG

## Setup

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
