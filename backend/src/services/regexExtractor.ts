/**
 * Regex-based structured extraction engine.
 * Comprehensive extraction for resumes, invoices, and general documents.
 * Handles both "Label: Value" patterns and multi-line section blocks.
 */

interface ExtractedData {
  [key: string]: string | string[] | null;
}

// ── Helpers ────────────────────────────────────────────────────

/**
 * Known section headers that typically start multi-line blocks in resumes.
 */
const SECTION_HEADERS = [
  "experience",
  "work experience",
  "professional experience",
  "employment history",
  "projects",
  "personal projects",
  "academic projects",
  "education",
  "academic background",
  "skills",
  "technical skills",
  "key skills",
  "core competencies",
  "achievements",
  "accomplishments",
  "awards",
  "honors",
  "certifications",
  "certificates",
  "licenses",
  "languages",
  "interests",
  "hobbies",
  "summary",
  "objective",
  "profile",
  "about me",
  "about",
  "references",
  "publications",
  "volunteering",
  "volunteer experience",
  "extracurricular activities",
  "activities",
  "training",
  "courses",
  "coursework",
  "declaration",
];

/**
 * Build a regex that matches any known section header at the start of a line.
 */
function buildSectionRegex(): RegExp {
  const escaped = SECTION_HEADERS.map((h) =>
    h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  return new RegExp(
    `^\\s*(${escaped.join("|")})\\s*[:：]?\\s*$`,
    "im"
  );
}

/**
 * Extract multi-line sections from text. A section starts with a known
 * header and ends when the next section header (or EOF) is reached.
 */
function extractSections(text: string): Record<string, string> {
  const lines = text.split(/\n/);
  const sectionRegex = buildSectionRegex();
  const sections: Record<string, string> = {};

  let currentSection: string | null = null;
  let buffer: string[] = [];

  for (const line of lines) {
    const match = line.match(sectionRegex);
    if (match) {
      // Save previous section
      if (currentSection && buffer.length > 0) {
        sections[currentSection] = buffer.join("\n").trim();
      }
      currentSection = match[1].trim().toLowerCase();
      buffer = [];
    } else if (currentSection) {
      buffer.push(line);
    }
  }

  // Save last section
  if (currentSection && buffer.length > 0) {
    sections[currentSection] = buffer.join("\n").trim();
  }

  return sections;
}

/**
 * Split a block of text into individual bullet items.
 */
function splitBullets(block: string): string[] {
  return block
    .split(/\n/)
    .map((l) => l.replace(/^\s*[-•●▪▸*]\s*/, "").trim())
    .filter((l) => l.length > 0);
}

/**
 * Split a comma / semicolon / pipe separated value into an array.
 */
function splitList(value: string): string[] {
  return value
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── Main Extractor ────────────────────────────────────────────

export function extractWithRegex(text: string): ExtractedData {
  const result: ExtractedData = {};

  // ── 1. Inline "Label: Value" patterns ───────────────────────

  // Name
  const nameMatch = text.match(
    /(?:^|\n)\s*(?:name|full\s*name)\s*[:：]\s*(.+)/i
  );
  if (nameMatch) result.name = nameMatch[1].trim();

  // Email (labeled or first occurrence)
  const emailLabeled = text.match(
    /(?:email|e-mail|mail)\s*[:：]\s*([\w.+-]+@[\w-]+\.[\w.]+)/i
  );
  if (emailLabeled) {
    result.email = emailLabeled[1].trim();
  } else {
    const anyEmail = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
    if (anyEmail) result.email = anyEmail[0].trim();
  }

  // Phone
  const phoneLabeled = text.match(
    /(?:phone|mobile|contact\s*(?:no|number)?|tel|telephone)\s*[:：]\s*([+\d][\d\s().-]{7,})/i
  );
  if (phoneLabeled) {
    result.phone = phoneLabeled[1].trim();
  } else {
    const anyPhone = text.match(
      /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/
    );
    if (anyPhone) result.phone = anyPhone[0].trim();
  }

  // Address / Location
  const addrMatch = text.match(
    /(?:^|\n)\s*(?:address|location|city)\s*[:：]\s*(.+)/i
  );
  if (addrMatch) result.address = addrMatch[1].trim();

  // LinkedIn
  const linkedinMatch = text.match(
    /(https?:\/\/(?:www\.)?linkedin\.com\/in\/[\w-]+\/?)/i
  );
  if (linkedinMatch) result.linkedin = linkedinMatch[1].trim();

  // GitHub
  const githubMatch = text.match(
    /(https?:\/\/(?:www\.)?github\.com\/[\w-]+\/?)/i
  );
  if (githubMatch) result.github = githubMatch[1].trim();

  // Portfolio / Website
  const portfolioLabeled = text.match(
    /(?:portfolio|website|site)\s*[:：]\s*(https?:\/\/\S+)/i
  );
  if (portfolioLabeled) result.portfolio = portfolioLabeled[1].trim();

  // Date of birth
  const dobMatch = text.match(
    /(?:date\s*of\s*birth|dob|d\.o\.b)\s*[:：]\s*(.+)/i
  );
  if (dobMatch) result.date_of_birth = dobMatch[1].trim();

  // Company / Organization
  const companyMatch = text.match(
    /(?:^|\n)\s*(?:company|organization|employer)\s*[:：]\s*(.+)/i
  );
  if (companyMatch) result.company = companyMatch[1].trim();

  // ── Invoice-specific fields ──────────────────────────────────
  const invoiceMatch = text.match(
    /(?:^|\n)\s*(?:invoice\s*(?:#|no|number|num))\s*[:：]?\s*(.+)/i
  );
  if (invoiceMatch) result.invoice_number = invoiceMatch[1].trim();

  const dateMatch = text.match(
    /(?:^|\n)\s*(?:date|invoice\s*date|issue\s*date)\s*[:：]\s*(.+)/i
  );
  if (dateMatch) result.date = dateMatch[1].trim();

  const totalMatch = text.match(
    /(?:^|\n)\s*(?:total|amount|grand\s*total|net\s*amount|balance\s*due)\s*[:：]\s*(.+)/i
  );
  if (totalMatch) result.total = totalMatch[1].trim();

  // ── 2. Inline list patterns (Skills: X, Y, Z) ──────────────

  const skillsInline = text.match(
    /(?:^|\n)\s*(?:skills|technical\s*skills|technologies|tech\s*stack|core\s*competencies|key\s*skills)\s*[:：]\s*(.+)/i
  );
  if (skillsInline) {
    result.skills = splitList(skillsInline[1]);
  }

  const languagesInline = text.match(
    /(?:^|\n)\s*(?:languages)\s*[:：]\s*(.+)/i
  );
  if (languagesInline) {
    result.languages = splitList(languagesInline[1]);
  }

  const certsInline = text.match(
    /(?:^|\n)\s*(?:certifications?|certificates?)\s*[:：]\s*(.+)/i
  );
  if (certsInline) {
    result.certifications = splitList(certsInline[1]);
  }

  const interestsInline = text.match(
    /(?:^|\n)\s*(?:interests|hobbies)\s*[:：]\s*(.+)/i
  );
  if (interestsInline) {
    result.interests = splitList(interestsInline[1]);
  }

  // Inline experience value  (e.g. "Experience: 2 years")
  const expInline = text.match(
    /(?:^|\n)\s*(?:experience|work\s*experience|total\s*experience)\s*[:：]\s*(.+)/i
  );
  if (expInline) {
    result.experience = expInline[1].trim();
  } else {
    const yearsMatch = text.match(/(\d+\+?\s*(?:years?|yrs?))/i);
    if (yearsMatch) result.experience = yearsMatch[1].trim();
  }

  // Inline education
  const eduInline = text.match(
    /(?:^|\n)\s*(?:education|degree|qualification)\s*[:：]\s*(.+)/i
  );
  if (eduInline) {
    result.education = eduInline[1].trim();
  }

  // Summary / Objective inline
  const summaryInline = text.match(
    /(?:^|\n)\s*(?:summary|objective|profile\s*summary|career\s*objective|about\s*me|about)\s*[:：]\s*(.+)/i
  );
  if (summaryInline) {
    result.summary = summaryInline[1].trim();
  }

  // ── 3. Multi-line section extraction ────────────────────────
  const sections = extractSections(text);

  // Skills section (multi-line bullets or comma-separated)
  if (sections["skills"] || sections["technical skills"] || sections["key skills"] || sections["core competencies"]) {
    const block =
      sections["skills"] ||
      sections["technical skills"] ||
      sections["key skills"] ||
      sections["core competencies"] ||
      "";
    // If it looks like it has bullets / newlines, parse each line
    const items = splitBullets(block);
    // Flatten: each bullet may itself be a comma-separated list
    const flat = items.flatMap((item) => splitList(item));
    if (flat.length > 0) {
      result.skills = flat;
    }
  }

  // Experience section
  if (sections["experience"] || sections["work experience"] || sections["professional experience"] || sections["employment history"]) {
    const block =
      sections["experience"] ||
      sections["work experience"] ||
      sections["professional experience"] ||
      sections["employment history"] ||
      "";
    const items = splitBullets(block);
    if (items.length > 0) {
      result.experience_details = items;
    }
  }

  // Projects section
  if (sections["projects"] || sections["personal projects"] || sections["academic projects"]) {
    const block =
      sections["projects"] ||
      sections["personal projects"] ||
      sections["academic projects"] ||
      "";
    const items = splitBullets(block);
    if (items.length > 0) {
      result.projects = items;
    }
  }

  // Education section (multi-line)
  if (sections["education"] || sections["academic background"]) {
    const block = sections["education"] || sections["academic background"] || "";
    const items = splitBullets(block);
    if (items.length > 0) {
      result.education_details = items;
    }
  }

  // Achievements / Awards
  if (sections["achievements"] || sections["accomplishments"] || sections["awards"] || sections["honors"]) {
    const block =
      sections["achievements"] ||
      sections["accomplishments"] ||
      sections["awards"] ||
      sections["honors"] ||
      "";
    const items = splitBullets(block);
    if (items.length > 0) {
      result.achievements = items;
    }
  }

  // Certifications (multi-line)
  if (sections["certifications"] || sections["certificates"] || sections["licenses"]) {
    const block =
      sections["certifications"] ||
      sections["certificates"] ||
      sections["licenses"] ||
      "";
    const items = splitBullets(block);
    if (items.length > 0) {
      result.certifications = items;
    }
  }

  // Languages (multi-line)
  if (sections["languages"]) {
    const items = splitBullets(sections["languages"]);
    if (items.length > 0) {
      result.languages = items;
    }
  }

  // Interests / Hobbies (multi-line)
  if (sections["interests"] || sections["hobbies"]) {
    const block = sections["interests"] || sections["hobbies"] || "";
    const items = splitBullets(block);
    if (items.length > 0) {
      result.interests = items;
    }
  }

  // Summary / Objective (multi-line)
  if (sections["summary"] || sections["objective"] || sections["profile"] || sections["about me"] || sections["about"]) {
    const block =
      sections["summary"] ||
      sections["objective"] ||
      sections["profile"] ||
      sections["about me"] ||
      sections["about"] ||
      "";
    if (block.trim().length > 0 && !result.summary) {
      result.summary = block.trim();
    }
  }

  // Training / Courses
  if (sections["training"] || sections["courses"] || sections["coursework"]) {
    const block =
      sections["training"] ||
      sections["courses"] ||
      sections["coursework"] ||
      "";
    const items = splitBullets(block);
    if (items.length > 0) {
      result.training = items;
    }
  }

  // Volunteering
  if (sections["volunteering"] || sections["volunteer experience"]) {
    const block =
      sections["volunteering"] ||
      sections["volunteer experience"] ||
      "";
    const items = splitBullets(block);
    if (items.length > 0) {
      result.volunteering = items;
    }
  }

  // Extracurricular / Activities
  if (sections["extracurricular activities"] || sections["activities"]) {
    const block =
      sections["extracurricular activities"] ||
      sections["activities"] ||
      "";
    const items = splitBullets(block);
    if (items.length > 0) {
      result.activities = items;
    }
  }

  // Publications
  if (sections["publications"]) {
    const items = splitBullets(sections["publications"]);
    if (items.length > 0) {
      result.publications = items;
    }
  }

  // References
  if (sections["references"]) {
    result.references = sections["references"].trim();
  }

  // Declaration
  if (sections["declaration"]) {
    result.declaration = sections["declaration"].trim();
  }

  // ── 4. Remove null / empty entries ──────────────────────────
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (val === null || val === undefined) {
      delete result[key];
    } else if (typeof val === "string" && val.trim() === "") {
      delete result[key];
    } else if (Array.isArray(val) && val.length === 0) {
      delete result[key];
    }
  }

  return result;
}
