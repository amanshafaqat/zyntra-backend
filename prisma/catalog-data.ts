/**
 * Curated dataset from the Zyntra FYP documentation:
 * 5 countries × 5 universities × 5 Master's programs = 125 program entries,
 * plus 8 scholarships. Mirrors the frontend dataset byte-for-byte, including
 * the deterministic fee formula and stable slugs, so existing frontend IDs
 * keep working after the switch to live APIs.
 */

export const PROGRAM_NAMES = [
  "MSc Computer Science",
  "MSc Software Engineering",
  "MSc Artificial Intelligence",
  "MSc Data Science",
  "MSc Cybersecurity",
] as const;

export interface SeedUniversity {
  name: string;
  city: string;
  ranking: number;
  feeMin: number;
  feeMax: number;
  ieltsMin: number;
  cgpaMin: number;
  description: string;
}

export interface SeedCountry {
  name: string;
  flag: string;
  currency: string;
  pkrRate: number;
  portal: string;
  livingCostMonthly: number;
  universities: SeedUniversity[];
}

export const COUNTRIES: SeedCountry[] = [
  {
    name: "Germany", flag: "🇩🇪", currency: "EUR", pkrRate: 305, portal: "DAAD (daad.de)", livingCostMonthly: 950,
    universities: [
      { name: "University of Passau", city: "Passau", ranking: 801, feeMin: 0, feeMax: 500, ieltsMin: 6.5, cgpaMin: 2.8, description: "Strong computer science and digital sciences programs in Bavaria, with a compact riverside campus." },
      { name: "University of Paderborn", city: "Paderborn", ranking: 750, feeMin: 0, feeMax: 500, ieltsMin: 6.5, cgpaMin: 2.8, description: "A leading technical university with a strong emphasis on computing and engineering disciplines." },
      { name: "Technical University of Chemnitz", city: "Chemnitz", ranking: 800, feeMin: 0, feeMax: 300, ieltsMin: 6.0, cgpaMin: 2.6, description: "Innovative programs in smart systems, embedded intelligence, and data-driven technologies." },
      { name: "University of Duisburg-Essen", city: "Duisburg", ranking: 701, feeMin: 0, feeMax: 500, ieltsMin: 6.5, cgpaMin: 2.8, description: "One of the largest German universities with excellent research in computer science and AI." },
      { name: "Otto von Guericke University Magdeburg", city: "Magdeburg", ranking: 750, feeMin: 0, feeMax: 400, ieltsMin: 6.5, cgpaMin: 2.7, description: "Known for its Data and Knowledge Engineering department and strong industry partnerships." },
    ],
  },
  {
    name: "Australia", flag: "🇦🇺", currency: "AUD", pkrRate: 190, portal: "CRICOS (cricos.teqsa.gov.au)", livingCostMonthly: 2100,
    universities: [
      { name: "University of Wollongong", city: "Wollongong", ranking: 401, feeMin: 28000, feeMax: 36000, ieltsMin: 6.5, cgpaMin: 3.0, description: "Ranked in the top 1% globally, offering world-class AI and data science programs near Sydney." },
      { name: "Deakin University", city: "Melbourne", ranking: 401, feeMin: 30000, feeMax: 38000, ieltsMin: 6.5, cgpaMin: 3.0, description: "A leader in cybersecurity and data science education with strong industry connections in Melbourne." },
      { name: "Curtin University", city: "Perth", ranking: 401, feeMin: 29000, feeMax: 37000, ieltsMin: 6.5, cgpaMin: 3.0, description: "Innovative programs in AI and software engineering with excellent graduate employment outcomes." },
      { name: "Griffith University", city: "Brisbane", ranking: 401, feeMin: 27000, feeMax: 35000, ieltsMin: 6.5, cgpaMin: 2.9, description: "Flexible study options across Brisbane and Gold Coast campuses with great research facilities." },
      { name: "Queensland University of Technology", city: "Brisbane", ranking: 401, feeMin: 31000, feeMax: 40000, ieltsMin: 6.5, cgpaMin: 3.1, description: "Consistently ranked among the world's most innovative universities, strong in CS and AI." },
    ],
  },
  {
    name: "Ireland", flag: "🇮🇪", currency: "EUR", pkrRate: 305, portal: "Qualifax (qualifax.ie)", livingCostMonthly: 1400,
    universities: [
      { name: "Dublin City University", city: "Dublin", ranking: 421, feeMin: 15000, feeMax: 20000, ieltsMin: 6.5, cgpaMin: 3.0, description: "A young, dynamic university known for computing, security research, and industry placement." },
      { name: "University of Limerick", city: "Limerick", ranking: 426, feeMin: 14000, feeMax: 19000, ieltsMin: 6.5, cgpaMin: 2.9, description: "Ireland's first university with a cooperative education program and strong software engineering." },
      { name: "Maynooth University", city: "Maynooth", ranking: 671, feeMin: 13000, feeMax: 17000, ieltsMin: 6.5, cgpaMin: 2.8, description: "Renowned for computer science and geocomputation near Dublin at competitive tuition." },
      { name: "Technological University Dublin", city: "Dublin", ranking: 801, feeMin: 12000, feeMax: 16000, ieltsMin: 6.0, cgpaMin: 2.7, description: "Ireland's first technological university with practice-based computing and data programs." },
      { name: "University of Galway", city: "Galway", ranking: 289, feeMin: 16000, feeMax: 21000, ieltsMin: 6.5, cgpaMin: 3.0, description: "A research-led university on Ireland's west coast, strong in AI and data analytics." },
    ],
  },
  {
    name: "Italy", flag: "🇮🇹", currency: "EUR", pkrRate: 305, portal: "Universitaly (universitaly.it)", livingCostMonthly: 900,
    universities: [
      { name: "University of Bologna", city: "Bologna", ranking: 133, feeMin: 2000, feeMax: 4000, ieltsMin: 6.0, cgpaMin: 3.0, description: "The oldest university in the Western world, with top-ranked computer science and AI faculties." },
      { name: "Politecnico di Milano", city: "Milan", ranking: 111, feeMin: 3500, feeMax: 4500, ieltsMin: 6.0, cgpaMin: 3.1, description: "Italy's leading technical university, world-renowned for engineering and computer science." },
      { name: "Sapienza University of Rome", city: "Rome", ranking: 132, feeMin: 1500, feeMax: 3000, ieltsMin: 6.0, cgpaMin: 2.9, description: "One of Europe's largest universities with comprehensive computing and cybersecurity programs." },
      { name: "University of Padua", city: "Padua", ranking: 219, feeMin: 2000, feeMax: 3500, ieltsMin: 6.0, cgpaMin: 2.9, description: "A historic research university with modern data science and AI master's degrees." },
      { name: "University of Trento", city: "Trento", ranking: 429, feeMin: 1000, feeMax: 3000, ieltsMin: 6.0, cgpaMin: 2.8, description: "A compact alpine university consistently top-rated in Italy for computer science research." },
    ],
  },
  {
    name: "Finland", flag: "🇫🇮", currency: "EUR", pkrRate: 305, portal: "Studyinfo (studyinfo.fi)", livingCostMonthly: 1100,
    universities: [
      { name: "Aalto University", city: "Espoo", ranking: 109, feeMin: 15000, feeMax: 17000, ieltsMin: 6.5, cgpaMin: 3.2, description: "Finland's innovation powerhouse, blending technology, business, and design excellence." },
      { name: "University of Helsinki", city: "Helsinki", ranking: 115, feeMin: 13000, feeMax: 15000, ieltsMin: 6.5, cgpaMin: 3.2, description: "The top-ranked university in Finland with a world-class computer science department." },
      { name: "Tampere University", city: "Tampere", ranking: 436, feeMin: 10000, feeMax: 12000, ieltsMin: 6.5, cgpaMin: 3.0, description: "A multidisciplinary university strong in software engineering and human-technology interaction." },
      { name: "University of Oulu", city: "Oulu", ranking: 313, feeMin: 10000, feeMax: 13000, ieltsMin: 6.0, cgpaMin: 2.9, description: "A northern technology hub known for wireless communications, AI, and applied computing." },
      { name: "LUT University", city: "Lappeenranta", ranking: 351, feeMin: 9500, feeMax: 11500, ieltsMin: 6.0, cgpaMin: 2.8, description: "A science university focused on clean energy, systems engineering, and software business." },
    ],
  },
];

/** Deadlines spread across the coming intake cycle, deterministic per entry. */
export const DEADLINE_MONTHS = [
  "2026-09-15", "2026-10-01", "2026-10-31", "2026-11-30", "2026-12-15",
  "2027-01-15", "2027-02-01", "2027-03-15",
] as const;

export function intakeLabelFor(deadlineIso: string): string {
  const d = new Date(deadlineIso);
  const month = d.getUTCMonth() + 1;
  const year = d.getUTCFullYear();
  // Deadlines through December feed the following year's Fall intake;
  // January–March deadlines feed the same year's Fall intake.
  return month >= 9 ? `Fall ${year + 1}` : `Fall ${year}`;
}

export const slugify = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Deterministic fee for entry #seq — identical to the frontend formula. */
export const feeFor = (uni: SeedUniversity, seq: number): number =>
  uni.feeMin + Math.round(((uni.feeMax - uni.feeMin) * ((seq * 37) % 100)) / 100);

export interface SeedScholarship {
  name: string;
  country: string;
  flag: string;
  amount: string;
  deadline: string;
  coverage: "Full" | "Partial";
  description: string;
  eligiblePrograms: string[];
}

const ALL = [...PROGRAM_NAMES];

export const SCHOLARSHIPS: SeedScholarship[] = [
  { name: "DAAD Scholarship", country: "Germany", flag: "🇩🇪", amount: "Full tuition + €934/month stipend", deadline: "2026-10-15", eligiblePrograms: ALL, coverage: "Full", description: "The German Academic Exchange Service offers comprehensive scholarships for international master's students at German universities." },
  { name: "Australia Awards", country: "Australia", flag: "🇦🇺", amount: "Full tuition + AUD 27,000/year", deadline: "2026-11-30", eligiblePrograms: ["MSc Computer Science", "MSc Artificial Intelligence"], coverage: "Full", description: "Prestigious Australian Government scholarships offering full support for study in Australia." },
  { name: "Government of Ireland Scholarship", country: "Ireland", flag: "🇮🇪", amount: "€10,000 one-time grant", deadline: "2027-03-31", eligiblePrograms: ALL, coverage: "Partial", description: "Awarded by the Government of Ireland to outstanding international students pursuing higher education." },
  { name: "UniBO International Merit Award", country: "Italy", flag: "🇮🇹", amount: "€5,000/year tuition reduction", deadline: "2027-02-28", eligiblePrograms: ["MSc Data Science", "MSc Computer Science"], coverage: "Partial", description: "University of Bologna's merit-based scholarship for international students with excellent academic records." },
  { name: "Finland Scholarship Programme", country: "Finland", flag: "🇫🇮", amount: "Full tuition fee waiver", deadline: "2027-01-31", eligiblePrograms: ALL, coverage: "Full", description: "Finnish universities offer competitive tuition waivers for international students demonstrating academic excellence." },
  { name: "Tampere University Excellence", country: "Finland", flag: "🇫🇮", amount: "€5,000 one-time award", deadline: "2027-02-15", eligiblePrograms: ["MSc Software Engineering", "MSc Artificial Intelligence"], coverage: "Partial", description: "Tampere University's excellence scholarships recognise outstanding international applicants in technology fields." },
  { name: "DCU International Merit", country: "Ireland", flag: "🇮🇪", amount: "€4,000 per year", deadline: "2027-03-15", eligiblePrograms: ["MSc Computer Science", "MSc Cybersecurity"], coverage: "Partial", description: "Dublin City University awards this to high-achieving international postgraduate students." },
  { name: "QUT International Scholarship", country: "Australia", flag: "🇦🇺", amount: "AUD 10,000/year", deadline: "2026-12-31", eligiblePrograms: ALL, coverage: "Partial", description: "Queensland University of Technology offers competitive merit-based awards for international postgraduate students." },
];
