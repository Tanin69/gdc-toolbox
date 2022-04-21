import { readdirSync } from "fs";
import { defineNuxtConfig } from "nuxt";
import { join } from "path";

const BG_PATH = "/assets/img/backgrounds/";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	css: ["@/assets/css/w3.css", "@/assets/css/style.css"],

	head: {
		viewport: "width=device-width, initial-scale=1, maximum-scale=1",
		charset: "utf-8",
		meta: [{ name: "description", content: "My amazing site." }],
	},

	typescript: {
		shim: false,
	},

	runtimeConfig: {
		public: {
			BASE_TITLE: "GDC Toolbox",
			BASE_URL: process.env.BASE_URL || "https://nuxtjs.org",
		},
	},
});
