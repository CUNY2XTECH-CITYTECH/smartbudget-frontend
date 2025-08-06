import "./MontlyExpense.css";


const MonthlyExpense = () => (
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
        {[
          "Household Maintenance",
          "Water",
          "Gas",
          "Wi-Fi",
          "Electricity",
          "Taxes",
          "Groceries",
          "Entertainment",
        ].map((expense) => (
          <tr key={expense}>
            <td>
              <span className="dot"></span>
              {expense}
            </td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        ))}
        <tr className="total-row">
          <td>Total Expenses</td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default MonthlyExpense;