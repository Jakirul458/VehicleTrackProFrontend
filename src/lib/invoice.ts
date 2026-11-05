import type { SubscriptionPayment } from "@/types";
import type { jsPDF } from "jspdf";

function inr(amount: number) {
  return `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(amount)}`;
}

function date(value?: string) {
  return value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "—";
}

function isAdminVerified(payment: SubscriptionPayment) {
  return payment.paymentApp === "Admin verified" || payment.utr.startsWith("ADMIN-");
}

export async function createInvoicePdf(payment: SubscriptionPayment) {
  const { jsPDF: PdfDocument } = await import("jspdf");
  const pdf = new PdfDocument({ format: "a4", unit: "mm" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const left = 18;
  const right = pageWidth - 18;
  const width = right - left;
  const navy: [number, number, number] = [17, 39, 67];
  const teal: [number, number, number] = [12, 132, 133];
  const muted: [number, number, number] = [91, 107, 125];
  const border: [number, number, number] = [222, 229, 236];
  const ink: [number, number, number] = [31, 45, 61];
  const gstEnabled = (payment.gstEnabled ?? false) && (payment.gstRate ?? 0) > 0;
  const gstAmount = payment.gstAmount ?? 0;
  const totalAmount = payment.totalAmount || payment.amount;

  pdf.setFillColor(...navy);
  pdf.roundedRect(left, 15, width, 34, 3, 3, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(19);
  pdf.text(payment.seller.businessName || "VehicleTrack Pro", left + 7, 25);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(211, 224, 238);
  pdf.text("SUBSCRIPTION INVOICE", left + 7, 33);
  pdf.text("Official payment receipt", left + 7, 40);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.text(payment.invoiceNumber || "INVOICE", right - 7, 24, { align: "right" });
  pdf.setFillColor(21, 148, 112);
  pdf.roundedRect(right - 31, 30, 24, 9, 2, 2, "F");
  pdf.setFontSize(8);
  pdf.text("PAID", right - 19, 36, { align: "center" });

  pdf.setTextColor(...muted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("ISSUED", left, 58);
  pdf.text("PAYMENT STATUS", right, 58, { align: "right" });
  pdf.setTextColor(...ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text(date(payment.approvedAt || payment.createdAt), left, 64);
  pdf.text("Paid · manually verified", right, 64, { align: "right" });

  const supplierName = payment.seller.businessName || payment.seller.fullName || "VehicleTrack Pro";
  const supplierLines = [
    supplierName,
    payment.seller.address,
    [payment.seller.city, payment.seller.state, payment.seller.pinCode].filter(Boolean).join(", "),
    payment.seller.email,
    payment.seller.mobile ? `Phone: ${payment.seller.mobile}` : "",
    payment.seller.gstin ? `GSTIN: ${payment.seller.gstin}` : "",
  ].filter(Boolean);
  const customerLines = [
    payment.customer.fullName,
    payment.customer.businessName,
    payment.customer.address,
    [payment.customer.city, payment.customer.state, payment.customer.pinCode]
      .filter(Boolean)
      .join(", "),
    payment.customer.email,
    payment.customer.mobile ? `Phone: ${payment.customer.mobile}` : "",
  ].filter(Boolean);
  const cardY = 73;
  const cardGap = 6;
  const cardWidth = (width - cardGap) / 2;
  const contentWidth = cardWidth - 12;
  const supplierWrapped = supplierLines.flatMap((line) => pdf.splitTextToSize(line, contentWidth));
  const customerWrapped = customerLines.flatMap((line) => pdf.splitTextToSize(line, contentWidth));
  const cardHeight = Math.max(supplierWrapped.length, customerWrapped.length, 2) * 5 + 17;

  for (const [x, heading, lines] of [
    [left, "FROM", supplierWrapped],
    [left + cardWidth + cardGap, "BILLED TO", customerWrapped],
  ] as const) {
    pdf.setFillColor(247, 249, 252);
    pdf.setDrawColor(...border);
    pdf.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, "FD");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...teal);
    pdf.text(heading, x + 6, cardY + 9);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...ink);
    pdf.text(lines.length ? lines : ["—"], x + 6, cardY + 16);
  }

  const tableY = cardY + cardHeight + 10;
  pdf.setFillColor(...navy);
  pdf.roundedRect(left, tableY, width, 11, 2, 2, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.text("SUBSCRIPTION", left + 5, tableY + 7);
  pdf.text("PLAN AMOUNT", right - 5, tableY + 7, { align: "right" });

  const descriptionLines = pdf.splitTextToSize(
    payment.planDescription || "Subscription plan",
    width - 58,
  );
  const itemLines = pdf.splitTextToSize(payment.planName, width - 58);
  const rowY = tableY + 11;
  const rowHeight = Math.max(descriptionLines.length, itemLines.length, 1) * 5 + 15;
  pdf.setDrawColor(...border);
  pdf.roundedRect(left, rowY, width, rowHeight, 2, 2, "S");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(...ink);
  pdf.text(itemLines, left + 5, rowY + 8);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...muted);
  pdf.text(descriptionLines, left + 5, rowY + 14 + (itemLines.length - 1) * 4);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(...ink);
  pdf.text(inr(payment.amount), right - 5, rowY + 9, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...muted);
  pdf.text("INR", right - 5, rowY + 15, { align: "right" });

  const detailY = rowY + rowHeight + 9;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...navy);
  pdf.text("PAYMENT & COVERAGE", left, detailY);
  const details: [string, string][] = [
    ["Plan amount", inr(payment.amount)],
    ...(gstEnabled ? [[`GST (${payment.gstRate}%)`, inr(gstAmount)] as [string, string]] : []),
    ["Coverage starts", date(payment.periodStart)],
    ["Valid through", date(payment.periodEnd)],
    ["Paid using", payment.paymentApp || "UPI"],
    ["Payment date", date(payment.paymentDate)],
    [
      isAdminVerified(payment) ? "Admin payment reference" : "UTR / transaction ID",
      isAdminVerified(payment) ? "Admin verified" : payment.utr,
    ],
  ];
  let detailLineY = detailY + 8;
  for (const [label, value] of details) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...muted);
    pdf.text(label, left, detailLineY);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...ink);
    pdf.text(pdf.splitTextToSize(value || "—", width - 57), right, detailLineY, {
      align: "right",
    });
    detailLineY += 7;
  }

  const totalY = detailLineY + 2;
  pdf.setFillColor(235, 247, 246);
  pdf.roundedRect(left, totalY, width, 19, 2, 2, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(...navy);
  pdf.text("TOTAL RECEIVED", left + 6, totalY + 12);
  pdf.setFontSize(14);
  pdf.setTextColor(...teal);
  pdf.text(inr(totalAmount), right - 6, totalY + 12, { align: "right" });

  let footerY = totalY + 29;
  pdf.setDrawColor(...border);
  pdf.line(left, footerY, right, footerY);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...muted);
  const note = gstEnabled
    ? "This computer-generated invoice records the subscription and GST amount shown. Confirm statutory GST invoice requirements, tax classification and place-of-supply details with your tax professional."
    : "This computer-generated subscription receipt confirms the payment shown above. GST was not charged on this invoice.";
  pdf.text(pdf.splitTextToSize(note, width), left, footerY + 7);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...navy);
  pdf.text("Thank you for choosing VehicleTrack Pro.", left, footerY + 18);
  footerY += 31;
  if (payment.seller.signatureImage) {
    const format = payment.seller.signatureImage.startsWith("data:image/png") ? "PNG" : "JPEG";
    pdf.addImage(payment.seller.signatureImage, format, right - 42, footerY - 15, 30, 12);
  }
  pdf.setDrawColor(...border);
  pdf.line(right - 52, footerY, right, footerY);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(...ink);
  pdf.text(payment.authorizedSignatory || "Authorized signatory", right, footerY + 5, {
    align: "right",
  });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(...muted);
  pdf.text(`For ${supplierName}`, right, footerY + 9, {
    align: "right",
  });

  return pdf;
}

export async function previewInvoicePdf(createPdf: () => Promise<jsPDF>) {
  const previewWindow = window.open("about:blank", "_blank");
  if (!previewWindow) {
    throw new Error("Allow pop-ups to preview this invoice.");
  }
  try {
    const pdf = await createPdf();
    const url = URL.createObjectURL(pdf.output("blob"));
    previewWindow.location.assign(url);
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    previewWindow.close();
    throw error;
  }
}

export function invoiceFilename(payment: SubscriptionPayment) {
  const agentName =
    typeof payment.agentId === "object" ? payment.agentId.fullName : payment.customer.fullName;
  const safeName = (agentName || payment.customer.fullName || "Agent")
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
  return `${payment.invoiceNumber || payment.id}-${safeName}-invoice.pdf`;
}
