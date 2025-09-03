import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

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

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchAdminUsers().then((res) => setUsers(res.users || []));
      fetchAdmins().then((res) => setAdmins(res.admins || []));
      getAllPostsForAdmin().then((res) => setPosts(res.posts || []));
    }
  }, [user]);

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-bold text-red-500">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* 📌 Quick Stats */}
      <div className="stats shadow mb-6">
        <div className="stat">
          <div className="stat-title">Total Users</div>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Admins</div>
          <div className="stat-value">{admins.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Posts</div>
          <div className="stat-value">{posts.length}</div>
        </div>
      </div>

      {/* 📌 Users Table */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Users</h2>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Request Deletion</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <button
                      className="btn btn-xs btn-error"
                      onClick={() =>
                        requestUserDeletion(u.id, "Violation of rules")
                      }
                    >
                      Request Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📌 Posts Table */}
      <div>
        <h2 className="text-2xl font-semibold mb-3">Posts</h2>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Request Deletion</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{p.author?.username}</td>
                  <td>
                    <button
                      className="btn btn-xs btn-error"
                      onClick={() =>
                        requestPostDeletion(p.id, "Inappropriate content")
                      }
                    >
                      Request Delete
                    </button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center text-gray-500">
                    No posts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
