export function cont(content: string, fileName: string) {
  let element = document.createElement('a');
  // element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(FileContent));

  let charset = 'utf-8';
  let data = 'text/plain';
  element.setAttribute(
    'href',
    'data:' + data + ';charset=' + charset + ',' + encodeURIComponent(content)
  );

  element.setAttribute('download', fileName);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export function arryToLineBreak(content: string[], fileName: string) {
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
