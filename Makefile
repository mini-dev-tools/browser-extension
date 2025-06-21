all:
	bun run build
check:
	npx vue-tsc --noEmit

safari:
		xcrun safari-web-extension-converter dist --project-location build/safari --no-prompt

package:
	cd dist && zip -r ../chrome-extension.zip . -x '*.DS_Store' -x '__MACOSX/*' -x '.vite/*' -x 'Archive.zip'