type Payment = {
  date: string
  user: string
  card: string
  amount: number
  description: string
  note: string
}

/**
 * CSV文字列をJSON文字列に変換します
 */
export function parse(csv: string): Payment[] {
  let user = ''
  let card = ''
  let result: Payment[] = []
  const detectRegex = /^(.*)　様,[0-9]{4}-.*,(.*)/
  const lines = csv.split(/\r\n/)
  lines.forEach(line => {
    // 利用者判定
    if (detectRegex.test(line)) {
      const detected = line.match(detectRegex)
      user = detected![1].replaceAll('　', ' ')
      card = detected![2].replaceAll('　', ' ').replace(/[Ａ-Ｚａ-ｚ０-９]/g, str => String.fromCharCode(str.charCodeAt(0) - 0xFEE0))
      return
    }
    // 意図しない文字列はスキップ(利用明細行は202nから始まる想定)
    if (!line.startsWith('202')) {
      return
    }
    // 文字列をオブジェクトに変換する
    const fixedLine = fixCsvLine(line)
    const [date, description, amount, _1, _2, subAmount, note] = fixedLine.split(',')
    result.push({
      date,
      user,
      card,
      amount: Number(amount || subAmount),
      description: cleanString(description),
      note: cleanString(note),
    })
  })
  result = result.sort((a, b) => (a.date > b.date) ? 1 : -1)
  return result
}

// 摘要欄の文字列をいい感じに改変する関数
function cleanString(str: string) {
  let result = str
  result = result.replaceAll('／ｉＤ', '')
  result = result.replaceAll('／ＮＦＣ', '')
  result = result.replaceAll('／ＡＰ', '')
  result = result.replaceAll('／Ａｐｐｌｅ　Ｐａｙ', '')
  result = result.replaceAll('　', ' ')
  result = result.replaceAll('．', '.')
  result = result.replaceAll('＊', '*')
  result = result.replaceAll('●', '')
  result = result.replaceAll('（', '(')
  result = result.replaceAll('）', ')')
  result = result.replaceAll('―', '-')
  result = result.replaceAll('－', '-')
  result = result.replace(/^\s+|\s+$/g,'').replace(/ +/g,' ')
  result = result.replace(/[Ａ-Ｚａ-ｚ０-９]/g, str => String.fromCharCode(str.charCodeAt(0) - 0xFEE0))
  return result
}

// 摘要欄の文字列にカンマが含まれている可能性を排除する関数
function fixCsvLine(line: string) {
  let fix = line
  while ((fix.match(/,/g) || []).length > 6) {
    const firstCommaIndex = fix.indexOf(',')
    const secondCommaIndex = fix.indexOf(',', firstCommaIndex + 1)
    fix = fix.substring(0, secondCommaIndex) + fix.substring(secondCommaIndex + 1)
  }
  return fix
}
