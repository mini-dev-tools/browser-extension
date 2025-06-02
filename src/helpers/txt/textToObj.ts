interface Paragraph {
  sentences: Array<sentence>;
}

interface sentence {
  endsWith: string;
  sentence: string;
  characterCount: number;
  wordCount: number;
}

export function paragraphArrayToObj(arrayOfParagraphs: Array<string>) {
  let pObj: Array<Paragraph> = [];
  if (arrayOfParagraphs.length == 0 || arrayOfParagraphs[0] == '') return pObj;
  for (let i = 0; i < arrayOfParagraphs.length; i++) {
    let paragraph = parToSentences(arrayOfParagraphs[i]);
    pObj.push(paragraph);
  }
  return pObj;
}

function parToSentences(par: string) {
  let sentencesEndWith = /[.,!?]/;
  let sentences: Array<sentence> = [];
  let sentence: Array<string> = par.split(sentencesEndWith);
  for (let k = 0; k < sentence.length; k++) {
    let punctuation = sentence[k].match(sentencesEndWith)
      ? sentence[k].match(sentencesEndWith)
      : '';
    let sentenceObj = {
      endsWith: punctuation,
      sentence: sentence[k],
      characterCount: sentence[k].length,
      wordCount: 2
    };
    sentences.push(<sentence>sentenceObj);
  }
  return {
    sentences: sentences
  };
}
function wordsCount(str: string) {
  return str.split(/ /g).length;
}

const txt = `Aliqua ex tempor proident irure minim eu reprehenderit. Nulla aute in dolore irure. Nostrud enim voluptate deserunt Lorem ex aute labore


Nostrud nisi veniam laboris veniam aliqua ipsum pariatur nulla mollit ut proident. Occaecat ipsum nostrud ea elit. Pariatur et cupidatat aliqua aliqua enim irure cupidatat labore. `;

console.log(paragraphArrayToObj(txt.split('\n\n')));
