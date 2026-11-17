
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Grade point mapping (provisional until officially verified)
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

// Subject credits
const subjectCredits = {
  DLD: 4,
  DBMS: 4,
  ASSP: 3,
  DMGT: 3,
  DSA: 4,
  FAI: 2,
  SEC: 2,
};

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to GradePilot AI Backend!",
    status: "Running",
  });
});

// SGPA calculation API
app.post("/api/calculate", (req, res) => {
  try {
    const { subjects } = req.body;

    if (!Array.isArray(subjects)) {
      return res.status(400).json({
        error: "Subjects must be provided as an array.",
      });
    }

    let totalCredits = 0;
    let totalPoints = 0;

    for (const subject of subjects) {
      const credits = subjectCredits[subject.name];
      const points = gradePoints[subject.grade];

      if (credits === undefined || points === undefined) {
        return res.status(400).json({
          error: `Invalid subject or grade: ${subject.name}`,
        });
      }

      totalCredits += credits;
      totalPoints += credits * points;
    }

    const sgpa =
      totalCredits > 0
        ? Number((totalPoints / totalCredits).toFixed(2))
        : 0;

    res.json({
      sgpa,
      totalCredits,
      totalPoints,
      message: "SGPA calculated successfully!",
    });
  } catch (error) {
    res.status(500).json({
      error: "Unable to calculate SGPA.",
    });
  }
});

// Academic advisor API
app.post("/api/advisor", (req, res) => {
  const { question, sgpa, subjects } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({
      error: "Please enter a question.",
    });
  }

  const completed = Array.isArray(subjects)
    ? subjects.filter((s) => s.grade && gradePoints[s.grade] !== undefined)
    : [];

  if (completed.length === 0) {
    return res.json({
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

  res.json({
    source: "fallback-engine",
    answer,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`GradePilot AI backend running at http://localhost:${PORT}`);
});
