// src/pages/SuperAdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Mail,
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye,
  Shield,
  Check,
  X,
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

const SuperAdminDashboard = () => {
  const {
    fetchAdminUsers,
    fetchAdmins,
    getAllPostsForAdmin,
    getPendingUserDeletions,
    getPendingPostDeletions,
    handleUserDeletion,
    handlePostDeletion,
    postDeleteDirectly,
    deleteUser,
  } = useAuth();

  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [posts, setPosts] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);

  // Modals
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Confirm Modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => () => {});

  // Request Stats
  const [requestStats, setRequestStats] = useState({ users: 0, posts: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const resUsers = await fetchAdminUsers();
        setUsers(resUsers?.users || []);

        const resAdmins = await fetchAdmins();
        setAdmins(resAdmins?.admins || []);

        const resPosts = await getAllPostsForAdmin();
        setPosts(resPosts?.posts || []);

        const resPendingU = await getPendingUserDeletions();
        setPendingUsers(resPendingU?.requests || []);

        const resPendingP = await getPendingPostDeletions();
        setPendingPosts(resPendingP?.requests || []);

        setRequestStats({
          users: resPendingU?.requests?.length || 0,
          posts: resPendingP?.requests?.length || 0,
        });
      } catch (err) {
        console.error(err);
        showToast("Failed to fetch data", "error");
      }
    };
    loadData();
  }, []);

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

  // 📊 Analytics
  const chartData = {
    labels: ["Users", "Admins", "Posts"],
    datasets: [
      {
        data: [users.length, admins.length, posts.length],
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B"],
      },
    ],
  };

  const postsPerUser = users.map(
    (u) => posts.filter((p) => p.user?.id === u.id).length
  );
  const barData = {
    labels: users.map((u) => u.username),
    datasets: [
      { label: "Posts per User", data: postsPerUser, backgroundColor: "#6366F1" },
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

  const doughnutData = {
    labels: ["With Image", "Without Image"],
    datasets: [
      {
        data: [
          posts.filter((p) => p.image).length,
          posts.filter((p) => !p.image).length,
        ],
        backgroundColor: ["#34D399", "#9CA3AF"],
      },
    ],
  };

  const requestData = {
    labels: ["User Requests", "Post Requests"],
    datasets: [
      {
        data: [requestStats.users, requestStats.posts],
        backgroundColor: ["#F87171", "#60A5FA"],
      },
    ],
  };

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Shield className="w-8 h-8 text-primary" />
        Super Admin Dashboard
      </h1>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
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
          <h2 className="text-lg font-semibold mb-2">Image vs Text</h2>
          <Doughnut data={doughnutData} />
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Deletion Requests</h2>
          <Pie data={requestData} />
        </div>
      </div>

      {/* Pending Requests */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Pending Deletion Requests</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* User Requests */}
          <div className="bg-white p-4 shadow rounded-lg">
            <h3 className="font-bold mb-2">User Deletion Requests</h3>
            {pendingUsers.length > 0 ? (
              pendingUsers.map((r) => (
                <div
                  key={r.id}
                  className="p-3 border rounded-lg flex justify-between items-center mb-2"
                >
                  <span>
                    {r.userId} - {r.reason}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-success btn-xs flex items-center gap-1"
                      onClick={() => {
                        setConfirmMessage("Approve this user deletion request?");
                        setConfirmAction(() => async () => {
                          await handleUserDeletion(r.id, "approve");
                          setPendingUsers((prev) =>
                            prev.filter((req) => req.id !== r.id)
                          );
                          showToast("User deletion approved");
                        });
                        setConfirmOpen(true);
                      }}
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      className="btn btn-error btn-xs flex items-center gap-1"
                      onClick={() => {
                        setConfirmMessage("Reject this user deletion request?");
                        setConfirmAction(() => async () => {
                          await handleUserDeletion(r.id, "reject");
                          setPendingUsers((prev) =>
                            prev.filter((req) => req.id !== r.id)
                          );
                          showToast("User deletion rejected");
                        });
                        setConfirmOpen(true);
                      }}
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No requests</p>
            )}
          </div>

          {/* Post Requests */}
          <div className="bg-white p-4 shadow rounded-lg">
            <h3 className="font-bold mb-2">Post Deletion Requests</h3>
            {pendingPosts.length > 0 ? (
              pendingPosts.map((r) => (
                <div
                  key={r.id}
                  className="p-3 border rounded-lg flex justify-between items-center mb-2"
                >
                  <span>
                    {r.postId} - {r.reason}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-success btn-xs flex items-center gap-1"
                      onClick={() => {
                        setConfirmMessage("Approve this post deletion request?");
                        setConfirmAction(() => async () => {
                          await handlePostDeletion(r.id, "approve");
                          setPendingPosts((prev) =>
                            prev.filter((req) => req.id !== r.id)
                          );
                          showToast("Post deletion approved");
                        });
                        setConfirmOpen(true);
                      }}
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      className="btn btn-error btn-xs flex items-center gap-1"
                      onClick={() => {
                        setConfirmMessage("Reject this post deletion request?");
                        setConfirmAction(() => async () => {
                          await handlePostDeletion(r.id, "reject");
                          setPendingPosts((prev) =>
                            prev.filter((req) => req.id !== r.id)
                          );
                          showToast("Post deletion rejected");
                        });
                        setConfirmOpen(true);
                      }}
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No requests</p>
            )}
          </div>
        </div>
      </div>

      {/* Users with Posts */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Users & Posts</h2>
        <div className="space-y-4">
          {users.map((u) => {
            const userPosts = posts.filter((p) => p.user?.id === u.id);
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
                          <User className="w-5 h-5 text-primary" /> {u.username}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <Mail className="w-4 h-4" /> {u.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {/* Expand button */}
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

                      {/* Direct Delete User */}
                      <button
                        className="btn btn-error btn-xs flex items-center gap-1"
                        onClick={() => {
                          setConfirmMessage("Are you sure you want to delete this user?");
                          setConfirmAction(() => async () => {
                            await deleteUser(u.id);
                            setUsers((prev) =>
                              prev.filter((usr) => usr.id !== u.id)
                            );
                            showToast("User deleted successfully");
                          });
                          setConfirmOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-4 border-t pt-4">
                      <h3 className="font-semibold mb-2">Posts</h3>
                      {userPosts.length > 0 ? (
                        userPosts.map((p) => (
                          <div
                            key={p.id}
                            className="p-3 border rounded-lg flex justify-between items-center"
                          >
                            <p className="truncate max-w-xs">{p.content}</p>
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
                                onClick={() => {
                                  setConfirmMessage("Are you sure you want to delete this post?");
                                  setConfirmAction(() => async () => {
                                    await postDeleteDirectly(p.id);
                                    setPosts((prev) =>
                                      prev.filter((post) => post.id !== p.id)
                                    );
                                    showToast("Post deleted successfully");
                                  });
                                  setConfirmOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No posts</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
              <p className="mb-3">{selectedPost.content}</p>
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

      {/* ✅ Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[1000]">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
            <h3 className="text-lg font-bold mb-4">Confirm Action</h3>
            <p className="mb-6">{confirmMessage}</p>
            <div className="flex justify-end gap-3">
              <button
                className="btn btn-outline"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={async () => {
                  setConfirmOpen(false);
                  await confirmAction();
                }}
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

export default SuperAdminDashboard;
