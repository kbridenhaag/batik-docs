const fs = require("fs-extra");
const sass = require("sass");
const postcss = require("postcss");
const autoprefixer = require("autoprefixer");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const pluginTOC = require("eleventy-plugin-toc");

module.exports = (eleventyConfig) => {
  eleventyConfig.setLibrary(
    "md",
    markdownIt({
      html: true,
      breaks: true,
      linkify: false,
      typographer: true,
    }).use(markdownItAnchor)
  );

  eleventyConfig.addPlugin(pluginTOC, {
    tags: ["h2", "h3"],
    wrapperClass: "kbridh-toc__nav",
    ul: true
  });

  eleventyConfig.addPassthroughCopy({ "./src/_assets": "assets" });
  eleventyConfig.addWatchTarget("./src/_style");
  eleventyConfig.addWatchTarget("./src/_assets");

  eleventyConfig.addNunjucksGlobal("assetsPath", (path) => "/assets/" + path);
  eleventyConfig.addNunjucksGlobal("publicPath", (path) => "/public/" + path);

  eleventyConfig.on("beforeBuild", () => {
    processSass("./src/_style/index.scss");
  });

  return {
    markdownTemplateEngine: "njk",
    dir: {
      includes: "_includes",
      input: "src",
      layouts: "_layouts",
      output: "dist",
    },
  };
};

function processSass(cssPath) {
  console.log("compiling CSS");
  const { css } = sass.compile(cssPath, {
    sourceMap: false,
    loadPaths: ["./"],
    quietDeps: true,
  });

  console.log("CSS compiled");

  console.log("Optimizing CSS");
  postcss([autoprefixer])
    .process(css.toString(), { from: "index.css", to: "./dist/public/app.css" })
    .then((result) => {
      fs.outputFileSync("./dist/public/app.css", result.css);
      console.log("CSS optimized");
    });
}
