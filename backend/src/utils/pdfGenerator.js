import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const uploadsRoot = process.env.UPLOADS_ROOT || path.resolve(process.cwd(), "uploads");
const generatedDir = path.join(uploadsRoot, "generated");

/**
 * Convert number to words (Philippine Peso format)
 */
const numberToWords = (num) => {
  if (num === 0) return "Zero";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
                "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
                "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const scales = ["", "Thousand", "Million", "Billion", "Trillion"];

  const convertHundreds = (n) => {
    let result = "";
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + " Hundred";
      n %= 100;
      if (n > 0) result += " ";
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)];
      n %= 10;
      if (n > 0) result += "-" + ones[n];
    } else if (n > 0) {
      result += ones[n];
    }
    return result;
  };

  let result = "";
  let scaleIndex = 0;

  while (num > 0) {
    const chunk = num % 1000;
    if (chunk > 0) {
      const chunkWords = convertHundreds(chunk);
      if (scaleIndex > 0) {
        result = chunkWords + " " + scales[scaleIndex] + (result ? " " + result : "");
      } else {
        result = chunkWords + (result ? " " + result : "");
      }
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }

  return result.trim();
};

/**
 * Format date to "Xth day of Month 20XX" format
 */
const formatLegalDate = (date) => {
  if (!date) return "________";
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "long" });
  const year = d.getFullYear();

  const ordinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return `${ordinal(day)} day of ${month} ${year}`;
};

// Ensure directories exist
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Generate Authority to Sell PDF
 */
export const generateAtsPdf = async (data) => {
  const { requestId, seller, propertyDraft, atsDetails, signature, version = 1 } = data;

  const outputDir = path.join(generatedDir, "authority-to-sell", requestId);
  ensureDir(outputDir);
  const outputPath = path.join(outputDir, `v${version}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);

    // Header
    doc.fontSize(18).font("Helvetica-Bold").text("AUTHORITY TO SELL AND NEGOTIATE", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica").text("Goshen Realty ABCD", { align: "center" });
    doc.moveDown(2);

    // Seller Information
    doc.fontSize(12).font("Helvetica-Bold").text("SELLER INFORMATION");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Full Name: ${seller?.fullName || "N/A"}`);
    doc.text(`Address: ${seller?.address || "N/A"}`);
    doc.text(`Phone: ${seller?.phone || "N/A"}`);
    doc.text(`Email: ${seller?.email || "N/A"}`);
    doc.moveDown(1.5);

    // Property Information
    doc.fontSize(12).font("Helvetica-Bold").text("PROPERTY INFORMATION");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Property Title: ${propertyDraft?.title || "N/A"}`);
    doc.text(`Location: ${propertyDraft?.location || "N/A"}`);
    doc.text(`Asking Price: PHP ${Number(propertyDraft?.price || 0).toLocaleString()}`);
    doc.text(`Description: ${propertyDraft?.description || "N/A"}`);
    doc.moveDown(1.5);

    // ATS Details
    doc.fontSize(12).font("Helvetica-Bold").text("AUTHORITY DETAILS");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Title No. / Tax Declaration: ${atsDetails?.titleNosTaxDec || "N/A"}`);
    doc.text(`Lot Area: ${atsDetails?.lotArea || "N/A"}`);
    doc.text(`Owner's Net Price: PHP ${Number(atsDetails?.ownersNetPrice || 0).toLocaleString()}`);
    if (atsDetails?.periodStart && atsDetails?.periodEnd) {
      doc.text(`Authority Period: ${new Date(atsDetails.periodStart).toLocaleDateString()} to ${new Date(atsDetails.periodEnd).toLocaleDateString()}`);
    }
    if (atsDetails?.remarks) {
      doc.text(`Remarks: ${atsDetails.remarks}`);
    }
    doc.moveDown(2);

    // Terms and Conditions
    doc.fontSize(12).font("Helvetica-Bold").text("TERMS AND CONDITIONS");
    doc.moveDown(0.5);
    doc.fontSize(9).font("Helvetica");
    doc.text("1. The Seller hereby authorizes Goshen Realty ABCD to sell and negotiate the above-described property.");
    doc.text("2. The Seller warrants that they have the legal right to sell the property.");
    doc.text("3. The Seller agrees to provide all necessary documents for the transaction.");
    doc.text("4. Commission rates and terms shall be as agreed upon separately.");
    doc.text("5. This authority remains valid until revoked in writing by the Seller.");
    doc.moveDown(2);

    // Signature Section
    doc.fontSize(12).font("Helvetica-Bold").text("SELLER'S CONSENT");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Signed Name: ${signature?.signedName || "N/A"}`);
    doc.text(`Date Signed: ${signature?.signedAt ? new Date(signature.signedAt).toLocaleString() : "N/A"}`);
    doc.text(`Consent Checked: ${signature?.consentChecked ? "Yes" : "No"}`);
    doc.moveDown(2);

    // Footer
    doc.fontSize(8).font("Helvetica").text(`Document ID: ${requestId}`, { align: "left" });
    doc.text(`Version: ${version}`, { align: "left" });
    doc.text(`Generated: ${new Date().toLocaleString()}`, { align: "left" });

    doc.end();

    writeStream.on("finish", () => {
      resolve({
        storageKey: `authority-to-sell/${requestId}/v${version}.pdf`,
        url: `/uploads/generated/authority-to-sell/${requestId}/v${version}.pdf`,
        localPath: outputPath,
      });
    });

    writeStream.on("error", reject);
  });
};

/**
 * Generate Earnest Money Agreement PDF (Single Page, Compact Layout)
 */
export const generateEmaPdf = async (data) => {
  const { emaId, executionDate, executionLocation, propertyTitle, propertyLocation, seller, buyer, titleNo, areaSqm, earnestMoneyAmount, totalPurchasePrice, deedExecutionDeadline, version = 1, isPreview = false } = data;

  const outputDir = path.join(generatedDir, "earnest-money", emaId);
  ensureDir(outputDir);
  const filename = isPreview ? "preview.pdf" : `v${version}.pdf`;
  const outputPath = path.join(outputDir, filename);

  // Format values for the legal document
  const execDateFormatted = executionDate ? formatLegalDate(new Date(executionDate)) : "________";
  const execLocationFormatted = executionLocation || "________";
  const deadlineFormatted = deedExecutionDeadline ? new Date(deedExecutionDeadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "________";
  const earnestAmountFormatted = `PHP ${Number(earnestMoneyAmount || 0).toLocaleString()}`;
  const earnestAmountWords = `${numberToWords(Number(earnestMoneyAmount || 0))} Pesos`;
  const totalPriceFormatted = `PHP ${Number(totalPurchasePrice || 0).toLocaleString()}`;
  const totalPriceWords = `${numberToWords(Number(totalPurchasePrice || 0))} Pesos`;

  return new Promise((resolve, reject) => {
    // Use LETTER size with tight margins for single page
    const doc = new PDFDocument({ margin: 45, size: "LETTER" });
    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);

    // Preview watermark
    if (isPreview) {
      doc.save();
      doc.rotate(45, { origin: [306, 396] });
      doc.fontSize(72).fillColor("#cccccc").fillOpacity(0.3).text("PREVIEW", 150, 300, { align: "center" });
      doc.restore();
      doc.fillColor("#000000").fillOpacity(1);
    }

    // Header
    doc.fontSize(14).font("Helvetica-Bold").text("EARNEST MONEY AGREEMENT", { align: "center" });
    doc.moveDown(0.8);

    // Opening paragraph
    doc.fontSize(9).font("Helvetica");
    doc.text(
      `This Earnest Money Agreement is made and executed this ${execDateFormatted}, in ${execLocationFormatted}, Philippines, by and between `,
      { continued: true }
    );
    doc.font("Helvetica-Bold").text(seller?.name || "________", { continued: true });
    doc.font("Helvetica").text(", of legal age, Filipino, with address at ", { continued: true });
    doc.font("Helvetica-Bold").text(seller?.address || "________", { continued: true });
    doc.font("Helvetica").text(", hereinafter referred to as the SELLER, and ", { continued: true });
    doc.font("Helvetica-Bold").text(buyer?.name || "________", { continued: true });
    doc.font("Helvetica").text(", of legal age, Filipino, with address at ", { continued: true });
    doc.font("Helvetica-Bold").text(buyer?.address || "________", { continued: true });
    doc.font("Helvetica").text(", hereinafter referred to as the BUYER.");
    doc.moveDown(0.5);

    // Property description paragraph
    doc.text(
      "The Seller is the lawful owner of a parcel of property, with or without improvements, situated at ",
      { continued: true }
    );
    doc.font("Helvetica-Bold").text(propertyLocation || "________", { continued: true });
    doc.font("Helvetica").text(", covered by Transfer Certificate of Title/Condominium Certificate of Title No. ", { continued: true });
    doc.font("Helvetica-Bold").text(titleNo || "________", { continued: true });
    doc.font("Helvetica").text(", containing an area of ", { continued: true });
    doc.font("Helvetica-Bold").text(`${areaSqm || "________"} square meters`, { continued: true });
    doc.font("Helvetica").text(", more particularly described in said title.");
    doc.moveDown(0.5);

    // Buyer intention paragraph
    doc.text(
      "The Buyer has manifested a firm intention to purchase the above-described property, and the Seller has agreed to sell the same, subject to the execution of a Deed of Absolute Sale under the terms and conditions hereinafter stated."
    );
    doc.moveDown(0.5);

    // Earnest money payment paragraph
    doc.text(
      "For and in consideration of the foregoing, the Buyer has paid, and the Seller has received, the amount of PESOS: ",
      { continued: true }
    );
    doc.font("Helvetica-Bold").text(`${earnestAmountFormatted} (${earnestAmountWords})`, { continued: true });
    doc.font("Helvetica").text(
      " as Earnest Money, which amount shall form part of and be credited toward the total purchase price of the property."
    );
    doc.moveDown(0.5);

    // Total purchase price paragraph
    doc.text(
      "The Parties have mutually agreed that the total purchase price of the property is PESOS: ",
      { continued: true }
    );
    doc.font("Helvetica-Bold").text(`${totalPriceFormatted} (${totalPriceWords})`, { continued: true });
    doc.font("Helvetica").text(
      ". The Earnest Money shall be deducted from the total purchase price upon the execution of the Deed of Absolute Sale."
    );
    doc.moveDown(0.5);

    // Deadline paragraph
    doc.text(
      "The Parties further agree that the Deed of Absolute Sale shall be executed on or before ",
      { continued: true }
    );
    doc.font("Helvetica-Bold").text(deadlineFormatted, { continued: true });
    doc.font("Helvetica").text(
      ", subject to the completion and submission of all necessary documents and compliance with all legal requirements, including but not limited to verification of ownership, settlement of taxes, and other lawful conditions relevant to the transfer of title."
    );
    doc.moveDown(0.5);

    // Forfeiture clause
    doc.text(
      "In the event that the Buyer unjustifiably fails or refuses to proceed with the purchase, the Earnest Money shall be forfeited in favor of the Seller as liquidated damages. Conversely, if the Seller unjustifiably fails or refuses to proceed with the sale, the Seller shall return the Earnest Money in full to the Buyer. Should the sale fail to be consummated due to causes beyond the control of both Parties, the Earnest Money shall be returned to the Buyer, unless otherwise agreed in writing."
    );
    doc.moveDown(0.5);

    // Taxes clause
    doc.text(
      "Unless otherwise stipulated, all taxes, fees, and expenses incident to the sale and transfer of the property shall be borne by the Parties in accordance with law and prevailing practice."
    );
    doc.moveDown(0.5);

    // Governing law clause
    doc.text(
      "This Agreement shall be governed by and construed in accordance with the laws of the Republic of the Philippines and shall be binding upon the Parties, their heirs, successors, and assigns."
    );
    doc.moveDown(0.5);

    // Witness clause
    doc.text(
      "IN WITNESS WHEREOF, the Parties have hereunto affixed their signatures on the date and place first above written."
    );
    doc.moveDown(1);

    // Signature section - side by side
    const signatureY = doc.y;
    const leftCol = 45;
    const rightCol = 310;

    doc.text("___________________________________", leftCol, signatureY);
    doc.font("Helvetica-Bold").text("SELLER", leftCol, signatureY + 12);
    doc.font("Helvetica").fontSize(7).text("Signature over Printed Name", leftCol, signatureY + 23);

    doc.fontSize(9).text("___________________________________", rightCol, signatureY);
    doc.font("Helvetica-Bold").text("BUYER", rightCol, signatureY + 12);
    doc.font("Helvetica").fontSize(7).text("Signature over Printed Name", rightCol, signatureY + 23);

    // Footer at bottom of page
    doc.fontSize(7).font("Helvetica");
    doc.text(`Document ID: ${emaId} | Version: ${isPreview ? "Preview" : version} | Generated: ${new Date().toLocaleString()}`, 45, 745, { align: "center", width: 522 });

    doc.end();

    writeStream.on("finish", () => {
      resolve({
        storageKey: `earnest-money/${emaId}/${filename}`,
        url: `/uploads/generated/earnest-money/${emaId}/${filename}`,
        localPath: outputPath,
      });
    });

    writeStream.on("error", reject);
  });
};

/**
 * Generate Appraisal Report PDF
 */
export const generateAppraisalReportPdf = async (data) => {
  const {
    reportId,
    clientName,
    propertyLocation,
    introduction,
    propertyIdentification,
    purpose,
    highestAndBestUse,
    marketAnalysis,
    valuationApproach,
    valueConclusion,
    limitingConditions,
    appraiserValue,
    effectiveDate,
    certification,
    version = 1,
  } = data;

  const outputDir = path.join(generatedDir, "appraisal", reportId);
  ensureDir(outputDir);
  const outputPath = path.join(outputDir, `v${version}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);

    // Cover Page
    doc.fontSize(24).font("Helvetica-Bold").text("PROPERTY APPRAISAL REPORT", { align: "center" });
    doc.moveDown(2);
    doc.fontSize(14).font("Helvetica").text("Prepared by Goshen Realty ABCD", { align: "center" });
    doc.moveDown(4);

    doc.fontSize(12).font("Helvetica");
    doc.text(`Client: ${clientName || "N/A"}`);
    doc.text(`Property Location: ${propertyLocation || "N/A"}`);
    doc.text(`Effective Date: ${effectiveDate ? new Date(effectiveDate).toLocaleDateString() : "N/A"}`);
    doc.moveDown(2);

    // Appraised Value Highlight
    doc.fontSize(16).font("Helvetica-Bold").text("APPRAISED VALUE", { align: "center" });
    doc.fontSize(20).text(`PHP ${Number(appraiserValue || 0).toLocaleString()}`, { align: "center" });
    doc.moveDown(3);

    // Add page break
    doc.addPage();

    // Introduction
    if (introduction) {
      doc.fontSize(14).font("Helvetica-Bold").text("1. INTRODUCTION");
      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica").text(introduction);
      doc.moveDown(1.5);
    }

    // Property Identification
    if (propertyIdentification) {
      doc.fontSize(14).font("Helvetica-Bold").text("2. PROPERTY IDENTIFICATION");
      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica").text(propertyIdentification);
      doc.moveDown(1.5);
    }

    // Purpose
    if (purpose) {
      doc.fontSize(14).font("Helvetica-Bold").text("3. PURPOSE OF APPRAISAL");
      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica").text(purpose);
      doc.moveDown(1.5);
    }

    // Highest and Best Use
    if (highestAndBestUse) {
      doc.fontSize(14).font("Helvetica-Bold").text("4. HIGHEST AND BEST USE");
      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica").text(highestAndBestUse);
      doc.moveDown(1.5);
    }

    // Market Analysis
    if (marketAnalysis) {
      doc.fontSize(14).font("Helvetica-Bold").text("5. MARKET ANALYSIS");
      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica").text(marketAnalysis);
      doc.moveDown(1.5);
    }

    // Add page break if needed
    if (doc.y > 650) doc.addPage();

    // Valuation Approach
    if (valuationApproach) {
      doc.fontSize(14).font("Helvetica-Bold").text("6. VALUATION APPROACH");
      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica").text(valuationApproach);
      doc.moveDown(1.5);
    }

    // Value Conclusion
    if (valueConclusion) {
      doc.fontSize(14).font("Helvetica-Bold").text("7. VALUE CONCLUSION");
      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica").text(valueConclusion);
      doc.moveDown(1.5);
    }

    // Limiting Conditions
    if (limitingConditions) {
      doc.fontSize(14).font("Helvetica-Bold").text("8. LIMITING CONDITIONS");
      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica").text(limitingConditions);
      doc.moveDown(1.5);
    }

    // Certification
    doc.addPage();
    doc.fontSize(14).font("Helvetica-Bold").text("APPRAISER CERTIFICATION");
    doc.moveDown(1);
    doc.fontSize(10).font("Helvetica");
    doc.text("I certify that, to the best of my knowledge and belief:");
    doc.text("- The statements of fact contained in this report are true and correct.");
    doc.text("- The reported analyses, opinions, and conclusions are limited only by the reported assumptions and limiting conditions.");
    doc.text("- I have no present or prospective interest in the property that is the subject of this report.");
    doc.moveDown(2);

    if (certification) {
      doc.text(`Appraiser Name: ${certification.appraiserName || "N/A"}`);
      doc.text(`License Number: ${certification.licenseNumber || "N/A"}`);
      doc.text(`Date: ${certification.signedDate ? new Date(certification.signedDate).toLocaleDateString() : "N/A"}`);
    }
    doc.moveDown(2);

    doc.text("_________________________");
    doc.text("Appraiser Signature");

    // Footer
    doc.moveDown(3);
    doc.fontSize(8).font("Helvetica");
    doc.text(`Report ID: ${reportId}`, { align: "left" });
    doc.text(`Version: ${version}`, { align: "left" });
    doc.text(`Generated: ${new Date().toLocaleString()}`, { align: "left" });

    doc.end();

    writeStream.on("finish", () => {
      resolve({
        storageKey: `appraisal/${reportId}/v${version}.pdf`,
        url: `/uploads/generated/appraisal/${reportId}/v${version}.pdf`,
        localPath: outputPath,
      });
    });

    writeStream.on("error", reject);
  });
};

export default {
  generateAtsPdf,
  generateEmaPdf,
  generateAppraisalReportPdf,
};
