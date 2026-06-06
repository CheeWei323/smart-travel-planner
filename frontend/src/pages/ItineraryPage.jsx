import { FaPlane, FaHotel, FaMapMarkerAlt, FaPlus } from "react-icons/fa";

export default function ItineraryPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* HEADER */}
      <div>
        <h2 style={{ margin: 0 }}>New York, USA</h2>
        <p style={{ margin: 0, color: "gray" }}>
          10 Jan - 15 Jan • Active Trip
        </p>
      </div>

      {/* PROGRESS */}
      <div>
        <p style={{ margin: "0 0 5px 0" }}>Trip Progress</p>
        <div
          style={{
            width: "100%",
            height: "10px",
            background: "#e5e7eb",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "65%",
              height: "100%",
              background: "#2563eb",
            }}
          />
        </div>
      </div>

      {/* TIMELINE */}
      <div>
        <h3>Itinerary</h3>

        <DayCard
          day="Day 1 - Arrival"
          items={[
            "✈ Flight KL → New York",
            "🏨 Hotel check-in",
            "🌆 Evening walk at Times Square",
          ]}
        />

        <DayCard
          day="Day 2 - City Tour"
          items={[
            "🗽 Statue of Liberty",
            "🌳 Central Park",
            "🎭 Broadway Show",
          ]}
        />

        <DayCard
          day="Day 3 - Shopping"
          items={[
            "🛍 5th Avenue",
            "🏙 Soho District",
          ]}
        />
      </div>

      {/* BOOKINGS */}
      <div>
        <h3>Bookings</h3>

        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          
          <BookingCard icon={<FaPlane />} title="Flight" desc="KL → New York" />
          <BookingCard icon={<FaHotel />} title="Hotel" desc="Marriott Hotel" />
          <BookingCard icon={<FaMapMarkerAlt />} title="Transport" desc="Airport Pickup" />

        </div>
      </div>

      {/* BUDGET */}
      <div
        style={{
          padding: "15px",
          background: "#0f172a",
          color: "white",
          borderRadius: "12px",
        }}
      >
        <h3 style={{ margin: 0 }}>Budget</h3>
        <p style={{ margin: "5px 0" }}>Total: RM 5,200</p>
        <p style={{ margin: 0 }}>Spent: RM 3,400</p>
      </div>

      {/* SMART SUGGESTIONS */}
      <div
        style={{
          padding: "15px",
          borderRadius: "12px",
          background: "#f1f5f9",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Smart Suggestions</h3>
        <p style={{ margin: 0 }}>⚠ You still need to book a restaurant for Day 2</p>
        <p style={{ margin: 0 }}>💡 Add Central Park picnic experience</p>
      </div>

      {/* ADD BUTTON */}
      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          justifyContent: "center",
        }}
      >
        <FaPlus />
        Add Activity
      </button>
    </div>
  );
}

/* DAY CARD */
function DayCard({ day, items }) {
  return (
    <div
      style={{
        background: "white",
        padding: "15px",
        borderRadius: "12px",
        marginTop: "10px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      }}
    >
      <h4 style={{ margin: "0 0 10px 0" }}>{day}</h4>

      <ul style={{ margin: 0, paddingLeft: "20px" }}>
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: "5px" }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* BOOKING CARD */
function BookingCard({ icon, title, desc }) {
  return (
    <div
      style={{
        flex: "1",
        background: "white",
        padding: "12px",
        borderRadius: "12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <div style={{ fontSize: "20px", color: "#2563eb" }}>{icon}</div>

      <div>
        <p style={{ margin: 0, fontWeight: "bold" }}>{title}</p>
        <p style={{ margin: 0, fontSize: "12px", color: "gray" }}>{desc}</p>
      </div>
    </div>
  );
}