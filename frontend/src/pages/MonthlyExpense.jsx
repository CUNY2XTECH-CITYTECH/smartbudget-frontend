import { useState, useMemo } from "react";
import "./MonthlyExpense.css";

const expenseList = [
  "Household Maintenance",
  "Water",
  "Gas",
  "Wi-Fi",
  "Electricity",
  "Taxes",
  "Groceries",
  "Entertainment",
];

const sanitizeNum = (v) => {
  // Allow empty string while typing; otherwise parse float
  if (v === "") return "";
  const n = parseFloat(v.replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? "" : String(n);
};

const MonthlyExpense = () => {
  const [date, setDate] = useState("");
  const [income, setIncome] = useState("");
  const [otherIncome, setOtherIncome] = useState("");

  const [expenses, setExpenses] = useState(
    expenseList.map((name) => ({
      name,
      budget: "",
      actual: "",
      difference: "0",
    }))
  );

  const handleChange = (index, field, value) => {
    const updated = [...expenses];
    // sanitize incoming value to keep it numeric or empty
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
    const sum = (arr, key) =>
      arr.reduce((s, e) => s + (parseFloat(e[key]) || 0), 0);
    const tBudget = sum(expenses, "budget");
    const tActual = sum(expenses, "actual");
    const tDiff = tBudget - tActual;
    return {
      budget: tBudget,
      actual: tActual,
      diff: tDiff,
    };
  }, [expenses]);

  const preventWheel = (e) => e.currentTarget.blur();

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
              <td>
                <span className="dot" aria-hidden="true"></span>
                {expense.name}
              </td>

              <td>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  className="budget-input no-arrows"
                  value={expense.budget}
                  onChange={(e) => handleChange(idx, "budget", e.target.value)}
                  onWheel={preventWheel}
                  placeholder="0"
                  aria-label={`${expense.name} budget`}
                />
              </td>

              <td>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  className="budget-input no-arrows"
                  value={expense.actual}
                  onChange={(e) => handleChange(idx, "actual", e.target.value)}
                  onWheel={preventWheel}
                  placeholder="0"
                  aria-label={`${expense.name} actual`}
                />
              </td>

              <td>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  className="budget-input no-arrows"
                  value={expense.difference}
                  readOnly
                  aria-label={`${expense.name} difference`}
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
    </div>
  );
};

export default MonthlyExpense;
