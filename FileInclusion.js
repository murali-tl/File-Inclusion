let STRING = '*/'
/*
Current code constrained to:
 -> '/*' must be in new Line
 -> after `${STRING}` move to next line
*/
class FileInclusion {

    constructor() {
        this.fs = require('fs');
        this.destinationFile = 'dest.txt';
        this.commentStack = [];
        this.getDestinationFilePath();
    }

    getDestinationFilePath() {
        const prompt = require('prompt-sync')();
        let destinationFile = prompt('Enter name/path of destination file: ');
        while (destinationFile != '' && !destinationFile?.endsWith('.txt') && !destinationFile?.endsWith('.doc')) {
            console.log('Please enter .txt or .doc filename.');
            destinationFile = prompt('Enter name/path of destination file: ');

        }
        if (destinationFile != '') {
            this.destinationFile = destinationFile;
        }
        try {
            this.fs.writeFileSync(this.destinationFile, '');
        }
        catch (err) {
            console.log('Invalid file path!!!');
            this.getDestinationFilePath();
        }
        this.recursiveRead('./source.js');
    }

    removeEmptyLines(arr) {
        for (let index = 0; index < arr.length; index++) {
            arr[index] = arr[index]?.replace('\r', '');
        }
        return arr;
    }

    getFileDataArr = (filepath) => {
        let fileData;
        let fileDataArr = [];
        try {
            fileData = this.fs.readFileSync(filepath).toString();
            fileDataArr = this.removeEmptyLines(fileData.split('\n'));
        }
        catch (err) {
            console.log('file missing');
        }
        return fileDataArr;
    }

    generateFilePath(line) {
        let importLine = line;
        if (importLine.includes('from')) {
            let lastIndex = importLine.lastIndexOf('from');
            importLine = importLine.slice(lastIndex + 4);
            console.log('he')
        }
        else {
            importLine = importLine.replace('import ', '');
        }
        importLine = importLine.replace(';', '');
        importLine = importLine.trim();
        return importLine;
    }

    recursiveRead(filepath) {
        let importValid = true;
        let fileDataArr = this.getFileDataArr(filepath);
        for (let index = 0; index < fileDataArr.length; index++) {
            let line = fileDataArr[index].trim();
            if (line.includes('/*') && !this.commentStack.length) { this.commentStack.push('/*'); }//

            if (line.startsWith('//') || this.commentStack.length) {
                this.fs.appendFileSync(this.destinationFile, (fileDataArr[index]) + '\n');
            }
            else if (importValid && line.startsWith('import')) {
                let res = this.generateFilePath(line);
                if (!res.startsWith('//') && !res.startsWith('/*')) {
                    this.recursiveRead(res.replace(/^'|'$/g, ''));
                }
            }
            else {
                importValid = false;
                this.fs.appendFileSync(this.destinationFile, (fileDataArr[index]) + '\n');
            }

            if (line.includes('*/')) { this.commentStack.pop(); }  //
        }
    }


}

const obj = new FileInclusion();
