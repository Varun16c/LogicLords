import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";

function StudentCourses() {
  const [activeTab, setActiveTab] = useState("enrolled");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseContent, setCourseContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [activeTab]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      if (activeTab === "enrolled") {
        const res = await axiosInstance.get("/api/courses/enrolled");
        setEnrolledCourses(res.data);
      } else {
        const res = await axiosInstance.get("/api/courses/available");
        setAvailableCourses(res.data);
      }
    } catch (e) {
      console.error("Error fetching courses:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrolling(courseId);
      await axiosInstance.post(`/api/courses/enroll/${courseId}`);
      alert("Successfully enrolled in course!");
      fetchCourses();
      setActiveTab("enrolled");
    } catch (e) {
      alert(e.response?.data?.error || "Failed to enroll");
    } finally {
      setEnrolling(null);
    }
  };

  const fetchCourseContent = async (courseId) => {
    try {
      const res = await axiosInstance.get(`/api/courses/${courseId}/content`);
      setCourseContent(res.data);
      setSelectedCourse(courseId);
      if (res.data.modules.length > 0) {
        setSelectedModule(res.data.modules[0].module_id);
      }
    } catch (e) {
      console.error("Error fetching course content:", e);
      alert(e.response?.data?.error || "Failed to load course content");
    }
  };

  const markModuleComplete = async (moduleId, isCompleted) => {
    try {
      const endpoint = isCompleted 
        ? `/api/courses/${selectedCourse}/modules/${moduleId}/incomplete`
        : `/api/courses/${selectedCourse}/modules/${moduleId}/complete`;
      
      await axiosInstance.post(endpoint);
      fetchCourseContent(selectedCourse);
      fetchCourses();
    } catch (e) {
      console.error("Error updating module status:", e);
    }
  };

  const getCurrentModule = () => {
    if (!courseContent || !selectedModule) return null;
    return courseContent.modules.find(m => m.module_id === selectedModule);
  };

  if (selectedCourse && courseContent) {
    const currentModule = getCurrentModule();

    return (
      <div className="dashboard-card full-width">
        {/* Course Header */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: "2px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => {
                setSelectedCourse(null);
                setCourseContent(null);
                setSelectedModule(null);
              }}
              style={{
                padding: "8px 16px",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              ← Back
            </button>
            <div>
              <h3 style={{ margin: 0 }}>{courseContent.course.course_name}</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6b7280" }}>
                {courseContent.modules.length} Modules
              </p>
            </div>
          </div>
        </div>

        {courseContent.modules.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "60px 20px",
            background: "#f9fafb",
            borderRadius: "8px"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
            <h3 style={{ color: "#374151" }}>No Modules Available</h3>
            <p style={{ color: "#6b7280" }}>The instructor hasn't added any modules yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "20px" }}>
            {/* Sidebar - Module List */}
            <div style={{ 
              width: "280px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}>
              <h4 style={{ 
                margin: "0 0 12px 0",
                fontSize: "14px",
                fontWeight: 600,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Course Modules
              </h4>
              {courseContent.modules.map((module) => (
                <button
                  key={module.module_id}
                  onClick={() => setSelectedModule(module.module_id)}
                  style={{
                    padding: "12px 16px",
                    background: selectedModule === module.module_id ? "#4f46e5" : "white",
                    color: selectedModule === module.module_id ? "white" : "#374151",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontWeight: selectedModule === module.module_id ? 600 : 400
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {module.is_completed && (
                      <span style={{ 
                        color: selectedModule === module.module_id ? "#dcfce7" : "#16a34a",
                        fontSize: "16px"
                      }}>
                        ✓
                      </span>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", opacity: 0.8 }}>
                        Module {module.module_number}
                      </div>
                      <div style={{ fontSize: "14px", marginTop: "2px" }}>
                        {module.module_name}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1 }}>
              {currentModule && (
                <>
                  {/* Module Header */}
                  <div style={{
                    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                    padding: "24px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    color: "white"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div>
                        <div style={{ fontSize: "13px", opacity: 0.9, marginBottom: "4px" }}>
                          Module {currentModule.module_number}
                        </div>
                        <h3 style={{ margin: "0 0 8px 0" }}>{currentModule.module_name}</h3>
                        <div style={{ fontSize: "14px", opacity: 0.9 }}>
                          {currentModule.contents.length} items
                        </div>
                      </div>
                      <button
                        onClick={() => markModuleComplete(currentModule.module_id, currentModule.is_completed)}
                        style={{
                          padding: "8px 16px",
                          background: currentModule.is_completed ? "#ef4444" : "#16a34a",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "14px",
                          cursor: "pointer",
                          fontWeight: 600
                        }}
                      >
                        {currentModule.is_completed ? "Mark Incomplete" : "Mark Complete"}
                      </button>
                    </div>
                  </div>

                  {/* Content List */}
                  {currentModule.contents.length === 0 ? (
                    <div style={{ 
                      textAlign: "center", 
                      padding: "60px 20px",
                      background: "#f9fafb",
                      borderRadius: "8px"
                    }}>
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
                      <h3 style={{ color: "#374151" }}>No Content Available</h3>
                      <p style={{ color: "#6b7280" }}>Content for this module will be added soon</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {/* Group content by type */}
                      {['video', 'pdf', 'image'].map(type => {
                        const items = currentModule.contents.filter(c => c.content_type === type);
                        if (items.length === 0) return null;

                        const typeInfo = {
                          video: { icon: "🎥", label: "Videos", color: "#dc2626" },
                          pdf: { icon: "📄", label: "PDFs", color: "#2563eb" },
                          image: { icon: "🖼️", label: "Images", color: "#16a34a" }
                        };

                        return (
                          <div key={type} style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            padding: "20px",
                            background: "white"
                          }}>
                            <h4 style={{ 
                              margin: "0 0 16px 0",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              color: typeInfo[type].color
                            }}>
                              <span style={{ fontSize: "20px" }}>{typeInfo[type].icon}</span>
                              {typeInfo[type].label}
                              <span style={{
                                marginLeft: "8px",
                                padding: "2px 8px",
                                background: "#f3f4f6",
                                color: "#6b7280",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: 600
                              }}>
                                {items.length}
                              </span>
                            </h4>

                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                              {items.map((content, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    padding: "16px",
                                    background: "#f9fafb",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "6px"
                                  }}
                                >
                                  <div style={{ 
                                    display: "flex", 
                                    justifyContent: "space-between",
                                    alignItems: "start",
                                    marginBottom: "12px"
                                  }}>
                                    <div>
                                      <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                                        {content.file_name}
                                      </div>
                                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                        {(content.size / 1024).toFixed(2)} KB
                                      </div>
                                    </div>
                                  </div>

                                  {type === "video" && (
                                    <video
                                      controls
                                      style={{ 
                                        width: "100%",
                                        maxHeight: "400px",
                                        borderRadius: "4px",
                                        background: "#000"
                                      }}
                                    >
                                      <source src={content.url} type="video/mp4" />
                                      Your browser does not support video playback.
                                    </video>
                                  )}

                                  {type === "image" && (
                                    <img
                                      src={content.url}
                                      alt={content.file_name}
                                      style={{ 
                                        width: "100%",
                                        maxHeight: "500px",
                                        borderRadius: "4px",
                                        objectFit: "contain",
                                        background: "#f3f4f6"
                                      }}
                                    />
                                  )}

                                  {type === "pdf" && (
                                    <a
                                      href={content.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        display: "inline-block",
                                        padding: "10px 20px",
                                        background: "#2563eb",
                                        color: "white",
                                        textDecoration: "none",
                                        borderRadius: "6px",
                                        fontSize: "14px",
                                        fontWeight: 600
                                      }}
                                    >
                                      Open PDF
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard-card full-width">
      <div style={{ 
        display: "flex", 
        gap: "12px", 
        marginBottom: "24px",
        borderBottom: "2px solid #e5e7eb"
      }}>
        <button
          onClick={() => setActiveTab("enrolled")}
          style={{
            padding: "12px 24px",
            background: "transparent",
            color: activeTab === "enrolled" ? "#4f46e5" : "#6b7280",
            border: "none",
            borderBottom: activeTab === "enrolled" ? "3px solid #4f46e5" : "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "15px"
          }}
        >
          My Courses ({enrolledCourses.length})
        </button>
        <button
          onClick={() => setActiveTab("available")}
          style={{
            padding: "12px 24px",
            background: "transparent",
            color: activeTab === "available" ? "#4f46e5" : "#6b7280",
            border: "none",
            borderBottom: activeTab === "available" ? "3px solid #4f46e5" : "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "15px"
          }}
        >
          Available Courses
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          Loading courses...
        </div>
      ) : (
        <>
          {activeTab === "enrolled" && (
            <>
              {enrolledCourses.length === 0 ? (
                <div style={{ 
                  textAlign: "center", 
                  padding: "60px 20px",
                  background: "#f9fafb",
                  borderRadius: "8px"
                }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
                  <h3 style={{ color: "#374151", marginBottom: "8px" }}>No Enrolled Courses</h3>
                  <p style={{ color: "#6b7280" }}>
                    Browse available courses and enroll to start learning
                  </p>
                  <button
                    onClick={() => setActiveTab("available")}
                    style={{
                      marginTop: "20px",
                      padding: "10px 24px",
                      background: "#4f46e5",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    Browse Courses
                  </button>
                </div>
              ) : (
                <div className="ms-form-grid">
                  {enrolledCourses.map((course) => (
                    <div
                      key={course.course_id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "20px",
                        background: "white",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                      onClick={() => fetchCourseContent(course.course_id)}
                    >
                      <h4 style={{ marginBottom: "8px" }}>{course.course_name}</h4>
                      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
                        by {course.instructor_name || "Instructor"}
                      </p>
                      
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px"
                      }}>
                        <span style={{ fontSize: "14px", color: "#6b7280" }}>
                          {course.module_count} modules
                        </span>
                        <span style={{ 
                          fontSize: "14px", 
                          fontWeight: 600,
                          color: course.progress === 100 ? "#16a34a" : "#4f46e5"
                        }}>
                          {course.progress}% Complete
                        </span>
                      </div>

                      <div style={{ 
                        width: "100%", 
                        height: "8px", 
                        background: "#e5e7eb",
                        borderRadius: "4px",
                        overflow: "hidden"
                      }}>
                        <div style={{
                          width: `${course.progress}%`,
                          height: "100%",
                          background: course.progress === 100 ? "#16a34a" : "#4f46e5",
                          transition: "width 0.3s"
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "available" && (
            <>
              {availableCourses.length === 0 ? (
                <div style={{ 
                  textAlign: "center", 
                  padding: "60px 20px",
                  background: "#f9fafb",
                  borderRadius: "8px"
                }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎓</div>
                  <h3 style={{ color: "#374151", marginBottom: "8px" }}>No Courses Available</h3>
                  <p style={{ color: "#6b7280" }}>
                    No courses have been created for your college yet
                  </p>
                </div>
              ) : (
                <div className="ms-form-grid">
                  {availableCourses.map((course) => (
                    <div
                      key={course.course_id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "20px",
                        background: course.is_enrolled ? "#f0fdf4" : "white"
                      }}
                    >
                      <h4 style={{ marginBottom: "8px" }}>{course.course_name}</h4>
                      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
                        by {course.instructor_name || "Instructor"}
                      </p>
                      
                      <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
                        {course.module_count} modules
                      </div>

                      {course.is_enrolled ? (
                        <div style={{
                          padding: "10px",
                          background: "#dcfce7",
                          color: "#166534",
                          borderRadius: "6px",
                          textAlign: "center",
                          fontWeight: 600
                        }}>
                          ✓ Enrolled
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course.course_id)}
                          disabled={enrolling === course.course_id}
                          style={{
                            width: "100%",
                            padding: "10px",
                            background: enrolling === course.course_id ? "#9ca3af" : "#4f46e5",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: enrolling === course.course_id ? "not-allowed" : "pointer",
                            fontWeight: 600
                          }}
                        >
                          {enrolling === course.course_id ? "Enrolling..." : "Enroll Now"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default StudentCourses;