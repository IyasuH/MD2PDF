package main

import (
	"bytes"
	"fmt"
	"os"
	"path/filepath"

	pdf "github.com/adrg/go-wkhtmltopdf"
	"github.com/microcosm-cc/bluemonday"
	"github.com/russross/blackfriday"
)

const (
	header = `<!DOCTYPE html>
<html lang="en">
	<head>
    	<meta charset="UTF-8">
    	<meta name="viewport" content="width=device-width, initial-scale=1.0">
    	<title>Document</title>
	</head>
	<body>
`
	footer = `
	</body>
</html>
	`
)

func main() {
	if len(os.Args) != 2 {
		fmt.Fprint(os.Stderr, "[ERROR] Invalid arguments. Usage: mdpdf <file.md>")
		os.Exit(1)
	}
	fileName := os.Args[1]
	fmt.Printf("[INFO] Converting file %s to PDF \n", fileName)
	if err := run(fileName); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	// clean up the generated HTML file
	// os.Remove(fmt.Sprintf("%s.html", filepath.Base(fileName))
}

func run(fileName string) error {
	input, err := os.ReadFile(fileName)
	if err != nil {
		return err
	}
	htmlData := parseContent(input)
	outName := fmt.Sprintf("%s.html", filepath.Base(fileName))
	fmt.Printf("[INFO] Writing HTML to %s \n", outName)
	err = saveHTML(outName, htmlData)
	if err != nil {
		return err
	}
	return savePDF(outName)
}

func parseContent(input []byte) []byte {
	output := blackfriday.MarkdownCommon(input)
	body := bluemonday.UGCPolicy().SanitizeBytes(output)

	var buffer bytes.Buffer

	buffer.WriteString(header)
	buffer.Write(body)
	buffer.WriteString(footer)

	return buffer.Bytes()
}

func saveHTML(fileName string, data []byte) error {
	return os.WriteFile(fileName, data, 0644)
}

func savePDF(fileName string) error {
	if err := pdf.Init(); err != nil {
		return err
	}
	defer pdf.Destroy()
	object, err := pdf.NewObject(fileName)
	if err != nil {
		return err
	}

	converter, err := pdf.NewConverter()
	if err != nil {
		return err
	}
	defer converter.Destroy()

	converter.Add(object)

	converter.Title = fileName
	converter.MarginTop = "1cm"
	converter.MarginBottom = "1cm"
	converter.PaperSize = pdf.A4

	outFile, err := os.Create("output.pdf")
	defer outFile.Close()

	if err := converter.Run(outFile); err != nil {
		return err
	}

	return nil
}
