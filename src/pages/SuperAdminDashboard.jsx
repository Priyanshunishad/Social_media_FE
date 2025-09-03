// src/pages/SuperAdminDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

/**
 * SuperAdminDashboard (UI-polished)
 * - Uses DaisyUI/Tailwind for a professional, production-ready look
 * - No functionality changes to your existing data flow or handlers
 * - Adds subtle UX niceties: loading skeletons, empty states, better hierarchy, responsive tables
 */

const SuperAdminDashboard = () => {
  const {
    fetchAdminUsers,
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
  const [tab, setTab] = useState("users");

  // Modal states
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });

  // Local UI state (purely presentational)
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const u = await fetchAdminUsers();
        setUsers(u?.users || []);

        const a = await fetchAdmins();
        setAdmins(a?.admins || []);

        const p = await getAllPostsForAdmin();
        setPosts(p?.posts || []);

        const pud = await getPendingUserDeletions();
        setPendingUserDeletions(pud?.requests || []);

        const ppd = await getPendingPostDeletions();
        setPendingPostDeletions(ppd?.requests || []);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ====== CREATE ADMIN ======
  const startCreate = () => {
    setForm({ username: "", email: "", firstName: "", lastName: "", password: "" });
    setCreatingAdmin(true);
  };

  const saveCreate = async () => {
    try {
      await createAdmin(form);
      const a = await fetchAdmins();
      setAdmins(a?.admins || []);
      setCreatingAdmin(false);
      toast.success("Admin created successfully!");
    } catch (error) {
      toast.error("Failed to create admin");
    }
  };

  // ====== EDIT ADMIN ======
  const startEdit = (admin) => {
    setEditingAdmin(admin.id);
    setForm({
      username: admin.username,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      password: "", // Not editable
    });
  };

  const saveEdit = async () => {
    try {
      await editAdmin(editingAdmin, form);
      const a = await fetchAdmins();
      setAdmins(a?.admins || []);
      setEditingAdmin(null);
      toast.success("Admin updated successfully!");
    } catch (error) {
      toast.error("Failed to update admin");
    }
  };

  // ====== USER ACTIONS ======
  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleApproveUserDeletion = async (id) => {
    try {
      await handleUserDeletion(id, "APPROVE");
      setPendingUserDeletions((prev) => prev.filter((r) => r.id !== id));
      toast.success("User deletion approved");
    } catch (error) {
      toast.error("Failed to approve request");
    }
  };

  const handleRejectUserDeletion = async (id) => {
    try {
      await handleUserDeletion(id, "REJECT");
      setPendingUserDeletions((prev) => prev.filter((r) => r.id !== id));
      toast.success("User deletion rejected");
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  const handleApprovePostDeletion = async (id) => {
    try {
      await handlePostDeletion(id, "APPROVE");
      setPendingPostDeletions((prev) => prev.filter((r) => r.id !== id));
      toast.success("Post deletion approved");
    } catch (error) {
      toast.error("Failed to approve post deletion");
    }
  };

  const handleRejectPostDeletion = async (id) => {
    try {
      await handlePostDeletion(id, "REJECT");
      setPendingPostDeletions((prev) => prev.filter((r) => r.id !== id));
      toast.success("Post deletion rejected");
    } catch (error) {
      toast.error("Failed to reject post deletion");
    }
  };

  // Derived stats (UI only)
  const stats = useMemo(
    () => [
      { label: "Total Users", value: users?.length || 0 },
      { label: "Admins", value: admins?.length || 0 },
      { label: "Posts", value: posts?.length || 0 },
      { label: "Pending Requests", value: (pendingUserDeletions?.length || 0) + (pendingPostDeletions?.length || 0) },
    ],
    [users, admins, posts, pendingUserDeletions, pendingPostDeletions]
  );

  // Small helpers
  const TabButton = ({ id, children }) => (
    <button
      onClick={() => setTab(id)}
      className={`tab tab-lg ${tab === id ? "tab-active" : ""}`}
    >
      {children}
    </button>
  );

  const EmptyState = ({ title, subtitle, action }) => (
    <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
      <div className="text-4xl">🗂️</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="text-base-content/70">{subtitle}</p>}
      {action}
    </div>
  );

  const LoadingRows = ({ rows = 4, cols = 4 }) => (
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c} className="py-3">
              <div className="skeleton h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-base-content/70">Manage users, admins, posts and review deletion requests.</p>
        </div>
        {/* Quick stats */}
        <div className="stats shadow bg-base-100">
          {stats.map((s, i) => (
            <div className="stat" key={i}>
              <div className="stat-title">{s.label}</div>
              <div className="stat-value text-primary">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed w-full mb-6">
        <TabButton id="users">Users</TabButton>
        <TabButton id="admins">Admins</TabButton>
        <TabButton id="pendingUserDeletions">User Deletions</TabButton>
        <TabButton id="pendingPostDeletions">Post Deletions</TabButton>
      </div>

      {/* Users */}
      {tab === "users" && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body gap-4">
            <div className="flex items-center justify-between">
              <h2 className="card-title">All Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th className="w-40 text-right">Actions</th>
                  </tr>
                </thead>
                {loading ? (
                  <LoadingRows rows={5} cols={3} />
                ) : users?.length ? (
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="hover">
                        <td className="font-medium">{u.username}</td>
                        <td className="text-base-content/80">{u.email}</td>
                        <td>
                          <div className="flex justify-end">
                            <button
                              className="btn btn-error btn-sm"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan={3}>
                        <EmptyState
                          title="No users found"
                          subtitle="Once users register, they will appear here."
                        />
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Admins */}
      {tab === "admins" && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="card-title">Admins</h2>
              <button className="btn btn-primary btn-sm" onClick={startCreate}>
                + Create Admin
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th className="w-40 text-right">Actions</th>
                  </tr>
                </thead>
                {loading ? (
                  <LoadingRows rows={4} cols={5} />
                ) : admins?.length ? (
                  <tbody>
                    {admins.map((a) => (
                      <tr key={a.id} className="hover">
                        <td className="font-medium">{a.username}</td>
                        <td className="text-base-content/80">{a.email}</td>
                        <td>{a.firstName || "—"}</td>
                        <td>{a.lastName || "—"}</td>
                        <td>
                          <div className="flex justify-end">
                            <button className="btn btn-outline btn-sm" onClick={() => startEdit(a)}>
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan={5}>
                        <EmptyState
                          title="No admins yet"
                          subtitle="Create your first admin to get started."
                          action={
                            <button className="btn btn-primary btn-sm" onClick={startCreate}>
                              Create Admin
                            </button>
                          }
                        />
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Pending User Deletions */}
      {tab === "pendingUserDeletions" && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body gap-4">
            <h2 className="card-title">Pending User Deletion Requests</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>User</th>
                    <th>Reason</th>
                    <th className="w-60 text-right">Actions</th>
                  </tr>
                </thead>
                {loading ? (
                  <LoadingRows rows={4} cols={4} />
                ) : pendingUserDeletions?.length ? (
                  <tbody>
                    {pendingUserDeletions.map((r) => (
                      <tr key={r.id} className="hover">
                        <td className="font-medium">{r.id}</td>
                        <td>
                          <span className="badge badge-ghost">{r.userId}</span>
                        </td>
                        <td className="max-w-xl">
                          <div className="truncate" title={r.reason}>{r.reason}</div>
                        </td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleApproveUserDeletion(r.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-error btn-sm"
                              onClick={() => handleRejectUserDeletion(r.id)}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan={4}>
                        <EmptyState title="No pending user deletion requests" />
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Pending Post Deletions */}
      {tab === "pendingPostDeletions" && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body gap-4">
            <h2 className="card-title">Pending Post Deletion Requests</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Post</th>
                    <th>Reason</th>
                    <th className="w-60 text-right">Actions</th>
                  </tr>
                </thead>
                {loading ? (
                  <LoadingRows rows={4} cols={4} />
                ) : pendingPostDeletions?.length ? (
                  <tbody>
                    {pendingPostDeletions.map((r) => (
                      <tr key={r.id} className="hover">
                        <td className="font-medium">{r.id}</td>
                        <td>
                          <span className="badge badge-ghost">{r.postId}</span>
                        </td>
                        <td className="max-w-xl">
                          <div className="truncate" title={r.reason}>{r.reason}</div>
                        </td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleApprovePostDeletion(r.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-error btn-sm"
                              onClick={() => handleRejectPostDeletion(r.id)}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan={4}>
                        <EmptyState title="No pending post deletion requests" />
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {creatingAdmin && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md">
            <h3 className="font-bold text-lg">Create Admin</h3>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Username"
                className="input input-bordered w-full"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                className="input input-bordered w-full"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First Name"
                  className="input input-bordered w-full"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="input input-bordered w-full"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
              <input
                type="password"
                placeholder="Password"
                className="input input-bordered w-full"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setCreatingAdmin(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveCreate}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md">
            <h3 className="font-bold text-lg">Edit Admin</h3>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Username"
                className="input input-bordered w-full"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                className="input input-bordered w-full"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First Name"
                  className="input input-bordered w-full"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="input input-bordered w-full"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setEditingAdmin(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
