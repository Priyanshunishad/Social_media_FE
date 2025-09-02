import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function AdminDashboard() {
  const { fetchAdminUsers, fetchAdmins, deleteUser, createAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [newAdmin, setNewAdmin] = useState({ username: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const usersRes = await fetchAdminUsers();
      const adminsRes = await fetchAdmins();
      setUsers(usersRes.users || []);
      setAdmins(adminsRes.admins || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const res = await deleteUser(id);
    if (res.success) {
      setUsers(users.filter((u) => u._id !== id));
      showToast("User deleted successfully", "success");
    } else {
      showToast("Failed to delete user", "error");
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreating(true);
    const res = await createAdmin(newAdmin);
    if (res.success) {
      setAdmins([...admins, res.admin]);
      setNewAdmin({ username: "", email: "", password: "" });
      document.getElementById("create_admin_modal").close();
      showToast("New admin created!", "success");
    } else {
      showToast("Failed to create admin", "error");
    }
    setCreating(false);
  };

  const showToast = (message, type = "info") => {
    const bg =
      type === "success" ? "alert-success" : type === "error" ? "alert-error" : "alert-info";
    const toast = document.createElement("div");
    toast.className = `alert ${bg} shadow-lg fixed bottom-4 right-4 w-72 animate-fade-in`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );

  return (
    <div className="p-6 space-y-10">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">⚡ Admin Dashboard</h1>
        <input
          type="text"
          placeholder="Search users..."
          className="input input-bordered w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Quick Stats (like screenshot cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat bg-base-100 shadow-md rounded-xl">
          <div className="stat-title">Total Users</div>
          <div className="stat-value">{users.length}</div>
          <div className="stat-desc">All registered users</div>
        </div>
        <div className="stat bg-base-100 shadow-md rounded-xl">
          <div className="stat-title">Admins</div>
          <div className="stat-value text-primary">{admins.length}</div>
          <div className="stat-desc">Active admins</div>
        </div>
        <div className="stat bg-base-100 shadow-md rounded-xl">
          <div className="stat-title">Super Admins</div>
          <div className="stat-value text-secondary">
            {admins.filter((a) => a.role === "SUPER-ADMIN").length}
          </div>
          <div className="stat-desc">Highest authority</div>
        </div>
        <div className="stat bg-base-100 shadow-md rounded-xl">
          <div className="stat-title">Regular Users</div>
          <div className="stat-value text-accent">
            {users.filter((u) => u.role === "USER").length}
          </div>
          <div className="stat-desc">Non-admin members</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">👥 Users</h2>
          <div className="overflow-x-auto mt-4">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u, i) => (
                    <tr key={u._id} className="hover">
                      <td>{i + 1}</td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            u.role === "ADMIN"
                              ? "badge-primary"
                              : u.role === "SUPER-ADMIN"
                              ? "badge-secondary"
                              : "badge-ghost"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="btn btn-error btn-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">🔑 Admins</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => document.getElementById("create_admin_modal").showModal()}
            >
              + Create Admin
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {admins.length > 0 ? (
                  admins.map((a, i) => (
                    <tr key={a._id} className="hover">
                      <td>{i + 1}</td>
                      <td>{a.username}</td>
                      <td>{a.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            a.role === "SUPER-ADMIN" ? "badge-secondary" : "badge-primary"
                          }`}
                        >
                          {a.role}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No admins found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Admin Modal */}
      <dialog id="create_admin_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Create New Admin</h3>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="input input-bordered w-full"
              value={newAdmin.username}
              onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered w-full"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="input input-bordered w-full"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              required
            />
            <div className="modal-action">
              <button type="submit" className={`btn btn-primary ${creating ? "loading" : ""}`}>
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => document.getElementById("create_admin_modal").close()}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}






// import { useEffect, useState } from "react";
// import { useAuth } from "../contexts/AuthContext";


// export default function AdminDashboard() {
//   const {
//     fetchAdminUsers,
//     fetchAdmins,
//     deleteUser,
//     createAdmin,
//   } = useAuth();

//   const [users, setUsers] = useState([]);
//   const [admins, setAdmins] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // For creating new admin
//   const [newAdmin, setNewAdmin] = useState({ username: "", email: "", password: "" });
//   const [creating, setCreating] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       const usersRes = await fetchAdminUsers();
//       const adminsRes = await fetchAdmins();
//       setUsers(usersRes.users || []);
//       setAdmins(adminsRes.admins || []);
//       setLoading(false);
//     };
//     fetchData();
//   }, []);

//   const handleDeleteUser = async (id) => {
//     if (!confirm("Are you sure you want to delete this user?")) return;
//     const res = await deleteUser(id);
//     if (res.success) {
//       setUsers(users.filter((u) => u._id !== id));
//     }
//   };

//   const handleCreateAdmin = async (e) => {
//     e.preventDefault();
//     setCreating(true);
//     const res = await createAdmin(newAdmin);
//     if (res.success) {
//       setAdmins([...admins, res.admin]);
//       setNewAdmin({ username: "", email: "", password: "" });
//       document.getElementById("create_admin_modal").close();
//     }
//     setCreating(false);
//   };

//   if (loading) return <div className="flex justify-center p-10">Loading...</div>;

//   return (
//     <div className="p-6 space-y-10">
//       <h1 className="text-3xl font-bold">Admin Dashboard</h1>

//       {/* Users Table */}
//       <div className="overflow-x-auto">
//         <h2 className="text-xl font-semibold mb-2">All Users</h2>
//         <table className="table table-zebra w-full">
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Username</th>
//               <th>Email</th>
//               <th>Role</th>
//               <th></th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.length > 0 ? (
//               users.map((u, i) => (
//                 <tr key={u._id}>
//                   <td>{i + 1}</td>
//                   <td>{u.username}</td>
//                   <td>{u.email}</td>
//                   <td>{u.role}</td>
//                   <td>
//                     <button
//                       onClick={() => handleDeleteUser(u._id)}
//                       className="btn btn-error btn-sm"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="5" className="text-center">
//                   No users found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Admins Table */}
//       <div className="overflow-x-auto">
//         <div className="flex justify-between items-center mb-2">
//           <h2 className="text-xl font-semibold">Admins</h2>
//           <button
//             className="btn btn-primary btn-sm"
//             onClick={() => document.getElementById("create_admin_modal").showModal()}
//           >
//             + Create Admin
//           </button>
//         </div>
//         <table className="table table-zebra w-full">
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Username</th>
//               <th>Email</th>
//               <th>Role</th>
//             </tr>
//           </thead>
//           <tbody>
//             {admins.length > 0 ? (
//               admins.map((a, i) => (
//                 <tr key={a._id}>
//                   <td>{i + 1}</td>
//                   <td>{a.username}</td>
//                   <td>{a.email}</td>
//                   <td>{a.role}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="4" className="text-center">
//                   No admins found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Create Admin Modal */}
//       <dialog id="create_admin_modal" className="modal">
//         <div className="modal-box">
//           <h3 className="font-bold text-lg mb-4">Create New Admin</h3>
//           <form onSubmit={handleCreateAdmin} className="space-y-4">
//             <input
//               type="text"
//               placeholder="Username"
//               className="input input-bordered w-full"
//               value={newAdmin.username}
//               onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
//               required
//             />
//             <input
//               type="email"
//               placeholder="Email"
//               className="input input-bordered w-full"
//               value={newAdmin.email}
//               onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
//               required
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               className="input input-bordered w-full"
//               value={newAdmin.password}
//               onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
//               required
//             />
//             <div className="modal-action">
//               <button type="submit" className={`btn btn-primary ${creating ? "loading" : ""}`}>
//                 Create
//               </button>
//               <button
//                 type="button"
//                 className="btn"
//                 onClick={() => document.getElementById("create_admin_modal").close()}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </dialog>
//     </div>
//   );
// }
