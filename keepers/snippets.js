// various snippets I have used in scripts

// from customized img auto size
// DISABLED since SQIPs don't really have an effect in <picture> groups
const svgPath = `${imagePath}.svg`;
if (fs.existsSync(svgPath)) {
    const data = fs.readFileSync(svgPath, options);
    const encoded = miniSvg(data.toString());
    const orig = img.attrs.src;
    // img.attrs.style = `background-size:cover;background-image:url("${encoded}");`;
    img.attrs["data-src"] = `${orig}`;
    img.attrs.src = `${encoded}`;
}
