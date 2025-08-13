// src/pages/MonthlyExpense.jsx
import { useState, useMemo, useEffect } from "react";
import "./MonthlyExpense.css";

const expenseList = [
  "Household Maintenance","Water","Gas","Wi-Fi","Electricity","Taxes","Groceries","Entertainment",
];

const sanitizeNum = (v) => {
  if (v === "") return "";
  const n = parseFloat(v.replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? "" : String(n);
};

export default function MonthlyExpense({ onSaved }) {
  const [date, setDate] = useState("");           // YYYY-MM-DD
  const [income, setIncome] = useState("");
  const [otherIncome, setOtherIncome] = useState("");
  const [savingMsg, setSavingMsg] = useState("");

  const [expenses, setExpenses] = useState(
    expenseList.map((name) => ({ name, budget: "", actual: "", difference: "0" }))
  );

  const handleChange = (index, field, value) => {
    const updated = [...expenses];
    const clean = sanitizeNum(value);
    updated[index][field] = clean;
    if (field === "budget" || field === "actual") {
      const budget = parseFloat(updated[index].budget) || 0;
      const actual = parseFloat(updated[index].actual) || 0;
      updated[index].difference = String(budget - actual);
    }
    setExpenses(updated);
  };

  const totals = useMemo(() => {
    const sum = (arr, key) => arr.reduce((s, e) => s + (parseFloat(e[key]) || 0), 0);
    const tBudget = sum(expenses, "budget");
    const tActual = sum(expenses, "actual");
    const tDiff = tBudget - tActual;
    return { budget: tBudget, actual: tActual, diff: tDiff };
  }, [expenses]);

  const preventWheel = (e) => e.currentTarget.blur();

  // Optional: when date changes, try to load existing plan for that month
  useEffect(() => {
    (async () => {
      if (!date) return;
      const [y, m] = date.split("-").map((x) => parseInt(x, 10));
      if (!y || !m) return;
      try {
        const res = await fetch(`/api/monthly/${y}/${m}`, { credentials: "include" });
        if (!res.ok) return;
        const { plan } = await res.json();
        if (plan?.categories) {
          // map plan.categories back into inputs
          setExpenses(expenseList.map((name) => {
            const row = plan.categories[name] || {};
            const b = row.budget ?? "";
            const a = row.actual ?? "";
            return {
              name,
              budget: b === "" ? "" : String(b),
              actual: a === "" ? "" : String(a),
              difference: String((parseFloat(b)||0) - (parseFloat(a)||0)),
            };
          }));
        }
      } catch {}
    })();
  }, [date]);

  const handleSave = async () => {
    setSavingMsg("");
    if (!date) {
      setSavingMsg("Choose a date (year/month) before saving.");
      return;
    }
    const [yStr, mStr] = date.split("-");
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10);

    // Build categories object: {"Groceries":{"budget":..., "actual":...}, ...}
    const categories = {};
    expenses.forEach((e) => {
      categories[e.name] = {
        budget: parseFloat(e.budget) || 0,
        actual: parseFloat(e.actual) || 0,
      };
    });

    const payload = {
      year,
      month,
      totalBudget: totals.budget,
      categories,
      // optionally attach incomes inside categories too if you want them persisted:
      // notes: `Income:${income || 0}, Other:${otherIncome || 0}`,
    };

    try {
      const res = await fetch("/api/monthly", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSavingMsg("Saved!");
      // 🔁 trigger dashboard to reload charts
      if (typeof onSaved === "function") onSaved();
      // clear the message after a bit
      setTimeout(() => setSavingMsg(""), 2000);
    } catch (err) {
      setSavingMsg(err.message || "Failed to save");
    }
  };

  return (
    <div className="budget-container">
      <h1 className="budget-title">Monthly Budget</h1>

      <form className="budget-form" onSubmit={(e) => e.preventDefault()}>
        <div className="budget-row">
          <label htmlFor="mb-date">Date:</label>
          <input
            id="mb-date"
            type="date"
            className="budget-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="budget-row">
          <label htmlFor="mb-income">Income:</label>
          <input
            id="mb-income"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            className="budget-input no-arrows"
            value={income}
            onChange={(e) => setIncome(sanitizeNum(e.target.value))}
            onWheel={preventWheel}
            placeholder="0"
            aria-label="Monthly income"
          />
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            className="budget-input no-arrows"
            value={otherIncome}
            onChange={(e) => setOtherIncome(sanitizeNum(e.target.value))}
            onWheel={preventWheel}
            placeholder="Other income / savings"
            aria-label="Other income or savings"
          />
        </div>
      </form>

      <table className="budget-table" role="table">
        <thead>
          <tr>
            <th scope="col">Expenses</th>
            <th scope="col">Budget</th>
            <th scope="col">Actual</th>
            <th scope="col">Difference</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, idx) => (
            <tr key={expense.name}>
              <td><span className="dot" aria-hidden="true"></span>{expense.name}</td>
              <td>
                <input
                  type="number" inputMode="decimal" step="0.01" min="0"
                  className="budget-input no-arrows"
                  value={expense.budget}
                  onChange={(e) => handleChange(idx, "budget", e.target.value)}
                  onWheel={preventWheel} placeholder="0"
                  aria-label={`${expense.name} budget`}
                />
              </td>
              <td>
                <input
                  type="number" inputMode="decimal" step="0.01" min="0"
                  className="budget-input no-arrows"
                  value={expense.actual}
                  onChange={(e) => handleChange(idx, "actual", e.target.value)}
                  onWheel={preventWheel} placeholder="0"
                  aria-label={`${expense.name} actual`}
                />
              </td>
              <td>
                <input
                  type="number" inputMode="decimal" step="0.01"
                  className="budget-input no-arrows"
                  value={expense.difference}
                  readOnly aria-label={`${expense.name} difference`}
                />
              </td>
            </tr>
          ))}

          <tr className="total-row">
            <td>Total Expenses</td>
            <td>{totals.budget.toFixed(2)}</td>
            <td>{totals.actual.toFixed(2)}</td>
            <td>{totals.diff.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div className="budget-actions">
        <button type="button" className="exp-btn" onClick={handleSave}>Save</button>
        {savingMsg && <span className="save-msg">{savingMsg}</span>}
      </div>
    </div>
  );
}
