export function wordsCount(str: string): number {
  let preg = str.match(/(\w+)/g);
  if (preg != null) {
    return preg.length;
  } else return 0;
}

export function charCount(str: string, exclude?: Array<string>): number {
  let text = '';
  if (exclude) {
    let reg = exclude[0];
    for (let i = 1; i < exclude.length; i++) {
      reg = reg + '|' + exclude[i];
    }
    let regex = new RegExp(reg, 'g');
    text = str.replace(regex, '');
  } else {
    text = str;
  }

  if (text != null) {
    return text.length;
  } else return 0;
}

export function removeDoubleSpace(str: string) {
  str = str.replace(/ +(?= )/g, '');
  return str;
}
