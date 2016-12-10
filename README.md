# porla-autoadd

The *porla-autoadd* script will monitor directories and automatically add any
torrents it finds based on filters and rules. It is the easiest way to get
torrents into Porla.

## Example configuration

The autoadd script can be configured either with a list of simple paths to watch,
or with an object describing the path, an (optional) RegExp filter and a (optional)
save path.

```js
{
  "autoadd": {
    "folders": [
      "/Users/john/Torrents",
      {
        "path": "/Users/john/Other torrents",
        "filter": ".*\\.torrent$",
        "savePath": "/Downloads"
      }
    ]
  }
}
```

## Installing in Porla

From your Porla project repository, run:

```
npm install porla-autoadd --save
```

Then add **porla-autoadd** to your `external-scripts.json`:

```
[
    "porla-autoadd"
]
```
