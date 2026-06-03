function DashboardPage() {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1>
        Welcome,
        {" "}
        {user?.username}
      </h1>

      <p>
        Login successful.
      </p>

    </div>
  );
}

export default DashboardPage;