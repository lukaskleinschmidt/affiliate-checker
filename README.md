# Affiliate Checker
This script checks whether your affiliate links forward correctly.
It uses [puppeteer](https://github.com/puppeteer/puppeteer/) in the background and is able to detect link manipulation via javascript.
Rename the `example.config.json` file to `config.json` and fill in your options.  
Start the script with `npm run start`.

Go and grab a ☕ in the meantime or [buy me one](https://www.paypal.me/lukaskleinschmidt/5eur) :)

## Partners
```json
{
    "title": "Amazon",
    "selector": "amzn.to",
    "follow": "goto",
    "params": {
        "tag": "my-affiliate-parameter"
    }
}
```

Option     | Type     | Default | Description
:--        | :--      | :--     | :--
title      | `string` | –       | The partner title
selector   | `array`  | –       | The selector used to find partner links `a[href*="amzn.to"]`
follow     |          | `false` | How links are followed. Available options: `goto`, `click`
params     | `obj`    | –       | List of query parameter value pairs

### Follow links
By default links are not followed but simply get validated with their respective `href` value.
If links are shortened it is necessary to follow the link to be able to validate it. In this case you should set the `follow` option to `goto` at least. Use `click` if you want to emulate a real click on the link. The `click` option can potentially identify links manipulated via javascript.

## Options
Option     | Type     | Default | Description
:--        | :--      | :--     | :--
pages      | `array`  | –       | The pages that should be checked
partners   | `array`  | –       | The polling delay
concurrent | `bool`   | `false` | Concurrent mode
collapse   | `bool`   | `true`  | Collapse the output
headless   | `bool`   | `true`  | whether to run the browser headless or not

```
❕ Concurrent mode might cause timeouts while running the script.
```