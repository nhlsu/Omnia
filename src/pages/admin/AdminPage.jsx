import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, ArrowLeft, ArrowRight, Bell, Check, ChevronRight,
  CircleCheck, ClipboardList, Gift, LayoutDashboard, MoreHorizontal,
  PartyPopper, Plus, Search, Settings, ShieldAlert, Store, Users, UsersRound,
  X,
} from "lucide-react";
import "./AdminPage.css";
import {
  addOccasionType, addStore, deleteGift, loadAdminData,
  setRegistryHidden, updateOccasionType, updateReportStatus,
  updateStore, updateUserStatus,
} from "./adminStore";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: UsersRound },
  { id: "reports", label: "Reports", icon: FlagIcon },
  { id: "settings", label: "Settings", icon: Settings },
];

function FlagIcon(props) { return <ShieldAlert {...props} />; }
function Icon({ icon: IconComponent }) { return <span className="om-icon" aria-hidden="true"><IconComponent size={18} strokeWidth={1.9} /></span>; }
function formatDate(value) { if (!value || Number.isNaN(Date.parse(value))) return "—"; return new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }); }

export default function AdminPage() {
  const [data, setData] = useState(loadAdminData);
  const [page, setPage] = useState("dashboard");
  const [userQuery, setUserQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [reportFilter, setReportFilter] = useState("Open");
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [settingsTab, setSettingsTab] = useState("stores");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");

  const toastTimer = useRef(null);

  useEffect(() => {
    let active = true;
    const refresh = () => queueMicrotask(() => {
      if (active) setData(loadAdminData());
    });
    window.addEventListener("omnia:data-changed", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.removeEventListener("omnia:data-changed", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      window.clearTimeout(toastTimer.current);
    };
  }, []);

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2800);
  };
  const commit = (next, message) => {
    setData(next);
    if (message) notify(message);
  };
  const perform = (callback) => {
    try { callback(); }
    catch (error) { notify(error.message || "Something went wrong."); }
  };

  const openReports = data.reports.filter((report) => report.status === "Open").length;
  const stats = [
    { label: "Users", value: data.users.length.toLocaleString(), icon: Users, tone: "lavender" },
    { label: "Wishlists", value: data.registries.length.toLocaleString(), icon: ClipboardList, tone: "mint" },
    { label: "Gift items", value: data.gifts.length.toLocaleString(), icon: Gift, tone: "peach" },
    { label: "Open reports", value: openReports.toLocaleString(), icon: ShieldAlert, tone: "purple", action: () => { setReportFilter("Open"); setSelectedReportId(null); setPage("reports"); } },
  ];

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    return data.users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(q));
  }, [data.users, userQuery]);
  const selectedUser = data.users.find((user) => user.id === selectedUserId);
  const visibleReports = data.reports
    .filter((report) => reportFilter === "Open" ? report.status === "Open" : report.status === "Closed")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const selectedReport = data.reports.find((report) => report.id === selectedReportId);

  function navTo(id) {
    setPage(id);
    if (id !== "users") setSelectedUserId(null);
    if (id !== "reports") setSelectedReportId(null);
  }

  function suspendUser(userId, reason) {
      commit(updateUserStatus(data, userId, "Suspended", reason), "Account suspended.");
      setModal(null);
  }

  function reactivateUser(userId) {
      commit(updateUserStatus(data, userId, "Active"), "Account reactivated.");
      setModal(null);
  }

  function decideReport(report, decision, action, reason) {
      let next = data;
      if (decision === "resolved" && action === "hide") {
        if (!report.registryId) throw new Error("This report is not linked to a wishlist.");
        next = setRegistryHidden(next, report.registryId, true, reason);
      }
      if (decision === "resolved" && action === "remove") {
        if (!report.giftId) throw new Error("This report is not linked to a gift item.");
        next = deleteGift(next, report.giftId, reason);
      }
      next = updateReportStatus(next, report.id, decision, action || "none", reason);
      commit(next, decision === "resolved" ? "Report resolved." : "Report dismissed.");
      setModal(null);
      setSelectedReportId(null);
  }

  function restoreRegistry(registryId) {
    perform(() => {
      commit(setRegistryHidden(data, registryId, false), "Wishlist restored.");
    });
  }

  function submitStore(formData) {
      let next = data;
      if (modal.mode === "add") next = addStore(data, formData);
      else next = updateStore(data, modal.record.id, formData);
      commit(next, modal.mode === "add" ? "Store added." : "Store updated.");
      setModal(null);
  }

  function submitOccasion(formData) {
      let next = data;
      if (modal.mode === "add") next = addOccasionType(data, formData);
      else next = updateOccasionType(data, modal.record.id, formData);
      commit(next, modal.mode === "add" ? "Occasion type added." : "Occasion type updated.");
      setModal(null);
  }

  function toggleStore(store) {
    perform(() => commit(updateStore(data, store.id, { isActive: !store.isActive }), store.isActive ? "Store deactivated." : "Store activated."));
  }

  function toggleOccasion(occasion) {
    perform(() => commit(updateOccasionType(data, occasion.id, { isActive: !occasion.isActive }), occasion.isActive ? "Occasion type deactivated." : "Occasion type activated."));
  }

  return (
    <div className="om-app">
      <aside className="om-sidebar">
        <Brand />
        <div className="om-side-label">ADMIN MENU</div>
        <nav className="om-side-nav" aria-label="Admin navigation">
          {navItems.map((item) => <button key={item.id} className={`om-nav-item ${page === item.id ? "active" : ""}`} onClick={() => navTo(item.id)}><Icon icon={item.icon} /><span>{item.label}</span>{item.id === "reports" && openReports > 0 && <b className="om-nav-count">{openReports}</b>}</button>)}
        </nav>
        <div className="om-sidebar-foot"><span className="om-avatar small">A</span><span><b>Omnia Admin</b><small>Administrator</small></span><span className="om-more"><MoreHorizontal size={18} /></span></div>
      </aside>

      <main className="om-main">
        <header className="om-topbar">
          <div className="om-mobile-brand"><Brand /></div>
          <div className="om-breadcrumb">Admin <span>/</span> <b>{page === "settings" ? "Settings" : selectedUser ? "User details" : selectedReport ? "Report details" : page[0].toUpperCase() + page.slice(1)}</b></div>
          <div className="om-top-actions"><button className="om-icon-button" aria-label="Notifications" onClick={() => { setReportFilter("Open"); setSelectedReportId(null); setPage("reports"); }}><Bell size={17} strokeWidth={1.8} />{openReports > 0 && <i />}</button><span className="om-avatar">A</span><div className="om-admin-label"><b>Omnia Admin</b><small>Admin account</small></div></div>
        </header>

        <div className="om-content">
          {page === "dashboard" && <Dashboard data={data} stats={stats} onNav={navTo} onSettingsTab={setSettingsTab} />}
          {page === "users" && (selectedUser
            ? <UserDetails user={selectedUser} onBack={() => setSelectedUserId(null)} onSuspend={() => setModal({ type: "suspend", user: selectedUser })} onReactivate={() => setModal({ type: "reactivate", user: selectedUser })} />
            : <UsersPage users={filteredUsers} query={userQuery} onQuery={setUserQuery} onSelect={(id) => setSelectedUserId(id)} />)}
          {page === "reports" && (selectedReport
            ? <ReportDetails report={selectedReport} data={data} onBack={() => setSelectedReportId(null)} onResolve={(action) => setModal({ type: "report-action", report: selectedReport, action })} onDismiss={() => setModal({ type: "dismiss", report: selectedReport })} onRestore={restoreRegistry} />
            : <ReportsPage reports={visibleReports} filter={reportFilter} onFilter={setReportFilter} onSelect={(id) => setSelectedReportId(id)} />)}
          {page === "settings" && <SettingsPage data={data} tab={settingsTab} onTab={setSettingsTab} onAdd={(type) => setModal({ type, mode: "add" })} onEdit={(type, record) => setModal({ type, mode: "edit", record })} onToggleStore={toggleStore} onToggleOccasion={toggleOccasion} />}
        </div>
      </main>

      <nav className="om-mobile-nav" aria-label="Admin navigation">
        {navItems.map((item) => <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => navTo(item.id)}><Icon icon={item.icon} /><small>{item.label}</small>{item.id === "reports" && openReports > 0 && <i />}</button>)}
      </nav>

      {modal && <AdminModal modal={modal} onClose={() => setModal(null)} onSuspend={suspendUser} onReactivate={reactivateUser} onReportDecision={decideReport} onStore={submitStore} onOccasion={submitOccasion} />}
      {toast && <div className="om-toast" role="status"><span><Check size={12} strokeWidth={2.6} /></span>{toast}</div>}
    </div>
  );
}

function Brand() {
  return <div className="om-brand"><span className="om-brand-mark">o</span><span>omnia</span><em>Admin</em></div>;
}

function PageHeading({ eyebrow, title, description, actions }) {
  return <div className="om-page-heading"><div>{eyebrow && <div className="om-eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="om-heading-actions">{actions}</div>}</div>;
}

function Dashboard({ data, stats, onNav, onSettingsTab }) {
  const recent = [...data.reports].filter((report) => report.status === "Open").sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  return <>
    <PageHeading eyebrow="PLATFORM OVERVIEW" title="Dashboard" description="A quick overview of what’s happening on Omnia." actions={<span className="om-updated"><span /> Updated just now</span>} />
    <section className="om-stat-grid" aria-label="Platform statistics">
      {stats.map((stat) => { const StatIcon = stat.icon; return <button key={stat.label} className={`om-stat-card ${stat.tone}`} onClick={stat.action || undefined}><span className="om-stat-top"><span>{stat.label}</span><span className="om-stat-icon"><StatIcon size={17} strokeWidth={1.8} /></span></span><strong>{stat.value}</strong><span className="om-stat-foot">Total on platform <ArrowRight size={13} /></span></button>; })}
    </section>
    <section className="om-panel om-recent-panel">
      <div className="om-panel-heading"><div><h2>Reports to review</h2><p>Recent reports that need your attention.</p></div><button className="om-text-button" onClick={() => onNav("reports")}>View all <ArrowRight size={13} /></button></div>
      {recent.length ? <div className="om-report-preview-list">{recent.map((report) => <button className="om-report-preview" key={report.id} onClick={() => onNav("reports")}><span className="om-report-symbol"><FlagIcon size={16} /></span><span className="om-report-preview-copy"><b>{report.reportedContent}</b><small>{report.type} · {report.reason}</small></span><span className="om-status open">Open</span><ChevronRight className="om-chevron" size={18} /></button>)}</div> : <EmptyState icon={<CircleCheck size={20} />} title="All clear" text="There are no open reports to review." />}
    </section>
    <section className="om-panel om-manage-panel"><div className="om-panel-heading"><div><h2>Manage platform</h2><p>Keep supported options up to date.</p></div></div><div className="om-manage-grid">
      <button className="om-manage-card" onClick={() => { onSettingsTab("stores"); onNav("settings"); }}><span className="om-manage-icon"><Store size={17} /></span><span><b>Supported stores</b><small>{data.stores.filter((store) => store.isActive).length} active stores</small></span><ChevronRight className="om-chevron" size={18} /></button>
      <button className="om-manage-card" onClick={() => { onSettingsTab("occasions"); onNav("settings"); }}><span className="om-manage-icon"><PartyPopper size={17} /></span><span><b>Occasion types</b><small>{data.occasionTypes.filter((item) => item.isActive).length} active types</small></span><ChevronRight className="om-chevron" size={18} /></button>
    </div></section>
    <footer className="om-footer">Omnia Admin <span>·</span> Keeping celebrations thoughtful</footer>
  </>;
}

function UsersPage({ users, query, onQuery, onSelect }) {
  return <>
    <PageHeading eyebrow="ACCOUNT MANAGEMENT" title="Users" description="Search and manage registry owner accounts." />
    <section className="om-panel">
      <div className="om-list-toolbar"><label className="om-search"><Search size={17} /><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search by name or email" aria-label="Search users by name or email" /></label><span className="om-result-count">{users.length} {users.length === 1 ? "result" : "results"}</span></div>
      {users.length ? <div className="om-user-list">{users.map((user) => <button className="om-user-row" key={user.id} onClick={() => onSelect(user.id)}><span className="om-avatar user-avatar">{user.name.slice(0, 1).toUpperCase()}</span><span className="om-user-main"><b>{user.name}</b><small>{user.email}</small></span><span className="om-user-meta"><b>{user.registries}</b><small>Wishlists</small></span><span className={`om-status ${user.status === "Active" ? "active" : "suspended"}`}>{user.status}</span><ChevronRight className="om-chevron" size={18} /></button>)}</div> : <EmptyState icon={<Search size={19} />} title="No users match your search." text="Try a different name or email address." />}
    </section>
    <p className="om-page-note">Account details include join date, registry count, gift count and account status.</p>
  </>;
}

function UserDetails({ user, onBack, onSuspend, onReactivate }) {
  return <>
    <button className="om-back-button" onClick={onBack}><ArrowLeft size={14} /> <span>Users</span></button>
    <PageHeading eyebrow="ACCOUNT DETAILS" title="User details" description="Review the account and its activity." />
    <section className="om-user-detail-card om-panel">
      <div className="om-user-profile"><span className="om-avatar profile-avatar">{user.name.slice(0, 1).toUpperCase()}</span><div><h2>{user.name}</h2><p>{user.email}</p></div><span className={`om-status ${user.status === "Active" ? "active" : "suspended"}`}>{user.status}</span></div>
      <div className="om-details-grid"><Detail label="Joined" value={formatDate(user.joinedAt)} /><Detail label="Wishlists" value={user.registries} /><Detail label="Gift items" value={user.gifts} /><Detail label="Role" value={user.role} /></div>
      {user.status === "Suspended" && user.suspensionReason && <div className="om-info-banner"><span>ⓘ</span><div><b>Account suspended</b><small>Reason: {user.suspensionReason}</small></div></div>}
      {user.role === "Admin" ? <div className="om-info-banner"><span>ⓘ</span><div><b>Administrator account</b><small>Admin accounts cannot be suspended from this screen.</small></div></div> : user.status === "Active" ? <button className="om-button danger full" onClick={onSuspend}>Suspend account</button> : <button className="om-button secondary full" onClick={onReactivate}>Reactivate account</button>}
      <p className="om-helper">Suspended accounts cannot sign in. Guest access checks block their wishlists.</p>
    </section>
  </>;
}

function Detail({ label, value }) { return <div className="om-detail"><span>{label}</span><b>{value}</b></div>; }

function ReportsPage({ reports, filter, onFilter, onSelect }) {
  return <>
    <PageHeading eyebrow="SAFETY & MODERATION" title="Reports" description="Review content reported by guests." />
    <section className="om-panel">
      <div className="om-tabs"><button className={filter === "Open" ? "active" : ""} onClick={() => onFilter("Open")}>Open <span>{reports.length && filter === "Open" ? reports.length : ""}</span></button><button className={filter === "Closed" ? "active" : ""} onClick={() => onFilter("Closed")}>Closed</button></div>
      {reports.length ? <div className="om-report-list">{reports.map((report) => <button className="om-report-row" key={report.id} onClick={() => onSelect(report.id)}><span className="om-report-symbol"><FlagIcon size={16} /></span><span className="om-report-preview-copy"><b>{report.reportedContent}</b><small>{report.type} · {report.reason}</small><small>Reported {formatDate(report.createdAt)}</small></span><span className={`om-status ${report.status === "Open" ? "open" : "closed"}`}>{report.status}</span><ChevronRight className="om-chevron" size={18} /></button>)}</div> : <EmptyState icon={filter === "Open" ? <CircleCheck size={19} /> : <ClipboardList size={19} />} title={filter === "Open" ? "No open reports" : "No closed reports yet"} text={filter === "Open" ? "New reports will appear here." : "Reviewed reports will appear here."} />}
    </section>
  </>;
}

function ReportDetails({ report, data, onBack, onResolve, onDismiss, onRestore }) {
  const registry = data.registries.find((item) => item.id === report.registryId);
  const gift = data.gifts.find((item) => item.id === report.giftId);
  return <>
    <button className="om-back-button" onClick={onBack}><ArrowLeft size={14} /> <span>Reports</span></button>
    <PageHeading eyebrow="REPORT REVIEW" title="Report details" description="Review the reported content and choose an action." />
    <div className="om-report-detail-layout">
      <section className="om-panel om-report-meta"><div className="om-panel-heading"><div><h2>Report information</h2><p>Submitted by a guest.</p></div><span className={`om-status ${report.status === "Open" ? "open" : "closed"}`}>{report.status}</span></div><Detail label="Type" value={report.type} /><Detail label="Reason" value={report.reason} /><Detail label="Reported on" value={formatDate(report.createdAt)} /><Detail label="Reported by" value={report.reporter || "Guest"} />{report.reviewedAt && <Detail label="Reviewed on" value={formatDate(report.reviewedAt)} />}</section>
      <section className="om-panel om-reported-content"><div className="om-panel-heading"><div><h2>Reported content</h2><p>Context for the moderation decision.</p></div></div><div className="om-content-card"><span className="om-content-symbol">{report.type === "Wishlist" ? <ClipboardList size={18} /> : <Gift size={18} />}</span><div><b>{report.reportedContent}</b><small>{registry ? `Owned by ${registry.ownerName} · ${registry.visibility}` : "Reported gift item"}</small>{gift && <small>SAR {gift.price}</small>}</div></div>{report.status === "Open" ? <div className="om-decision-area"><h3>Decision</h3><button className="om-button danger full" onClick={() => onResolve(report.type === "Wishlist" ? "hide" : "remove")}>{report.type === "Wishlist" ? "Resolve: hide wishlist" : "Resolve: remove gift item"}</button><button className="om-button quiet full" onClick={onDismiss}>Dismiss report</button></div> : <div className="om-decision-result"><span><Check size={15} /></span><div><b>{report.decision === "dismissed" ? "Report dismissed" : "Report resolved"}</b><small>{report.action === "hide" ? "Wishlist hidden" : report.action === "remove" ? "Gift item removed" : "No content action taken"}{report.reviewedBy ? ` · by ${report.reviewedBy}` : ""}</small></div></div>}
      </section>
      {registry?.isHidden && <section className="om-info-banner restore-banner"><span>ⓘ</span><div><b>This wishlist is hidden.</b><small>Guests cannot open it. Restore it after the issue has been resolved.</small></div><button className="om-button secondary" onClick={() => onRestore(registry.id)}>Restore wishlist</button></section>}
    </div>
  </>;
}

function SettingsPage({ data, tab, onTab, onAdd, onEdit, onToggleStore, onToggleOccasion }) {
  const countsByOccasion = data.registries.reduce((counts, registry) => { counts[registry.occasionTypeId] = (counts[registry.occasionTypeId] || 0) + 1; return counts; }, {});
  return <>
    <PageHeading eyebrow="PLATFORM CONFIGURATION" title="Settings" description="Manage the supported stores and occasion options." />
    <section className="om-panel om-settings-panel">
      <div className="om-tabs settings-tabs"><button className={tab === "stores" ? "active" : ""} onClick={() => onTab("stores")}>Supported stores</button><button className={tab === "occasions" ? "active" : ""} onClick={() => onTab("occasions")}>Occasion types</button></div>
      {tab === "stores" ? <>
        <div className="om-settings-intro"><div><h2>Supported stores</h2><p>Only active stores can be used to auto-fill gift details.</p></div><button className="om-button primary" onClick={() => onAdd("store")}><Plus size={14} /> <span>Add a store</span></button></div>
        <div className="om-setting-list">{data.stores.map((store) => <div className="om-setting-row" key={store.id}><span className="om-square-icon"><Store size={16} /></span><span className="om-setting-info"><b>{store.name}</b><small>{store.domain}</small></span><span className={`om-status ${store.isActive ? "active" : "inactive"}`}>{store.isActive ? "Active" : "Inactive"}</span><button className="om-small-link" onClick={() => onEdit("store", store)}>Edit</button><button className="om-kebab" aria-label={`Toggle ${store.name} status`} onClick={() => onToggleStore(store)}>{store.isActive ? "Deactivate" : "Activate"}</button></div>)}</div>
      </> : <>
        <div className="om-settings-intro"><div><h2>Occasion types</h2><p>Types available when owners create a wishlist.</p></div><button className="om-button primary" onClick={() => onAdd("occasion")}><Plus size={14} /> <span>Add a type</span></button></div>
        <div className="om-setting-list">{data.occasionTypes.map((occasion) => <div className="om-setting-row" key={occasion.id}><span className="om-square-icon"><PartyPopper size={16} /></span><span className="om-setting-info"><b>{occasion.name}</b><small>{countsByOccasion[occasion.id] || 0} wishlists</small></span><span className={`om-status ${occasion.isActive ? "active" : "inactive"}`}>{occasion.isActive ? "Active" : "Inactive"}</span><button className="om-small-link" onClick={() => onEdit("occasion", occasion)}>Rename</button><button className="om-kebab" aria-label={`Toggle ${occasion.name} status`} onClick={() => onToggleOccasion(occasion)}>{occasion.isActive ? "Deactivate" : "Activate"}</button></div>)}</div>
      </>}
      <div className="om-info-banner settings-note"><span>ⓘ</span><div><b>Changes apply immediately</b><small>Inactive stores and occasion types are hidden from owner forms. Existing wishlists keep their occasion type.</small></div></div>
    </section>
  </>;
}

function EmptyState({ icon, title, text }) { return <div className="om-empty"><span>{icon}</span><b>{title}</b><small>{text}</small></div>; }

function AdminModal({ modal, onClose, onSuspend, onReactivate, onReportDecision, onStore, onOccasion }) {
  const [reason, setReason] = useState("");
  const [name, setName] = useState(modal.record?.name || "");
  const [domain, setDomain] = useState(modal.record?.domain || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const user = modal.user;
  const report = modal.report;

  function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (modal.type === "suspend") onSuspend(user.id, reason);
      else if (modal.type === "reactivate") onReactivate(user.id);
      else if (modal.type === "report-action") onReportDecision(report, "resolved", modal.action, reason);
      else if (modal.type === "dismiss") onReportDecision(report, "dismissed", "", reason);
      else if (modal.type === "store") onStore({ name, domain });
      else if (modal.type === "occasion") onOccasion({ name });
    } catch (submissionError) { setError(submissionError.message); }
    setBusy(false);
  }

  const isDataForm = modal.type === "store" || modal.type === "occasion";
  const title = modal.type === "suspend" ? "Suspend account?" : modal.type === "reactivate" ? "Reactivate account?" : modal.type === "report-action" ? (modal.action === "hide" ? "Hide wishlist" : "Remove gift item") : modal.type === "dismiss" ? "Dismiss report?" : modal.type === "store" ? (modal.mode === "add" ? "Add a store" : "Edit store") : (modal.mode === "add" ? "Add an occasion type" : "Rename occasion type");

  return <div className="om-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="om-modal" role="dialog" aria-modal="true" aria-labelledby="om-modal-title"><button className="om-modal-close" aria-label="Close" onClick={onClose}><X size={17} /></button><div className="om-modal-icon">{modal.type === "suspend" || modal.type === "report-action" ? <AlertTriangle size={19} /> : modal.type === "reactivate" ? <CircleCheck size={19} /> : <Plus size={19} />}</div><h2 id="om-modal-title">{title}</h2><p className="om-modal-lead">{modal.type === "suspend" ? `This will suspend ${user.name}’s account. Their wishlists will be unavailable to guests.` : modal.type === "reactivate" ? `${user.name} will be able to sign in and share wishlists again.` : modal.type === "report-action" ? (modal.action === "hide" ? `“${report.reportedContent}” will be hidden from guests.` : `“${report.reportedContent}” and its reservations and pledges will be removed.`) : modal.type === "dismiss" ? "The report will be closed without taking action on the content." : modal.type === "store" ? "Enter the store name and its domain." : "Choose a unique name between 2 and 30 characters."}</p>
      <form onSubmit={submit}>
        {modal.type === "suspend" && <label className="om-field">Reason <span className="required">*</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={200} required placeholder="Explain why this account is being suspended" /><small>{reason.length}/200</small></label>}
        {modal.type === "report-action" && <label className="om-field">{modal.action === "hide" ? "Reason for hiding" : "Reason for removal"} <span className="required">*</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={200} required placeholder="Add a short moderation reason" /><small>{reason.length}/200</small></label>}
        {modal.type === "dismiss" && <label className="om-field">Decision note <span className="optional">Optional</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={200} placeholder="Add a note about this decision" /><small>{reason.length}/200</small></label>}
        {isDataForm && <><label className="om-field">{modal.type === "store" ? "Store name" : "Occasion name"}<input value={name} onChange={(event) => setName(event.target.value)} minLength={modal.type === "occasion" ? 2 : undefined} maxLength={modal.type === "occasion" ? 30 : 80} required placeholder={modal.type === "store" ? "e.g. Amazon.sa" : "e.g. Birthday"} /></label>{modal.type === "store" && <label className="om-field">Domain<input value={domain} onChange={(event) => setDomain(event.target.value)} required placeholder="example.com" /></label>}</>}
        {error && <div className="om-form-error">{error}</div>}
        <div className="om-modal-actions">{modal.type === "reactivate" ? <button type="button" className="om-button secondary" onClick={onClose}>Cancel</button> : <button type="button" className="om-button secondary" onClick={onClose}>Cancel</button>}<button type="submit" disabled={busy} className={`om-button ${modal.type === "suspend" || modal.type === "report-action" ? "danger" : "primary"}`}>{busy ? "Saving…" : modal.type === "suspend" ? "Suspend account" : modal.type === "reactivate" ? "Reactivate account" : modal.type === "report-action" ? (modal.action === "hide" ? "Hide wishlist" : "Remove gift item") : modal.type === "dismiss" ? "Dismiss report" : modal.mode === "edit" ? "Save changes" : "Add"}</button></div>
      </form>
    </section></div>;
}

