type Payment = {
  date: string
  description: string
  amount: number
  user: string
  card: string
  note: string
  category?: string
  installments?: string
}

/**
 * CSV文字列を変換します
 */
export function parse(csv: string): Payment[] {
  let result: Payment[] = []
  let user = ''
  let card = ''
  const detectRegex = /^(.*)　様,[0-9]{4}-.*,(.*)/
  const lines = csv.split(/\r\n/)
  lines.forEach(line => {
    // 利用者とカードの判定
    if (detectRegex.test(line)) {
      const detected = line.match(detectRegex)
      user = detected![1].replaceAll('　', ' ')
      card = detected![2]
          .replaceAll('　', ' ')
          .replaceAll('／', '/')
          .replace(/[Ａ-Ｚａ-ｚ０-９]/g, str => String.fromCharCode(str.charCodeAt(0) - 0xFEE0))
      return
    }
    // 意図しない文字列はスキップ(利用明細行は yyyy/mm/dd から始まる想定)
    if (!line.startsWith('20') || isNaN(Date.parse(line.substring(0, 10)))) {
      return
    }
    // 文字列をオブジェクトに変換する
    const fixedLine = fixCsvLine(line)
    const [date, description, amountUsed, category, installments, amountToBePaid, note] = fixedLine.split(',')
    let item: Payment = {
      date,
      description: cleanString(description),
      amount: Number(amountToBePaid || amountUsed),
      user,
      card,
      note: cleanString(note),
    }
    if (category.length || installments.length) {
      item = {...item, category, installments}
    }
    result.push(item)
  })
  // 利用日順にソート
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
  result = result.replaceAll('／', '/')
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
