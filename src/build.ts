import fs from 'fs';
import nsblob from 'nsblob';
import path from 'path';

export default async function build() {
	const style = await nsblob.store_file(
		path.resolve(__filename, '../..', 'lib', 'style.css')
	);
	const script = await nsblob.store_file(
		path.resolve(__filename, '../..', 'lib', 'script.js')
	);
	const index = fs
		.readFileSync(path.resolve(__filename, '../..', 'src', 'index.html'))
		.toString()
		.replace('%SCRIPT%', `${script}.js`)
		.replace('%STYLE%', `${style}.css`);
	process.stdout.write(await nsblob.store(index));
}

build();
