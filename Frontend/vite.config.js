import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, './index.html'),
				'vagas': resolve(__dirname, './vagas/index.html'),
			},
		},
	},
})


/*

EXEMPLO: dentro de input, coloque a seguinte linha:

'nome-da-tela': resolve(__dirname, './nome-da-pasta/index.html'),

*/