const normalize = (value: string) => value.toLowerCase().trim();

const titleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const todayLabel = () =>
  new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const extractDays = (prompt: string): string => {
  const match = prompt.match(/(\d+)\s*(day|days)/i);
  return match ? `${match[1]} day${match[1] === "1" ? "" : "s"}` : "2 days";
};

const extractReason = (prompt: string): string => {
  const reasonMatch = prompt.match(/for\s+(.+?)(?:\.|,|$)/i);
  if (reasonMatch?.[1]) return reasonMatch[1].trim();
  if (/medical|sick|fever|health/i.test(prompt)) return "a medical reason";
  if (/family|personal/i.test(prompt)) return "a personal reason";
  if (/travel|trip/i.test(prompt)) return "travel";
  return "a personal reason";
};

const leaveApplication = (prompt: string) => {
  const days = extractDays(prompt);
  const reason = extractReason(prompt);
  return `Subject: Leave Application

Dear Sir/Madam,

I hope you are doing well. I am writing to request ${days} of leave due to ${reason}. I kindly request leave from [start date] to [end date].

I have completed my priority tasks and shared necessary updates with the team to avoid disruption.

Please approve my leave request.

Thank you for your consideration.

Sincerely,
[Your Name]
[Employee ID / Class]
[Date: ${todayLabel()}]`;
};

const resignationLetter = () => `Subject: Resignation Letter

Dear [Manager Name],

Please accept this letter as formal notice of my resignation from my position at [Company Name], effective [Last Working Day].

I am grateful for the opportunities and guidance I received during my time here. I appreciate the support from the team and leadership.

I will complete pending tasks and ensure a smooth handover before my last day.

Thank you once again.

Sincerely,
[Your Name]
[Date: ${todayLabel()}]`;

const formalEmail = (prompt: string) => {
  const cleaned = prompt.replace(/^generate\s*/i, "").trim();
  const topic = cleaned ? titleCase(cleaned) : "Requested Update";
  return `Subject: ${topic}

Dear [Recipient Name],

I hope you are doing well. I am writing regarding ${cleaned || "the requested update"}.

[Add your key details in 2-3 short points]
- Point 1
- Point 2
- Point 3

Please let me know if any additional information is needed.

Best regards,
[Your Name]`;
};

const apologyLetter = () => `Subject: Apology Letter

Dear [Recipient Name],

I sincerely apologize for the inconvenience caused by [issue].

I understand the impact this created and take full responsibility. I have already taken corrective steps to prevent this from happening again.

Thank you for your patience and understanding.

Sincerely,
[Your Name]`;

const complaintLetter = () => `Subject: Complaint Regarding [Issue]

Dear [Recipient Name / Team],

I am writing to formally raise a complaint about [issue]. This occurred on [date] and affected [impact].

I request that this matter be reviewed and resolved at the earliest. Kindly share the next steps.

Thank you.

Sincerely,
[Your Name]`;

const generalWriter = (prompt: string) => {
  const cleaned = prompt.trim();
  return `Topic: ${cleaned || "General Writing"}

Introduction:
${cleaned || "This topic is important because it influences practical outcomes in daily work and communication."}

Main Points:
1. Explain the context clearly.
2. Present key facts or examples.
3. Highlight benefits, challenges, and practical impact.

Conclusion:
In summary, ${cleaned || "this topic"} should be approached with clarity, planning, and consistent execution.`;
};

export const generateAIWriting = (prompt: string): string => {
  const input = normalize(prompt);
  if (!input) {
    return "Enter a prompt like: generate leave application for 3 days due to fever.";
  }

  if (/\bleave\b|\bleave application\b/.test(input)) return leaveApplication(prompt);
  if (/\bresign|\bresignation\b/.test(input)) return resignationLetter();
  if (/\bformal email\b|\bmail\b|\bemail\b/.test(input)) return formalEmail(prompt);
  if (/\bapology\b|\bsorry\b/.test(input)) return apologyLetter();
  if (/\bcomplaint\b/.test(input)) return complaintLetter();

  return generalWriter(prompt);
};
