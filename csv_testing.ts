
import * as fs from "fs";
import CsvReadableStream from "csv-reader";

// Load UK city/town/village names
async function loadCSVNames(csvFilename: string, colIndex = 0): Promise<string[]> {
    return new Promise((resolve) => {
        let seenHeader = false;
        let rows: any[] = [];
        let inputStream = fs.createReadStream(csvFilename, 'utf8');

        inputStream
            .pipe(new CsvReadableStream({ parseNumbers: false, parseBooleans: false, trim: true }))
            .on('data', function (row) {
                if (!seenHeader) {
                    seenHeader = true;
                } else {
                    rows.push(row[colIndex].toLowerCase())
                }
            })
            .on('end', function () {
                resolve(rows);
            });
    });
}
