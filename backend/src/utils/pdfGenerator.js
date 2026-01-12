import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const uploadsRoot = process.env.UPLOADS_ROOT || path.resolve(process.cwd(), "uploads");
const generatedDir = path.join(uploadsRoot, "generated");

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
 * Generate Earnest Money Agreement PDF
 */
export const generateEmaPdf = async (data) => {
  const { emaId, propertyTitle, propertyLocation, seller, buyer, titleNo, areaSqm, earnestMoneyAmount, totalPurchasePrice, deedExecutionDeadline, version = 1 } = data;

  const outputDir = path.join(generatedDir, "earnest-money", emaId);
  ensureDir(outputDir);
  const outputPath = path.join(outputDir, `v${version}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);

    // Header
    doc.fontSize(18).font("Helvetica-Bold").text("EARNEST MONEY AGREEMENT", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica").text("Goshen Realty ABCD", { align: "center" });
    doc.moveDown(2);

    // Introduction
    doc.fontSize(10).font("Helvetica");
    doc.text("This Earnest Money Agreement is entered into by and between:");
    doc.moveDown(1.5);

    // Seller Information
    doc.fontSize(12).font("Helvetica-Bold").text("THE SELLER:");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Name: ${seller?.name || "N/A"}`);
    doc.text(`Address: ${seller?.address || "N/A"}`);
    doc.moveDown(1);

    // Buyer Information
    doc.fontSize(12).font("Helvetica-Bold").text("THE BUYER:");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Name: ${buyer?.name || "N/A"}`);
    doc.text(`Address: ${buyer?.address || "N/A"}`);
    doc.text(`Phone: ${buyer?.phone || "N/A"}`);
    doc.text(`Email: ${buyer?.email || "N/A"}`);
    doc.moveDown(1.5);

    // Property Information
    doc.fontSize(12).font("Helvetica-Bold").text("PROPERTY DETAILS:");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Property: ${propertyTitle || "N/A"}`);
    doc.text(`Location: ${propertyLocation || "N/A"}`);
    doc.text(`Title No.: ${titleNo || "N/A"}`);
    doc.text(`Area: ${areaSqm || "N/A"} sqm`);
    doc.moveDown(1.5);

    // Financial Terms
    doc.fontSize(12).font("Helvetica-Bold").text("FINANCIAL TERMS:");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Total Purchase Price: PHP ${Number(totalPurchasePrice || 0).toLocaleString()}`);
    doc.text(`Earnest Money Amount: PHP ${Number(earnestMoneyAmount || 0).toLocaleString()}`);
    doc.text(`Deed Execution Deadline: ${deedExecutionDeadline ? new Date(deedExecutionDeadline).toLocaleDateString() : "N/A"}`);
    doc.moveDown(1.5);

    // Terms
    doc.fontSize(12).font("Helvetica-Bold").text("TERMS AND CONDITIONS:");
    doc.moveDown(0.5);
    doc.fontSize(9).font("Helvetica");
    doc.text("1. The Buyer agrees to pay the above earnest money as a deposit for the property.");
    doc.text("2. The earnest money shall be applied to the total purchase price upon execution of the Deed of Absolute Sale.");
    doc.text("3. If the Buyer fails to proceed with the purchase, the earnest money may be forfeited.");
    doc.text("4. If the Seller fails to deliver the property as agreed, the earnest money shall be returned to the Buyer.");
    doc.text("5. Both parties agree to execute the Deed of Absolute Sale on or before the deadline specified above.");
    doc.moveDown(2);

    // Signature Lines
    doc.fontSize(10).font("Helvetica");
    doc.text("_________________________                    _________________________");
    doc.text("        SELLER                                              BUYER");
    doc.moveDown(2);

    // Footer
    doc.fontSize(8).font("Helvetica");
    doc.text(`Document ID: ${emaId}`, { align: "left" });
    doc.text(`Version: ${version}`, { align: "left" });
    doc.text(`Generated: ${new Date().toLocaleString()}`, { align: "left" });

    doc.end();

    writeStream.on("finish", () => {
      resolve({
        storageKey: `earnest-money/${emaId}/v${version}.pdf`,
        url: `/uploads/generated/earnest-money/${emaId}/v${version}.pdf`,
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
