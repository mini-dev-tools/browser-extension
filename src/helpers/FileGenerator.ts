export default function download(
  filename: string,
  FileContent: string,
  charset: string = 'utf-8',
  data: string = 'text/plain'
) {
  let element = document.createElement('a');
  // element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(FileContent));
  element.setAttribute(
    'href',
    'data:' +
      data +
      ';charset=' +
      charset +
      ',' +
      encodeURIComponent(FileContent)
  );

  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
