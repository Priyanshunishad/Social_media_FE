import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { Users, UserCog, FileText } from "lucide-react"; // icons

const AdminDashboard = () => {
  const {
    user,
    fetchAdminUsers,
    fetchAdmins,
    getAllPostsForAdmin,
    requestUserDeletion,
    requestPostDeletion,
  } = useAuth();

  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [posts, setPosts] = useState([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [deleteType, setDeleteType] = useState(""); // "user" or "post"
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchAdminUsers().then((res) => setUsers(res.users || []));
      fetchAdmins().then((res) => setAdmins(res.admins || []));
      getAllPostsForAdmin().then((res) => setPosts(res.posts || []));
    }
  }, [user]);

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex justify-center items-center h-screen bg-base-200">
        <p className="text-2xl font-bold text-red-600">
          🚫 Access Denied - Admins Only
        </p>
      </div>
    );
  }

  // Open modal
  const openModal = (type, id) => {
    setDeleteType(type);
    setSelectedId(id);
    setReason("");
    setIsModalOpen(true);
  };

  // Confirm deletion request
  const confirmRequest = async () => {
    if (!reason.trim()) return;

    try {
      if (deleteType === "user") {
        const res = await requestUserDeletion(selectedId, reason);
        toast.success(res.message || "✅ User deletion request sent!");
      } else if (deleteType === "post") {
        const res = await requestPostDeletion(selectedId, reason);
        toast.success(res.message || "✅ Post deletion request sent!");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "❌ Error sending deletion request."
      );
    }
  };

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      {/* Page Title */}
      <h1 className="text-4xl font-bold mb-8 text-center">
        👑 Admin Dashboard
      </h1>

      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <div className="stat bg-base-100 shadow-lg rounded-xl border">
          <div className="stat-figure text-primary">
            <Users className="w-8 h-8" />
          </div>
          <div className="stat-title">Total Users</div>
          <div className="stat-value">{users.length}</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-xl border">
          <div className="stat-figure text-secondary">
            <UserCog className="w-8 h-8" />
          </div>
          <div className="stat-title">Admins</div>
          <div className="stat-value">{admins.length}</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-xl border">
          <div className="stat-figure text-accent">
            <FileText className="w-8 h-8" />
          </div>
          <div className="stat-title">Posts</div>
          <div className="stat-value">{posts.length}</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card bg-base-100 shadow-xl mb-10">
        <div className="card-body">
          <h2 className="card-title text-2xl">👤 Users</h2>
          <div className="overflow-x-auto mt-4">
            <table className="table table-zebra w-full">
              <thead className="bg-base-300">
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-error"
                        onClick={() => openModal("user", u.id)}
                      >
                        Request Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-500 py-4">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">📝 Posts</h2>
          <div className="overflow-x-auto mt-4">
            <table className="table table-zebra w-full">
              <thead className="bg-base-300">
                <tr>
                  <th>Content</th>
                  <th>Author</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.content}</td>
                    <td>{p.user?.username}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-error"
                        onClick={() => openModal("post", p.id)}
                      >
                        Request Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-500 py-4">
                      No posts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-base-100 rounded-xl shadow-xl p-6 w-96 animate-fadeIn">
            <h3 className="text-lg font-bold mb-4">
              Reason for Deleting{" "}
              {deleteType === "user" ? "User" : "Post"}
            </h3>
            <textarea
              className="textarea textarea-bordered w-full h-28"
              placeholder="Enter reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                className="btn btn-ghost"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={confirmRequest}
                disabled={!reason.trim()}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
