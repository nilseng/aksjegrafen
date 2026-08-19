# About this project

An application for searching for companies and shareholders in the Norwegian stock market. Data is presented in a graph where the nodes represent the actors in the stock market and the edges represent relationships between them.

<img width="1115" alt="image" src="https://github.com/user-attachments/assets/ee1748de-cf79-4f42-ad90-f40cedc4db07">

## Privacy: the suppression list

Publishing register data rests on legitimate interest, and data subjects can object (GDPR Art. 21). Granted objections are recorded on a suppression list stored in MongoDB (`suppressions` collection) and managed with a CLI — identifying details are never committed to this repository.

```
cd server
npm run suppress -- add --type person --name "<name as in the registers>" --yearOfBirth <yyyy> --reason "GDPR Art. 21 objection"
npm run suppress -- add --type company --orgnr <orgnr> --scope none --noindex
npm run suppress -- list
npm run suppress -- remove --id <id>
npm run suppress -- apply
```

Each entry has a `scope`: `search` hides the person/company from name and orgnr search (the in-app search and the search endpoints) while leaving them visible when navigating from a company; `all` also hides them from relation listings, graphs and direct lookups. `--noindex` makes the server send an `X-Robots-Tag: noindex, noarchive` header for any page path referencing the orgnr, so search engines delist the page — follow up with a removal request in Google Search Console for faster effect.

`add` and `remove` apply the list immediately. The flags are re-derived automatically at the end of every data import (imports rebuild the flagged documents and graph nodes); `apply` re-derives them on demand.

