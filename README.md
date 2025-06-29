# popupnotesEXT

- Note: When distributing for Chrome, use background/service_workers: 

```
  "background": {
    "service_worker": "background.js"
  },
```

and use background/scripts for Mozilla siatribution.

```
  "background": {
    "scripts": [
      "background.js"
    ]
  },
```

- For mozilla, before getting zip file for version updated, go into the Project folder, select all files/folders, then compress that selection, to enable mozilla ready the manifest.
