const SalesTable = ({ sales }) => {
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-blue-50">
          <th className="p-3 text-left">
            Invoice
          </th>

          <th className="p-3 text-left">
            Date
          </th>

          <th className="p-3 text-left">
            Amount
          </th>

          <th className="p-3 text-left">
            Payment
          </th>
        </tr>
      </thead>

      <tbody>
        {sales.map((sale) => (
          <tr
            key={sale.id}
            className="border-b"
          >
            <td className="p-3">
              {sale.invoice}
            </td>

            <td className="p-3">
              {sale.date}
            </td>

            <td className="p-3">
              Rs. {sale.amount}
            </td>

            <td className="p-3">
              {sale.payment}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SalesTable;