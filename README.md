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

## Behavior

The original CSV file is garbled due to Shift_JIS.

```
���с@�C���@�l,4980-11**-****-****,�O��Z�F�J�[�h�v���`�i�v���t�@�[�h
2023/04/13,�d�s�b��s��,390,,,,���_�c���O�@�@�����@�@�@�@�y�E��
2023/04/30,GITHUB, INC. (HTTPSGITHUB.C),1394,,,,10.00�@USD�@139.488�@05 01
```

`read()` function reads a CSV file asynchronously.  
(NOTICE: We have found cases where the description field contains commas.)

```
小林　修平　様,4980-11**-****-****,三井住友カードプラチナプリファード
2023/04/13,ＥＴＣ首都高,390,,,,自神田橋外　　至台場　　　　軽・二
2023/04/30,GITHUB, INC. (HTTPSGITHUB.C),1394,,,,10.00　USD　139.488　05 01
```

`parse()` function converts CSV to JSON.  
Corrects unnecessary information, half-width and full-width characters, description field commas, etc. during conversion.

```
[
  {
    amount: 390,
    card: "三井住友カードプラチナプリファード",
    date: "2023/04/13",
    description: "ETC首都高 特別割引",
    note: "自錦糸町上 至台場 軽・二",
    user: "小林 修平"
  },
  {
    amount: 1394
    card: "三井住友カードプラチナプリファード"
    date: "2023/04/30"
    description: "GITHUB INC. (HTTPSGITHUB.C)"
    note: "10.00 USD 139.488 05 01"
    user: "小林 修平"
  }
]
```
