/**
 * ファイルを読み込みCSV文字列を返します
 */
export async function read(file: File): Promise<string | null> {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result !== 'string') {
        resolve(null)
        return
      }
      resolve(reader.result)
    })
    reader.readAsText(file, 'shift-jis')
  })
}
