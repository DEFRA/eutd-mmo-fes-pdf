const PdfStyle = require('./mmoPdfStyles');
const path = require('path');
const qr = require('qr-image');

module.exports = {

    separator: function(doc, startY) {
        doc.lineWidth(0.75);
        doc.moveTo(0, startY).lineTo(600, startY).dash(2, {space: 2}).stroke('#767676');
    },
    endOfPage: function(doc, page) {
        doc.undash();
        doc.lineWidth(2);
        doc.moveTo(PdfStyle.MARGIN.LEFT, 795).lineTo(560, 795).stroke('#353535');
        doc.font(PdfStyle.FONT.REGULAR);
        doc.fontSize(PdfStyle.FONT_SIZE.SMALL);
        doc.fillColor('#353535');
        doc.text(page, 0, 800, {
            align: 'center'
        });

        if (!doc.page.dictionary.Tabs) {
            doc.page.dictionary.data.Tabs = 'S';
        }
    },
    qrCode: function(doc, buff, startX, startY) {
        doc.addStructure(doc.struct('Figure', {
            alt: 'QR Code'
        }, () => {
            doc.image(buff, startX, startY, {fit: [55, 55]});
        }));
        this.labelBold(doc, startX + 90,startY + 10,
            'Use the QR code');
        this.labelBold(doc, startX + 90,startY + 25,
            'to check that this');
        this.labelBold(doc, startX + 90,startY + 40,
            'certificate is valid');
    },
    generateQRCode: function(uri) {
        return new Promise(((resolve, reject) => {
            let stream = qr.image(uri, {type: 'PNG'});
            let data = [];

            stream.on('data', (chunk) => {
                data.push(chunk);
            });

            stream.on('end', () => {
                resolve(Buffer.concat(data));
            });

            stream.on('error', (e) => {
                reject(e);
            })
        }));
    },
    labelImpl: function(doc, x, y, text, font) {
        doc.font(font);
        doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
        doc.fillColor('#353535');
        doc.font(font);
        doc.text(text, x, y);
    },
    label: function(doc, x, y, text) {
        this.labelImpl(doc, x, y, text, PdfStyle.FONT.REGULAR);
    },
    labelBold: function(doc, x, y, text) {
        this.labelImpl(doc, x, y, text, PdfStyle.FONT.BOLD);
    },
    labelBoldItalic: function(doc, x, y, text) {
        this.labelImpl(doc, x, y, text, PdfStyle.FONT.BOLD_ITALIC);
    },
    tableHeaderCell: function(doc, x, y, width, height, text) {
        if (!text || Array.isArray(text)) {
            this.cell({doc, x, y, width, height, textArr: text, trimWidth: false, isBold: false, lineColor: '#767676', textColor: '#353535', bgColour: '', numberOfLines: 1 });
        } else {
            let textArr = [text];
            this.cell({doc, x, y, width, height, textArr, trimWidth: false, isBold: false, lineColor: '#767676', textColor: '#353535', bgColour: '', numberOfLines: 1 });
        }
    },
    tableHeaderCellBold: function(doc, x, y, width, height, text) {
        if (!text || Array.isArray(text)) {
            this.cell({doc, x, y, width, height, textArr: text, trimWidth: false, isBold: true, lineColor: '#767676', textColor: '#353535', bgColour: '', numberOfLines: 1 });
        } else {
            let textArr = [text];
            this.cell({doc, x, y, width, height, textArr, trimWidth: false, isBold: true, lineColor: '#767676', textColor: '#353535', bgColour: '', numberOfLines: 1 });
        }
    },
    field: function(doc, x, y, width, height, text, numberOfLines = 1) {
        if (!text || Array.isArray(text)) {
            this.cell({doc, x, y, width, height, textArr: text, trimWidth: true, isBold: false, lineColor: '#767676', textColor: '#6B6B6B', bgColour:'#f1f4ff', numberOfLines});
        } else {
            let textArr = [text];
            this.cell({doc, x, y, width, height, textArr, trimWidth: true, isBold: false, lineColor: '#767676', textColor: '#6B6B6B', bgColour:'#f1f4ff', numberOfLines});
        }
    },
    wrappedField: function(doc, x, y, width, height, text) {
        if (!text || Array.isArray(text)) {
            this.cell({doc, x, y, width, height, textArr: text, trimWidth: false, isBold: false, lineColor: '#767676', textColor: '#6B6B6B', bgColour:'#f1f4ff', numberOfLines: 1 });
        } else {
            let textArr = [text];
            this.cell({doc, x, y, width, height, textArr, trimWidth: false, isBold: false, lineColor: '#767676', textColor: '#6B6B6B', bgColour:'#f1f4ff', numberOfLines: 1 });
        }
    },
    cell: function({ doc, x, y, width, height, textArr, trimWidth,
           isBold, lineColor, textColor, bgColour, numberOfLines }) {

        let yPos = y;
        doc.undash();
        doc.lineWidth(0.75);
        doc.rect(x, y, width, height);
        if (bgColour) {
            doc.fillAndStroke(bgColour, lineColor);
        } else {
            doc.stroke(lineColor);
        }
        doc.fillColor(textColor);
        if (textArr && textArr.length > 0) {
            if (isBold) {
                doc.font(PdfStyle.FONT.BOLD);
            } else {
                doc.font(PdfStyle.FONT.REGULAR);
            }
            doc.fontSize(PdfStyle.FONT_SIZE.SMALL);

            let txtFirstElement = textArr[0];
            if (trimWidth) {
                txtFirstElement = this.constrainWidth(doc, textArr[0], width - 4, numberOfLines);
            }
            doc.text(txtFirstElement, x + 4, yPos + 4, {
                width: width - 4,
                lineBreak: true,
                ellipsis: true
            });

            doc.font(PdfStyle.FONT.REGULAR);
            let arrlength = textArr.length;
            for (let idx = 1; idx < arrlength; idx++) {
                let prevTxt = textArr[idx-1];
                const prevTextWidth = doc.widthOfString(prevTxt);
                const prevTextLines = Math.ceil(prevTextWidth/width);
                yPos += 10 + ((PdfStyle.ROW.HEIGHT)*(prevTextLines - 1));
                doc.moveDown(1);
                let txt = textArr[idx];
                if (trimWidth) {
                    txt = this.constrainWidth(doc, textArr[idx], width - 4);
                }
                doc.text(txt, x + 4, yPos + 4, {
                    width: width - 4,
                    lineBreak: true,
                    ellipsis: true
                });
            }
        }
    },
    heading: function(doc, text) {
        let imageFile = path.join(__dirname, '../resources/hmgovlogo.png');
        doc.addStructure(doc.struct('Figure', {
            alt: 'HM Government logo'
        }, () => {
            doc.image(imageFile, /*PdfStyle.MARGIN.LEFT, PdfStyle.MARGIN.TOP,*/ {
                width: 220
            })
        }));

        doc.fillColor('#353535');
        doc.fontSize(PdfStyle.FONT_SIZE.LARGEST);
        doc.font(PdfStyle.FONT.BOLD);
        doc.addStructure(doc.struct('H1', {}, () => {
            doc.text('UNITED KINGDOM', 450, PdfStyle.MARGIN.TOP);
        }))
        doc.fontSize(PdfStyle.FONT_SIZE.LARGE);
        doc.addStructure(doc.struct('H2', {}, () => {
            doc.text(text, 0, 75, {
                align: 'center'
            });
        }))
    },
    subHeading: function(doc, x, y, text) {
        doc.fillColor('#353535');
        doc.fontSize(PdfStyle.FONT_SIZE.MEDIUM);
        doc.text(text, x, y, {
            align: 'center'
        });
    },
    constrainWidth: function(doc, text, width, numberOfLines) {
        let newTxt = text;
        if (doc.widthOfString(newTxt) > (width * numberOfLines) && newTxt.length > 3) {
            //-5 is to give extra space just incase of capital letters
            while (doc.widthOfString(newTxt) > (width * numberOfLines) - 5 && newTxt.length > 1) {
                newTxt = newTxt.slice(0, -1);
            }
            newTxt = newTxt.slice(0, -4);
            newTxt = newTxt + '...';
        }
        return newTxt;
    },
    constructAddress: function(addressArray) {
        let address = '';
        if (addressArray.length === 4) {
            if (addressArray[0]) {
                address += addressArray[0];
            }
            if (addressArray[0] && addressArray[1]) {
                address += ', ';
            }
            if (addressArray[1]) {
                address += addressArray[1];
            }
            if (addressArray[2]) {
                address += ', ' + addressArray[2];
            }
            if (addressArray[3]) {
                address += '. ' + addressArray[3];
            }
        }
        return address;
    },
    todaysDate: function() {
        const currentDate = new Date();
        const month = currentDate.getMonth() > 8 ? `${currentDate.getMonth() + 1}` : `0${currentDate.getMonth() + 1}`;
        return `${currentDate.getDate()}/${month}/${currentDate.getFullYear()}`;
    }
}