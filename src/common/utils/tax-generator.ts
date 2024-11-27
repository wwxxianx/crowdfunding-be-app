import { Injectable } from '@nestjs/common';
import { Campaign, CampaignDonation, User } from '@prisma/client';
const PDFDocument = require('pdfkit');
const fs = require('fs');

export type TaxReceiptPayloadItem = CampaignDonation & {
  campaign: Campaign;
  user: User;
};

export type TaxReceiptPayload = TaxReceiptPayloadItem[];

@Injectable()
export class TaxReceiptGenerator {
  async createReceipt(payload: TaxReceiptPayload): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      this._generateHeader(doc);
      this._generateCustomerInformation(doc, payload);
      this._generateTableHeader(doc);
      this._generateInvoiceTable(doc, payload);
      doc.end();
    });
  }

  private _generateHeader(doc) {
    doc
      // TODO: Find logo image
      .image('logo.jpg', 50, 45, { width: 50 })
      .fillColor('#444444')
      .fontSize(20)
      .text('FYP Inc.', 110, 57)
      .fontSize(10)
      // TODO: Put signature image
      .image('signature.png', 500, 35, { width: 80, align: 'right' })
      .text('Executive Director & CEO', 200, 75, { align: 'right' })
      .text('Donation Malaysia', 200, 90, { align: 'right' })
      .moveDown();
  }

  private _generateTableHeader(doc) {
    doc
      .fontSize(10)
      .text('Donation No.', 50, 300)
      .text('Campaign', 150, 300)
      .text('Amount', 280, 300, { width: 90, align: 'right' })
      .text('Date', 370, 300, { width: 90, align: 'right' })
      .text('Total', 0, 300, { align: 'right' })
      .moveDown();
    this._generateDivider(doc, 320);
  }

  private _generateCustomerInformation(doc, payload: TaxReceiptPayload) {
    const labelXPosition = 50;
    const valueXPosition = 180;
    const user = payload[0].user;
    const date = new Date();
    doc
      .text(`DONATION OFFICIAL RECEIPT`, labelXPosition, 100)
      .text(`Invoice Number:`, labelXPosition, 130)
      .text(`123`, valueXPosition, 130)
      .text(`Invoice Date:`, labelXPosition, 145)
      .text(
        `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${date.getUTCDate()}`,
        valueXPosition,
        145,
      )
      .text(`Receipt to:`, labelXPosition, 160)
      .text(`${user.fullName}`, valueXPosition, 160)
      .text(`Mailing Adderss:`, labelXPosition, 175)
      .text(`${user.address}`, valueXPosition, 175)
      .text(`NRIC/Passport No:`, labelXPosition, 190)
      .text(`${user.identityNumber}`, valueXPosition, 190)
      .moveDown();
  }
  private _generateDivider(doc, y) {
    doc.underline(40, y, 550, 2, { color: 'black' }).moveDown();
  }

  private _generateTableRow(doc, y, c1, c2, c3, c4, c5) {
    doc
      .fontSize(10)
      .text(c1, 50, y)
      .text(c2, 150, y)
      .text(c3, 280, y, { width: 90, align: 'right' })
      .text(c4, 370, y, { width: 90, align: 'right' })
      .text(c5, 0, y, { align: 'right' });
  }

  private _generateInvoiceTable(doc, payload: TaxReceiptPayload) {
    let i,
      invoiceTableTop = 300;

    for (i = 0; i < payload.length; i++) {
      const userDonation = payload[i];
      const date = userDonation.createdAt;
      const position = invoiceTableTop + (i + 1) * 30;
      this._generateTableRow(
        doc,
        position,
        i + 1,
        userDonation.campaign.title,
        userDonation.amount,
        `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${date.getUTCDate()}`,
        userDonation.amount,
      );
    }
  }
}
