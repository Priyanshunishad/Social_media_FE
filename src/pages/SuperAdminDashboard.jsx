// src/pages/SuperAdminDashboard.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const SuperAdminDashboard = () => {
  const {
    getAllUsers,
    fetchAdmins,
    createAdmin,
    editAdmin,
    deleteUser,
    getPendingUserDeletions,
    handleUserDeletion,
    getAllPostsForAdmin,
    getPendingPostDeletions,
    handlePostDeletion,
  } = useAuth();

  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [posts, setPosts] = useState([]);
  const [pendingUserDeletions, setPendingUserDeletions] = useState([]);
  const [pendingPostDeletions, setPendingPostDeletions] = useState([]);
  const [tab, setTab] = useState("users"); // active tab

  // Fetch all dashboard data
  useEffect(() => {
    (async () => {
      const u = await getAllUsers();
      setUsers(u?.users || []);

      const a = await fetchAdmins();
      setAdmins(a?.admins || []);

      const p = await getAllPostsForAdmin();
      setPosts(p?.posts || []);

      const pud = await getPendingUserDeletions();
      setPendingUserDeletions(pud?.requests || []);

      const ppd = await getPendingPostDeletions();
      setPendingPostDeletions(ppd?.requests || []);
    })();
  }, []);

  // Handle actions
  const handleApproveUserDeletion = async (id) => {
    await handleUserDeletion(id, "approve");
    setPendingUserDeletions((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRejectUserDeletion = async (id) => {
    await handleUserDeletion(id, "reject");
    setPendingUserDeletions((prev) => prev.filter((r) => r.id !== id));
  };

  const handleApprovePostDeletion = async (id) => {
    await handlePostDeletion(id, "approve");
    setPendingPostDeletions((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRejectPostDeletion = async (id) => {
    await handlePostDeletion(id, "reject");
    setPendingPostDeletions((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["users", "admins", "posts", "pendingUserDeletions", "pendingPostDeletions"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`btn ${tab === t ? "btn-primary" : "btn-outline"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Users */}
      {tab === "users" && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">All Users</h2>
            <ul className="space-y-2">
              {users.map((u) => (
                <li key={u.id} className="flex justify-between items-center border p-2 rounded">
                  <span>{u.username} ({u.email})</span>
                  <button className="btn btn-error btn-sm" onClick={() => deleteUser(u.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Admins */}
      {tab === "admins" && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Admins</h2>
            <ul className="space-y-2">
              {admins.map((a) => (
                <li key={a.id} className="flex justify-between items-center border p-2 rounded">
                  <span>{a.username} ({a.email})</span>
                  <button className="btn btn-info btn-sm">Edit</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Posts */}
      {tab === "posts" && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">All Posts</h2>
            <ul className="space-y-2">
              {posts.map((p) => (
                <li key={p.id} className="flex justify-between items-center border p-2 rounded">
                  <span>{p.content.slice(0, 50)}...</span>
                  <button className="btn btn-error btn-sm">Delete</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Pending User Deletions */}
      {tab === "pendingUserDeletions" && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Pending User Deletion Requests</h2>
            <ul className="space-y-2">
              {pendingUserDeletions.map((r) => (
                <li key={r.id} className="flex justify-between items-center border p-2 rounded">
                  <span>User: {r.userId}, Reason: {r.reason}</span>
                  <div className="flex gap-2">
                    <button className="btn btn-success btn-sm" onClick={() => handleApproveUserDeletion(r.id)}>
                      Approve
                    </button>
                    <button className="btn btn-error btn-sm" onClick={() => handleRejectUserDeletion(r.id)}>
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Pending Post Deletions */}
      {tab === "pendingPostDeletions" && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Pending Post Deletion Requests</h2>
            <ul className="space-y-2">
              {pendingPostDeletions.map((r) => (
                <li key={r.id} className="flex justify-between items-center border p-2 rounded">
                  <span>Post: {r.postId}, Reason: {r.reason}</span>
                  <div className="flex gap-2">
                    <button className="btn btn-success btn-sm" onClick={() => handleApprovePostDeletion(r.id)}>
                      Approve
                    </button>
                    <button className="btn btn-error btn-sm" onClick={() => handleRejectPostDeletion(r.id)}>
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
