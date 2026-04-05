import config from "@iobroker/eslint-config";

export default [
    ...config,
    {
        languageOptions: {
            parserOptions: {
                projectService: { allowDefaultProject: ["*.mjs"] },
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        // Test files use Mocha globals
        files: ["test/**/*.js"],
        languageOptions: {
            globals: {
                describe: "readonly",
                it: "readonly",
                before: "readonly",
                after: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
            },
        },
    },
    {
        ignores: [
            ".dev-server/",
            ".vscode/",
            "*.test.js",
            "test/**",
            "*.config.mjs",
            "build",
            "admin",
            "node_modules",
            "**/adapter-config.d.ts",
        ],
    },
];
