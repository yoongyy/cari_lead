export type IntentLevel = "High" | "Medium" | "Low";
export type TrendDirection = "Growing" | "Stable" | "Shrinking";

export interface DemoOpportunity {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  location: string;
  intent: IntentLevel;
  confidence: number;
  posted: string;
  signal: string;
  knownFacts: string[];
  unknownFacts: string[];
  suggestedResponse: string;
  warnings: string[];
}

export interface Theme {
  name: string;
  mentions: number;
  share: number;
  direction: TrendDirection;
  change: string;
  summary: string;
}

export const reportMeta = {
  title: "Malaysia Insurance Customer Voice Report",
  edition: "Sample edition · Demo data",
  period: "Illustrative 7-day window",
  conversations: 126,
  highIntent: 18,
  leadingProduct: "Medical card",
  fastestGrowing: "Premium increase",
};

export const themes: Theme[] = [
  { name: "Premium increases", mentions: 34, share: 27, direction: "Growing", change: "+9 pts", summary: "People question renewal jumps and ask whether to reduce benefits or compare alternatives." },
  { name: "Medical card limits", mentions: 26, share: 21, direction: "Growing", change: "+5 pts", summary: "Questions focus on annual limits, room rates, exclusions, and co-insurance." },
  { name: "Claims clarity", mentions: 20, share: 16, direction: "Stable", change: "+1 pt", summary: "Customers want clearer documentation, timelines, and reasons for partial approvals." },
  { name: "Agent responsiveness", mentions: 16, share: 13, direction: "Shrinking", change: "-4 pts", summary: "Service complaints remain visible but form a smaller share of this demo period." },
  { name: "Family protection", mentions: 15, share: 12, direction: "Growing", change: "+3 pts", summary: "Young families seek simple coverage comparisons that fit a fixed monthly budget." },
  { name: "Policy cancellation", mentions: 15, share: 12, direction: "Stable", change: "0 pts", summary: "People ask about surrender value, waiting periods, and replacement-policy risks." },
];

export const insurerMentions = [
  { name: "AIA", mentions: 24, positive: 9, neutral: 8, negative: 7 },
  { name: "Prudential", mentions: 22, positive: 7, neutral: 8, negative: 7 },
  { name: "Great Eastern", mentions: 17, positive: 7, neutral: 6, negative: 4 },
  { name: "Allianz", mentions: 15, positive: 6, neutral: 6, negative: 3 },
  { name: "Etiqa", mentions: 12, positive: 5, neutral: 5, negative: 2 },
];

export const productThemes = [
  { name: "Medical cards", mentions: 39, signal: "Comparisons and limit questions" },
  { name: "Life protection", mentions: 25, signal: "Affordability and family needs" },
  { name: "Critical illness", mentions: 19, signal: "Coverage scope questions" },
  { name: "Motor insurance", mentions: 16, signal: "Renewal price comparisons" },
  { name: "Takaful", mentions: 14, signal: "Shariah-compliant alternatives" },
];

export const opportunities: DemoOpportunity[] = [
  {
    id: "medical-card-budget",
    title: "Looking for a medical card below RM250 monthly",
    excerpt: "A young parent is comparing plans and wants a clear explanation of annual limits and room coverage.",
    category: "Medical card",
    location: "Selangor",
    intent: "High",
    confidence: 92,
    posted: "2 hours ago",
    signal: "Budget + comparison request",
    knownFacts: ["Monthly budget below RM250", "Wants medical-card comparisons", "Asks about annual and room limits"],
    unknownFacts: ["Age and underwriting profile", "Existing coverage", "Preferred insurer or takaful requirement"],
    suggestedResponse: "Offer a short, neutral comparison framework covering annual limit, room rate, co-insurance, waiting periods, and exclusions. Ask permission before discussing personal circumstances privately.",
    warnings: ["Do not promise approval or claim outcomes", "Do not request medical details in a public reply"],
  },
  {
    id: "premium-jump",
    title: "Renewal premium increased sharply this year",
    excerpt: "The poster wants to understand whether repricing is normal and what can be adjusted without losing essential protection.",
    category: "Policy review",
    location: "Kuala Lumpur",
    intent: "High",
    confidence: 89,
    posted: "4 hours ago",
    signal: "Switching risk + cost pain",
    knownFacts: ["Renewal cost increased", "Customer is considering alternatives", "Wants to retain core protection"],
    unknownFacts: ["Policy type and rider structure", "Increase amount", "Current benefits and exclusions"],
    suggestedResponse: "Explain that repricing can have several causes and offer to compare adjustment paths such as room rate, deductible, or rider structure using the policy documents.",
    warnings: ["Do not recommend cancellation before replacement is active", "State that actual options depend on policy terms"],
  },
  {
    id: "claim-documents",
    title: "Unsure which documents are needed for a claim",
    excerpt: "A customer is asking for a practical checklist after receiving conflicting instructions.",
    category: "Claims support",
    location: "Penang",
    intent: "Medium",
    confidence: 82,
    posted: "Yesterday",
    signal: "Service recovery opportunity",
    knownFacts: ["Claim process has started", "Instructions were unclear", "Customer wants a checklist"],
    unknownFacts: ["Claim category", "Insurer requirements", "Submission deadline"],
    suggestedResponse: "Share a general checklist and direct the customer to the insurer's official claim guide. Offer help interpreting the checklist without asking for documents publicly.",
    warnings: ["Never request identity or medical documents in public", "Use the insurer's current official requirements"],
  },
  {
    id: "newborn-cover",
    title: "Comparing protection options for a newborn",
    excerpt: "New parents want a simple explanation of medical and life protection priorities.",
    category: "Family protection",
    location: "Johor",
    intent: "High",
    confidence: 88,
    posted: "Yesterday",
    signal: "Life event + active research",
    knownFacts: ["Newborn coverage is the priority", "Parents are comparing options", "Needs plain-language guidance"],
    unknownFacts: ["Budget", "Existing family coverage", "Eligibility and underwriting details"],
    suggestedResponse: "Provide an educational sequence: immediate medical needs, parent protection, affordability, and policy conditions. Invite them to set a budget before comparing products.",
    warnings: ["Avoid urgency tactics", "Explain waiting periods and underwriting clearly"],
  },
  {
    id: "agent-unresponsive",
    title: "Current agent is no longer responding",
    excerpt: "The policyholder needs servicing help and is asking how to change the servicing agent.",
    category: "Agent service",
    location: "Perak",
    intent: "Medium",
    confidence: 84,
    posted: "2 days ago",
    signal: "Provider switching signal",
    knownFacts: ["Existing policy needs servicing", "Current agent is unresponsive", "Customer asks about reassignment"],
    unknownFacts: ["Insurer", "Service request", "Whether the agent is still active"],
    suggestedResponse: "Point to the insurer's official servicing channels and explain that agent reassignment processes differ. Offer general guidance without criticizing the current representative.",
    warnings: ["Do not solicit confidential policy numbers publicly", "Avoid unverified claims about another agent"],
  },
  {
    id: "takaful-comparison",
    title: "Seeking takaful alternatives with similar benefits",
    excerpt: "A buyer wants to compare takaful and conventional plans at roughly the same budget.",
    category: "Takaful",
    location: "Negeri Sembilan",
    intent: "High",
    confidence: 90,
    posted: "2 days ago",
    signal: "Alternative product request",
    knownFacts: ["Prefers takaful options", "Has a fixed comparison budget", "Wants equivalent benefits"],
    unknownFacts: ["Current plan", "Coverage priorities", "Contribution horizon"],
    suggestedResponse: "Compare benefit definitions, contribution structure, exclusions, and sustainability rather than positioning products as exact equivalents.",
    warnings: ["Do not imply identical coverage", "Use current product disclosure sheets"],
  },
  {
    id: "critical-illness-gap",
    title: "Does a medical card cover loss of income?",
    excerpt: "A salaried worker is discovering the difference between hospital bills and critical-illness cash benefits.",
    category: "Critical illness",
    location: "Sabah",
    intent: "Medium",
    confidence: 79,
    posted: "3 days ago",
    signal: "Coverage gap education",
    knownFacts: ["Has or is considering a medical card", "Concerned about income interruption", "Needs product-category clarity"],
    unknownFacts: ["Emergency savings", "Employer benefits", "Existing life or critical-illness cover"],
    suggestedResponse: "Explain the general difference between reimbursement-based medical coverage and lump-sum protection, then suggest a needs and budget review.",
    warnings: ["Avoid personalized sufficiency claims without a fact-find", "Do not present benefits as guaranteed"],
  },
  {
    id: "motor-renewal",
    title: "Motor renewal quote is higher despite no claims",
    excerpt: "The owner is comparing renewal channels and asking which factors affect the premium.",
    category: "Motor insurance",
    location: "Melaka",
    intent: "Medium",
    confidence: 81,
    posted: "3 days ago",
    signal: "Price comparison",
    knownFacts: ["No recent claim reported", "Renewal quote increased", "Customer is shopping around"],
    unknownFacts: ["Vehicle and insured value", "Coverage add-ons", "No-claim discount details"],
    suggestedResponse: "List common quote variables and suggest comparing insured value, add-ons, excess, and service features on a like-for-like basis.",
    warnings: ["Do not infer the cause without the quote breakdown", "Confirm details through licensed channels"],
  },
];

export const comparisonRows = [
  { feature: "Weekly customer-voice summary", free: true, paid: true },
  { feature: "Top complaints and product themes", free: true, paid: true },
  { feature: "Curated opportunity previews", free: "3 examples", paid: "Full monitored feed" },
  { feature: "Intent and confidence scoring", free: false, paid: true },
  { feature: "Suggested response guidance", free: false, paid: true },
  { feature: "Saved searches and team workflow", free: false, paid: true },
];
