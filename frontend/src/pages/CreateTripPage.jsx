import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createTrip, updateTrip, getTrips } from "../services/tripService";

// +++++ ADD THIS IMPORT +++++
import Weather from "../components/Weather";

export default function TripFormPage() {
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    notes: "",
    hotel: false,
    flight: false,
    carRental: false,
    activities: false,
  });

  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = window.location.pathname.includes("edit");
  const isView = window.location.pathname.includes("view");
  const isCreate = !id;

  const isReadOnly = isView;

  useEffect(() => {
    if (!id) {
      setFormData({
        destination: "",
        startDate: "",
        endDate: "",
        budget: "",
        notes: "",
        hotel: false,
        flight: false,
        carRental: false,
        activities: false,
      });
      return;
    }
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    try {
      const data = await getTrips();
      const trip = data.find((t) => t._id === id);
      if (trip) {
        setFormData({
          destination: trip.destination || "",
          startDate: trip.startDate ? trip.startDate.substring(0, 10) : "",
          endDate: trip.endDate ? trip.endDate.substring(0, 10) : "",
          budget: trip.budget || "",
          notes: trip.notes || "",
          hotel: !!trip.hotel,
          flight: !!trip.flight,
          carRental: !!trip.carRental,
          activities: !!trip.activities,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    if (isReadOnly) return;
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? Boolean(checked) : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        hotel: !!formData.hotel,
        flight: !!formData.flight,
        carRental: !!formData.carRental,
        activities: !!formData.activities,
      };
      if (isEdit) {
        await updateTrip(id, payload);
        alert("Trip Updated!");
      } else {
        await createTrip(payload);
        alert("Trip Created!");
      }
      navigate("/trips");
    } catch (err) {
      console.error(err);
      alert("Error saving trip");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* HEADER */}
      <div>
        <h2 style={{ margin: 0 }}>
          {isView ? "View Trip" : isEdit ? "Edit Trip" : "Create Trip"}
        </h2>
        <p style={{ margin: 0, color: "gray" }}>
          {isView
            ? "You are viewing this trip (read-only)"
            : "Enter trip details"}
        </p>
      </div>

      {/* OVERVIEW */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Trip Overview</h3>

        <input
          name="destination"
          value={formData.destination}
          onChange={handleChange}
          placeholder="Destination"
          style={inputStyle}
          disabled={isReadOnly}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="date"
            name="startDate"
            value={formData.startDate || ""}
            onChange={handleChange}
            style={inputStyle}
            disabled={isReadOnly}
          />
          <input
            type="date"
            name="endDate"
            value={formData.endDate || ""}
            onChange={handleChange}
            style={inputStyle}
            disabled={isReadOnly}
          />
        </div>
      </div>

      {/* +++++ WEATHER SECTION (ONLY WHEN VIEWING) +++++ */}
      {isView && formData.destination && (
        <div style={sectionStyle}>
          <h3 style={titleStyle}>Current Weather</h3>
          <Weather city={formData.destination} />
        </div>
      )}

      {/* LOGISTICS */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Logistics & Preferences</h3>

        <input
          name="budget"
          type="number"
          value={formData.budget}
          onChange={handleChange}
          placeholder="Budget"
          style={inputStyle}
          disabled={isReadOnly}
        />

        <h4>Required Bookings</h4>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <CheckBox
            label="Hotel"
            name="hotel"
            checked={formData.hotel}
            onChange={handleChange}
            disabled={isReadOnly}
          />
          <CheckBox
            label="Flight"
            name="flight"
            checked={formData.flight}
            onChange={handleChange}
            disabled={isReadOnly}
          />
          <CheckBox
            label="Car Rental"
            name="carRental"
            checked={formData.carRental}
            onChange={handleChange}
            disabled={isReadOnly}
          />
          <CheckBox
            label="Activities"
            name="activities"
            checked={formData.activities}
            onChange={handleChange}
            disabled={isReadOnly}
          />
        </div>
      </div>

      {/* NOTES */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Additional Details</h3>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Notes..."
          style={{ ...inputStyle, height: "120px", resize: "none" }}
          disabled={isReadOnly}
        />
      </div>

      {/* BUTTON */}
      {!isView && (
        <button style={buttonStyle} onClick={handleSubmit}>
          {isEdit ? "Update Trip" : "Create Trip"}
        </button>
      )}
    </div>
  );
}

/* STYLES remain unchanged */
const sectionStyle = {
  background: "white",
  padding: "15px",
  borderRadius: "12px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const titleStyle = { margin: 0 };

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
  width: "100%",
};

const buttonStyle = {
  padding: "12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
};

function CheckBox({ label, name, checked, onChange, disabled }) {
  return (
    <label style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      {label}
    </label>
  );
}