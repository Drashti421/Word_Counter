export async function checkGrammar(text: string) {
  const res = await fetch("https://api.languagetool.org/v2/check", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      text: text,
      language: "en-US",
    }),
  });

  const data = await res.json();
  return data.matches;
}
