// import "./MonthlyExpense.css";


// const MonthlyExpense = () => (
//   <div className="budget-container">
//     <h1 className="budget-title">Monthly Budget</h1>
//     <form className="budget-form">
//       <div className="budget-row">
//         <label>Date:</label>
//         <input type="text" className="budget-input" />
//       </div>
//       <div className="budget-row">
//         <label>Income:</label>
//         <input type="text" className="budget-input" />
//         <input type="text" className="budget-input" placeholder="Other income / savings" />
//       </div>
//     </form>
//     <table className="budget-table">
//       <thead>
//         <tr>
//           <th>Expenses</th>
//           <th>Budget</th>
//           <th>Actual</th>
//           <th>Difference</th>
//         </tr>
//       </thead>
//       <tbody>
//         {[
//           "Household Maintenance",
//           "Water",
//           "Gas",
//           "Wi-Fi",
//           "Electricity",
//           "Taxes",
//           "Groceries",
//           "Entertainment",
//         ].map((expense) => (
//           <tr key={expense}>
//             <td>
//               <span className="dot"></span>
//               {expense}
//             </td>
//             <td></td>
//             <td></td>
//             <td></td>
//           </tr>
//         ))}
//         <tr className="total-row">
//           <td>Total Expenses</td>
//           <td></td>
//           <td></td>
//           <td></td>
//         </tr>
//       </tbody>
//     </table>
//   </div>
// );

// export default MonthlyExpense;

import { useState } from "react";
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

const MonthlyExpense = () => {
  const [expenses, setExpenses] = useState(
    expenseList.map((name) => ({
      name,
      budget: "",
      actual: "",
      difference: "",
    }))
  );

  const handleChange = (index, field, value) => {
    const updated = [...expenses];
    updated[index][field] = value;
    // Optionally auto-calculate difference
    if (field === "budget" || field === "actual") {
      const budget = parseFloat(updated[index].budget) || 0;
      const actual = parseFloat(updated[index].actual) || 0;
      updated[index].difference = (budget - actual).toString();
    }
    setExpenses(updated);
  };

  return (
    <div className="budget-container">
      <h1 className="budget-title">Monthly Budget</h1>
      <form className="budget-form">
        <div className="budget-row">
          <label>Date:</label>
          <input type="text" className="budget-input" />
        </div>
        <div className="budget-row">
          <label>Income:</label>
          <input type="text" className="budget-input" />
          <input type="text" className="budget-input" placeholder="Other income / savings" />
        </div>
      </form>
      <table className="budget-table">
        <thead>
          <tr>
            <th>Expenses</th>
            <th>Budget</th>
            <th>Actual</th>
            <th>Difference</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, idx) => (
            <tr key={expense.name}>
              <td>
                <span className="dot"></span>
                {expense.name}
              </td>
              <td>
                <input
                  type="number"
                  className="budget-input no-arrows"
                  value={expense.budget}
                  onChange={(e) => handleChange(idx, "budget", e.target.value)}
                  placeholder="0"
                />
              </td>
              <td>
                <input
                  type="number"
                  className="budget-input no-arrows"
                  value={expense.actual}
                  onChange={(e) => handleChange(idx, "actual", e.target.value)}
                  placeholder="0"
                />
              </td>
              <td>
                <input
                  type="number"
                  className="budget-input no-arrows"
                  value={expense.difference}
                  readOnly
                  placeholder="0"
                />
              </td>
            </tr>
          ))}
          <tr className="total-row">
            <td>Total Expenses</td>
            <td>
              {expenses.reduce((sum, e) => sum + (parseFloat(e.budget) || 0), 0)}
            </td>
            <td>
              {expenses.reduce((sum, e) => sum + (parseFloat(e.actual) || 0), 0)}
            </td>
            <td>
              {expenses.reduce((sum, e) => sum + (parseFloat(e.difference) || 0), 0)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyExpense;