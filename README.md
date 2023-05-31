# vpass-csv-parser

CSV to JSON parser for Vpass (SMBC Card) statement

Vpass (三井住友カード) のカード利用明細 CSV を JSON に変換します

## Usage

```
import { read, parse } from 'vpass-csv-parser'

async function onFileSelect(e) {
  const file = e.target.files[0]
  const csv = await read(file)
  const json = parse(csv)
  console.log(json)
}
```
