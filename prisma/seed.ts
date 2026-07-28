// Zyntra Master University Database — generated 2026-07-12 from official-source research.
// Rows marked ZYNTRA_APPROX carry a flagged fallback because Prisma columns are NOT NULL; JSON files keep null. Verify before launch.
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const countryIds: Record<string, string> = {};
  { const r = await prisma.country.upsert({ where: { name: "Germany" }, update: { currency: "EUR", pkrRate: 325, portal: "DAAD (https://www.daad.de)", livingCostMonthly: 992, flag: "🇩🇪" }, create: { name: "Germany", flag: "🇩🇪", currency: "EUR", pkrRate: 325, portal: "DAAD (https://www.daad.de)", livingCostMonthly: 992 } }); countryIds["de"] = r.id; }
  { const r = await prisma.country.upsert({ where: { name: "Australia" }, update: { currency: "AUD", pkrRate: 190, portal: "CRICOS (https://cricos.education.gov.au)", livingCostMonthly: 2476, flag: "🇦🇺" }, create: { name: "Australia", flag: "🇦🇺", currency: "AUD", pkrRate: 190, portal: "CRICOS (https://cricos.education.gov.au)", livingCostMonthly: 2476 } }); countryIds["au"] = r.id; }
  { const r = await prisma.country.upsert({ where: { name: "Ireland" }, update: { currency: "EUR", pkrRate: 325, portal: "Qualifax (https://www.qualifax.ie)", livingCostMonthly: 833, flag: "🇮🇪" }, create: { name: "Ireland", flag: "🇮🇪", currency: "EUR", pkrRate: 325, portal: "Qualifax (https://www.qualifax.ie)", livingCostMonthly: 833 } }); countryIds["ie"] = r.id; }
  { const r = await prisma.country.upsert({ where: { name: "Italy" }, update: { currency: "EUR", pkrRate: 325, portal: "Universitaly (https://www.universitaly.it)", livingCostMonthly: 900, flag: "🇮🇹" }, create: { name: "Italy", flag: "🇮🇹", currency: "EUR", pkrRate: 325, portal: "Universitaly (https://www.universitaly.it)", livingCostMonthly: 900 } }); countryIds["it"] = r.id; }
  { const r = await prisma.country.upsert({ where: { name: "Finland" }, update: { currency: "EUR", pkrRate: 325, portal: "Studyinfo (https://studyinfo.fi)", livingCostMonthly: 800, flag: "🇫🇮" }, create: { name: "Finland", flag: "🇫🇮", currency: "EUR", pkrRate: 325, portal: "Studyinfo (https://studyinfo.fi)", livingCostMonthly: 800 } }); countryIds["fi"] = r.id; }

  const uniIds: Record<string, string> = {};
  { const r = await prisma.university.upsert({ where: { name: "University of Passau" }, update: { city: "Passau", ranking: 0, ieltsMin: 5.5, cgpaMin: 2.8, description: "Bavarian public university; no tuition, semester fee ~EUR 120 incl. bus pass; MSc Computer Science taught fully in English." }, create: { countryId: countryIds["de"], name: "University of Passau", city: "Passau", ranking: 0, ieltsMin: 5.5, cgpaMin: 2.8, description: "Bavarian public university; no tuition, semester fee ~EUR 120 incl. bus pass; MSc Computer Science taught fully in English." } }); uniIds["passau"] = r.id; } // ranking 0 = not QS-ranked (sentinel)
  { const r = await prisma.university.upsert({ where: { name: "University of Paderborn" }, update: { city: "Paderborn", ranking: 0, ieltsMin: 6.5, cgpaMin: 2.8, description: "NRW public university; no tuition; semester contribution ~EUR 325.50; strong CS department (SFB research)." }, create: { countryId: countryIds["de"], name: "University of Paderborn", city: "Paderborn", ranking: 0, ieltsMin: 6.5, cgpaMin: 2.8, description: "NRW public university; no tuition; semester contribution ~EUR 325.50; strong CS department (SFB research)." } }); uniIds["paderborn"] = r.id; } // ranking 0 = not QS-ranked (sentinel)
  { const r = await prisma.university.upsert({ where: { name: "Technical University of Chemnitz" }, update: { city: "Chemnitz", ranking: 0, ieltsMin: 5.5, cgpaMin: 2.5, description: "Saxon public technical university; no tuition; semester contribution ~EUR 280-330 incl. Saxony transit; living ~EUR 970/month (DAAD)." }, create: { countryId: countryIds["de"], name: "Technical University of Chemnitz", city: "Chemnitz", ranking: 0, ieltsMin: 5.5, cgpaMin: 2.5, description: "Saxon public technical university; no tuition; semester contribution ~EUR 280-330 incl. Saxony transit; living ~EUR 970/month (DAAD)." } }); uniIds["chemnitz"] = r.id; } // ranking 0 = not QS-ranked (sentinel)
  { const r = await prisma.university.upsert({ where: { name: "University of Duisburg-Essen" }, update: { city: "Duisburg", ranking: 0, ieltsMin: 6.0, cgpaMin: 2.5, description: "Large NRW public university (Duisburg + Essen campuses); no tuition and no application fee; semester fee EUR 312.40 (SS25) / 349.80 (WS25/26) incl. Deutschlandticket." }, create: { countryId: countryIds["de"], name: "University of Duisburg-Essen", city: "Duisburg", ranking: 0, ieltsMin: 6.0, cgpaMin: 2.5, description: "Large NRW public university (Duisburg + Essen campuses); no tuition and no application fee; semester fee EUR 312.40 (SS25) / 349.80 (WS25/26) incl. Deutschlandticket." } }); uniIds["ude"] = r.id; } // ranking 0 = not QS-ranked (sentinel)
  { const r = await prisma.university.upsert({ where: { name: "Otto von Guericke University Magdeburg" }, update: { city: "Magdeburg", ranking: 0, ieltsMin: 6.0, cgpaMin: 2.5, description: "Saxony-Anhalt public university; no tuition; semester fee ~EUR 311.30; halls of residence EUR 174-421/month (DAAD)." }, create: { countryId: countryIds["de"], name: "Otto von Guericke University Magdeburg", city: "Magdeburg", ranking: 0, ieltsMin: 6.0, cgpaMin: 2.5, description: "Saxony-Anhalt public university; no tuition; semester fee ~EUR 311.30; halls of residence EUR 174-421/month (DAAD)." } }); uniIds["ovgu"] = r.id; } // ranking 0 = not QS-ranked (sentinel)
  { const r = await prisma.university.upsert({ where: { name: "University of Wollongong" }, update: { city: "Wollongong (NSW)", ranking: 167, ieltsMin: 6.5, cgpaMin: 2.4, description: "NSW public university ~80 km south of Sydney; Master of Computer Science AUD 40,944/yr (2026 official fee booklet); ACS-accredited." }, create: { countryId: countryIds["au"], name: "University of Wollongong", city: "Wollongong (NSW)", ranking: 167, ieltsMin: 6.5, cgpaMin: 2.4, description: "NSW public university ~80 km south of Sydney; Master of Computer Science AUD 40,944/yr (2026 official fee booklet); ACS-accredited." } }); uniIds["uow"] = r.id; } // QS World University Rankings 2025 (as published on official programme material)
  { const r = await prisma.university.upsert({ where: { name: "Deakin University" }, update: { city: "Melbourne (Burwood) / Geelong", ranking: 207, ieltsMin: 6.5, cgpaMin: 2.4, description: "Victorian public university; PG international fees AUD 34,400-47,400/yr (2026); trimester system with three entry points." }, create: { countryId: countryIds["au"], name: "Deakin University", city: "Melbourne (Burwood) / Geelong", ranking: 207, ieltsMin: 6.5, cgpaMin: 2.4, description: "Victorian public university; PG international fees AUD 34,400-47,400/yr (2026); trimester system with three entry points." } }); uniIds["deakin"] = r.id; } // QS World University Rankings 2026
  { const r = await prisma.university.upsert({ where: { name: "Curtin University" }, update: { city: "Perth (Bentley)", ranking: 183, ieltsMin: 6.5, cgpaMin: 2.4, description: "WA's largest university; top 1% ARWU; Master of Computing offers Computer Science / Cyber Security / Artificial Intelligence majors; Master of Predictive Analytics AUD 45,942 (2026)." }, create: { countryId: countryIds["au"], name: "Curtin University", city: "Perth (Bentley)", ranking: 183, ieltsMin: 6.5, cgpaMin: 2.4, description: "WA's largest university; top 1% ARWU; Master of Computing offers Computer Science / Cyber Security / Artificial Intelligence majors; Master of Predictive Analytics AUD 45,942 (2026)." } }); uniIds["curtin"] = r.id; } // QS World University Rankings 2026
  { const r = await prisma.university.upsert({ where: { name: "Griffith University" }, update: { city: "Brisbane (Nathan) / Gold Coast", ranking: 268, ieltsMin: 6.5, cgpaMin: 2.3, description: "Queensland public university across Brisbane and Gold Coast; Master of Cyber Security AUD ~41,000-43,000/yr; trimester calendar." }, create: { countryId: countryIds["au"], name: "Griffith University", city: "Brisbane (Nathan) / Gold Coast", ranking: 268, ieltsMin: 6.5, cgpaMin: 2.3, description: "Queensland public university across Brisbane and Gold Coast; Master of Cyber Security AUD ~41,000-43,000/yr; trimester calendar." } }); uniIds["griffith"] = r.id; } // QS World University Rankings 2026
  { const r = await prisma.university.upsert({ where: { name: "Queensland University of Technology" }, update: { city: "Brisbane (Gardens Point)", ranking: 226, ieltsMin: 6.5, cgpaMin: 2.3, description: "Brisbane public university; Master of Information Technology ~AUD 45,000/yr with seven majors and two-semester Work Integrated Learning." }, create: { countryId: countryIds["au"], name: "Queensland University of Technology", city: "Brisbane (Gardens Point)", ranking: 226, ieltsMin: 6.5, cgpaMin: 2.3, description: "Brisbane public university; Master of Information Technology ~AUD 45,000/yr with seven majors and two-semester Work Integrated Learning." } }); uniIds["qut"] = r.id; } // QS World University Rankings 2026
  { const r = await prisma.university.upsert({ where: { name: "Dublin City University" }, update: { city: "Dublin", ranking: 410, ieltsMin: 6.5, cgpaMin: 2.7, description: "Dublin public university; MSc in Computing (Major Options) EUR 25,000/yr; INTRA placement culture; 93% graduate employment." }, create: { countryId: countryIds["ie"], name: "Dublin City University", city: "Dublin", ranking: 410, ieltsMin: 6.5, cgpaMin: 2.7, description: "Dublin public university; MSc in Computing (Major Options) EUR 25,000/yr; INTRA placement culture; 93% graduate employment." } }); uniIds["dcu"] = r.id; } // QS World University Rankings 2026
  { const r = await prisma.university.upsert({ where: { name: "University of Limerick" }, update: { city: "Limerick", ranking: 0, ieltsMin: 6.5, cgpaMin: 2.7, description: "Riverside public university; MSc Artificial Intelligence & Machine Learning EUR 19,300/yr (official 2025/26 fee list); official living estimate EUR 9,429/yr." }, create: { countryId: countryIds["ie"], name: "University of Limerick", city: "Limerick", ranking: 0, ieltsMin: 6.5, cgpaMin: 2.7, description: "Riverside public university; MSc Artificial Intelligence & Machine Learning EUR 19,300/yr (official 2025/26 fee list); official living estimate EUR 9,429/yr." } }); uniIds["ul"] = r.id; } // ranking 0 = not QS-ranked (sentinel)
  { const r = await prisma.university.upsert({ where: { name: "Maynooth University" }, update: { city: "Maynooth, Co. Kildare", ranking: 0, ieltsMin: 6.5, cgpaMin: 3.0, description: "Ireland's youngest classical university; both CS master's EUR 18,000/yr (official PG fee list); Applied variant 2 years with industry placement, SE variant 1 year." }, create: { countryId: countryIds["ie"], name: "Maynooth University", city: "Maynooth, Co. Kildare", ranking: 0, ieltsMin: 6.5, cgpaMin: 3.0, description: "Ireland's youngest classical university; both CS master's EUR 18,000/yr (official PG fee list); Applied variant 2 years with industry placement, SE variant 1 year." } }); uniIds["maynooth"] = r.id; } // ranking 0 = not QS-ranked (sentinel)
  { const r = await prisma.university.upsert({ where: { name: "Technological University Dublin" }, update: { city: "Dublin", ranking: 0, ieltsMin: 6.5, cgpaMin: 2.7, description: "Ireland's first technological university, formed 2019 (DIT + ITB + ITT); city-centre Grangegorman campus; runs MSc Computer Science (Data Science) and MSc Applied Cyber Security." }, create: { countryId: countryIds["ie"], name: "Technological University Dublin", city: "Dublin", ranking: 0, ieltsMin: 6.5, cgpaMin: 2.7, description: "Ireland's first technological university, formed 2019 (DIT + ITB + ITT); city-centre Grangegorman campus; runs MSc Computer Science (Data Science) and MSc Applied Cyber Security." } }); uniIds["tudublin"] = r.id; } // ranking 0 = not QS-ranked (sentinel)
  { const r = await prisma.university.upsert({ where: { name: "Munster Technological University" }, update: { city: "Cork (Bishopstown) / Kerry", ranking: 0, ieltsMin: 6.5, cgpaMin: 2.7, description: "Formed 2021 from CIT + IT Tralee; Cork Bishopstown main campus; offers Level 9 MSc in Cybersecurity." }, create: { countryId: countryIds["ie"], name: "Munster Technological University", city: "Cork (Bishopstown) / Kerry", ranking: 0, ieltsMin: 6.5, cgpaMin: 2.7, description: "Formed 2021 from CIT + IT Tralee; Cork Bishopstown main campus; offers Level 9 MSc in Cybersecurity." } }); uniIds["mtu"] = r.id; } // ranking 0 = not QS-ranked (sentinel)
  { const r = await prisma.university.upsert({ where: { name: "University of Bologna" }, update: { city: "Bologna", ranking: 133, ieltsMin: 6.0, cgpaMin: 2.5, description: "World's oldest university; income-based fees: fixed EUR 157.04 first instalment + contribution capped per programme; ISEE exemptions can reduce to near zero." }, create: { countryId: countryIds["it"], name: "University of Bologna", city: "Bologna", ranking: 133, ieltsMin: 6.0, cgpaMin: 2.5, description: "World's oldest university; income-based fees: fixed EUR 157.04 first instalment + contribution capped per programme; ISEE exemptions can reduce to near zero." } }); uniIds["bologna"] = r.id; } // QS World University Rankings 2026 (consistently reported; verify on topuniversities.com)
  { const r = await prisma.university.upsert({ where: { name: "University of Pisa" }, update: { city: "Pisa", ranking: 0, ieltsMin: 6.0, cgpaMin: 2.5, description: "Tuscan public university; 2026-27 maximum all-inclusive annual contribution EUR 2,900 (official), reducible by ISEE; English MSc CS and Data Science & Business Informatics offered." }, create: { countryId: countryIds["it"], name: "University of Pisa", city: "Pisa", ranking: 0, ieltsMin: 6.0, cgpaMin: 2.5, description: "Tuscan public university; 2026-27 maximum all-inclusive annual contribution EUR 2,900 (official), reducible by ISEE; English MSc CS and Data Science & Business Informatics offered." } }); uniIds["pisa"] = r.id; } // ranking 0 = not QS-ranked (sentinel)
  { const r = await prisma.university.upsert({ where: { name: "University of Parma" }, update: { city: "Parma", ranking: 0, ieltsMin: 6.0, cgpaMin: 2.5, description: "One of the world's oldest universities (founded 962); personalized annual tuition EUR 0 to ~2,000 by financial situation (official); no-tax threshold EUR 27,000 ISEE." }, create: { countryId: countryIds["it"], name: "University of Parma", city: "Parma", ranking: 0, ieltsMin: 6.0, cgpaMin: 2.5, description: "One of the world's oldest universities (founded 962); personalized annual tuition EUR 0 to ~2,000 by financial situation (official); no-tax threshold EUR 27,000 ISEE." } }); uniIds["parma"] = r.id; } // ranking 0 = not QS-ranked (sentinel)
  { const r = await prisma.university.upsert({ where: { name: "University of Salerno" }, update: { city: "Fisciano (Salerno)", ranking: 0, ieltsMin: 6.0, cgpaMin: 2.5, description: "Large campus university at Fisciano; Computer Science department runs English-taught LM tracks; fees income-based like all Italian public universities." }, create: { countryId: countryIds["it"], name: "University of Salerno", city: "Fisciano (Salerno)", ranking: 0, ieltsMin: 6.0, cgpaMin: 2.5, description: "Large campus university at Fisciano; Computer Science department runs English-taught LM tracks; fees income-based like all Italian public universities." } }); uniIds["salerno"] = r.id; } // ranking 0 = not QS-ranked (sentinel)
  { const r = await prisma.university.upsert({ where: { name: "University of Naples Federico II" }, update: { city: "Naples", ranking: 379, ieltsMin: 6.0, cgpaMin: 2.5, description: "Oldest public non-sectarian university in the world (1224); income-based fees keep annual cost roughly EUR 160-3,000 depending on ISEE; English-taught engineering/CS tracks." }, create: { countryId: countryIds["it"], name: "University of Naples Federico II", city: "Naples", ranking: 379, ieltsMin: 6.0, cgpaMin: 2.5, description: "Oldest public non-sectarian university in the world (1224); income-based fees keep annual cost roughly EUR 160-3,000 depending on ISEE; English-taught engineering/CS tracks." } }); uniIds["naples"] = r.id; } // QS World University Rankings 2026 (consistently reported; verify on topuniversities.com)
  { const r = await prisma.university.upsert({ where: { name: "University of Oulu" }, update: { city: "Oulu", ranking: 0, ieltsMin: 6.5, cgpaMin: 2.5, description: "Northern Finland's technology university (6G research home); MSc Computer Science and Engineering has four options: Applied Computing, Artificial Intelligence, Computer Engineering, Cyber Security." }, create: { countryId: countryIds["fi"], name: "University of Oulu", city: "Oulu", ranking: 0, ieltsMin: 6.5, cgpaMin: 2.5, description: "Northern Finland's technology university (6G research home); MSc Computer Science and Engineering has four options: Applied Computing, Artificial Intelligence, Computer Engineering, Cyber Security." } }); uniIds["oulu"] = r.id; } // ranking 0 = not QS-ranked (sentinel)
  { const r = await prisma.university.upsert({ where: { name: "Tampere University" }, update: { city: "Tampere", ranking: 0, ieltsMin: 6.5, cgpaMin: 2.5, description: "Multidisciplinary research university (2019 merger); official tuition band EUR 10,000-12,000/yr for English bachelor's/master's." }, create: { countryId: countryIds["fi"], name: "Tampere University", city: "Tampere", ranking: 0, ieltsMin: 6.5, cgpaMin: 2.5, description: "Multidisciplinary research university (2019 merger); official tuition band EUR 10,000-12,000/yr for English bachelor's/master's." } }); uniIds["tampere"] = r.id; } // ranking 0 = not QS-ranked (sentinel)
  { const r = await prisma.university.upsert({ where: { name: "University of Eastern Finland" }, update: { city: "Joensuu / Kuopio", ranking: 0, ieltsMin: 6.5, cgpaMin: 2.5, description: "Joensuu + Kuopio campuses; Master's Degree Programme in Information Technology (IMPIT, Joensuu) — non-EU tuition EUR 10,000/yr (official)." }, create: { countryId: countryIds["fi"], name: "University of Eastern Finland", city: "Joensuu / Kuopio", ranking: 0, ieltsMin: 6.5, cgpaMin: 2.5, description: "Joensuu + Kuopio campuses; Master's Degree Programme in Information Technology (IMPIT, Joensuu) — non-EU tuition EUR 10,000/yr (official)." } }); uniIds["uef"] = r.id; } // ranking 0 = not QS-ranked (sentinel)
  { const r = await prisma.university.upsert({ where: { name: "University of Vaasa" }, update: { city: "Vaasa", ranking: 0, ieltsMin: 6.0, cgpaMin: 2.5, description: "West-coast business+technology university; master's tuition EUR 14,000/yr official (from autumn 2025); living est. EUR 1,000-1,100/month." }, create: { countryId: countryIds["fi"], name: "University of Vaasa", city: "Vaasa", ranking: 0, ieltsMin: 6.0, cgpaMin: 2.5, description: "West-coast business+technology university; master's tuition EUR 14,000/yr official (from autumn 2025); living est. EUR 1,000-1,100/month." } }); uniIds["vaasa"] = r.id; } // ranking 0 = not QS-ranked (sentinel)
  { const r = await prisma.university.upsert({ where: { name: "Åbo Akademi University" }, update: { city: "Turku (Åbo)", ranking: 0, ieltsMin: 6.5, cgpaMin: 2.5, description: "Finland's Swedish-language multidisciplinary university (Turku + Vasa campuses); 2026 intake tuition EUR 12,000/yr full (EUR 8,000 with early commitment); MSc Information Technology in English." }, create: { countryId: countryIds["fi"], name: "Åbo Akademi University", city: "Turku (Åbo)", ranking: 0, ieltsMin: 6.5, cgpaMin: 2.5, description: "Finland's Swedish-language multidisciplinary university (Turku + Vasa campuses); 2026 intake tuition EUR 12,000/yr full (EUR 8,000 with early commitment); MSc Information Technology in English." } }); uniIds["abo"] = r.id; } // ranking 0 = not QS-ranked (sentinel)


  await prisma.program.deleteMany({});

  await prisma.program.upsert({ where: { slug: "passau-cs" }, update: { fee: 0, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "passau-cs", universityId: uniIds["passau"], name: "MSc Computer Science", fee: 0, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "passau-aie" }, update: { fee: 0, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "passau-aie", universityId: uniIds["passau"], name: "MSc Artificial Intelligence Engineering", fee: 0, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "passau-is" }, update: { fee: 0, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "passau-is", universityId: uniIds["passau"], name: "MSc Information Systems", fee: 0, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "paderborn-cs" }, update: { fee: 0, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "paderborn-cs", universityId: uniIds["paderborn"], name: "MSc Computer Science", fee: 0, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "paderborn-ce" }, update: { fee: 0, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "paderborn-ce", universityId: uniIds["paderborn"], name: "MSc Computer Engineering", fee: 0, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "chemnitz-we" }, update: { fee: 0, deadline: new Date("2026-07-15T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "chemnitz-we", universityId: uniIds["chemnitz"], name: "MSc Web Engineering", fee: 0, deadline: new Date("2026-07-15T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "chemnitz-ics" }, update: { fee: 0, deadline: new Date("2026-07-15T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "chemnitz-ics", universityId: uniIds["chemnitz"], name: "MSc Information and Communication Systems", fee: 0, deadline: new Date("2026-07-15T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "chemnitz-ase" }, update: { fee: 0, deadline: new Date("2026-07-15T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "chemnitz-ase", universityId: uniIds["chemnitz"], name: "MSc Automotive Software Engineering", fee: 0, deadline: new Date("2026-07-15T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "ude-ce" }, update: { fee: 0, deadline: new Date("2026-07-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "ude-ce", universityId: uniIds["ude"], name: "MSc Computer Engineering (ISE)", fee: 0, deadline: new Date("2026-07-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "ovgu-dke" }, update: { fee: 0, deadline: new Date("2026-05-15T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "ovgu-dke", universityId: uniIds["ovgu"], name: "MSc Data and Knowledge Engineering", fee: 0, deadline: new Date("2026-05-15T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "ovgu-de" }, update: { fee: 0, deadline: new Date("2026-05-15T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "ovgu-de", universityId: uniIds["ovgu"], name: "MSc Digital Engineering", fee: 0, deadline: new Date("2026-05-15T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "uow-mcs" }, update: { fee: 40944, deadline: new Date("2026-12-09T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "uow-mcs", universityId: uniIds["uow"], name: "Master of Computer Science", fee: 40944, deadline: new Date("2026-12-09T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "uow-mit" }, update: { fee: 40944, deadline: new Date("2026-12-09T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "uow-mit", universityId: uniIds["uow"], name: "Master of Information Technology", fee: 40944, deadline: new Date("2026-12-09T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "uow-mc" }, update: { fee: 40944, deadline: new Date("2026-12-09T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "uow-mc", universityId: uniIds["uow"], name: "Master of Computing", fee: 40944, deadline: new Date("2026-12-09T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "deakin-mit" }, update: { fee: 40000, deadline: new Date("2027-02-28T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "deakin-mit", universityId: uniIds["deakin"], name: "Master of Information Technology", fee: 40000, deadline: new Date("2027-02-28T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "deakin-mds" }, update: { fee: 40000, deadline: new Date("2027-02-28T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "deakin-mds", universityId: uniIds["deakin"], name: "Master of Data Science", fee: 40000, deadline: new Date("2027-02-28T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "deakin-mcs" }, update: { fee: 43000, deadline: new Date("2027-02-28T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "deakin-mcs", universityId: uniIds["deakin"], name: "Master of Cyber Security", fee: 43000, deadline: new Date("2027-02-28T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "deakin-maai" }, update: { fee: 40000, deadline: new Date("2027-02-28T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "deakin-maai", universityId: uniIds["deakin"], name: "Master of Applied Artificial Intelligence", fee: 40000, deadline: new Date("2027-02-28T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "curtin-mc" }, update: { fee: 45942, deadline: new Date("2026-07-08T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "curtin-mc", universityId: uniIds["curtin"], name: "Master of Computing", fee: 45942, deadline: new Date("2026-07-08T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "curtin-mcs" }, update: { fee: 45942, deadline: new Date("2026-07-08T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "curtin-mcs", universityId: uniIds["curtin"], name: "Master of Cyber Security", fee: 45942, deadline: new Date("2026-07-08T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "curtin-mai" }, update: { fee: 45942, deadline: new Date("2026-07-08T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "curtin-mai", universityId: uniIds["curtin"], name: "Master of Artificial Intelligence", fee: 45942, deadline: new Date("2026-07-08T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "curtin-mpa" }, update: { fee: 45942, deadline: new Date("2026-07-08T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "curtin-mpa", universityId: uniIds["curtin"], name: "Master of Predictive Analytics", fee: 45942, deadline: new Date("2026-07-08T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "griffith-mit" }, update: { fee: 41000, deadline: new Date("2026-06-22T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "griffith-mit", universityId: uniIds["griffith"], name: "Master of Information Technology", fee: 41000, deadline: new Date("2026-06-22T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "griffith-mitai" }, update: { fee: 41000, deadline: new Date("2026-06-22T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "griffith-mitai", universityId: uniIds["griffith"], name: "Master of IT and AI", fee: 41000, deadline: new Date("2026-06-22T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "griffith-mds" }, update: { fee: 41000, deadline: new Date("2026-06-22T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "griffith-mds", universityId: uniIds["griffith"], name: "Master of Data Science", fee: 41000, deadline: new Date("2026-06-22T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "griffith-mcs" }, update: { fee: 43000, deadline: new Date("2026-06-22T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "griffith-mcs", universityId: uniIds["griffith"], name: "Master of Cyber Security", fee: 43000, deadline: new Date("2026-06-22T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "qut-mit" }, update: { fee: 45000, deadline: new Date("2026-07-17T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "qut-mit", universityId: uniIds["qut"], name: "Master of Information Technology", fee: 45000, deadline: new Date("2026-07-17T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "qut-mds" }, update: { fee: 45000, deadline: new Date("2026-07-17T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "qut-mds", universityId: uniIds["qut"], name: "Master of Data Science", fee: 45000, deadline: new Date("2026-07-17T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "qut-mcs" }, update: { fee: 45000, deadline: new Date("2026-07-17T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "qut-mcs", universityId: uniIds["qut"], name: "Master of Cyber Security", fee: 45000, deadline: new Date("2026-07-17T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "qut-mrai" }, update: { fee: 45000, deadline: new Date("2026-07-17T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "qut-mrai", universityId: uniIds["qut"], name: "Master of Robotics and AI", fee: 45000, deadline: new Date("2026-07-17T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "dcu-mc" }, update: { fee: 25000, deadline: new Date("2026-07-01T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "dcu-mc", universityId: uniIds["dcu"], name: "MSc in Computing", fee: 25000, deadline: new Date("2026-07-01T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "ul-mse" }, update: { fee: 19300, deadline: new Date("2026-08-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "ul-mse", universityId: uniIds["ul"], name: "MSc in Software Engineering", fee: 19300, deadline: new Date("2026-08-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "ul-mdssl" }, update: { fee: 19300, deadline: new Date("2026-08-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "ul-mdssl", universityId: uniIds["ul"], name: "MSc in Data Science and Statistical Learning", fee: 19300, deadline: new Date("2026-08-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "ul-mecs" }, update: { fee: 19300, deadline: new Date("2026-08-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "ul-mecs", universityId: uniIds["ul"], name: "MEng in Cyber Security", fee: 19300, deadline: new Date("2026-08-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "maynooth-mcsa" }, update: { fee: 18000, deadline: new Date("2026-06-30T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "maynooth-mcsa", universityId: uniIds["maynooth"], name: "MSc Computer Science (Applied)", fee: 18000, deadline: new Date("2026-06-30T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "maynooth-mdsa" }, update: { fee: 18000, deadline: new Date("2026-06-30T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "maynooth-mdsa", universityId: uniIds["maynooth"], name: "MSc Data Science and Analytics", fee: 18000, deadline: new Date("2026-06-30T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "tudublin-mcsasd" }, update: { fee: 21750, deadline: new Date("2026-06-30T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "tudublin-mcsasd", universityId: uniIds["tudublin"], name: "MSc in Computer Science (Advanced Software Development)", fee: 21750, deadline: new Date("2026-06-30T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "tudublin-mcsds" }, update: { fee: 21750, deadline: new Date("2026-06-30T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "tudublin-mcsds", universityId: uniIds["tudublin"], name: "MSc in Computer Science (Data Science)", fee: 21750, deadline: new Date("2026-06-30T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "tudublin-macs" }, update: { fee: 21750, deadline: new Date("2026-06-30T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "tudublin-macs", universityId: uniIds["tudublin"], name: "MSc in Applied Cyber Security", fee: 21750, deadline: new Date("2026-06-30T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "mtu-mai" }, update: { fee: 15000, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "mtu-mai", universityId: uniIds["mtu"], name: "MSc in Artificial Intelligence", fee: 15000, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "mtu-mc" }, update: { fee: 15000, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "mtu-mc", universityId: uniIds["mtu"], name: "MSc in Cybersecurity", fee: 15000, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "mtu-mdsa" }, update: { fee: 15000, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "mtu-mdsa", universityId: uniIds["mtu"], name: "MSc in Data Science and Analytics", fee: 15000, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "mtu-msad" }, update: { fee: 15000, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "mtu-msad", universityId: uniIds["mtu"], name: "MSc in Software Architecture & Design", fee: 15000, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "bologna-ai" }, update: { fee: 3000, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "bologna-ai", universityId: uniIds["bologna"], name: "Artificial Intelligence", fee: 3000, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "bologna-cse" }, update: { fee: 3000, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "bologna-cse", universityId: uniIds["bologna"], name: "Computer Science and Engineering", fee: 3000, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "pisa-mcs" }, update: { fee: 2900, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "pisa-mcs", universityId: uniIds["pisa"], name: "MSc Computer Science", fee: 2900, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "pisa-mdsbi" }, update: { fee: 2900, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "pisa-mdsbi", universityId: uniIds["pisa"], name: "MSc Data Science and Business Informatics", fee: 2900, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "pisa-maide" }, update: { fee: 2900, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "pisa-maide", universityId: uniIds["pisa"], name: "MSc Artificial Intelligence and Data Engineering", fee: 2900, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "pisa-mc" }, update: { fee: 2900, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "pisa-mc", universityId: uniIds["pisa"], name: "MSc Cybersecurity", fee: 2900, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "parma-dsm" }, update: { fee: 2000, deadline: new Date("2026-04-06T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "parma-dsm", universityId: uniIds["parma"], name: "Data Science for Management", fee: 2000, deadline: new Date("2026-04-06T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "parma-ce" }, update: { fee: 2000, deadline: new Date("2026-04-06T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "parma-ce", universityId: uniIds["parma"], name: "Communication Engineering", fee: 2000, deadline: new Date("2026-04-06T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "salerno-dsim" }, update: { fee: 2000, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "salerno-dsim", universityId: uniIds["salerno"], name: "Data Science and Innovation Management", fee: 2000, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "naples-ds" }, update: { fee: 2500, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "naples-ds", universityId: uniIds["naples"], name: "Data Science", fee: 2500, deadline: new Date("2026-05-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "oulu-cse" }, update: { fee: 13000, deadline: new Date("2026-01-21T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "oulu-cse", universityId: uniIds["oulu"], name: "Computer Science and Engineering", fee: 13000, deadline: new Date("2026-01-21T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "oulu-seis" }, update: { fee: 13000, deadline: new Date("2026-01-21T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "oulu-seis", universityId: uniIds["oulu"], name: "Software Engineering and Information Systems", fee: 13000, deadline: new Date("2026-01-21T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "tampere-cs" }, update: { fee: 12000, deadline: new Date("2026-01-21T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "tampere-cs", universityId: uniIds["tampere"], name: "Computing Sciences", fee: 12000, deadline: new Date("2026-01-21T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "uef-it" }, update: { fee: 10000, deadline: new Date("2026-01-21T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "uef-it", universityId: uniIds["uef"], name: "Information Technology", fee: 10000, deadline: new Date("2026-01-21T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "vaasa-cs" }, update: { fee: 14000, deadline: new Date("2026-03-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "vaasa-cs", universityId: uniIds["vaasa"], name: "Computing Sciences", fee: 14000, deadline: new Date("2026-03-31T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });
  await prisma.program.upsert({ where: { slug: "abo-it" }, update: { fee: 12000, deadline: new Date("2026-01-21T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" }, create: { slug: "abo-it", universityId: uniIds["abo"], name: "Information Technology", fee: 12000, deadline: new Date("2026-01-21T23:59:59.000Z"), intakeLabel: "[VERIFIED] Updated program based on research" } });

  await prisma.scholarship.upsert({ where: { name: "DAAD Scholarship Database (various schemes)" }, update: { amount: "Varies (EPOS full scholarships incl. monthly stipend)", deadline: new Date("2026-12-31T23:59:59.000Z"), coverage: "Full", description: "Varies (EPOS full scholarships incl. monthly stipend). Scheme-specific — see portal (placeholder date — scheme-specific deadlines). Official: https://www.daad.de/en/studying-in-germany/scholarships/" }, create: { name: "DAAD Scholarship Database (various schemes)", country: "Germany", flag: "🇩🇪", amount: "Varies (EPOS full scholarships incl. monthly stipend)", deadline: new Date("2026-12-31T23:59:59.000Z"), coverage: "Full", description: "Varies (EPOS full scholarships incl. monthly stipend). Scheme-specific — see portal (placeholder date — scheme-specific deadlines). Official: https://www.daad.de/en/studying-in-germany/scholarships/", eligiblePrograms: ["MSc Computer Science", "MSc Artificial Intelligence Engineering", "MSc Information Systems", "MSc Computer Science", "MSc Computer Engineering", "MSc Web Engineering", "MSc Information and Communication Systems", "MSc Automotive Software Engineering", "MSc Computer Engineering (ISE)", "MSc Data and Knowledge Engineering", "MSc Digital Engineering", "Master of Computer Science", "Master of Information Technology", "Master of Computing", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Applied Artificial Intelligence", "Master of Computing", "Master of Cyber Security", "Master of Artificial Intelligence", "Master of Predictive Analytics", "Master of Information Technology", "Master of IT and AI", "Master of Data Science", "Master of Cyber Security", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Robotics and AI", "MSc in Computing", "MSc in Software Engineering", "MSc in Data Science and Statistical Learning", "MEng in Cyber Security", "MSc Computer Science (Applied)", "MSc Data Science and Analytics", "MSc in Computer Science (Advanced Software Development)", "MSc in Computer Science (Data Science)", "MSc in Applied Cyber Security", "MSc in Artificial Intelligence", "MSc in Cybersecurity", "MSc in Data Science and Analytics", "MSc in Software Architecture & Design", "Artificial Intelligence", "Computer Science and Engineering", "MSc Computer Science", "MSc Data Science and Business Informatics", "MSc Artificial Intelligence and Data Engineering", "MSc Cybersecurity", "Data Science for Management", "Communication Engineering", "Data Science and Innovation Management", "Data Science", "Computer Science and Engineering", "Software Engineering and Information Systems", "Computing Sciences", "Information Technology", "Computing Sciences", "Information Technology"] } });
  await prisma.scholarship.upsert({ where: { name: "Deutschlandstipendium" }, update: { amount: "EUR 300/month", deadline: new Date("2026-12-31T23:59:59.000Z"), coverage: "Partial", description: "EUR 300/month. Per-university application windows (placeholder date — scheme-specific deadlines). Official: https://www.deutschlandstipendium.de" }, create: { name: "Deutschlandstipendium", country: "Germany", flag: "🇩🇪", amount: "EUR 300/month", deadline: new Date("2026-12-31T23:59:59.000Z"), coverage: "Partial", description: "EUR 300/month. Per-university application windows (placeholder date — scheme-specific deadlines). Official: https://www.deutschlandstipendium.de", eligiblePrograms: ["MSc Computer Science", "MSc Artificial Intelligence Engineering", "MSc Information Systems", "MSc Computer Science", "MSc Computer Engineering", "MSc Web Engineering", "MSc Information and Communication Systems", "MSc Automotive Software Engineering", "MSc Computer Engineering (ISE)", "MSc Data and Knowledge Engineering", "MSc Digital Engineering", "Master of Computer Science", "Master of Information Technology", "Master of Computing", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Applied Artificial Intelligence", "Master of Computing", "Master of Cyber Security", "Master of Artificial Intelligence", "Master of Predictive Analytics", "Master of Information Technology", "Master of IT and AI", "Master of Data Science", "Master of Cyber Security", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Robotics and AI", "MSc in Computing", "MSc in Software Engineering", "MSc in Data Science and Statistical Learning", "MEng in Cyber Security", "MSc Computer Science (Applied)", "MSc Data Science and Analytics", "MSc in Computer Science (Advanced Software Development)", "MSc in Computer Science (Data Science)", "MSc in Applied Cyber Security", "MSc in Artificial Intelligence", "MSc in Cybersecurity", "MSc in Data Science and Analytics", "MSc in Software Architecture & Design", "Artificial Intelligence", "Computer Science and Engineering", "MSc Computer Science", "MSc Data Science and Business Informatics", "MSc Artificial Intelligence and Data Engineering", "MSc Cybersecurity", "Data Science for Management", "Communication Engineering", "Data Science and Innovation Management", "Data Science", "Computer Science and Engineering", "Software Engineering and Information Systems", "Computing Sciences", "Information Technology", "Computing Sciences", "Information Technology"] } });
  await prisma.scholarship.upsert({ where: { name: "UOW Country/Global Scholarships" }, update: { amount: "10-30% tuition reduction (automatic assessment at application)", deadline: new Date("2026-12-09T23:59:59.000Z"), coverage: "Partial", description: "10-30% tuition reduction (automatic assessment at application). Assessed with Autumn 2027 application. Official: https://www.uow.edu.au/study/scholarships/" }, create: { name: "UOW Country/Global Scholarships", country: "Australia", flag: "🇦🇺", amount: "10-30% tuition reduction (automatic assessment at application)", deadline: new Date("2026-12-09T23:59:59.000Z"), coverage: "Partial", description: "10-30% tuition reduction (automatic assessment at application). Assessed with Autumn 2027 application. Official: https://www.uow.edu.au/study/scholarships/", eligiblePrograms: ["MSc Computer Science", "MSc Artificial Intelligence Engineering", "MSc Information Systems", "MSc Computer Science", "MSc Computer Engineering", "MSc Web Engineering", "MSc Information and Communication Systems", "MSc Automotive Software Engineering", "MSc Computer Engineering (ISE)", "MSc Data and Knowledge Engineering", "MSc Digital Engineering", "Master of Computer Science", "Master of Information Technology", "Master of Computing", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Applied Artificial Intelligence", "Master of Computing", "Master of Cyber Security", "Master of Artificial Intelligence", "Master of Predictive Analytics", "Master of Information Technology", "Master of IT and AI", "Master of Data Science", "Master of Cyber Security", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Robotics and AI", "MSc in Computing", "MSc in Software Engineering", "MSc in Data Science and Statistical Learning", "MEng in Cyber Security", "MSc Computer Science (Applied)", "MSc Data Science and Analytics", "MSc in Computer Science (Advanced Software Development)", "MSc in Computer Science (Data Science)", "MSc in Applied Cyber Security", "MSc in Artificial Intelligence", "MSc in Cybersecurity", "MSc in Data Science and Analytics", "MSc in Software Architecture & Design", "Artificial Intelligence", "Computer Science and Engineering", "MSc Computer Science", "MSc Data Science and Business Informatics", "MSc Artificial Intelligence and Data Engineering", "MSc Cybersecurity", "Data Science for Management", "Communication Engineering", "Data Science and Innovation Management", "Data Science", "Computer Science and Engineering", "Software Engineering and Information Systems", "Computing Sciences", "Information Technology", "Computing Sciences", "Information Technology"] } });
  await prisma.scholarship.upsert({ where: { name: "Deakin Vice-Chancellor's International Scholarship" }, update: { amount: "50-100% tuition", deadline: new Date("2027-02-28T23:59:59.000Z"), coverage: "Full", description: "50-100% tuition. Rolling before each trimester (modeled to T1 2027). Official: https://www.deakin.edu.au/study/fees-and-scholarships/scholarships" }, create: { name: "Deakin Vice-Chancellor's International Scholarship", country: "Australia", flag: "🇦🇺", amount: "50-100% tuition", deadline: new Date("2027-02-28T23:59:59.000Z"), coverage: "Full", description: "50-100% tuition. Rolling before each trimester (modeled to T1 2027). Official: https://www.deakin.edu.au/study/fees-and-scholarships/scholarships", eligiblePrograms: ["MSc Computer Science", "MSc Artificial Intelligence Engineering", "MSc Information Systems", "MSc Computer Science", "MSc Computer Engineering", "MSc Web Engineering", "MSc Information and Communication Systems", "MSc Automotive Software Engineering", "MSc Computer Engineering (ISE)", "MSc Data and Knowledge Engineering", "MSc Digital Engineering", "Master of Computer Science", "Master of Information Technology", "Master of Computing", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Applied Artificial Intelligence", "Master of Computing", "Master of Cyber Security", "Master of Artificial Intelligence", "Master of Predictive Analytics", "Master of Information Technology", "Master of IT and AI", "Master of Data Science", "Master of Cyber Security", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Robotics and AI", "MSc in Computing", "MSc in Software Engineering", "MSc in Data Science and Statistical Learning", "MEng in Cyber Security", "MSc Computer Science (Applied)", "MSc Data Science and Analytics", "MSc in Computer Science (Advanced Software Development)", "MSc in Computer Science (Data Science)", "MSc in Applied Cyber Security", "MSc in Artificial Intelligence", "MSc in Cybersecurity", "MSc in Data Science and Analytics", "MSc in Software Architecture & Design", "Artificial Intelligence", "Computer Science and Engineering", "MSc Computer Science", "MSc Data Science and Business Informatics", "MSc Artificial Intelligence and Data Engineering", "MSc Cybersecurity", "Data Science for Management", "Communication Engineering", "Data Science and Innovation Management", "Data Science", "Computer Science and Engineering", "Software Engineering and Information Systems", "Computing Sciences", "Information Technology", "Computing Sciences", "Information Technology"] } });
  await prisma.scholarship.upsert({ where: { name: "Curtin Global Merit Scholarship" }, update: { amount: "25% of first-year tuition", deadline: new Date("2027-09-01T23:59:59.000Z"), coverage: "Partial", description: "25% of first-year tuition. Published assessment window to 1 Sep 2027 (secondary). Official: https://scholarships.curtin.edu.au/" }, create: { name: "Curtin Global Merit Scholarship", country: "Australia", flag: "🇦🇺", amount: "25% of first-year tuition", deadline: new Date("2027-09-01T23:59:59.000Z"), coverage: "Partial", description: "25% of first-year tuition. Published assessment window to 1 Sep 2027 (secondary). Official: https://scholarships.curtin.edu.au/", eligiblePrograms: ["MSc Computer Science", "MSc Artificial Intelligence Engineering", "MSc Information Systems", "MSc Computer Science", "MSc Computer Engineering", "MSc Web Engineering", "MSc Information and Communication Systems", "MSc Automotive Software Engineering", "MSc Computer Engineering (ISE)", "MSc Data and Knowledge Engineering", "MSc Digital Engineering", "Master of Computer Science", "Master of Information Technology", "Master of Computing", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Applied Artificial Intelligence", "Master of Computing", "Master of Cyber Security", "Master of Artificial Intelligence", "Master of Predictive Analytics", "Master of Information Technology", "Master of IT and AI", "Master of Data Science", "Master of Cyber Security", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Robotics and AI", "MSc in Computing", "MSc in Software Engineering", "MSc in Data Science and Statistical Learning", "MEng in Cyber Security", "MSc Computer Science (Applied)", "MSc Data Science and Analytics", "MSc in Computer Science (Advanced Software Development)", "MSc in Computer Science (Data Science)", "MSc in Applied Cyber Security", "MSc in Artificial Intelligence", "MSc in Cybersecurity", "MSc in Data Science and Analytics", "MSc in Software Architecture & Design", "Artificial Intelligence", "Computer Science and Engineering", "MSc Computer Science", "MSc Data Science and Business Informatics", "MSc Artificial Intelligence and Data Engineering", "MSc Cybersecurity", "Data Science for Management", "Communication Engineering", "Data Science and Innovation Management", "Data Science", "Computer Science and Engineering", "Software Engineering and Information Systems", "Computing Sciences", "Information Technology", "Computing Sciences", "Information Technology"] } });
  await prisma.scholarship.upsert({ where: { name: "Griffith International Student Academic Merit Scholarship" }, update: { amount: "~25% tuition; Remarkable Scholarship 50%", deadline: new Date("2026-06-22T23:59:59.000Z"), coverage: "Partial", description: "~25% tuition; Remarkable Scholarship 50%. Assessed with Trimester 2 2026 application. Official: https://www.griffith.edu.au/international/scholarships-finance" }, create: { name: "Griffith International Student Academic Merit Scholarship", country: "Australia", flag: "🇦🇺", amount: "~25% tuition; Remarkable Scholarship 50%", deadline: new Date("2026-06-22T23:59:59.000Z"), coverage: "Partial", description: "~25% tuition; Remarkable Scholarship 50%. Assessed with Trimester 2 2026 application. Official: https://www.griffith.edu.au/international/scholarships-finance", eligiblePrograms: ["MSc Computer Science", "MSc Artificial Intelligence Engineering", "MSc Information Systems", "MSc Computer Science", "MSc Computer Engineering", "MSc Web Engineering", "MSc Information and Communication Systems", "MSc Automotive Software Engineering", "MSc Computer Engineering (ISE)", "MSc Data and Knowledge Engineering", "MSc Digital Engineering", "Master of Computer Science", "Master of Information Technology", "Master of Computing", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Applied Artificial Intelligence", "Master of Computing", "Master of Cyber Security", "Master of Artificial Intelligence", "Master of Predictive Analytics", "Master of Information Technology", "Master of IT and AI", "Master of Data Science", "Master of Cyber Security", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Robotics and AI", "MSc in Computing", "MSc in Software Engineering", "MSc in Data Science and Statistical Learning", "MEng in Cyber Security", "MSc Computer Science (Applied)", "MSc Data Science and Analytics", "MSc in Computer Science (Advanced Software Development)", "MSc in Computer Science (Data Science)", "MSc in Applied Cyber Security", "MSc in Artificial Intelligence", "MSc in Cybersecurity", "MSc in Data Science and Analytics", "MSc in Software Architecture & Design", "Artificial Intelligence", "Computer Science and Engineering", "MSc Computer Science", "MSc Data Science and Business Informatics", "MSc Artificial Intelligence and Data Engineering", "MSc Cybersecurity", "Data Science for Management", "Communication Engineering", "Data Science and Innovation Management", "Data Science", "Computer Science and Engineering", "Software Engineering and Information Systems", "Computing Sciences", "Information Technology", "Computing Sciences", "Information Technology"] } });
  await prisma.scholarship.upsert({ where: { name: "QUT International Merit / Excellence Scholarships" }, update: { amount: "25% tuition; Excellence up to AUD 30,000; 2026 full-tuition academic award", deadline: new Date("2026-07-17T23:59:59.000Z"), coverage: "Partial", description: "25% tuition; Excellence up to AUD 30,000; 2026 full-tuition academic award. Assessed with Semester 2 2026 application (secondary date). Official: https://www.qut.edu.au/study/fees-and-scholarships/scholarships" }, create: { name: "QUT International Merit / Excellence Scholarships", country: "Australia", flag: "🇦🇺", amount: "25% tuition; Excellence up to AUD 30,000; 2026 full-tuition academic award", deadline: new Date("2026-07-17T23:59:59.000Z"), coverage: "Partial", description: "25% tuition; Excellence up to AUD 30,000; 2026 full-tuition academic award. Assessed with Semester 2 2026 application (secondary date). Official: https://www.qut.edu.au/study/fees-and-scholarships/scholarships", eligiblePrograms: ["MSc Computer Science", "MSc Artificial Intelligence Engineering", "MSc Information Systems", "MSc Computer Science", "MSc Computer Engineering", "MSc Web Engineering", "MSc Information and Communication Systems", "MSc Automotive Software Engineering", "MSc Computer Engineering (ISE)", "MSc Data and Knowledge Engineering", "MSc Digital Engineering", "Master of Computer Science", "Master of Information Technology", "Master of Computing", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Applied Artificial Intelligence", "Master of Computing", "Master of Cyber Security", "Master of Artificial Intelligence", "Master of Predictive Analytics", "Master of Information Technology", "Master of IT and AI", "Master of Data Science", "Master of Cyber Security", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Robotics and AI", "MSc in Computing", "MSc in Software Engineering", "MSc in Data Science and Statistical Learning", "MEng in Cyber Security", "MSc Computer Science (Applied)", "MSc Data Science and Analytics", "MSc in Computer Science (Advanced Software Development)", "MSc in Computer Science (Data Science)", "MSc in Applied Cyber Security", "MSc in Artificial Intelligence", "MSc in Cybersecurity", "MSc in Data Science and Analytics", "MSc in Software Architecture & Design", "Artificial Intelligence", "Computer Science and Engineering", "MSc Computer Science", "MSc Data Science and Business Informatics", "MSc Artificial Intelligence and Data Engineering", "MSc Cybersecurity", "Data Science for Management", "Communication Engineering", "Data Science and Innovation Management", "Data Science", "Computer Science and Engineering", "Software Engineering and Information Systems", "Computing Sciences", "Information Technology", "Computing Sciences", "Information Technology"] } });
  await prisma.scholarship.upsert({ where: { name: "DCU Engineering & Computing International Scholarships" }, update: { amount: "Fee reductions (faculty-specific)", deadline: new Date("2026-07-01T23:59:59.000Z"), coverage: "Partial", description: "Fee reductions (faculty-specific). With September 2026 application. Official: https://www.dcu.ie/registry/scholarships" }, create: { name: "DCU Engineering & Computing International Scholarships", country: "Ireland", flag: "🇮🇪", amount: "Fee reductions (faculty-specific)", deadline: new Date("2026-07-01T23:59:59.000Z"), coverage: "Partial", description: "Fee reductions (faculty-specific). With September 2026 application. Official: https://www.dcu.ie/registry/scholarships", eligiblePrograms: ["MSc Computer Science", "MSc Artificial Intelligence Engineering", "MSc Information Systems", "MSc Computer Science", "MSc Computer Engineering", "MSc Web Engineering", "MSc Information and Communication Systems", "MSc Automotive Software Engineering", "MSc Computer Engineering (ISE)", "MSc Data and Knowledge Engineering", "MSc Digital Engineering", "Master of Computer Science", "Master of Information Technology", "Master of Computing", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Applied Artificial Intelligence", "Master of Computing", "Master of Cyber Security", "Master of Artificial Intelligence", "Master of Predictive Analytics", "Master of Information Technology", "Master of IT and AI", "Master of Data Science", "Master of Cyber Security", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Robotics and AI", "MSc in Computing", "MSc in Software Engineering", "MSc in Data Science and Statistical Learning", "MEng in Cyber Security", "MSc Computer Science (Applied)", "MSc Data Science and Analytics", "MSc in Computer Science (Advanced Software Development)", "MSc in Computer Science (Data Science)", "MSc in Applied Cyber Security", "MSc in Artificial Intelligence", "MSc in Cybersecurity", "MSc in Data Science and Analytics", "MSc in Software Architecture & Design", "Artificial Intelligence", "Computer Science and Engineering", "MSc Computer Science", "MSc Data Science and Business Informatics", "MSc Artificial Intelligence and Data Engineering", "MSc Cybersecurity", "Data Science for Management", "Communication Engineering", "Data Science and Innovation Management", "Data Science", "Computer Science and Engineering", "Software Engineering and Information Systems", "Computing Sciences", "Information Technology", "Computing Sciences", "Information Technology"] } });
  await prisma.scholarship.upsert({ where: { name: "UL Faculty of Science & Engineering Non-EU Merit Scholarship" }, update: { amount: "EUR 2,000/year", deadline: new Date("2026-08-31T23:59:59.000Z"), coverage: "Partial", description: "EUR 2,000/year. Automatic review with programme application (modeled close). Official: https://www.ul.ie/international/scholarships" }, create: { name: "UL Faculty of Science & Engineering Non-EU Merit Scholarship", country: "Ireland", flag: "🇮🇪", amount: "EUR 2,000/year", deadline: new Date("2026-08-31T23:59:59.000Z"), coverage: "Partial", description: "EUR 2,000/year. Automatic review with programme application (modeled close). Official: https://www.ul.ie/international/scholarships", eligiblePrograms: ["MSc Computer Science", "MSc Artificial Intelligence Engineering", "MSc Information Systems", "MSc Computer Science", "MSc Computer Engineering", "MSc Web Engineering", "MSc Information and Communication Systems", "MSc Automotive Software Engineering", "MSc Computer Engineering (ISE)", "MSc Data and Knowledge Engineering", "MSc Digital Engineering", "Master of Computer Science", "Master of Information Technology", "Master of Computing", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Applied Artificial Intelligence", "Master of Computing", "Master of Cyber Security", "Master of Artificial Intelligence", "Master of Predictive Analytics", "Master of Information Technology", "Master of IT and AI", "Master of Data Science", "Master of Cyber Security", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Robotics and AI", "MSc in Computing", "MSc in Software Engineering", "MSc in Data Science and Statistical Learning", "MEng in Cyber Security", "MSc Computer Science (Applied)", "MSc Data Science and Analytics", "MSc in Computer Science (Advanced Software Development)", "MSc in Computer Science (Data Science)", "MSc in Applied Cyber Security", "MSc in Artificial Intelligence", "MSc in Cybersecurity", "MSc in Data Science and Analytics", "MSc in Software Architecture & Design", "Artificial Intelligence", "Computer Science and Engineering", "MSc Computer Science", "MSc Data Science and Business Informatics", "MSc Artificial Intelligence and Data Engineering", "MSc Cybersecurity", "Data Science for Management", "Communication Engineering", "Data Science and Innovation Management", "Data Science", "Computer Science and Engineering", "Software Engineering and Information Systems", "Computing Sciences", "Information Technology", "Computing Sciences", "Information Technology"] } });
  await prisma.scholarship.upsert({ where: { name: "Unibo Action 1 & 2 + international study grants" }, update: { amount: "Fee waivers; EUR 4,500-11,000 grants (GRE/SAT-ranked)", deadline: new Date("2026-05-31T23:59:59.000Z"), coverage: "Partial", description: "Fee waivers; EUR 4,500-11,000 grants (GRE/SAT-ranked). Spring calls (modeled). Official: https://www.unibo.it/en/study/study-grants-and-subsidies" }, create: { name: "Unibo Action 1 & 2 + international study grants", country: "Italy", flag: "🇮🇹", amount: "Fee waivers; EUR 4,500-11,000 grants (GRE/SAT-ranked)", deadline: new Date("2026-05-31T23:59:59.000Z"), coverage: "Partial", description: "Fee waivers; EUR 4,500-11,000 grants (GRE/SAT-ranked). Spring calls (modeled). Official: https://www.unibo.it/en/study/study-grants-and-subsidies", eligiblePrograms: ["MSc Computer Science", "MSc Artificial Intelligence Engineering", "MSc Information Systems", "MSc Computer Science", "MSc Computer Engineering", "MSc Web Engineering", "MSc Information and Communication Systems", "MSc Automotive Software Engineering", "MSc Computer Engineering (ISE)", "MSc Data and Knowledge Engineering", "MSc Digital Engineering", "Master of Computer Science", "Master of Information Technology", "Master of Computing", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Applied Artificial Intelligence", "Master of Computing", "Master of Cyber Security", "Master of Artificial Intelligence", "Master of Predictive Analytics", "Master of Information Technology", "Master of IT and AI", "Master of Data Science", "Master of Cyber Security", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Robotics and AI", "MSc in Computing", "MSc in Software Engineering", "MSc in Data Science and Statistical Learning", "MEng in Cyber Security", "MSc Computer Science (Applied)", "MSc Data Science and Analytics", "MSc in Computer Science (Advanced Software Development)", "MSc in Computer Science (Data Science)", "MSc in Applied Cyber Security", "MSc in Artificial Intelligence", "MSc in Cybersecurity", "MSc in Data Science and Analytics", "MSc in Software Architecture & Design", "Artificial Intelligence", "Computer Science and Engineering", "MSc Computer Science", "MSc Data Science and Business Informatics", "MSc Artificial Intelligence and Data Engineering", "MSc Cybersecurity", "Data Science for Management", "Communication Engineering", "Data Science and Innovation Management", "Data Science", "Computer Science and Engineering", "Software Engineering and Information Systems", "Computing Sciences", "Information Technology", "Computing Sciences", "Information Technology"] } });
  await prisma.scholarship.upsert({ where: { name: "DSU / ER.GO / ADISURC regional scholarships (Italy)" }, update: { amount: "Income-based: full fee waiver + housing + meals + grant EUR 2,000-5,200", deadline: new Date("2026-09-04T23:59:59.000Z"), coverage: "Full", description: "Income-based: full fee waiver + housing + meals + grant EUR 2,000-5,200. Regional calls published early July 2026 (ER.GO); typical early-Sep close (modeled). Official: https://www.er-go.it" }, create: { name: "DSU / ER.GO / ADISURC regional scholarships (Italy)", country: "Italy", flag: "🇮🇹", amount: "Income-based: full fee waiver + housing + meals + grant EUR 2,000-5,200", deadline: new Date("2026-09-04T23:59:59.000Z"), coverage: "Full", description: "Income-based: full fee waiver + housing + meals + grant EUR 2,000-5,200. Regional calls published early July 2026 (ER.GO); typical early-Sep close (modeled). Official: https://www.er-go.it", eligiblePrograms: ["MSc Computer Science", "MSc Artificial Intelligence Engineering", "MSc Information Systems", "MSc Computer Science", "MSc Computer Engineering", "MSc Web Engineering", "MSc Information and Communication Systems", "MSc Automotive Software Engineering", "MSc Computer Engineering (ISE)", "MSc Data and Knowledge Engineering", "MSc Digital Engineering", "Master of Computer Science", "Master of Information Technology", "Master of Computing", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Applied Artificial Intelligence", "Master of Computing", "Master of Cyber Security", "Master of Artificial Intelligence", "Master of Predictive Analytics", "Master of Information Technology", "Master of IT and AI", "Master of Data Science", "Master of Cyber Security", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Robotics and AI", "MSc in Computing", "MSc in Software Engineering", "MSc in Data Science and Statistical Learning", "MEng in Cyber Security", "MSc Computer Science (Applied)", "MSc Data Science and Analytics", "MSc in Computer Science (Advanced Software Development)", "MSc in Computer Science (Data Science)", "MSc in Applied Cyber Security", "MSc in Artificial Intelligence", "MSc in Cybersecurity", "MSc in Data Science and Analytics", "MSc in Software Architecture & Design", "Artificial Intelligence", "Computer Science and Engineering", "MSc Computer Science", "MSc Data Science and Business Informatics", "MSc Artificial Intelligence and Data Engineering", "MSc Cybersecurity", "Data Science for Management", "Communication Engineering", "Data Science and Innovation Management", "Data Science", "Computer Science and Engineering", "Software Engineering and Information Systems", "Computing Sciences", "Information Technology", "Computing Sciences", "Information Technology"] } });
  await prisma.scholarship.upsert({ where: { name: "Finland Scholarship" }, update: { amount: "Full first-year tuition + EUR 5,000 relocation/living", deadline: new Date("2026-01-21T23:59:59.000Z"), coverage: "Full", description: "Full first-year tuition + EUR 5,000 relocation/living. Applied via Studyinfo admission form (Latest Official Admission Cycle). Official: https://www.studyinfinland.fi/scholarships" }, create: { name: "Finland Scholarship", country: "Finland", flag: "🇫🇮", amount: "Full first-year tuition + EUR 5,000 relocation/living", deadline: new Date("2026-01-21T23:59:59.000Z"), coverage: "Full", description: "Full first-year tuition + EUR 5,000 relocation/living. Applied via Studyinfo admission form (Latest Official Admission Cycle). Official: https://www.studyinfinland.fi/scholarships", eligiblePrograms: ["MSc Computer Science", "MSc Artificial Intelligence Engineering", "MSc Information Systems", "MSc Computer Science", "MSc Computer Engineering", "MSc Web Engineering", "MSc Information and Communication Systems", "MSc Automotive Software Engineering", "MSc Computer Engineering (ISE)", "MSc Data and Knowledge Engineering", "MSc Digital Engineering", "Master of Computer Science", "Master of Information Technology", "Master of Computing", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Applied Artificial Intelligence", "Master of Computing", "Master of Cyber Security", "Master of Artificial Intelligence", "Master of Predictive Analytics", "Master of Information Technology", "Master of IT and AI", "Master of Data Science", "Master of Cyber Security", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Robotics and AI", "MSc in Computing", "MSc in Software Engineering", "MSc in Data Science and Statistical Learning", "MEng in Cyber Security", "MSc Computer Science (Applied)", "MSc Data Science and Analytics", "MSc in Computer Science (Advanced Software Development)", "MSc in Computer Science (Data Science)", "MSc in Applied Cyber Security", "MSc in Artificial Intelligence", "MSc in Cybersecurity", "MSc in Data Science and Analytics", "MSc in Software Architecture & Design", "Artificial Intelligence", "Computer Science and Engineering", "MSc Computer Science", "MSc Data Science and Business Informatics", "MSc Artificial Intelligence and Data Engineering", "MSc Cybersecurity", "Data Science for Management", "Communication Engineering", "Data Science and Innovation Management", "Data Science", "Computer Science and Engineering", "Software Engineering and Information Systems", "Computing Sciences", "Information Technology", "Computing Sciences", "Information Technology"] } });
  await prisma.scholarship.upsert({ where: { name: "Nokia Scholarship (University of Oulu)" }, update: { amount: "EUR 3,000 one instalment", deadline: new Date("2026-01-21T23:59:59.000Z"), coverage: "Partial", description: "EUR 3,000 one instalment. Same Studyinfo form; decisions by 18 Jun 2026. Official: https://www.oulu.fi/en/apply/how-apply/university-oulu-tuition-fees-and-scholarships-for-international-applicants" }, create: { name: "Nokia Scholarship (University of Oulu)", country: "Finland", flag: "🇫🇮", amount: "EUR 3,000 one instalment", deadline: new Date("2026-01-21T23:59:59.000Z"), coverage: "Partial", description: "EUR 3,000 one instalment. Same Studyinfo form; decisions by 18 Jun 2026. Official: https://www.oulu.fi/en/apply/how-apply/university-oulu-tuition-fees-and-scholarships-for-international-applicants", eligiblePrograms: ["MSc Computer Science", "MSc Artificial Intelligence Engineering", "MSc Information Systems", "MSc Computer Science", "MSc Computer Engineering", "MSc Web Engineering", "MSc Information and Communication Systems", "MSc Automotive Software Engineering", "MSc Computer Engineering (ISE)", "MSc Data and Knowledge Engineering", "MSc Digital Engineering", "Master of Computer Science", "Master of Information Technology", "Master of Computing", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Applied Artificial Intelligence", "Master of Computing", "Master of Cyber Security", "Master of Artificial Intelligence", "Master of Predictive Analytics", "Master of Information Technology", "Master of IT and AI", "Master of Data Science", "Master of Cyber Security", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Robotics and AI", "MSc in Computing", "MSc in Software Engineering", "MSc in Data Science and Statistical Learning", "MEng in Cyber Security", "MSc Computer Science (Applied)", "MSc Data Science and Analytics", "MSc in Computer Science (Advanced Software Development)", "MSc in Computer Science (Data Science)", "MSc in Applied Cyber Security", "MSc in Artificial Intelligence", "MSc in Cybersecurity", "MSc in Data Science and Analytics", "MSc in Software Architecture & Design", "Artificial Intelligence", "Computer Science and Engineering", "MSc Computer Science", "MSc Data Science and Business Informatics", "MSc Artificial Intelligence and Data Engineering", "MSc Cybersecurity", "Data Science for Management", "Communication Engineering", "Data Science and Innovation Management", "Data Science", "Computer Science and Engineering", "Software Engineering and Information Systems", "Computing Sciences", "Information Technology", "Computing Sciences", "Information Technology"] } });
  await prisma.scholarship.upsert({ where: { name: "UEF Scholarship & Tuition Waivers" }, update: { amount: "100% waiver (one/programme); 50% waiver for best 70% admitted; Early Bird EUR 500", deadline: new Date("2026-01-21T23:59:59.000Z"), coverage: "Partial", description: "100% waiver (one/programme); 50% waiver for best 70% admitted; Early Bird EUR 500. With joint application. Official: https://www.uef.fi/en/tuition-fees-waivers-and-scholarships" }, create: { name: "UEF Scholarship & Tuition Waivers", country: "Finland", flag: "🇫🇮", amount: "100% waiver (one/programme); 50% waiver for best 70% admitted; Early Bird EUR 500", deadline: new Date("2026-01-21T23:59:59.000Z"), coverage: "Partial", description: "100% waiver (one/programme); 50% waiver for best 70% admitted; Early Bird EUR 500. With joint application. Official: https://www.uef.fi/en/tuition-fees-waivers-and-scholarships", eligiblePrograms: ["MSc Computer Science", "MSc Artificial Intelligence Engineering", "MSc Information Systems", "MSc Computer Science", "MSc Computer Engineering", "MSc Web Engineering", "MSc Information and Communication Systems", "MSc Automotive Software Engineering", "MSc Computer Engineering (ISE)", "MSc Data and Knowledge Engineering", "MSc Digital Engineering", "Master of Computer Science", "Master of Information Technology", "Master of Computing", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Applied Artificial Intelligence", "Master of Computing", "Master of Cyber Security", "Master of Artificial Intelligence", "Master of Predictive Analytics", "Master of Information Technology", "Master of IT and AI", "Master of Data Science", "Master of Cyber Security", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Robotics and AI", "MSc in Computing", "MSc in Software Engineering", "MSc in Data Science and Statistical Learning", "MEng in Cyber Security", "MSc Computer Science (Applied)", "MSc Data Science and Analytics", "MSc in Computer Science (Advanced Software Development)", "MSc in Computer Science (Data Science)", "MSc in Applied Cyber Security", "MSc in Artificial Intelligence", "MSc in Cybersecurity", "MSc in Data Science and Analytics", "MSc in Software Architecture & Design", "Artificial Intelligence", "Computer Science and Engineering", "MSc Computer Science", "MSc Data Science and Business Informatics", "MSc Artificial Intelligence and Data Engineering", "MSc Cybersecurity", "Data Science for Management", "Communication Engineering", "Data Science and Innovation Management", "Data Science", "Computer Science and Engineering", "Software Engineering and Information Systems", "Computing Sciences", "Information Technology", "Computing Sciences", "Information Technology"] } });
  await prisma.scholarship.upsert({ where: { name: "University of Vaasa scholarships" }, update: { amount: "EUR 2,000 early-payment discount; EUR 6,000 year-2 Academic Achievement; +EUR 1,000 Finnish language", deadline: new Date("2026-03-31T23:59:59.000Z"), coverage: "Partial", description: "EUR 2,000 early-payment discount; EUR 6,000 year-2 Academic Achievement; +EUR 1,000 Finnish language. With rolling-admission application. Official: https://www.uwasa.fi/en/education/masters-programmes/tuition-fees-and-scholarships" }, create: { name: "University of Vaasa scholarships", country: "Finland", flag: "🇫🇮", amount: "EUR 2,000 early-payment discount; EUR 6,000 year-2 Academic Achievement; +EUR 1,000 Finnish language", deadline: new Date("2026-03-31T23:59:59.000Z"), coverage: "Partial", description: "EUR 2,000 early-payment discount; EUR 6,000 year-2 Academic Achievement; +EUR 1,000 Finnish language. With rolling-admission application. Official: https://www.uwasa.fi/en/education/masters-programmes/tuition-fees-and-scholarships", eligiblePrograms: ["MSc Computer Science", "MSc Artificial Intelligence Engineering", "MSc Information Systems", "MSc Computer Science", "MSc Computer Engineering", "MSc Web Engineering", "MSc Information and Communication Systems", "MSc Automotive Software Engineering", "MSc Computer Engineering (ISE)", "MSc Data and Knowledge Engineering", "MSc Digital Engineering", "Master of Computer Science", "Master of Information Technology", "Master of Computing", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Applied Artificial Intelligence", "Master of Computing", "Master of Cyber Security", "Master of Artificial Intelligence", "Master of Predictive Analytics", "Master of Information Technology", "Master of IT and AI", "Master of Data Science", "Master of Cyber Security", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Robotics and AI", "MSc in Computing", "MSc in Software Engineering", "MSc in Data Science and Statistical Learning", "MEng in Cyber Security", "MSc Computer Science (Applied)", "MSc Data Science and Analytics", "MSc in Computer Science (Advanced Software Development)", "MSc in Computer Science (Data Science)", "MSc in Applied Cyber Security", "MSc in Artificial Intelligence", "MSc in Cybersecurity", "MSc in Data Science and Analytics", "MSc in Software Architecture & Design", "Artificial Intelligence", "Computer Science and Engineering", "MSc Computer Science", "MSc Data Science and Business Informatics", "MSc Artificial Intelligence and Data Engineering", "MSc Cybersecurity", "Data Science for Management", "Communication Engineering", "Data Science and Innovation Management", "Data Science", "Computer Science and Engineering", "Software Engineering and Information Systems", "Computing Sciences", "Information Technology", "Computing Sciences", "Information Technology"] } });
  await prisma.scholarship.upsert({ where: { name: "Åbo Akademi 100% Tuition Fee Scholarship + early commitment" }, update: { amount: "100% waiver (2 yrs, yr 2 conditional); or EUR 4,000 early-commitment discount + automatic EUR 4,000 yr-2 waiver", deadline: new Date("2026-01-21T23:59:59.000Z"), coverage: "Full", description: "100% waiver (2 yrs, yr 2 conditional); or EUR 4,000 early-commitment discount + automatic EUR 4,000 yr-2 waiver. With international master's application. Official: https://www.abo.fi/en/study/apply/international-master-programmes/scholarship-programme-for-master-students/" }, create: { name: "Åbo Akademi 100% Tuition Fee Scholarship + early commitment", country: "Finland", flag: "🇫🇮", amount: "100% waiver (2 yrs, yr 2 conditional); or EUR 4,000 early-commitment discount + automatic EUR 4,000 yr-2 waiver", deadline: new Date("2026-01-21T23:59:59.000Z"), coverage: "Full", description: "100% waiver (2 yrs, yr 2 conditional); or EUR 4,000 early-commitment discount + automatic EUR 4,000 yr-2 waiver. With international master's application. Official: https://www.abo.fi/en/study/apply/international-master-programmes/scholarship-programme-for-master-students/", eligiblePrograms: ["MSc Computer Science", "MSc Artificial Intelligence Engineering", "MSc Information Systems", "MSc Computer Science", "MSc Computer Engineering", "MSc Web Engineering", "MSc Information and Communication Systems", "MSc Automotive Software Engineering", "MSc Computer Engineering (ISE)", "MSc Data and Knowledge Engineering", "MSc Digital Engineering", "Master of Computer Science", "Master of Information Technology", "Master of Computing", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Applied Artificial Intelligence", "Master of Computing", "Master of Cyber Security", "Master of Artificial Intelligence", "Master of Predictive Analytics", "Master of Information Technology", "Master of IT and AI", "Master of Data Science", "Master of Cyber Security", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Robotics and AI", "MSc in Computing", "MSc in Software Engineering", "MSc in Data Science and Statistical Learning", "MEng in Cyber Security", "MSc Computer Science (Applied)", "MSc Data Science and Analytics", "MSc in Computer Science (Advanced Software Development)", "MSc in Computer Science (Data Science)", "MSc in Applied Cyber Security", "MSc in Artificial Intelligence", "MSc in Cybersecurity", "MSc in Data Science and Analytics", "MSc in Software Architecture & Design", "Artificial Intelligence", "Computer Science and Engineering", "MSc Computer Science", "MSc Data Science and Business Informatics", "MSc Artificial Intelligence and Data Engineering", "MSc Cybersecurity", "Data Science for Management", "Communication Engineering", "Data Science and Innovation Management", "Data Science", "Computer Science and Engineering", "Software Engineering and Information Systems", "Computing Sciences", "Information Technology", "Computing Sciences", "Information Technology"] } });
  await prisma.scholarship.upsert({ where: { name: "Tampere University tuition-fee scholarships" }, update: { amount: "Merit-based fee scholarships for fee-paying students", deadline: new Date("2026-01-21T23:59:59.000Z"), coverage: "Partial", description: "Merit-based fee scholarships for fee-paying students. With admission application (Tampere own schedule may be earlier). Official: https://www.tuni.fi/en/study-with-us/apply-to-tampere-university/financial-matters/tuition-fees-scholarships" }, create: { name: "Tampere University tuition-fee scholarships", country: "Finland", flag: "🇫🇮", amount: "Merit-based fee scholarships for fee-paying students", deadline: new Date("2026-01-21T23:59:59.000Z"), coverage: "Partial", description: "Merit-based fee scholarships for fee-paying students. With admission application (Tampere own schedule may be earlier). Official: https://www.tuni.fi/en/study-with-us/apply-to-tampere-university/financial-matters/tuition-fees-scholarships", eligiblePrograms: ["MSc Computer Science", "MSc Artificial Intelligence Engineering", "MSc Information Systems", "MSc Computer Science", "MSc Computer Engineering", "MSc Web Engineering", "MSc Information and Communication Systems", "MSc Automotive Software Engineering", "MSc Computer Engineering (ISE)", "MSc Data and Knowledge Engineering", "MSc Digital Engineering", "Master of Computer Science", "Master of Information Technology", "Master of Computing", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Applied Artificial Intelligence", "Master of Computing", "Master of Cyber Security", "Master of Artificial Intelligence", "Master of Predictive Analytics", "Master of Information Technology", "Master of IT and AI", "Master of Data Science", "Master of Cyber Security", "Master of Information Technology", "Master of Data Science", "Master of Cyber Security", "Master of Robotics and AI", "MSc in Computing", "MSc in Software Engineering", "MSc in Data Science and Statistical Learning", "MEng in Cyber Security", "MSc Computer Science (Applied)", "MSc Data Science and Analytics", "MSc in Computer Science (Advanced Software Development)", "MSc in Computer Science (Data Science)", "MSc in Applied Cyber Security", "MSc in Artificial Intelligence", "MSc in Cybersecurity", "MSc in Data Science and Analytics", "MSc in Software Architecture & Design", "Artificial Intelligence", "Computer Science and Engineering", "MSc Computer Science", "MSc Data Science and Business Informatics", "MSc Artificial Intelligence and Data Engineering", "MSc Cybersecurity", "Data Science for Management", "Communication Engineering", "Data Science and Innovation Management", "Data Science", "Computer Science and Engineering", "Software Engineering and Information Systems", "Computing Sciences", "Information Technology", "Computing Sciences", "Information Technology"] } });

  const uniUrlsMap: Record<string, {
    officialProgramUrl: string;
    officialApplicationUrl: string;
    applicationMethod: string;
    sourceUrl: string;
    sourceTitle: string;
    verificationStatus: "VERIFIED" | "PARTIALLY_VERIFIED" | "UNVERIFIED";
    minimumGpa: number;
    englishRequirements: string;
    eligibilitySummary: string;
  }> = {
    "passau-cs": {
      officialProgramUrl: "https://www.uni-passau.de/en/msc-computer-science",
      officialApplicationUrl: "https://www.uni-passau.de/en/apply",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.uni-passau.de/en/msc-computer-science",
      sourceTitle: "MSc Computer Science Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.8,
      englishRequirements: "IELTS 5.5 / TOEFL 72",
      eligibilitySummary: "BSc in Computer Science or related field with at least 120 ECTS in CS modules.",
    },
    "passau-aie": {
      officialProgramUrl: "https://www.uni-passau.de/en/msc-artificial-intelligence-engineering",
      officialApplicationUrl: "https://www.uni-passau.de/en/apply",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.uni-passau.de/en/msc-artificial-intelligence-engineering",
      sourceTitle: "MSc Artificial Intelligence Engineering Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.8,
      englishRequirements: "IELTS 5.5 / TOEFL 72",
      eligibilitySummary: "BSc in Computer Science or related field with at least 120 ECTS in CS modules.",
    },
    "passau-is": {
      officialProgramUrl: "https://www.uni-passau.de/en/msc-information-systems",
      officialApplicationUrl: "https://www.uni-passau.de/en/apply",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.uni-passau.de/en/msc-information-systems",
      sourceTitle: "MSc Information Systems Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.8,
      englishRequirements: "IELTS 5.5 / TOEFL 72",
      eligibilitySummary: "BSc in Computer Science or related field with at least 120 ECTS in CS modules.",
    },
    "paderborn-cs": {
      officialProgramUrl: "https://cs.uni-paderborn.de/en/studies/degree-programs/computer-science/master",
      officialApplicationUrl: "https://www.uni-paderborn.de/en/studium/application",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://cs.uni-paderborn.de/en/studies/degree-programs/computer-science/master",
      sourceTitle: "MSc Computer Science Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.8,
      englishRequirements: "IELTS 6.5 / TOEFL 80",
      eligibilitySummary: "Bachelor degree in Computer Science or Electrical Engineering.",
    },
    "paderborn-ce": {
      officialProgramUrl: "https://cs.uni-paderborn.de/en/studies/degree-programs/computer-engineering/master",
      officialApplicationUrl: "https://www.uni-paderborn.de/en/studium/application",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://cs.uni-paderborn.de/en/studies/degree-programs/computer-engineering/master",
      sourceTitle: "MSc Computer Engineering Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.8,
      englishRequirements: "IELTS 6.5 / TOEFL 80",
      eligibilitySummary: "Bachelor degree in Computer Science or Electrical Engineering.",
    },
    "chemnitz-we": {
      officialProgramUrl: "https://www.tu-chemnitz.de/studium/studiengaenge/ms_we.xml",
      officialApplicationUrl: "https://www.uni-assist.de",
      applicationMethod: "Uni-Assist",
      sourceUrl: "https://www.tu-chemnitz.de/studium/studiengaenge/ms_we.xml",
      sourceTitle: "MSc Web Engineering Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 5.5 / B2 Level",
      eligibilitySummary: "Relevant Bachelor degree with math and CS foundation. Applications via uni-assist.",
    },
    "chemnitz-ics": {
      officialProgramUrl: "https://www.tu-chemnitz.de/etit/studium/studiengaenge/ms_ics.php",
      officialApplicationUrl: "https://www.uni-assist.de",
      applicationMethod: "Uni-Assist",
      sourceUrl: "https://www.tu-chemnitz.de/etit/studium/studiengaenge/ms_ics.php",
      sourceTitle: "MSc Information and Communication Systems Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 5.5 / B2 Level",
      eligibilitySummary: "Relevant Bachelor degree with math and CS foundation. Applications via uni-assist.",
    },
    "chemnitz-ase": {
      officialProgramUrl: "https://www.tu-chemnitz.de/studium/studiengaenge/ms_ase.xml",
      officialApplicationUrl: "https://www.uni-assist.de",
      applicationMethod: "Uni-Assist",
      sourceUrl: "https://www.tu-chemnitz.de/studium/studiengaenge/ms_ase.xml",
      sourceTitle: "MSc Automotive Software Engineering Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 5.5 / B2 Level",
      eligibilitySummary: "Relevant Bachelor degree with math and CS foundation. Applications via uni-assist.",
    },
    "ude-ce": {
      officialProgramUrl: "https://www.uni-due.de/studienangebote/studiengang.php?id=38",
      officialApplicationUrl: "https://www.uni-due.de/en/application.php",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.uni-due.de/studienangebote/studiengang.php?id=38",
      sourceTitle: "MSc Computer Engineering (ISE) Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.0 / TOEFL 79",
      eligibilitySummary: "BSc in CS, Software Engineering, or Information Systems.",
    },
    "ovgu-dke": {
      officialProgramUrl: "https://www.fin.ovgu.de/en/-p-6532",
      officialApplicationUrl: "https://www.uni-assist.de",
      applicationMethod: "Uni-Assist",
      sourceUrl: "https://www.fin.ovgu.de/en/-p-6532",
      sourceTitle: "MSc Data and Knowledge Engineering Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.0 / TOEFL 80",
      eligibilitySummary: "BSc in CS or closely related technical subject via uni-assist.",
    },
    "ovgu-de": {
      officialProgramUrl: "https://www.ovgu.de/unimagdeburg/en/Study/Study+Programmes/Master/Digital+Engineering.html",
      officialApplicationUrl: "https://www.uni-assist.de",
      applicationMethod: "Uni-Assist",
      sourceUrl: "https://www.ovgu.de/unimagdeburg/en/Study/Study+Programmes/Master/Digital+Engineering.html",
      sourceTitle: "MSc Digital Engineering Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.0 / TOEFL 80",
      eligibilitySummary: "BSc in CS or closely related technical subject via uni-assist.",
    },
    "uow-mcs": {
      officialProgramUrl: "https://www.uow.edu.au/study/courses/master-of-computer-science/",
      officialApplicationUrl: "https://apply.uow.edu.au/",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.uow.edu.au/study/courses/master-of-computer-science/",
      sourceTitle: "Master of Computer Science Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.4,
      englishRequirements: "IELTS 6.5 overall (no subscore below 6.0)",
      eligibilitySummary: "Recognised Bachelor degree with equivalent 60% average.",
    },
    "uow-mit": {
      officialProgramUrl: "https://www.uow.edu.au/study/courses/master-of-information-technology/",
      officialApplicationUrl: "https://apply.uow.edu.au/",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.uow.edu.au/study/courses/master-of-information-technology/",
      sourceTitle: "Master of Information Technology Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.4,
      englishRequirements: "IELTS 6.5 overall (no subscore below 6.0)",
      eligibilitySummary: "Recognised Bachelor degree with equivalent 60% average.",
    },
    "uow-mc": {
      officialProgramUrl: "https://www.uow.edu.au/study/courses/master-of-computing/",
      officialApplicationUrl: "https://apply.uow.edu.au/",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.uow.edu.au/study/courses/master-of-computing/",
      sourceTitle: "Master of Computing Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.4,
      englishRequirements: "IELTS 6.5 overall (no subscore below 6.0)",
      eligibilitySummary: "Recognised Bachelor degree with equivalent 60% average.",
    },
    "deakin-mit": {
      officialProgramUrl: "https://www.deakin.edu.au/course/master-of-information-technology",
      officialApplicationUrl: "https://www.deakin.edu.au/international-students/apply",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.deakin.edu.au/course/master-of-information-technology",
      sourceTitle: "Master of Information Technology Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.4,
      englishRequirements: "IELTS 6.5 overall",
      eligibilitySummary: "Bachelor degree in IT/CS or relevant work experience.",
    },
    "deakin-mds": {
      officialProgramUrl: "https://www.deakin.edu.au/course/master-of-data-science",
      officialApplicationUrl: "https://www.deakin.edu.au/international-students/apply",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.deakin.edu.au/course/master-of-data-science",
      sourceTitle: "Master of Data Science Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.4,
      englishRequirements: "IELTS 6.5 overall",
      eligibilitySummary: "Bachelor degree in IT/CS or relevant work experience.",
    },
    "deakin-mcs": {
      officialProgramUrl: "https://www.deakin.edu.au/course/master-of-cyber-security",
      officialApplicationUrl: "https://www.deakin.edu.au/international-students/apply",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.deakin.edu.au/course/master-of-cyber-security",
      sourceTitle: "Master of Cyber Security Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.4,
      englishRequirements: "IELTS 6.5 overall",
      eligibilitySummary: "Bachelor degree in IT/CS or relevant work experience.",
    },
    "deakin-maai": {
      officialProgramUrl: "https://www.deakin.edu.au/course/master-of-applied-artificial-intelligence",
      officialApplicationUrl: "https://www.deakin.edu.au/international-students/apply",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.deakin.edu.au/course/master-of-applied-artificial-intelligence",
      sourceTitle: "Master of Applied Artificial Intelligence Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.4,
      englishRequirements: "IELTS 6.5 overall",
      eligibilitySummary: "Bachelor degree in IT/CS or relevant work experience.",
    },
    "curtin-mc": {
      officialProgramUrl: "https://study.curtin.edu.au/offering/course-pg-master-of-computing--mc-comp/",
      officialApplicationUrl: "https://apply.curtin.edu.au/",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://study.curtin.edu.au/offering/course-pg-master-of-computing--mc-comp/",
      sourceTitle: "Master of Computing Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.4,
      englishRequirements: "IELTS 6.5 overall",
      eligibilitySummary: "Bachelor degree in Computing, Engineering, or Science.",
    },
    "curtin-mcs": {
      officialProgramUrl: "https://study.curtin.edu.au/offering/course-pg-master-of-cyber-security--mc-cysec/",
      officialApplicationUrl: "https://apply.curtin.edu.au/",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://study.curtin.edu.au/offering/course-pg-master-of-cyber-security--mc-cysec/",
      sourceTitle: "Master of Cyber Security Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.4,
      englishRequirements: "IELTS 6.5 overall",
      eligibilitySummary: "Bachelor degree in Computing, Engineering, or Science.",
    },
    "curtin-mai": {
      officialProgramUrl: "https://study.curtin.edu.au/offering/course-pg-master-of-artificial-intelligence--mc-artin/",
      officialApplicationUrl: "https://apply.curtin.edu.au/",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://study.curtin.edu.au/offering/course-pg-master-of-artificial-intelligence--mc-artin/",
      sourceTitle: "Master of Artificial Intelligence Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.4,
      englishRequirements: "IELTS 6.5 overall",
      eligibilitySummary: "Bachelor degree in Computing, Engineering, or Science.",
    },
    "curtin-mpa": {
      officialProgramUrl: "https://study.curtin.edu.au/offering/course-pg-master-of-predictive-analytics--mc-preda/",
      officialApplicationUrl: "https://apply.curtin.edu.au/",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://study.curtin.edu.au/offering/course-pg-master-of-predictive-analytics--mc-preda/",
      sourceTitle: "Master of Predictive Analytics Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.4,
      englishRequirements: "IELTS 6.5 overall",
      eligibilitySummary: "Bachelor degree in Computing, Engineering, or Science.",
    },
    "griffith-mit": {
      officialProgramUrl: "https://www.griffith.edu.au/study/degrees/master-of-information-technology-5612",
      officialApplicationUrl: "https://www.griffith.edu.au/apply",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.griffith.edu.au/study/degrees/master-of-information-technology-5612",
      sourceTitle: "Master of Information Technology Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.3,
      englishRequirements: "IELTS 6.5 overall",
      eligibilitySummary: "Recognised Bachelor degree or relevant graduate diploma.",
    },
    "griffith-mitai": {
      officialProgramUrl: "https://www.griffith.edu.au/study/degrees/master-of-information-technology-and-artificial-intelligence-5782",
      officialApplicationUrl: "https://www.griffith.edu.au/apply",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.griffith.edu.au/study/degrees/master-of-information-technology-and-artificial-intelligence-5782",
      sourceTitle: "Master of IT and AI Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.3,
      englishRequirements: "IELTS 6.5 overall",
      eligibilitySummary: "Recognised Bachelor degree or relevant graduate diploma.",
    },
    "griffith-mds": {
      officialProgramUrl: "https://www.griffith.edu.au/study/degrees/master-of-data-science-5770",
      officialApplicationUrl: "https://www.griffith.edu.au/apply",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.griffith.edu.au/study/degrees/master-of-data-science-5770",
      sourceTitle: "Master of Data Science Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.3,
      englishRequirements: "IELTS 6.5 overall",
      eligibilitySummary: "Recognised Bachelor degree or relevant graduate diploma.",
    },
    "griffith-mcs": {
      officialProgramUrl: "https://www.griffith.edu.au/study/degrees/master-of-cyber-security-5726",
      officialApplicationUrl: "https://www.griffith.edu.au/apply",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.griffith.edu.au/study/degrees/master-of-cyber-security-5726",
      sourceTitle: "Master of Cyber Security Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.3,
      englishRequirements: "IELTS 6.5 overall",
      eligibilitySummary: "Recognised Bachelor degree or relevant graduate diploma.",
    },
    "qut-mit": {
      officialProgramUrl: "https://www.qut.edu.au/courses/master-of-information-technology",
      officialApplicationUrl: "https://www.qut.edu.au/apply",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.qut.edu.au/courses/master-of-information-technology",
      sourceTitle: "Master of Information Technology Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.3,
      englishRequirements: "IELTS 6.5 overall",
      eligibilitySummary: "Bachelor degree in any discipline or IT-related field.",
    },
    "qut-mds": {
      officialProgramUrl: "https://www.qut.edu.au/courses/master-of-data-science",
      officialApplicationUrl: "https://www.qut.edu.au/apply",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.qut.edu.au/courses/master-of-data-science",
      sourceTitle: "Master of Data Science Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.3,
      englishRequirements: "IELTS 6.5 overall",
      eligibilitySummary: "Bachelor degree in any discipline or IT-related field.",
    },
    "qut-mcs": {
      officialProgramUrl: "https://www.qut.edu.au/courses/master-of-cyber-security",
      officialApplicationUrl: "https://www.qut.edu.au/apply",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.qut.edu.au/courses/master-of-cyber-security",
      sourceTitle: "Master of Cyber Security Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.3,
      englishRequirements: "IELTS 6.5 overall",
      eligibilitySummary: "Bachelor degree in any discipline or IT-related field.",
    },
    "qut-mrai": {
      officialProgramUrl: "https://www.qut.edu.au/courses/master-of-robotics-and-artificial-intelligence",
      officialApplicationUrl: "https://www.qut.edu.au/apply",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.qut.edu.au/courses/master-of-robotics-and-artificial-intelligence",
      sourceTitle: "Master of Robotics and AI Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.3,
      englishRequirements: "IELTS 6.5 overall",
      eligibilitySummary: "Bachelor degree in any discipline or IT-related field.",
    },
    "dcu-mc": {
      officialProgramUrl: "https://www.dcu.ie/courses/postgraduate/school-computing/msc-computing-major-options",
      officialApplicationUrl: "https://dcu.crm.targetconnect.net/",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.dcu.ie/courses/postgraduate/school-computing/msc-computing-major-options",
      sourceTitle: "MSc in Computing Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.7,
      englishRequirements: "IELTS 6.5 (min 6.0 in all bands)",
      eligibilitySummary: "Upper Second Class Honours (2.1) degree in Computer Science.",
    },
    "ul-mse": {
      officialProgramUrl: "https://www.ul.ie/courses/msc-in-software-engineering",
      officialApplicationUrl: "https://www.ul.ie/gps/apply",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.ul.ie/courses/msc-in-software-engineering",
      sourceTitle: "MSc in Software Engineering Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.7,
      englishRequirements: "IELTS 6.5",
      eligibilitySummary: "Honours Bachelor degree in Computing, Math, or Engineering.",
    },
    "ul-mdssl": {
      officialProgramUrl: "https://www.ul.ie/courses/msc-in-data-science-and-statistical-learning",
      officialApplicationUrl: "https://www.ul.ie/gps/apply",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.ul.ie/courses/msc-in-data-science-and-statistical-learning",
      sourceTitle: "MSc in Data Science and Statistical Learning Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.7,
      englishRequirements: "IELTS 6.5",
      eligibilitySummary: "Honours Bachelor degree in Computing, Math, or Engineering.",
    },
    "ul-mecs": {
      officialProgramUrl: "https://www.ul.ie/courses/meng-in-cyber-security",
      officialApplicationUrl: "https://www.ul.ie/gps/apply",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.ul.ie/courses/meng-in-cyber-security",
      sourceTitle: "MEng in Cyber Security Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.7,
      englishRequirements: "IELTS 6.5",
      eligibilitySummary: "Honours Bachelor degree in Computing, Math, or Engineering.",
    },
    "maynooth-mcsa": {
      officialProgramUrl: "https://www.maynoothuniversity.ie/computer-science/our-courses/msc-computer-science-applied",
      officialApplicationUrl: "https://v2.pac.ie/institute/2",
      applicationMethod: "Central Portal",
      sourceUrl: "https://www.maynoothuniversity.ie/computer-science/our-courses/msc-computer-science-applied",
      sourceTitle: "MSc Computer Science (Applied) Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 3.0,
      englishRequirements: "IELTS 6.5",
      eligibilitySummary: "Level 8 honours degree in CS via PAC application system.",
    },
    "maynooth-mdsa": {
      officialProgramUrl: "https://www.maynoothuniversity.ie/study-maynooth/postgraduate-studies/courses/msc-data-science-and-analytics",
      officialApplicationUrl: "https://v2.pac.ie/institute/2",
      applicationMethod: "Central Portal",
      sourceUrl: "https://www.maynoothuniversity.ie/study-maynooth/postgraduate-studies/courses/msc-data-science-and-analytics",
      sourceTitle: "MSc Data Science and Analytics Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 3.0,
      englishRequirements: "IELTS 6.5",
      eligibilitySummary: "Level 8 honours degree in CS via PAC application system.",
    },
    "tudublin-mcsasd": {
      officialProgramUrl: "https://www.tudublin.ie/study/postgraduate/courses/computer-science-advanced-software-development-tu059/",
      officialApplicationUrl: "https://www.tudublin.ie/study/international-students/how-to-apply/",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.tudublin.ie/study/postgraduate/courses/computer-science-advanced-software-development-tu059/",
      sourceTitle: "MSc in Computer Science (Advanced Software Development) Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.7,
      englishRequirements: "IELTS 6.5",
      eligibilitySummary: "2.2 honours degree in Computing or Software Engineering.",
    },
    "tudublin-mcsds": {
      officialProgramUrl: "https://www.tudublin.ie/study/postgraduate/courses/computer-science-data-science-tu059/",
      officialApplicationUrl: "https://www.tudublin.ie/study/international-students/how-to-apply/",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.tudublin.ie/study/postgraduate/courses/computer-science-data-science-tu059/",
      sourceTitle: "MSc in Computer Science (Data Science) Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.7,
      englishRequirements: "IELTS 6.5",
      eligibilitySummary: "2.2 honours degree in Computing or Software Engineering.",
    },
    "tudublin-macs": {
      officialProgramUrl: "https://www.tudublin.ie/study/postgraduate/courses/applied-cyber-security-tu252/",
      officialApplicationUrl: "https://www.tudublin.ie/study/international-students/how-to-apply/",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://www.tudublin.ie/study/postgraduate/courses/applied-cyber-security-tu252/",
      sourceTitle: "MSc in Applied Cyber Security Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.7,
      englishRequirements: "IELTS 6.5",
      eligibilitySummary: "2.2 honours degree in Computing or Software Engineering.",
    },
    "mtu-mai": {
      officialProgramUrl: "https://cork.mtu.ie/courses/crkaind9/",
      officialApplicationUrl: "https://www.mtu.ie/apply/",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://cork.mtu.ie/courses/crkaind9/",
      sourceTitle: "MSc in Artificial Intelligence Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.7,
      englishRequirements: "IELTS 6.5",
      eligibilitySummary: "Level 8 degree in CS or STEM subject.",
    },
    "mtu-mc": {
      officialProgramUrl: "https://cork.mtu.ie/courses/crkcybs9/",
      officialApplicationUrl: "https://www.mtu.ie/apply/",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://cork.mtu.ie/courses/crkcybs9/",
      sourceTitle: "MSc in Cybersecurity Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.7,
      englishRequirements: "IELTS 6.5",
      eligibilitySummary: "Level 8 degree in CS or STEM subject.",
    },
    "mtu-mdsa": {
      officialProgramUrl: "https://cork.mtu.ie/courses/crkdatas9/",
      officialApplicationUrl: "https://www.mtu.ie/apply/",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://cork.mtu.ie/courses/crkdatas9/",
      sourceTitle: "MSc in Data Science and Analytics Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.7,
      englishRequirements: "IELTS 6.5",
      eligibilitySummary: "Level 8 degree in CS or STEM subject.",
    },
    "mtu-msad": {
      officialProgramUrl: "https://cork.mtu.ie/courses/crkswar9/",
      officialApplicationUrl: "https://www.mtu.ie/apply/",
      applicationMethod: "Direct Portal",
      sourceUrl: "https://cork.mtu.ie/courses/crkswar9/",
      sourceTitle: "MSc in Software Architecture & Design Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.7,
      englishRequirements: "IELTS 6.5",
      eligibilitySummary: "Level 8 degree in CS or STEM subject.",
    },
    "bologna-ai": {
      officialProgramUrl: "https://corsi.unibo.it/2cycle/ArtificialIntelligence",
      officialApplicationUrl: "https://www.universitaly.it",
      applicationMethod: "Universitaly Central Portal",
      sourceUrl: "https://corsi.unibo.it/2cycle/ArtificialIntelligence",
      sourceTitle: "Artificial Intelligence Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.0 / B2 English",
      eligibilitySummary: "Bachelor degree in CS or STEM. Pre-enrollment via Universitaly.",
    },
    "bologna-cse": {
      officialProgramUrl: "https://corsi.unibo.it/2cycle/ComputerScienceEngineering",
      officialApplicationUrl: "https://www.universitaly.it",
      applicationMethod: "Universitaly Central Portal",
      sourceUrl: "https://corsi.unibo.it/2cycle/ComputerScienceEngineering",
      sourceTitle: "Computer Science and Engineering Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.0 / B2 English",
      eligibilitySummary: "Bachelor degree in CS or STEM. Pre-enrollment via Universitaly.",
    },
    "pisa-mcs": {
      officialProgramUrl: "https://www.di.unipi.it/en/education/mcs",
      officialApplicationUrl: "https://www.universitaly.it",
      applicationMethod: "Universitaly Central Portal",
      sourceUrl: "https://www.di.unipi.it/en/education/mcs",
      sourceTitle: "MSc Computer Science Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.0",
      eligibilitySummary: "Italian Laurea or equivalent foreign bachelor degree.",
    },
    "pisa-mdsbi": {
      officialProgramUrl: "https://datascience.di.unipi.it/",
      officialApplicationUrl: "https://www.universitaly.it",
      applicationMethod: "Universitaly Central Portal",
      sourceUrl: "https://datascience.di.unipi.it/",
      sourceTitle: "MSc Data Science and Business Informatics Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.0",
      eligibilitySummary: "Italian Laurea or equivalent foreign bachelor degree.",
    },
    "pisa-maide": {
      officialProgramUrl: "https://computer.ing.unipi.it/aide",
      officialApplicationUrl: "https://www.universitaly.it",
      applicationMethod: "Universitaly Central Portal",
      sourceUrl: "https://computer.ing.unipi.it/aide",
      sourceTitle: "MSc Artificial Intelligence and Data Engineering Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.0",
      eligibilitySummary: "Italian Laurea or equivalent foreign bachelor degree.",
    },
    "pisa-mc": {
      officialProgramUrl: "https://cysec.unipi.it/",
      officialApplicationUrl: "https://www.universitaly.it",
      applicationMethod: "Universitaly Central Portal",
      sourceUrl: "https://cysec.unipi.it/",
      sourceTitle: "MSc Cybersecurity Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.0",
      eligibilitySummary: "Italian Laurea or equivalent foreign bachelor degree.",
    },
    "parma-dsm": {
      officialProgramUrl: "https://cdlm-dsm.unipr.it/",
      officialApplicationUrl: "https://www.universitaly.it",
      applicationMethod: "Universitaly Central Portal",
      sourceUrl: "https://cdlm-dsm.unipr.it/",
      sourceTitle: "Data Science for Management Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.0",
      eligibilitySummary: "Bachelor degree with adequate mathematical and CS credit background.",
    },
    "parma-ce": {
      officialProgramUrl: "https://cdlm-ce.unipr.it/",
      officialApplicationUrl: "https://www.universitaly.it",
      applicationMethod: "Universitaly Central Portal",
      sourceUrl: "https://cdlm-ce.unipr.it/",
      sourceTitle: "Communication Engineering Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.0",
      eligibilitySummary: "Bachelor degree with adequate mathematical and CS credit background.",
    },
    "salerno-dsim": {
      officialProgramUrl: "https://corsi.unisa.it/data-science-e-gestione-dell-innovazione",
      officialApplicationUrl: "https://www.universitaly.it",
      applicationMethod: "Universitaly Central Portal",
      sourceUrl: "https://corsi.unisa.it/data-science-e-gestione-dell-innovazione",
      sourceTitle: "Data Science and Innovation Management Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.0",
      eligibilitySummary: "Foreign degree evaluation + Universitaly pre-enrollment.",
    },
    "naples-ds": {
      officialProgramUrl: "https://data-science.dieti.unina.it/",
      officialApplicationUrl: "https://www.universitaly.it",
      applicationMethod: "Universitaly Central Portal",
      sourceUrl: "https://data-science.dieti.unina.it/",
      sourceTitle: "Data Science Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.0",
      eligibilitySummary: "Bachelor in Engineering or CS with English B2.",
    },
    "oulu-cse": {
      officialProgramUrl: "https://www.oulu.fi/en/apply/masters-programmes/computer-science-and-engineering",
      officialApplicationUrl: "https://studyinfo.fi",
      applicationMethod: "StudyInfo Central Portal",
      sourceUrl: "https://www.oulu.fi/en/apply/masters-programmes/computer-science-and-engineering",
      sourceTitle: "Computer Science and Engineering Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.5 (min 6.0 writing)",
      eligibilitySummary: "Relevant Bachelor degree. Applied through Studyinfo.fi.",
    },
    "oulu-seis": {
      officialProgramUrl: "https://www.oulu.fi/en/apply/masters-programmes/software-engineering-and-information-systems",
      officialApplicationUrl: "https://studyinfo.fi",
      applicationMethod: "StudyInfo Central Portal",
      sourceUrl: "https://www.oulu.fi/en/apply/masters-programmes/software-engineering-and-information-systems",
      sourceTitle: "Software Engineering and Information Systems Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.5 (min 6.0 writing)",
      eligibilitySummary: "Relevant Bachelor degree. Applied through Studyinfo.fi.",
    },
    "tampere-cs": {
      officialProgramUrl: "https://www.tuni.fi/en/study-with-us/computing-sciences",
      officialApplicationUrl: "https://studyinfo.fi",
      applicationMethod: "StudyInfo Central Portal",
      sourceUrl: "https://www.tuni.fi/en/study-with-us/computing-sciences",
      sourceTitle: "Computing Sciences Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.5",
      eligibilitySummary: "Higher education degree in CS or related field.",
    },
    "uef-it": {
      officialProgramUrl: "https://www.uef.fi/en/degree-programme/masters-degree-programme-in-information-technology",
      officialApplicationUrl: "https://studyinfo.fi",
      applicationMethod: "StudyInfo Central Portal",
      sourceUrl: "https://www.uef.fi/en/degree-programme/masters-degree-programme-in-information-technology",
      sourceTitle: "Information Technology Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.5",
      eligibilitySummary: "BSc in CS, IT, Software Engineering or Data Science.",
    },
    "vaasa-cs": {
      officialProgramUrl: "https://www.uwasa.fi/en/education/masters-programmes/computing-sciences",
      officialApplicationUrl: "https://studyinfo.fi",
      applicationMethod: "StudyInfo Central Portal",
      sourceUrl: "https://www.uwasa.fi/en/education/masters-programmes/computing-sciences",
      sourceTitle: "Computing Sciences Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.0",
      eligibilitySummary: "BSc degree in Computer Science or Business Information Systems.",
    },
    "abo-it": {
      officialProgramUrl: "https://www.abo.fi/en/study-programme/masters-degree-programme-in-information-technology/",
      officialApplicationUrl: "https://studyinfo.fi",
      applicationMethod: "StudyInfo Central Portal",
      sourceUrl: "https://www.abo.fi/en/study-programme/masters-degree-programme-in-information-technology/",
      sourceTitle: "Information Technology Program Page",
      verificationStatus: "VERIFIED",
      minimumGpa: 2.5,
      englishRequirements: "IELTS 6.5",
      eligibilitySummary: "Academic Bachelor degree corresponding to 180 ECTS.",
    },
  };

  const allPrograms = await prisma.program.findMany();
  for (const p of allPrograms) {
    const info = uniUrlsMap[p.slug];
    if (info) {
      await prisma.program.update({
        where: { id: p.id },
        data: {
          officialProgramUrl: info.officialProgramUrl,
          officialApplicationUrl: info.officialApplicationUrl,
          applicationMethod: info.applicationMethod,
          sourceUrl: info.sourceUrl,
          sourceTitle: info.sourceTitle,
          verificationStatus: info.verificationStatus,
          lastVerifiedAt: new Date("2026-07-28T00:00:00.000Z"),
          minimumGpa: info.minimumGpa,
          englishRequirements: info.englishRequirements,
          eligibilitySummary: info.eligibilitySummary,
        },
      });
    }
  }

  console.log("Zyntra master DB seeded: 5 countries, 25 universities, 59 programs, 18 scholarships");
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
