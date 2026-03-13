/**
 * Regex-based structured extraction engine.
 * Matches common patterns found in resumes, invoices, and general documents.
 */

interface ExtractedData {
  [key: string]: string | string[] | null;
}

export function extractWithRegex(text: string): ExtractedData {
  const result: ExtractedData = {};

  // ── Name ──
  const nameMatch = text.match(
    /(?:^|\n)\s*(?:name|full\s*name)\s*[:：]\s*(.+)/i
  );
  if (nameMatch) {
    result.name = nameMatch[1].trim();
  }

  // ── Email ──
  const emailMatch = text.match(
    /(?:email|e-mail|mail)\s*[:：]\s*([\w.+-]+@[\w-]+\.[\w.]+)/i
  );
  if (!emailMatch) {
    // Try finding any email in the text
    const anyEmail = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
    if (anyEmail) result.email = anyEmail[0].trim();
  } else {
    result.email = emailMatch[1].trim();
  }

  // ── Phone ──
  const phoneMatch = text.match(
    /(?:phone|mobile|contact|tel|telephone)\s*[:：]\s*([+\d][\d\s().-]{7,})/i
  );
  if (!phoneMatch) {
    const anyPhone = text.match(
      /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/
    );
    if (anyPhone) result.phone = anyPhone[0].trim();
  } else {
    result.phone = phoneMatch[1].trim();
  }

  // ── Skills ──
  const skillsMatch = text.match(
    /(?:^|\n)\s*(?:skills|technical\s*skills|technologies|tech\s*stack)\s*[:：]\s*(.+)/i
  );
  if (skillsMatch) {
    result.skills = skillsMatch[1]
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // ── Experience ──
  const expMatch = text.match(
    /(?:^|\n)\s*(?:experience|work\s*experience|total\s*experience)\s*[:：]\s*(.+)/i
  );
  if (expMatch) {
    result.experience = expMatch[1].trim();
  } else {
    // Try matching patterns like "X years"
    const yearsMatch = text.match(/(\d+\+?\s*(?:years?|yrs?))/i);
    if (yearsMatch) result.experience = yearsMatch[1].trim();
  }

  // ── Education ──
  const eduMatch = text.match(
    /(?:^|\n)\s*(?:education|degree|qualification)\s*[:：]\s*(.+)/i
  );
  if (eduMatch) {
    result.education = eduMatch[1].trim();
  }

  // ── Address / Location ──
  const addressMatch = text.match(
    /(?:^|\n)\s*(?:address|location|city)\s*[:：]\s*(.+)/i
  );
  if (addressMatch) {
    result.address = addressMatch[1].trim();
  }

  // ── Company / Organization ──
  const companyMatch = text.match(
    /(?:^|\n)\s*(?:company|organization|employer)\s*[:：]\s*(.+)/i
  );
  if (companyMatch) {
    result.company = companyMatch[1].trim();
  }

  // ── Date ──
  const dateMatch = text.match(
    /(?:^|\n)\s*(?:date|invoice\s*date|issue\s*date)\s*[:：]\s*(.+)/i
  );
  if (dateMatch) {
    result.date = dateMatch[1].trim();
  }

  // ── Invoice Number ──
  const invoiceMatch = text.match(
    /(?:^|\n)\s*(?:invoice\s*(?:#|no|number|num))\s*[:：]?\s*(.+)/i
  );
  if (invoiceMatch) {
    result.invoiceNumber = invoiceMatch[1].trim();
  }

  // ── Total / Amount ──
  const totalMatch = text.match(
    /(?:^|\n)\s*(?:total|amount|grand\s*total|net\s*amount|balance\s*due)\s*[:：]\s*(.+)/i
  );
  if (totalMatch) {
    result.total = totalMatch[1].trim();
  }

  // ── Summary / Objective ──
  const summaryMatch = text.match(
    /(?:^|\n)\s*(?:summary|objective|profile|about)\s*[:：]\s*(.+)/i
  );
  if (summaryMatch) {
    result.summary = summaryMatch[1].trim();
  }

  return result;
}
