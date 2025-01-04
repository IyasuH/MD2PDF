import { Plugin, Notice } from 'obsidian';

import { execFile } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

export default class MDToPDF extends Plugin {
  async onload() {
	const execFileAsync = promisify(execFile);
	const plugin_path = ".obsidian/plugins/obsidian-md2pdf-plugin";
	console.log('loading MDToPDF plugin');
	this.addRibbonIcon('dice', 'MD to PDF', async () => {
		console.log('MD to PDF clicked');
		const file = this.app.workspace.getActiveFile();
		if (file) {
			const fullPath = this.app.vault.getAbstractFileByPath(file.path);
			const file_name = this.app.workspace.getActiveFile()?.basename;
			if (!file_name) {
				console.error('Error: file_name is undefined');
				return;
			}

			const copy_path = path.join(plugin_path, file_name);
			
			await fullPath?.vault.copy(file, copy_path);

			const md_path = await this.app.fileManager.getAvailablePathForAttachment(copy_path)

			const root_ = await this.app.vault.getRoot();
			const binary_path = path.join(root_.vault.adapter.basePath, plugin_path, "mdpdf/md2pdf");
			console.log('binary_path:', binary_path);

			try {
				const { stdout, stderr } = await execFileAsync(binary_path, [md_path]);
				if (stderr) {
					console.error('Error:', stderr);
				} else {
					console.log('MD2PDF:', stdout);
				}
				console.log(`PDF generated inside ${plugin_path}`);
				new Notice(`PDF generated inside ${plugin_path}`);
			} catch (error) {
				console.log('Error during file conversition: ' + error);
				new Notice('Error during file conversition: ' + error);
				throw error;
			}
		}
	});
  }
}
