import { useEffect, useState } from "react";

export default function CourseManagement() {
  const token = localStorage.getItem("token");

  /* ===============================
     STATE
  =============================== */
  const [courseName, setCourseName] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");

  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [contentList, setContentList] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [contentType, setContentType] = useState("video");
  const [file, setFile] = useState(null);

  const jsonHeaders = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };

  /* ===============================
     FETCH COURSES
  =============================== */
  const fetchCourses = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/instructor/courses",
        { headers: jsonHeaders }
      );
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  /* ===============================
     FETCH MODULES BY COURSE
  =============================== */
  const fetchModules = async (courseId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/instructor/modules/${courseId}`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      const data = await res.json();
      setModules(data);
    } catch (err) {
      console.error("Error fetching modules:", err);
    }
  };

  /* ===============================
     FETCH UPLOADED CONTENT
  =============================== */
  const fetchContent = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/instructor/content",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      const data = await res.json();
      setContentList(data);
    } catch (err) {
      console.error("Error fetching content:", err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchContent();
  }, []);

  /* ===============================
     CREATE COURSE
  =============================== */
  const createCourse = async () => {
    if (!courseName.trim()) {
      alert("Enter course name");
      return;
    }

    const res = await fetch(
      "http://localhost:5000/api/instructor/courses",
      {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ courseName }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Course created successfully");
    setCourseName("");
    fetchCourses();
  };

  /* ===============================
     CREATE MODULE (DB ONLY)
  =============================== */
  const createModule = async () => {
    if (!selectedCourse || !moduleTitle.trim()) {
      alert("Select course & enter module title");
      return;
    }

    const res = await fetch(
      "http://localhost:5000/api/instructor/modules",
      {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          courseId: selectedCourse,
          moduleName: moduleTitle,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Module created");
    setModuleTitle("");
    fetchModules(selectedCourse);
  };

  /* ===============================
     UPLOAD CONTENT
  =============================== */
  const uploadContent = async () => {
    if (!selectedCourse || !selectedModule || !file) {
      alert("Select course, module & file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("moduleId", selectedModule);
    formData.append("contentType", contentType);

    const res = await fetch(
      "http://localhost:5000/api/instructor/content/upload",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Content uploaded successfully");
    setFile(null);
    fetchContent();
  };

  const deleteContent = async (s3Key) => {
    if (!window.confirm("Delete this content permanently?")) return;

    const res = await fetch(
      `http://localhost:5000/api/instructor/content?s3Key=${encodeURIComponent(s3Key)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    fetchContent();
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div style={{ padding: "30px", maxWidth: "900px" }}>
      <h2>📚 Course Management</h2>

      {/* ================= CREATE COURSE ================= */}
      <section style={{ marginBottom: "40px" }}>
        <h3>Create Course</h3>
        <input
          placeholder="Course name"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
        />
        <button onClick={createCourse} style={{ marginLeft: "10px" }}>
          Create
        </button>
      </section>

      {/* ================= CREATE MODULE ================= */}
      <section style={{ marginBottom: "40px" }}>
        <h3>Create Module</h3>

        <select
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            setSelectedModule("");
            fetchModules(e.target.value);
          }}
        >
          <option value="">Select Course</option>
          {courses.map((c) => (
            <option key={c.course_id} value={c.course_id}>
              {c.course_name}
            </option>
          ))}
        </select>

        <input
          placeholder="Module title"
          value={moduleTitle}
          onChange={(e) => setModuleTitle(e.target.value)}
          style={{ marginLeft: "10px" }}
        />

        <button onClick={createModule} style={{ marginLeft: "10px" }}>
          Add Module
        </button>
      </section>

      {/* ================= UPLOAD CONTENT ================= */}
      <section style={{ marginBottom: "40px" }}>
        <h3>Upload Content</h3>

        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
        >
          <option value="">Select Module</option>
          {modules.map((m) => (
            <option key={m.module_id} value={m.module_id}>
              {m.module_name}
            </option>
          ))}
        </select>

        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          style={{ marginLeft: "10px" }}
        >
          <option value="video">🎥 Video</option>
          <option value="pdf">📄 PDF</option>
          <option value="image">🖼️ Image</option>
        </select>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginLeft: "10px" }}
        />

        <button onClick={uploadContent} style={{ marginLeft: "10px" }}>
          Upload
        </button>
      </section>

      {/* ================= CONTENT LIST ================= */}
      <section style={{ marginBottom: "40px" }}>
        <h3>Uploaded Content</h3>

        {contentList.length === 0 && (
          <p style={{ color: "#666" }}>No content uploaded yet</p>
        )}

        <div style={{ display: "grid", gap: "15px" }}>
          {contentList.map((c, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "8px",
                background: "#fafafa",
              }}
            >
              <h4 style={{ marginBottom: "8px" }}>{c.course_name}</h4>

              <p>
                <b>Module:</b> {c.module_number === 'all' ? 'All Modules' : `Module ${c.module_number}`}
              </p>

              <p>
                <b>Type:</b>{" "}
                {c.content_type === "video"
                  ? "🎥 Video"
                  : c.content_type === "pdf"
                  ? "📄 PDF"
                  : "🖼️ Image"}
              </p>

              <p>
                <b>File:</b> {c.file_name}
              </p>

              <small style={{ color: "#777" }}>
                Uploaded on {new Date(c.uploaded_at).toLocaleString()}
              </small>

              {/* 🔥 DELETE BUTTON */}
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => deleteContent(c.s3_key)}
                  style={{
                    background: "#ff4d4f",
                    color: "white",
                    border: "none",
                    padding: "6px 14px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}