// PHI tripwire: reject text that looks like it carries a real identifier. It keys on
// labels, not shapes, where a shape alone would match our own synthetic letters (every
// letter has a denial date). It never returns or logs the matched text. Names are not
// checked: that can't be done reliably, and the demo states it takes synthetic data only.

export type PhiKind = "ssn" | "mbi" | "dob" | "phone" | "street_address";

const DATE = String.raw`(?:\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}|\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.? \d{1,2},? \d{4})`;
// Medicare Beneficiary Identifier: 11 characters in fixed letter/digit positions,
// letters never S, L, O, I, B or Z; often printed with dashes after 4 and 7.
const L = "[AC-HJKMNP-RT-Y]";
const A = "[AC-HJKMNP-RT-Y0-9]";
const MBI = `[1-9]${L}${A}[0-9]-?${L}${A}[0-9]-?${L}${L}[0-9]{2}`;
const SUFFIX = "Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl|Terrace|Crescent|Cres|Parkway|Pkwy|Highway|Hwy";

const PATTERNS: Record<PhiKind, RegExp[]> = {
  ssn: [/\b\d{3}-\d{2}-\d{4}\b/, /\b(?:SSN|social security(?: number| no\.?)?)\W{0,15}\d{9}\b/i],
  mbi: [new RegExp(String.raw`\b${MBI}\b`)],
  dob: [new RegExp(String.raw`\b(?:DOB|D\.O\.B\.?|date of birth|birth ?date|born(?: on)?)\W{0,20}${DATE}`, "i")],
  phone: [/(?:\+?1[\s.-]?)?(?:\(\d{3}\)\s?|\b\d{3}[\s.-])\d{3}[\s.-]\d{4}\b/],
  street_address: [new RegExp(String.raw`\b\d{1,6}\s+(?:[A-Z][a-z]+\s+){1,3}(?:${SUFFIX})\b`)],
};

export function phiFindings(text: string): PhiKind[] {
  return (Object.keys(PATTERNS) as PhiKind[]).filter((k) => PATTERNS[k].some((re) => re.test(text)));
}
