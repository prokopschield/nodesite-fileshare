'use strict';
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, '__esModule', { value: true });
const fs_1 = __importDefault(require('fs'));
const nsblob_1 = __importDefault(require('nsblob'));
const path_1 = __importDefault(require('path'));
async function build() {
	const style = await nsblob_1.default.store_file(
		path_1.default.resolve(__filename, '../..', 'lib', 'style.css')
	);
	const script = await nsblob_1.default.store_file(
		path_1.default.resolve(__filename, '../..', 'lib', 'script.js')
	);
	const index = fs_1.default
		.readFileSync(
			path_1.default.resolve(__filename, '../..', 'src', 'index.html')
		)
		.toString()
		.replace('%SCRIPT%', `${script}.js`)
		.replace('%STYLE%', `${style}.css`);
	process.stdout.write(await nsblob_1.default.store(index));
}
exports.default = build;
build();
