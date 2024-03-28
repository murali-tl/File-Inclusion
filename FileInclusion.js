class Constants {
    static IMPORT = 'import';
    static FROM = 'from';
}

class FileInclusion {

    constructor() {
        this.fs = require('fs');
        this.destinationFile = 'dest.txt';
        this.sourceFile = './source.js';
        this.errorStatus = false;
        this.getDestinationFilePath();
    }

    getDestinationFilePath = () => {
        const prompt = require('prompt-sync')();
        let inputDestinationFile = prompt('Enter name/path of destination file: ');
        while (inputDestinationFile != '' && !inputDestinationFile?.endsWith('.txt') && !inputDestinationFile?.endsWith('.doc')) {
            console.log('Please enter .txt or .doc filename.');
            inputDestinationFile = prompt('Enter name/path of destination file: ');
        }
        if (inputDestinationFile != '') {
            try {
                this.fs.writeFileSync(inputDestinationFile, '');
            }
            catch (err) {
                console.log('Invalid file path!!!');
                return this.getDestinationFilePath();
            }
            this.destinationFile = inputDestinationFile;
        }
        this.fs.writeFileSync(this.destinationFile, '');
        this.readFile(this.sourceFile, []);
    }

    removeEmptyLines = (arr) => {
        for (let index = 0; index < arr.length; index++) {
            arr[index] = arr[index]?.replace('\r', '');
        }
        return arr;
    }

    getFileDataArr = (filepath) => {
        let fileData;
        let fileDataArr = [];
        try {
            fileData = this.fs.readFileSync(filepath, 'utf-8');
            fileDataArr = this.removeEmptyLines(fileData.split('\n'));
        }
        catch (err) {
            console.log('FAILED: File "' + filepath + '" missing.');
            this.errorStatus = true;
        }
        return fileDataArr;
    }

    importFile(line, fileArr) {
        let importLine = line;
        let res = '';
        if (importLine.includes('//')) {
            res = importLine.slice(importLine.indexOf('//'));
            importLine = importLine.replace(res, '');
        }
        let importArr = importLine.split('import ');
        for (let ele of importArr) {
            let startIndex, lastIndex;
            if (ele.includes('"')) {
                startIndex = ele.indexOf('"');
                lastIndex = ele.lastIndexOf('"');
            }
            else {
                startIndex = ele.indexOf("'");
                lastIndex = ele.lastIndexOf("'");
            }
            let path = ele.slice(startIndex + 1, lastIndex);
            if (path.length) {
                this.readFile(path, fileArr);
            }
            let restStr = ele.replace(path, '');
            if (ele.includes('"')) {
                restStr = restStr.replaceAll('"', '');
            }
            else {
                restStr = restStr.replaceAll("'", '');
            }
            if (restStr[0] === ';') {
                restStr = restStr.slice(1);
            }
            this.fs.appendFileSync(this.destinationFile, (restStr));
        }
        this.fs.appendFileSync(this.destinationFile, (res) + '\n');
    }

    validateLine(stack, originalLine, fileArr) {
        let line = originalLine.trim();
        let commentStack = stack;
        if (line.includes('/*') && commentStack.length === 0) {
            if (line.includes('*/')) {
                this.validateLine(commentStack, line.slice(0, line.indexOf('/*')), fileArr);
                this.fs.appendFileSync(this.destinationFile, (line.slice(line.indexOf('/*'), line.indexOf('*/') + 2)));
                this.validateLine(commentStack, line.slice(line.indexOf('*/') + 2), fileArr);
            }
            else {
                let commentStr = line.slice(line.indexOf('/*'));
                line = line.slice(0, line.indexOf('/*'));
                if (line.trim().length) {
                    this.validateLine(commentStack, line, fileArr);
                }
                this.fs.appendFileSync(this.destinationFile, (commentStr));
                commentStack?.push('/*');
            }
        }
        else if (line.includes('*/') && commentStack.length) {
            this.fs.appendFileSync(this.destinationFile, (line.slice(0, line.indexOf('*/') + 2)));
            line = line?.slice(line.indexOf('*/') + 2);
            commentStack?.pop();
            if (line.trim().length) {
                return this.validateLine(commentStack, line, fileArr);
            }
        }
        else if (commentStack.length) {
            this.fs.appendFileSync(this.destinationFile, (originalLine));
        }
        else if (line.startsWith('//')) {
            this.fs.appendFileSync(this.destinationFile, (originalLine));
        }
        else {
            if (line.includes(Constants.IMPORT) && commentStack.length === 0) {
                let importIndex = line.indexOf(Constants.IMPORT);
                if (importIndex === 0) {
                    this.importFile(line, fileArr);
                }
                else {
                    if (!line.slice(0, importIndex).includes('//')) {
                        this.fs.appendFileSync(this.destinationFile, (line.slice(0, importIndex)) + '\n');
                        this.importFile(line.slice(importIndex), fileArr);
                    }
                    else {
                        this.fs.appendFileSync(this.destinationFile, (line) + '\n');
                    }
                }
            }
            else {
                this.fs.appendFileSync(this.destinationFile, (originalLine));
            }
        }
        this.fs.appendFileSync(this.destinationFile, '\n');
    }

    readFile = (filepath, fileArr) => {
        let commentStack = [];
        let fileArray = [...fileArr];
        if (!(fileArray?.includes(filepath))) {
            fileArray?.push(filepath);
            //console.log(filepath,fileArray);
            let fileDataArr = this.getFileDataArr(filepath);
            for (let index = 0; index < fileDataArr?.length; index++) {
                this.validateLine(commentStack, fileDataArr[index], fileArray);
            }
        }
    }

}

const obj = new FileInclusion();
if (!obj.errorStatus) {
    console.log('\nSUCCESS: Files data is included in Destination file.\n');
}