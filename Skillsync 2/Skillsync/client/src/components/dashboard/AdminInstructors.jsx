import { useEffect, useState } from "react";

export default function AdminInstructors() {
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: "Bearer " + token,
  };

  useEffect(() => {
    fetchPending();
    fetchAll();
  }, []);

  const fetchPending = async () => {
    const res = await fetch("http://localhost:5000/api/admin/pending", {
      headers,
    });
    const data = await res.json();
    setPending(data);
  };

  const fetchAll = async () => {
    const res = await fetch("http://localhost:5000/api/admin/instructors", {
      headers,
    });
    const data = await res.json();
    setAll(data);
  };

  const approve = async (instructorId) => {
    await fetch(
      `http://localhost:5000/api/admin/instructors/${instructorId}/approve`,
      {
        method: "PUT",
        headers,
      }
    );
    fetchPending();
    fetchAll();
  };

  const reject = async (instructorId) => {
    await fetch(
      `http://localhost:5000/api/admin/instructors/${instructorId}/reject`,
      {
        method: "PUT",
        headers,
      }
    );
    fetchPending();
    fetchAll();
  };

  return (
    <div style={styles.container}>
      <h2>Manage Instructors</h2>

      {/* Pending Requests */}
      <section style={styles.section}>
        <h3>Pending Instructor Requests</h3>

        {pending.length === 0 ? (
          <p>No pending requests</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>College</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((i) => (
                <tr key={i.instructor_id}>
                  <td>{i.name}</td>
                  <td>{i.email}</td>
                  <td>{i.organisation}</td>
                  <td>
                    <button
                      onClick={() => approve(i.instructor_id)}
                      style={styles.approve}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(i.instructor_id)}
                      style={styles.reject}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* All Instructors */}
      <section style={styles.section}>
        <h3>All Instructors</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>College</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {all.map((i) => (
              <tr key={i.instructor_id}>
                <td>{i.name}</td>
                <td>{i.email}</td>
                <td>{i.organisation}</td>
                <td>{i.approval_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    fontFamily: "sans-serif",
  },
  section: {
    marginBottom: "40px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  approve: {
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    marginRight: "6px",
    cursor: "pointer",
  },
  reject: {
    background: "#f44336",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    cursor: "pointer",
  },
};
