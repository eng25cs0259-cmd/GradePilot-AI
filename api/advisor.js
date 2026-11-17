
const gradePoints = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  P: 4,
  F: 0,
};

module.exports = (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, sgpa, subjects } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({
      error: "Please enter a question.",
    });
  }

  const completed = Array.isArray(subjects)
    ? subjects.filter(
        (s) => s.grade && gradePoints[s.grade] !== undefined
      )
    : [];

  if (completed.length === 0) {
    return res.status(200).json({
      source: "fallback-engine",
      answer: "Enter your grades first so I can analyze your performance.",
    });
  }

  const ranked = [...completed].sort(
    (a, b) => gradePoints[a.grade] - gradePoints[b.grade]
  );

  const weakest = ranked[0];
  const strongest = ranked[ranked.length - 1];

  const q = question.toLowerCase();
  let answer;

  if (q.includes("weak") || q.includes("improve") || q.includes("study")) {
    answer = `Your lowest-scoring subject is ${weakest.name} (${weakest.grade}). Your strongest subject is ${strongest.name} (${strongest.grade}). Give ${weakest.name} extra revision time, practise questions and review your mistakes regularly.`;
  } else if (q.includes("strong") || q.includes("best")) {
    answer = `Your strongest entered subject is ${strongest.name}, with grade ${strongest.grade} and ${gradePoints[strongest.grade]} grade points. Keep up the good work!`;
  } else {
    answer = `Your current SGPA is ${sgpa ?? "not provided"}. Your strongest subject is ${strongest.name}, and your lowest-scoring subject is ${weakest.name}. Keep practising consistently to improve your performance.`;
  }

  return res.status(200).json({
    source: "fallback-engine",
    answer,
  });
};
