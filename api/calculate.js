
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

const subjectCredits = {
  DLD: 4,
  DBMS: 4,
  ASSP: 3,
  DMGT: 3,
  DSA: 4,
  FAI: 2,
  SEC: 2,
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    const sgpa = totalCredits > 0
      ? Number((totalPoints / totalCredits).toFixed(2))
      : 0;

    return res.status(200).json({
      sgpa,
      totalCredits,
      totalPoints,
      message: "SGPA calculated successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Unable to calculate SGPA.",
    });
  }
}
