import { Plugin, 
	// FileSystemAdapter 
} from 'obsidian';
// import * as path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

export default class MDToPDF extends Plugin {
  async onload() {
	const execFileAsync = promisify(execFile);
	console.log('loading MDToPDF plugin');
	this.addRibbonIcon('dice', 'MD to PDF', async () => {

		// const fileSysAdpaterObj = new FileSystemAdapter()
		// console.log(fileSysAdpaterObj.getFullPath());	

		console.log('MD to PDF clicked');
		const file = this.app.workspace.getActiveFile();
		if (file) {
			console.log('Active file path: ' + file.path);
			const content = await this.app.vault.readBinary(file)
			console.log('Active file content: ' + content);
			const parentLoc = await this.app.vault.getResourcePath(file);
			// console.log('Parent location: ' + parentLoc);
			// const binaryPath = path.join("./", 'md2pdf');
			const mdPath_ = parentLoc.split('88fad638fe6dcd63ea01daecb38061f52c5e')[1]
			const md_path = mdPath_.split('?')[0]
			console.log('MD_PATH: ' + md_path);
			// console.log('Binary path: ' + binaryPath);
			try {
				const { stdout, stderr } = await execFileAsync("/home/iyasu/portifolios/test_go/obsidian_plugin/test/.obsidian/plugins/obsidian-sample-plugin/md2pdf", [md_path]);
				if (stderr) {
					console.error('Error:', stderr);
				} else {
					console.log('MD2PDF:', stdout);
				}
				console.log('PDF generated');
			} catch (error) {
				console.log('Error during file conversition: ' + error);
				throw error;
			}
		}
	});
  }
}
