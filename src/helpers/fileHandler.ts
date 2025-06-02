export class fileHandler {
  private _fileName: string = 'untitled';
  private _content: string = '';
  private _charset: string = 'utf-8';
  private _data = 'text/plain';

  constructor(content?: string) {
    this._content = content ? content : '';
  }

  getContent(): string {
    return this._content;
  }

  setContent(value: string) {
    this._content = value;
    return this;
  }

  setFileName(str: string) {
    this._fileName = str;
    return this;
  }
  setCharset(str: string) {
    this._charset = str;
    return this;
  }
  setFileMimeType(str: string) {
    this._data = str;
    return this;
  }

  getFileName() {
    return this._fileName;
  }
  getCharset() {
    return this._charset;
  }
  getFileType() {
    return this._data;
  }

  downloadFile() {
    let element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:' +
        this._data +
        ';charset=' +
        this._charset +
        ',' +
        encodeURIComponent(this._content)
    );
    element.setAttribute('download', this._fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}

export function arrayToLineBreak(content: string[], fileName: string) {
  let element = document.createElement('a');
  // element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(FileContent));

  let charset = 'utf-8';
  let data = 'text/plain';
  let contentData = '';
  content.forEach(myFunction);

  function myFunction(line: string) {
    contentData += line + '\n';
  }
  element.setAttribute(
    'href',
    'data:' +
      data +
      ';charset=' +
      charset +
      ',' +
      encodeURIComponent(contentData)
  );

  element.setAttribute('download', fileName);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
