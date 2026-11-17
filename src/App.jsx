
import { useState } from "react";
import "./App.css";

const initialSubjects = [
  { id: 1, name: "DLD", credits: "", grade: "" },
  { id: 2, name: "DBMS", credits: "", grade: "" },
  { id: 3, name: "ASSP", credits: "", grade: "" },
  { id: 4, name: "DMGT", credits: "", grade: "" },
  { id: 5, name: "DSA", credits: "", grade: "" },
  { id: 6, name: "FAI", credits: "", grade: "" },
  { id: 7, name: "SEC", credits: "", grade: "" },
];

// Provisional grade-point mapping. Verify with DSU's official scheme.
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

function App() {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [question, setQuestion] = useState("");
const [advisorAnswer, setAdvisorAnswer] = useState("");
const [backendResult, setBackendResult] = useState(null);
const [calculationMessage, setCalculationMessage] = useState("");

  const updateSubject = (id, field, value) => {
    setSubjects((current) =>
      current.map((subject) =>
        subject.id === id ? { ...subject, [field]: value } : subject
      )
    );
  };

  const totalCredits = subjects.reduce(
    (sum, subject) => sum + (Number(subject.credits) || 0),
    0
  );

  const totalPoints = subjects.reduce((sum, subject) => {
    const credits = Number(subject.credits) || 0;
    const points = gradePoints[subject.grade];

    return sum + (points !== undefined ? credits * points : 0);
  }, 0);

  const completedSubjects = subjects.filter(
    (subject) => subject.credits !== "" && subject.grade !== ""
  ).length;

  const sgpa =
    totalCredits > 0 && completedSubjects > 0
      ? (totalPoints / totalCredits).toFixed(2)
      : "0.00";

const calculateWithBackend = async () => {
  const enteredSubjects = subjects.filter(
    (subject) => subject.grade && Number(subject.credits) > 0
  );

  if (enteredSubjects.length === 0) {
    setCalculationMessage("Please enter your grades and credits first.");
    return;
  }

  setCalculationMessage("Calculating...");
  setBackendResult(null);

  try {
    const response = await fetch("http://localhost:5000/api/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subjects: enteredSubjects,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    setBackendResult(data);
    setCalculationMessage("Backend calculation successful!");
  } catch (error) {
    setCalculationMessage(
      "Unable to calculate. Please check your backend server."
    );
  }
};

  const resetCalculator = () => {
    setSubjects(initialSubjects);
  };
  
const askAdvisor = async () => {
  if (!question.trim()) {
    setAdvisorAnswer("Please enter a question first.");
    return;
  }

  setAdvisorAnswer("Analyzing your academic performance...");

  try {
    const response = await fetch("http://localhost:5000/api/advisor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        sgpa,
        subjects,
      }),
    });

    const data = await response.json();
    setAdvisorAnswer(data.answer);
  } catch (error) {
    setAdvisorAnswer("Backend connection failed. Check whether your backend server is running.");
  }
};


  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">G</div>
          <div>
            <h2>GradePilot</h2>
            <span>AI ACADEMIC ASSISTANT</span>
          </div>
        </div>

        <nav>
          <a className="nav-link active" href="#dashboard">
            <span>▦</span> Dashboard
          </a>
          <a className="nav-link" href="#calculator">
            <span>▤</span> SGPA Calculator
          </a>
          <a className="nav-link" href="#advisor">
            <span>✦</span> AI Advisor
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">✦</span>
            <h3>Study smarter.</h3>
            <p>Your academic journey, simplified.</p>
          </div>
          <p className="sidebar-footer">GRADEPILOT AI · 2026</p>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">STUDENT WORKSPACE</p>
            <h1>My Dashboard</h1>
          </div>
          <div className="semester-tag">
            <span className="status-dot"></span>
            DSU · Semester 3
          </div>
        </header>

        <section className="welcome-section">
          <div>
            <p className="welcome-label">YOUR ACADEMIC COMPANION</p>
            <h2>Welcome to GradePilot <span>✦</span></h2>
            <p>
              Track your grades, calculate your SGPA and understand your
              academic performance.
            </p>
          </div>
          <div className="welcome-decoration">G</div>
        </section>

        <section className="stats-grid">
          <div className="stat-card primary-stat">
            <div className="stat-heading">
              <span>Current SGPA</span>
              <span className="stat-icon">✦</span>
            </div>
            <h2>{sgpa}</h2>
            <p>Based on entered grades and credits</p>
          </div>

          <div className="stat-card">
            <div className="stat-heading">
              <span>Total Credits</span>
              <span className="stat-icon">◈</span>
            </div>
            <h2>{totalCredits}</h2>
            <p>Credits entered so far</p>
          </div>

          <div className="stat-card">
            <div className="stat-heading">
              <span>Subjects Completed</span>
              <span className="stat-icon">✓</span>
            </div>
            <h2>{completedSubjects}<small> / 7</small></h2>
            <p>Subjects with credits and grades</p>
          </div>
        </section>

        <section className="calculator-section" id="calculator">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SEMESTER PERFORMANCE</p>
              <h2>SGPA Calculator</h2>
              <p className="section-description">
                Enter your subject credits and select your grades.
              </p>
            </div>
            <button className="reset-button" onClick={resetCalculator}>
              ↻ Reset
            </button>
          </div>

          <div className="subject-list">
            {subjects.map((subject) => (
              <div className="subject-row" key={subject.id}>
                <div className="subject-number">
                  {String(subject.id).padStart(2, "0")}
                </div>

                <div className="subject-name">
                  <strong>{subject.name}</strong>
                  <span>Semester 3 subject</span>
                </div>

                <div className="field-group">
                  <label htmlFor={`credits-${subject.id}`}>Credits</label>
                  <input
                    id={`credits-${subject.id}`}
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Enter"
                    value={subject.credits}
                    onChange={(event) =>
                      updateSubject(subject.id, "credits", event.target.value)
                    }
                  />
                </div>

                <div className="field-group">
                  <label htmlFor={`grade-${subject.id}`}>Grade</label>
                  <select
                    id={`grade-${subject.id}`}
                    value={subject.grade}
                    onChange={(event) =>
                      updateSubject(subject.id, "grade", event.target.value)
                    }
                  >
                    <option value="">Select grade</option>
                    {Object.keys(gradePoints).map((grade) => (
                      <option value={grade} key={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="points-display">
                  <span>Points</span>
                  <strong>
                    {subject.grade ? gradePoints[subject.grade] : "—"}
                  </strong>
                </div>
              </div>
            ))}
          </div>

          <div className="result-panel">
            <div>
              <span className="result-label">YOUR CALCULATED SGPA</span>
              <h2>{sgpa}</h2>
              <p>Weighted grade-point average</p>
            </div>
            <div className="result-details">
              <div>
                <span>Total credits</span>
                <strong>{totalCredits}</strong>
              </div>
              <div>
                <span>Weighted points</span>
                <strong>{totalPoints.toFixed(2)}</strong>
              </div>
            </div>
          </div>

<div className="backend-calculation">
  <button onClick={calculateWithBackend}>
    Calculate with Backend ↗
  </button>

  {calculationMessage && (
    <p>{calculationMessage}</p>
  )}

  {backendResult && (
    <div className="backend-result">
      <strong>Backend Verified SGPA: {backendResult.sgpa}</strong>
      <span>Total Credits: {backendResult.totalCredits}</span>
      <span>Weighted Points: {backendResult.totalPoints}</span>
    </div>
  )}
</div>


          <p className="disclaimer">
            Note: The displayed grade-point mapping is provisional. Confirm
            the official DSU grading scheme and subject credits before using
            this result for academic submission.
          </p>
        </section>

       <section className="advisor-preview" id="advisor">
  <div className="advisor-symbol">✦</div>

  <div className="advisor-content">
    <p className="eyebrow">YOUR PERSONAL ACADEMIC ASSISTANT</p>
    <h2>AI Academic Advisor</h2>
    <p>
      Get insights into your grades and personalized study suggestions.
    </p>

    <div className="advisor-input">
      <input
        type="text"
        placeholder="Ask about your academic performance..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") askAdvisor();
        }}
      />

      <button onClick={askAdvisor}>Ask Advisor ✦</button>
    </div>

    {advisorAnswer && (
      <div className="advisor-answer">
        <strong>✦ GradePilot Insights</strong>
        <p>{advisorAnswer}</p>
      </div>
    )}
  </div>
</section>

        <footer className="page-footer">
          GradePilot AI · Built for smarter learning.
        </footer>
      </main>
    </div>
  );
}

export default App;
