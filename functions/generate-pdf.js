import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export const handler = async (event) => {
  try {
    const { html, title } = JSON.parse(event.body);

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: true
    });

    const page = await browser.newPage();

    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            margin: 0;
            font-family: Arial, sans-serif;
          }
          .pdf-wrapper {
            width: 210mm;
            height: 297mm;
            transform: scale(0.72);
            transform-origin: top left;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table, th, td {
            border: 1px solid #000;
          }
        </style>
      </head>
      <body>
        <div class="pdf-wrapper">
          ${html}
        </div>
      </body>
      </html>
    `);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      pageRanges: "1"
    });

    await browser.close();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${title || "lesson-plan"}.pdf"`
      },
      body: pdf.toString("base64"),
      isBase64Encoded: true
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: "PDF generation failed"
    };
  }
};
