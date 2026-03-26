import { useState } from "react";

function ExpenseTable({ expenses, onSelect }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = expenses.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const totalPages = Math.ceil(expenses.length / itemsPerPage);

  return (
    <div>
      <table border="1">
        <thead>
          <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((exp) => (
            <tr key={exp.id} onClick={() => onSelect(exp)}>
              <td>{exp.title}</td>
              <td>{exp.amount}</td>
              <td>{exp.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        <span> Page {currentPage} of {totalPages || 1} </span>

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ExpenseTable;