all:
	bun run build
check:
	npx vue-tsc --noEmit
package:
	cd dist && zip -r ../chrome-extension.zip . -x '*.DS_Store' -x '__MACOSX/*' -x '.vite/*' -x 'Archive.zip'