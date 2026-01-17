// src/pages/instructor/ManageStudents.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Dashboard.css";
import axiosInstance from "../../utils/axiosConfig";

function ManageStudents() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // UI states
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 35;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  // ✅ Edit modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // ✅ Single add modal states
  const [singleForm, setSingleForm] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    gender: "Male",
    contact: "",
    address: "",
    roll_no: "",
    department: "",
    year_of_study: "",
    admission_year: "",
    graduate_year: "",
    cgpa: "",
    marks_10: "",
    marks_12: "",
    backlogs: "",
    skills: "",
    certifications: "",
    projects: "",
    resume_url: "",
    job_roles: "",
    job_locations: "",
    placement_status: ""
  });

  const [singleLoading, setSingleLoading] = useState(false);

  // ✅ Delete loading (NEW)
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  // Bulk modal
  const [selectedFile, setSelectedFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState({
    fileName: "",
    successCount: 0,
    errorCount: 0,
    errors: [],
  });

  // DB states
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageRows = students; // backend paginates
  const showingFrom = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = Math.min(safePage * pageSize, total);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const closeAllModals = () => {
    setIsAddOpen(false);
    setIsBulkOpen(false);
  };

  const updateSingle = (key, value) => {
    setSingleForm((prev) => ({ ...prev, [key]: value }));
  };

  const openAddModal = () => {
    setSingleForm({
      name: "",
      email: "",
      password: "",
      dob: "",
      gender: "Male",
      contact: "",
      address: "",
      roll_no: "",
      department: "",
      year_of_study: "",
      admission_year: "",
      graduate_year: "",
      cgpa: "",
      marks_10: "",
      marks_12: "",
      backlogs: "",
      skills: "",
      certifications: "",
      projects: "",
      resume_url: "",
      job_roles: "",
      job_locations: "",
      placement_status: ""
    });
    setIsAddOpen(true);
  };

  const onPickFile = (e) => {
    const f = e.target.files?.[0] || null;
    setSelectedFile(f);
    setBulkResult({ fileName: "", successCount: 0, errorCount: 0, errors: [] });
  };

  // ✅ Refresh helper (NEW)
  const refreshStudents = async (goToPage = safePage) => {
    const res = await axiosInstance.get("/api/students", {
      params: { search, page: goToPage, limit: pageSize },
    });
    setStudents(res.data.students || []);
    setTotal(res.data.total || 0);
    setTotalPages(res.data.totalPages || 1);
  };

  // Fetch students from DB
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await refreshStudents(safePage);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  // ✅ Add single student -> DB
  const onAddSingleStudent = async () => {
    try {
      const requiredKeys = [
        "name",
        "email",
        "password",
        "dob",
        "gender",
        "contact",
        "address",
        "roll_no",
        "department",
        "year_of_study",
        "admission_year",
        "graduate_year",
        "cgpa",
        "marks_10",
        "marks_12",
        "backlogs",
        "skills",
        "certifications",
        "projects",
        "resume_url",
        "job_roles",
        "job_locations",
        "placement_status",
      ];

      for (const k of requiredKeys) {
        const v = (singleForm[k] ?? "").toString().trim();
        if (!v) {
          alert(`Please fill "${k}"`);
          return;
        }
      }

      setSingleLoading(true);

      const payload = {
        ...singleForm,
        admission_year: Number(singleForm.admission_year),
        graduate_year: Number(singleForm.graduate_year),
        cgpa: Number(singleForm.cgpa),
        marks_10: Number(singleForm.marks_10),
        marks_12: Number(singleForm.marks_12),
        backlogs: Number(singleForm.backlogs)
      };

      await axiosInstance.post("/api/students", payload);

      setIsAddOpen(false);

      await refreshStudents(1);
      setPage(1);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to add student");
    } finally {
      setSingleLoading(false);
    }
  };

  const onProcessBulk = async () => {
    if (!selectedFile) return;

    try {
      setBulkLoading(true);
      setBulkResult({ fileName: selectedFile.name, successCount: 0, errorCount: 0, errors: [] });

      const fd = new FormData();
      fd.append("file", selectedFile);

      const res = await axiosInstance.post("/api/students/bulk", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setBulkResult({
        fileName: res.data.fileName || selectedFile.name,
        successCount: res.data.successCount || 0,
        errorCount: res.data.errorCount || 0,
        errors: res.data.errors || [],
      });

      await refreshStudents(1);
      setPage(1);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Bulk upload failed");
    } finally {
      setBulkLoading(false);
    }
  };

  // Pagination UI
  const paginationNumbers = useMemo(() => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage >= totalPages - 2) return [1, "…", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, 2, 3, 4, "…", totalPages];
  }, [totalPages, safePage]);

  // ✅ Edit modal
  const openEditModal = (s) => {
    setEditForm({
      student_id: s.student_id,
      name: s.name || "",
      email: s.email || "",
      dob: s.dob ? String(s.dob).slice(0, 10) : "",
      gender: s.gender || "Male",
      contact: s.contact || "",
      address: s.address || "",
      roll_no: s.roll_no || "",
      department: s.department || "",
      year_of_study: s.year_of_study || "",
      admission_year: s.admission_year ?? "",
      graduate_year: s.graduate_year ?? "",
      cgpa: s.cgpa ?? "",
      marks_10: s.marks_10 ?? "",
      marks_12: s.marks_12 ?? "",
      backlogs: s.backlogs ?? "",
      skills: s.skills || "",
      certifications: s.certifications || "",
      projects: s.projects || "",
      resume_url: s.resume_url || "",
      job_roles: s.job_roles || "",
      job_locations: s.job_locations || "",
      placement_status: s.placement_status || ""
    });
    setIsEditOpen(true);
  };

  const updateEdit = (key, value) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditForm(null);
  };

  const onUpdateStudent = async () => {
    if (!editForm?.student_id) return;

    try {
      const requiredKeys = [
        "name",
        "email",
        "dob",
        "gender",
        "contact",
        "address",
        "roll_no",
        "department",
        "year_of_study",
        "admission_year",
        "graduate_year",
        "cgpa",
        "marks_10",
        "marks_12",
        "backlogs",
        "skills",
        "certifications",
        "projects",
        "resume_url",
        "job_roles",
        "job_locations",
        "placement_status",
      ];

      for (const k of requiredKeys) {
        const v = (editForm[k] ?? "").toString().trim();
        if (!v) {
          alert(`Please fill "${k}"`);
          return;
        }
      }

      setEditLoading(true);

      const payload = {
        ...editForm,
        admission_year: Number(editForm.admission_year),
        graduate_year: Number(editForm.graduate_year),
        cgpa: Number(editForm.cgpa),
        marks_10: Number(editForm.marks_10),
        marks_12: Number(editForm.marks_12),
        backlogs: Number(editForm.backlogs)
      };

      await axiosInstance.put(`/api/students/${editForm.student_id}`, payload);

      await refreshStudents(safePage);
      closeEditModal();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to update student");
    } finally {
      setEditLoading(false);
    }
  };

  // ✅ Delete student (NEW)
  const onDeleteStudent = async (studentId, studentName) => {
    const ok = window.confirm(`Delete ${studentName}? This cannot be undone.`);
    if (!ok) return;

    try {
      await axiosInstance.delete(`/api/students/${studentId}`);

      const listRes = await axiosInstance.get("/api/students", {
        params: { search, page: safePage, limit: pageSize },
      });
      setStudents(listRes.data.students || []);
      setTotal(listRes.data.total || 0);
      setTotalPages(listRes.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to delete student");
    }
  };



  return (
    <div className={`dashboard-container ${sidebarOpen ? "" : "collapsed"}`}>
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <h2 className="dashboard-logo">SkillSync</h2>

        <nav className="dashboard-nav">
          <button onClick={() => navigate("/instructor")}>
            <span className="icon">🏠</span>
            <span className="label">Dashboard</span>
          </button>

          <button>
            <span className="icon">👤</span>
            <span className="label">My Profile</span>
          </button>

          <button>
            <span className="icon">📚</span>
            <span className="label">My Courses</span>
          </button>

          <button className="active">
            <span className="icon">👨‍🎓</span>
            <span className="label">Manage Students</span>
          </button>
        </nav>

        <button className="dashboard-logout" onClick={handleLogout}>
          <span className="icon">🚪</span>
          <span className="label">Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="dashboard-main">
        {/* HEADER */}
        <header className="dashboard-header">
          <div className="header-left">
            <button className="hamburger" onClick={toggleSidebar}>
              ☰
            </button>
            <h3>Student Management</h3>
          </div>

          <div className="header-right">
            Welcome, <b>{name}</b>
          </div>
        </header>

        {/* HERO */}
        <section className="dashboard-hero">
          <div className="hero-card">
            <h2>👨‍🎓 Student Management</h2>
            <p>Manage enrolled students, track progress, and communicate</p>
          </div>

          <div className="stats">
            <div className="stat-box">
              <h4>Total Students</h4>
              <span>{total}</span>
            </div>
          </div>
        </section>

        {/* PAGE CONTENT */}
        <section className="dashboard-content">
          <div className="dashboard-card full-width">
            {/* Header row */}
            <div className="ms-header">
              <div className="ms-title">
                <h3>Manage Students</h3>
                <p className="ms-subtitle">
                  Total: {total} students | Page {safePage} of {totalPages}
                </p>
              </div>

              <div className="ms-actions">
                <button className="btn-primary" onClick={openAddModal}>
                  ➕ Add Single Student
                </button>
                <button className="btn-success" onClick={() => setIsBulkOpen(true)}>
                  📄 Bulk Registration
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="ms-search-row">
              <div className="ms-search">
                <span className="ms-search-icon">🔍</span>
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search students by name..."
                />
              </div>
            </div>

            {/* Table */}
            <div className="ms-table-wrap">
              <table className="ms-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>DOB</th>
                    <th>Gender</th>
                    <th>Contact</th>
                    <th>Roll No</th>
                    <th>Dept</th>
                    <th>Year</th>
                    <th>CGPA</th>
                    <th>Resume</th>
                    <th>Job Roles</th>
                    <th>Locations</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={18} style={{ textAlign: "center", padding: "18px" }}>
                        Loading students...
                      </td>
                    </tr>
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={18} style={{ textAlign: "center", padding: "18px" }}>
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((s) => (
                      <tr key={s.student_id}>
                        <td>—</td>
                        <td>{s.name || "—"}</td>
                        <td>{s.email || "—"}</td>
                        <td>{s.dob ? new Date(s.dob).toLocaleDateString("en-GB") : "—"}</td>
                        <td>{s.gender || "—"}</td>
                        <td>{s.contact || "—"}</td>
                        <td>{s.roll_no || "—"}</td>
                        <td>{s.department || "—"}</td>
                        <td>{s.year_of_study || "—"}</td>
                        <td>{s.cgpa ?? "—"}</td>
                        <td>{s.resume_url ? "View" : "N/A"}</td>
                        <td>{s.job_roles || "—"}</td>
                        <td>{s.job_locations || "—"}</td>
                        <td>{s.placement_status || "—"}</td>

                        <td>{s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}</td>

                        <td>
                          <div className="ms-row-actions">
                            <button className="icon-btn" title="Edit" onClick={() => openEditModal(s)}>
                              ✏️
                            </button>

                            <button
                              className="icon-btn danger"
                              title="Delete"
                              onClick={() => onDeleteStudent(s.student_id, s.name)}
                            >
                              🗑️
                            </button>


                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer + pagination */}
            <div className="ms-footer">
              <div className="ms-showing">
                Showing {showingFrom} to {showingTo} of {total} students
              </div>

              <div className="ms-pagination">
                <button
                  className="ms-page-btn"
                  disabled={safePage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ‹ Previous
                </button>

                {paginationNumbers.map((n, idx) =>
                  n === "…" ? (
                    <span key={`dots-${idx}`} className="ms-dots">
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      className={`ms-page-num ${safePage === n ? "active" : ""}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  )
                )}

                <button
                  className="ms-page-btn"
                  disabled={safePage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next ›
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Add Single Student Modal */}
      {isAddOpen && (
        <div className="ms-modal-backdrop" onClick={closeAllModals}>
          <div className="ms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ms-modal-header">
              <h3>Add Single Student</h3>
              <button className="ms-close" onClick={closeAllModals}>
                ✕
              </button>
            </div>

            <div className="ms-modal-body">
              <div className="ms-form-grid">
                <label>
                  Name*
                  <input value={singleForm.name} onChange={(e) => updateSingle("name", e.target.value)} />
                </label>

                <label>
                  Email*
                  <input value={singleForm.email} onChange={(e) => updateSingle("email", e.target.value)} />
                </label>

                <label>
                  Password*
                  <input
                    type="password"
                    value={singleForm.password}
                    onChange={(e) => updateSingle("password", e.target.value)}
                  />
                </label>

                <label>
                  DOB*
                  <input type="date" value={singleForm.dob} onChange={(e) => updateSingle("dob", e.target.value)} />
                </label>

                {/* ✅ Gender radio */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontWeight: 700, color: "#374151", fontSize: 13 }}>Gender*</span>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    {["Male", "Female", "Other"].map((g) => (
                      <label key={g} style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 600 }}>
                        <input
                          type="radio"
                          name="gender_single"
                          value={g}
                          checked={singleForm.gender === g}
                          onChange={(e) => updateSingle("gender", e.target.value)}
                        />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>

                <label>
                  Contact*
                  <input value={singleForm.contact} onChange={(e) => updateSingle("contact", e.target.value)} />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  Address*
                  <input value={singleForm.address} onChange={(e) => updateSingle("address", e.target.value)} />
                </label>

                <label>
                  Roll No*
                  <input value={singleForm.roll_no} onChange={(e) => updateSingle("roll_no", e.target.value)} />
                </label>

                <label>
                  Department*
                  <input value={singleForm.department} onChange={(e) => updateSingle("department", e.target.value)} />
                </label>

                <label>
                  Year of Study*
                  <input value={singleForm.year_of_study} onChange={(e) => updateSingle("year_of_study", e.target.value)} />
                </label>

                <label>
                  Admission Year*
                  <input type="number" value={singleForm.admission_year} onChange={(e) => updateSingle("admission_year", e.target.value)} />
                </label>

                <label>
                  Graduate Year*
                  <input type="number" value={singleForm.graduate_year} onChange={(e) => updateSingle("graduate_year", e.target.value)} />
                </label>

                <label>
                  CGPA*
                  <input type="number" step="0.01" value={singleForm.cgpa} onChange={(e) => updateSingle("cgpa", e.target.value)} />
                </label>

                <label>
                  Marks 10*
                  <input type="number" step="0.01" value={singleForm.marks_10} onChange={(e) => updateSingle("marks_10", e.target.value)} />
                </label>

                <label>
                  Marks 12*
                  <input type="number" step="0.01" value={singleForm.marks_12} onChange={(e) => updateSingle("marks_12", e.target.value)} />
                </label>

                <label>
                  Backlogs*
                  <input type="number" value={singleForm.backlogs} onChange={(e) => updateSingle("backlogs", e.target.value)} />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  Skills*
                  <input value={singleForm.skills} onChange={(e) => updateSingle("skills", e.target.value)} />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  Certifications*
                  <input value={singleForm.certifications} onChange={(e) => updateSingle("certifications", e.target.value)} />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  Projects*
                  <input value={singleForm.projects} onChange={(e) => updateSingle("projects", e.target.value)} />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  Resume URL*
                  <input value={singleForm.resume_url} onChange={(e) => updateSingle("resume_url", e.target.value)} />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  Job Roles*
                  <input value={singleForm.job_roles} onChange={(e) => updateSingle("job_roles", e.target.value)} />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  Job Locations*
                  <input value={singleForm.job_locations} onChange={(e) => updateSingle("job_locations", e.target.value)} />
                </label>

                <label>
                  Placement Status*
                  <input value={singleForm.placement_status} onChange={(e) => updateSingle("placement_status", e.target.value)} />
                </label>
              </div>
            </div>

            <div className="ms-modal-footer">
              <button className="ms-btn" onClick={closeAllModals} disabled={singleLoading}>
                Cancel
              </button>
              <button className="ms-btn primary" onClick={onAddSingleStudent} disabled={singleLoading}>
                {singleLoading ? "Adding..." : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditOpen && editForm && (
        <div className="ms-modal-backdrop" onClick={closeEditModal}>
          <div className="ms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ms-modal-header">
              <h3>Edit Student</h3>
              <button className="ms-close" onClick={closeEditModal}>
                ✕
              </button>
            </div>

            <div className="ms-modal-body">
              <div className="ms-form-grid">
                <label>
                  Name*
                  <input value={editForm.name} onChange={(e) => updateEdit("name", e.target.value)} />
                </label>

                <label>
                  Email*
                  <input value={editForm.email} onChange={(e) => updateEdit("email", e.target.value)} />
                </label>

                <label>
                  DOB*
                  <input type="date" value={editForm.dob} onChange={(e) => updateEdit("dob", e.target.value)} />
                </label>

                {/* ✅ Gender radio */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontWeight: 700, color: "#374151", fontSize: 13 }}>Gender*</span>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    {["Male", "Female", "Other"].map((g) => (
                      <label key={g} style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 600 }}>
                        <input
                          type="radio"
                          name="gender_edit"
                          value={g}
                          checked={editForm.gender === g}
                          onChange={(e) => updateEdit("gender", e.target.value)}
                        />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>

                <label>
                  Contact*
                  <input value={editForm.contact} onChange={(e) => updateEdit("contact", e.target.value)} />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  Address*
                  <input value={editForm.address} onChange={(e) => updateEdit("address", e.target.value)} />
                </label>

                <label>
                  Roll No*
                  <input value={editForm.roll_no} onChange={(e) => updateEdit("roll_no", e.target.value)} />
                </label>

                <label>
                  Department*
                  <input value={editForm.department} onChange={(e) => updateEdit("department", e.target.value)} />
                </label>

                <label>
                  Year of Study*
                  <input value={editForm.year_of_study} onChange={(e) => updateEdit("year_of_study", e.target.value)} />
                </label>

                <label>
                  Admission Year*
                  <input type="number" value={editForm.admission_year} onChange={(e) => updateEdit("admission_year", e.target.value)} />
                </label>

                <label>
                  Graduate Year*
                  <input type="number" value={editForm.graduate_year} onChange={(e) => updateEdit("graduate_year", e.target.value)} />
                </label>

                <label>
                  CGPA*
                  <input type="number" step="0.01" value={editForm.cgpa} onChange={(e) => updateEdit("cgpa", e.target.value)} />
                </label>

                <label>
                  Marks 10*
                  <input type="number" step="0.01" value={editForm.marks_10} onChange={(e) => updateEdit("marks_10", e.target.value)} />
                </label>

                <label>
                  Marks 12*
                  <input type="number" step="0.01" value={editForm.marks_12} onChange={(e) => updateEdit("marks_12", e.target.value)} />
                </label>

                <label>
                  Backlogs*
                  <input type="number" value={editForm.backlogs} onChange={(e) => updateEdit("backlogs", e.target.value)} />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  Skills*
                  <input value={editForm.skills} onChange={(e) => updateEdit("skills", e.target.value)} />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  Certifications*
                  <input value={editForm.certifications} onChange={(e) => updateEdit("certifications", e.target.value)} />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  Projects*
                  <input value={editForm.projects} onChange={(e) => updateEdit("projects", e.target.value)} />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  Resume URL*
                  <input value={editForm.resume_url} onChange={(e) => updateEdit("resume_url", e.target.value)} />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  Job Roles*
                  <input value={editForm.job_roles} onChange={(e) => updateEdit("job_roles", e.target.value)} />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  Job Locations*
                  <input value={editForm.job_locations} onChange={(e) => updateEdit("job_locations", e.target.value)} />
                </label>

                <label>
                  Placement Status*
                  <input value={editForm.placement_status} onChange={(e) => updateEdit("placement_status", e.target.value)} />
                </label>
              </div>
            </div>
          </div>

          <div className="ms-modal-footer">
            <button className="ms-btn" onClick={closeEditModal} disabled={editLoading}>
              Cancel
            </button>
            <button className="ms-btn primary" onClick={onUpdateStudent} disabled={editLoading}>
              {editLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

      )}

      {/* Bulk Registration Modal */}
      {isBulkOpen && (
        <div className="ms-modal-backdrop" onClick={closeAllModals}>
          <div className="ms-modal large" onClick={(e) => e.stopPropagation()}>
            <div className="ms-modal-header">
              <h3>Bulk Student Registration</h3>
              <button className="ms-close" onClick={closeAllModals}>
                ✕
              </button>
            </div>

            <div className="ms-modal-body">
              <div className="ms-requirements">
                <h4>CSV/Excel File Requirements:</h4>
                <p>Your file should contain the following columns (required fields marked with *):</p>

                <div className="ms-req-grid">
                  <div>• name* • email* • password*</div>
                  <div>• dob • gender • contact</div>
                  <div>• address • roll_no</div>
                  <div>• department • year_of_study • cgpa</div>
                  <div>• admission_year • graduate_year</div>
                  <div>• marks_10 • marks_12 • backlogs</div>
                  <div>• skills • certifications • projects</div>
                  <div>• resume_url • job_roles • job_locations</div>
                  <div>• placement_status</div>
                </div>

                <p className="ms-req-note">Note: student_id and user_id will be auto-generated. Don’t include them in your file.</p>
              </div>

              <div className="ms-file-block">
                <div className="ms-file-title">Select CSV or Excel File</div>
                <input type="file" accept=".csv,.xlsx,.xls" onChange={onPickFile} />
                <div className="ms-file-help">Supported formats: CSV, XLSX, XLS</div>

                {selectedFile && (
                  <div className="ms-selected-file">
                    Selected file: <b>{selectedFile.name}</b>
                  </div>
                )}
              </div>

              <div className="ms-bulk-results">
                <div className="ms-success-box">Successfully Registered ({bulkResult.successCount})</div>

                <div className="ms-error-box">
                  <div className="ms-error-title">Errors ({bulkResult.errorCount})</div>

                  <div className="ms-error-list">
                    {bulkResult.errorCount === 0
                      ? "No errors yet."
                      : bulkResult.errors.map((e, idx) => (
                        <div key={idx}>
                          Row {e.row}: {e.message}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="ms-modal-footer">
              <button className="ms-btn" onClick={closeAllModals} disabled={bulkLoading}>
                Cancel
              </button>
              <button className="ms-btn primary" disabled={!selectedFile || bulkLoading} onClick={onProcessBulk}>
                {bulkLoading ? "Processing..." : "Process File"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageStudents;