// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Mail,
  Trash2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Eye,
} from "lucide-react";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js";
import { Pie, Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
);

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
  const [expandedUser, setExpandedUser] = useState(null);

  // Delete Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [deleteType, setDeleteType] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // View Post Modal
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

useEffect(() => {
  const loadData = async () => {
    if (user?.role === "ADMIN") {
      try {
        const resUsers = await fetchAdminUsers();
        if (!resUsers?.success) {
          showToast(resUsers?.message || "Failed to fetch users", "error");
          setUsers([]);
        } else {
          setUsers(resUsers.users || []);
        }
      } catch (err) {
        console.error(err);
        showToast(err?.response?.data?.message || err.message || "Error fetching users", "error");
        setUsers([]);
      }

      try {
        const resAdmins = await fetchAdmins();
        if (!resAdmins?.success) {
          showToast(resAdmins?.message || "Failed to fetch admins", "error");
          setAdmins([]);
        } else {
          setAdmins(resAdmins.admins || []);
        }
      } catch (err) {
        console.error(err);
        showToast(err?.response?.data?.message || err.message || "Error fetching admins", "error");
        setAdmins([]);
      }

      try {
        const resPosts = await getAllPostsForAdmin();
        if (!resPosts?.success) {
          showToast(resPosts?.message || "Failed to fetch posts", "error");
          setPosts([]);
        } else {
          setPosts(resPosts.posts || []);
        }
      } catch (err) {
        console.error(err);
        showToast(err?.response?.data?.message || err.message || "Error fetching posts", "error");
        setPosts([]);
      }
    }
  };

  loadData();
}, [user]);


  if (user?.role !== "ADMIN") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-bold text-red-500">Access Denied</p>
      </div>
    );
  }

  const openModal = (type, id) => {
    setDeleteType(type);
    setSelectedId(id);
    setReason("");
    setIsModalOpen(true);
  };

  const showToast = (msg, type = "success") => {
    const toast = document.createElement("div");
    toast.className = `alert ${
      type === "error" ? "alert-error" : "alert-success"
    } shadow-lg fixed bottom-5 right-5 w-80 animate-fadeIn z-[1000]`;
    toast.innerHTML = `<span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

 const confirmRequest = async () => {
  if (!reason.trim()) return;

  try {
    let res;
    if (deleteType === "user") {
      res = await requestUserDeletion(selectedId, reason);
    } else if (deleteType === "post") {
      res = await requestPostDeletion(selectedId, reason);
    }

    if (res?.success) {
      showToast(res.message || "Request sent successfully!", "success");
      setIsModalOpen(false);
    } else {
      showToast(res?.message || "Failed to send request", "error");
    }
  } catch (err) {
    console.error(err);
    const errorMessage =
      err?.response?.data?.message || err.message || "Error sending deletion request.";
    showToast(errorMessage, "error");
  }
};


  const getUserPosts = (userId) =>
    posts.filter((post) => post.user?.id === userId);

  // 📊 Analytics
  const chartData = {
    labels: ["Users", "Admins", "Posts"],
    datasets: [
      {
        data: [users.length, admins.length, posts.length],
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B"],
        borderWidth: 2,
      },
    ],
  };

  const postsPerUser = users.map((u) => getUserPosts(u.id).length);
  const barData = {
    labels: users.map((u) => u.username),
    datasets: [
      {
        label: "Posts per User",
        data: postsPerUser,
        backgroundColor: "#6366F1",
      },
    ],
  };

  const postsOverTime = posts.reduce((acc, post) => {
    const date = new Date(post.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const lineData = {
    labels: Object.keys(postsOverTime),
    datasets: [
      {
        label: "Posts over Time",
        data: Object.values(postsOverTime),
        borderColor: "#F43F5E",
        backgroundColor: "#FCA5A5",
        tension: 0.3,
      },
    ],
  };

  const imagePosts = posts.filter((p) => p.image).length;
  const noImagePosts = posts.length - imagePosts;
  const doughnutData = {
    labels: ["With Image", "Without Image"],
    datasets: [
      {
        data: [imagePosts, noImagePosts],
        backgroundColor: ["#34D399", "#9CA3AF"],
      },
    ],
  };

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ClipboardList className="w-8 h-8 text-primary" />
        Admin Dashboard
      </h1>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">System Overview</h2>
          <Pie data={chartData} />
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Posts per User</h2>
          <Bar data={barData} />
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Posts over Time</h2>
          <Line data={lineData} />
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Image vs Text Posts</h2>
          <Doughnut data={doughnutData} />
        </div>
      </div>

      {/* Users with Posts */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Users & Posts</h2>
        <div className="space-y-4">
          {users.map((u) => {
            const userPosts = getUserPosts(u.id);
            const expanded = expandedUser === u.id;
            return (
              <div key={u.id} className="card bg-white shadow-md">
                <div className="card-body">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          u.profilePicture ||
                          `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`
                        }
                        alt="avatar"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          <User className="w-5 h-5 text-primary" />
                          {u.username}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {u.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-error btn-xs flex items-center gap-1"
                        onClick={() => openModal("user", u.id)}
                      >
                        <Trash2 className="w-4 h-4" /> Delete User
                      </button>
                      <button
                        className="btn btn-outline btn-xs"
                        onClick={() =>
                          setExpandedUser(expanded ? null : u.id)
                        }
                      >
                        {expanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* User Posts */}
                  {expanded && (
                    <div className="mt-4 border-t pt-4">
                      <h3 className="font-semibold mb-2">Posts</h3>
                      {userPosts.length > 0 ? (
                        <div className="space-y-2">
                          {userPosts.map((p) => (
                            <div
                              key={p.id}
                              className="p-3 border rounded-lg flex justify-between items-center"
                            >
                              <p className="text-gray-700 truncate max-w-xs">
                                {p.content}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  className="btn btn-info btn-xs flex items-center gap-1"
                                  onClick={() => {
                                    setSelectedPost(p);
                                    setIsPostModalOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" /> View
                                </button>
                                <button
                                  className="btn btn-error btn-xs flex items-center gap-1"
                                  onClick={() => openModal("post", p.id)}
                                >
                                  <Trash2 className="w-4 h-4" /> Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No posts found</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <p className="text-center text-gray-500">No users found</p>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">
              Reason for Deleting {deleteType === "user" ? "User" : "Post"}
            </h3>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Enter reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
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

      {/* View Post Modal */}
      {isPostModalOpen && selectedPost && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Post Details</h3>
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={
                    selectedPost.user?.profilePicture ||
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${selectedPost.user?.username}`
                  }
                  alt="avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold">{selectedPost.user?.username}</p>
                  <p className="text-sm text-gray-500">
                    {selectedPost.user?.email}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap mb-3">
                {selectedPost.content}
              </p>
              {selectedPost.image && (
                <img
                  src={selectedPost.image}
                  alt="post"
                  className="rounded-lg mb-3 max-h-60 object-cover"
                />
              )}
              <p className="text-sm text-gray-500">
                Likes: {selectedPost.likeCount} |{" "}
                {new Date(selectedPost.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="btn btn-primary"
                onClick={() => setIsPostModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
