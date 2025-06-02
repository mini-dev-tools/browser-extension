export interface letter {
  letter: string;
  count: number;
  percentage: number;
}

export function letterComposition(str: string): Array<letter> {
  let strClean = str.replace(/[\r\n]/gm, '');
  strClean = strClean.replace(/\s/g, '');
  strClean = strClean.toLowerCase();

  let unique = findUnique(strClean);
  let allCharactersCount = strClean.length;
  let arr: Array<letter> = [];

  for (let i = 0; i < unique.length; i++) {
    let count = char_count_in_string(strClean, unique[i]);
    let percentage = (count / allCharactersCount) * 100;

    let c: letter = {
      letter: unique[i],
      count: count,
      percentage: percentage
    };

    arr.push(c);
  }

  arr.sort((a, b) => {
    return b.count - a.count;
  });

  return arr;
}

function char_count_in_string(str: string, letter: string) {
  let letter_Count = 0;
  for (let position = 0; position < str.length; position++) {
    if (str.charAt(position) == letter) {
      letter_Count += 1;
    }
  }
  return letter_Count;
}

function findUnique(str: string) {
  // The variable that contains the unique values
  let uniq = '';

  for (let i = 0; i < str.length; i++) {
    // Checking if the uniq contains the character
    if (!uniq.includes(str[i])) {
      // If the character not present in uniq
      // Concatenate the character with uniq
      uniq += str[i];
    }
  }
  return uniq;
}
