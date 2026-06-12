import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { createTrip, updateTrip, getTrips } from "../services/tripService";
import { getFavorites } from "../services/favoriteService";
import { getChecklist, addChecklistItem, updateChecklistItem, deleteChecklistItem } from "../services/checklistService";
import Weather from "../components/Weather";
import { FaTrash, FaPlus, FaCheckSquare, FaRegSquare, FaSearch } from "react-icons/fa";

export default function TripFormPage() {
  // Catch the passed destination data from the TripsPage
  const location = useLocation();
  const prefilledDestination = location.state?.destination || "";

  const [formData, setFormData] = useState({
    destination: prefilledDestination, 
    startDate: "", 
    endDate: "", 
    budget: "", 
    hotel: false, 
    flight: false, 
    carRental: false, 
    activities: false,
  });

  const [favorites, setFavorites] = useState([]);
  
  // Destination Search States
  const [destSearchResults, setDestSearchResults] = useState([]);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Checklist States
  const [checklist, setChecklist] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [localTasks, setLocalTasks] = useState([]); 

  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = window.location.pathname.includes("edit");
  const isView = window.location.pathname.includes("view");
  const isReadOnly = isView;

  useEffect(() => {
    loadFavorites();
    if (!id) return;
    loadTripAndChecklist();
  }, [id]);

  const loadFavorites = async () => {
    try {
      const favs = await getFavorites();
      setFavorites(favs);
    } catch (err) { console.error(err); }
  };

  const loadTripAndChecklist = async () => {
    try {
      const data = await getTrips();
      const trip = (data?.trips || data).find((t) => t._id === id);
      if (trip) {
        setFormData({
          destination: trip.destination || "",
          startDate: trip.startDate ? trip.startDate.substring(0, 10) : "",
          endDate: trip.endDate ? trip.endDate.substring(0, 10) : "",
          budget: trip.budget || "",
          hotel: !!trip.hotel, flight: !!trip.flight, carRental: !!trip.carRental, activities: !!trip.activities,
        });
        const items = await getChecklist(id);
        setChecklist(items);
      }
    } catch (err) { console.error(err); }
  };

  // --- STANDARD FORM HANDLER ---
  const handleChange = (e) => {
    if (isReadOnly) return;
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? Boolean(checked) : value }));
  };

  // --- PHOTON API DESTINATION SEARCH ---
  const handleDestSearch = async (e) => {
    if (isReadOnly) return;
    const query = e.target.value;
    
    setFormData((prev) => ({ ...prev, destination: query }));

    if (query.length < 3) {
      setDestSearchResults([]);
      setShowDestDropdown(false);
      return;
    }

    try {
      const res = await axios.get(`https://photon.komoot.io/api/?q=${query}&limit=5`);
      const results = res.data.features.map((f) => ({
        name: f.properties.name,
        country: f.properties.country || "",
        state: f.properties.state || ""
      }));
      setDestSearchResults(results.filter(r => r.name));
      setShowDestDropdown(true);
    } catch (err) {
      console.error("Photon API error:", err);
    }
  };

  const handleSelectDestination = (dest) => {
    const finalDest = dest.country && dest.name !== dest.country 
      ? `${dest.name}, ${dest.country}` 
      : dest.name;
      
    setFormData((prev) => ({ ...prev, destination: finalDest }));
    setDestSearchResults([]);
    setShowDestDropdown(false);
  };

  // --- SUBMIT TRIP ---
  const handleSubmit = async () => {
    if (!formData.destination.trim()) {
      alert("Please search and select a destination!");
      return;
    }

    try {
      if (isEdit) {
        await updateTrip(id, formData);
        alert("Trip Updated!");
        navigate("/trips");
      } else {
        const newTrip = await createTrip(formData);
        if (localTasks.length > 0) {
          await Promise.all(localTasks.map(task => addChecklistItem(newTrip._id, task)));
        }
        alert("Trip Created!");
        navigate("/trips");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving trip");
    }
  };

  // --- CHECKLIST API HANDLERS ---
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || isReadOnly) return;
    if (id) {
      try {
        const item = await addChecklistItem(id, newTask);
        setChecklist([...checklist, item]);
      } catch (err) { console.error(err); }
    } else {
      setLocalTasks([...localTasks, newTask]);
    }
    setNewTask("");
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    if (isReadOnly) return;
    try {
      const updated = await updateChecklistItem(taskId, { isCompleted: !currentStatus });
      setChecklist(checklist.map(item => item._id === taskId ? updated : item));
    } catch (err) { console.error(err); }
  };

  const handleDeleteTask = async (taskId) => {
    if (isReadOnly) return;
    try {
      await deleteChecklistItem(taskId);
      setChecklist(checklist.filter(item => item._id !== taskId));
    } catch (err) { console.error(err); }
  };

  const handleDeleteLocalTask = (index) => {
    setLocalTasks(localTasks.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* HEADER */}
      <div>
        <h2 style={{ margin: 0 }}>{isView ? "View Trip" : isEdit ? "Edit Trip" : "Create Trip"}</h2>
        <p style={{ margin: 0, color: "gray" }}>{isView ? "You are viewing this trip (read-only)" : "Enter trip details"}</p>
      </div>

      {/* OVERVIEW */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Trip Overview</h3>
        
        {/* DESTINATION SEARCH BAR */}
        <div style={{ padding: "0 15px", marginTop: "15px", position: "relative" }}>
          <div style={{ position: "relative" }}>
            <FaSearch style={{ position: "absolute", top: "16px", left: "14px", color: "gray" }} />
            <input 
              name="destination" 
              value={formData.destination} 
              onChange={handleDestSearch} 
              placeholder="Search for a real City or Country..." 
              style={{...inputStyle, paddingLeft: "40px"}} 
              disabled={isReadOnly} 
              autoComplete="off"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showDestDropdown && destSearchResults.length > 0 && (
            <ul style={{ position: "absolute", top: "100%", left: "15px", right: "15px", background: "white", zIndex: 1000, listStyle: "none", margin: 0, padding: 0, border: "1px solid #ccc", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", maxHeight: "200px", overflowY: "auto" }}>
              {destSearchResults.map((res, i) => (
                <li 
                  key={i} 
                  onClick={() => handleSelectDestination(res)}
                  style={{ padding: "12px", borderBottom: "1px solid #eee", cursor: "pointer", display: "flex", flexDirection: "column" }}
                  onMouseEnter={(e) => e.target.style.background = "#f3f4f6"}
                  onMouseLeave={(e) => e.target.style.background = "white"}
                >
                  <strong style={{ color: "#111827" }}>{res.name}</strong> 
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>
                    {res.state ? `${res.state}, ` : ""}{res.country}
                  </span>
                </li>
              ))}
            </ul>
          )}
          
          {/* Quick Select Favorites Buttons */}
          {!isReadOnly && favorites.length > 0 && (
            <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", color: "gray", marginTop: "4px" }}>Quick Select:</span>
              {favorites.map(fav => (
                <button 
                  key={fav._id} 
                  type="button" 
                  onClick={() => setFormData({...formData, destination: fav.destination})} 
                  style={{ background: "#fef1f2", color: "#be123c", border: "none", borderRadius: "12px", padding: "4px 10px", fontSize: "12px", cursor: "pointer", fontWeight: "bold" }}
                >
                  {fav.destination}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px", margin: "10px 15px 15px 15px" }}>
          <input type="date" name="startDate" value={formData.startDate || ""} onChange={handleChange} style={inputStyle} disabled={isReadOnly} />
          <input type="date" name="endDate" value={formData.endDate || ""} onChange={handleChange} style={inputStyle} disabled={isReadOnly} />
        </div>
      </div>

      {/* WEATHER SECTION */}
      {isView && formData.destination && (
        <div style={sectionStyle}>
          <h3 style={titleStyle}>Current Weather</h3>
          <div style={{ padding: "15px" }}><Weather city={formData.destination} /></div>
        </div>
      )}

      {/* LOGISTICS */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Logistics & Preferences</h3>
        <div style={{ padding: "0 15px 15px 15px" }}>
          <input name="budget" type="number" value={formData.budget} onChange={handleChange} placeholder="Budget (RM)" style={{...inputStyle, marginTop: "15px"}} disabled={isReadOnly} />
          <h4 style={{ margin: "15px 0 5px 0" }}>Required Bookings</h4>
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <CheckBox label="Hotel" name="hotel" checked={formData.hotel} onChange={handleChange} disabled={isReadOnly} />
            <CheckBox label="Flight" name="flight" checked={formData.flight} onChange={handleChange} disabled={isReadOnly} />
            <CheckBox label="Car Rental" name="carRental" checked={formData.carRental} onChange={handleChange} disabled={isReadOnly} />
            <CheckBox label="Activities" name="activities" checked={formData.activities} onChange={handleChange} disabled={isReadOnly} />
          </div>
        </div>
      </div>

      {/* CHECKLIST */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Trip Checklist</h3>
        <div style={{ padding: "15px" }}>
          {!isReadOnly && (
            <form onSubmit={handleAddTask} style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="E.g., Pack passport..." style={inputStyle} />
              <button type="submit" style={{ padding: "10px 15px", background: "#10b981", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>
                <FaPlus />
              </button>
            </form>
          )}

          {id && checklist.map((item) => (
            <div key={item._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: isReadOnly ? "default" : "pointer" }} onClick={() => handleToggleTask(item._id, item.isCompleted)}>
                {item.isCompleted ? <FaCheckSquare color="#10b981" size={20} /> : <FaRegSquare color="#9ca3af" size={20} />}
                <span style={{ textDecoration: item.isCompleted ? "line-through" : "none", color: item.isCompleted ? "#9ca3af" : "#111827" }}>{item.task}</span>
              </div>
              {!isReadOnly && <FaTrash color="#ef4444" style={{ cursor: "pointer" }} onClick={() => handleDeleteTask(item._id)} />}
            </div>
          ))}

          {!id && localTasks.map((task, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaRegSquare color="#9ca3af" size={20} />
                <span>{task}</span>
              </div>
              <FaTrash color="#ef4444" style={{ cursor: "pointer" }} onClick={() => handleDeleteLocalTask(idx)} />
            </div>
          ))}

          {(checklist.length === 0 && localTasks.length === 0) && <p style={{ color: "gray", fontSize: "14px", margin: 0 }}>No items in your checklist yet.</p>}
        </div>
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

/* STYLES */
const sectionStyle = { background: "white", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column" };
const titleStyle = { margin: 0, padding: "15px 15px 0 15px" };
const inputStyle = { padding: "12px", borderRadius: "10px", border: "1px solid #e5e7eb", width: "100%", boxSizing: "border-box" };
const buttonStyle = { padding: "14px", background: "#2563eb", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" };

function CheckBox({ label, name, checked, onChange, disabled }) {
  return (
    <label style={{ display: "flex", gap: "6px", alignItems: "center", cursor: disabled ? "default" : "pointer" }}>
      <input type="checkbox" name={name} checked={checked} onChange={onChange} disabled={disabled} style={{ cursor: disabled ? "default" : "pointer" }} />
      {label}
    </label>
  );
}