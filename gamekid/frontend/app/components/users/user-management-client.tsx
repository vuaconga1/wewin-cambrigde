"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Pencil,
  Plus,
  Search,
  Users,
} from "lucide-react";
import axiosClient from "@/lib/auth/axios";
import { Routes } from "@/lib/constants/routes";
import ReusableTable from "@/app/components/table";
import { Pagination, RowsPerPage } from "@/app/components/pagination";
import Button from "@/app/components/button";
import { BackButton } from "@/app/components/backButton";
import { StatusBadge } from "@/app/components/status";
import type { Role } from "@/types/role";

type ApiRole = Role;

type ApiUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  dob?: string | null;
  image?: string | null;
  isActive?: boolean;
  roles: ApiRole[];
  createdAt?: string;
  updatedAt?: string;
};

type UserFormState = {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  dob: string;
  image: string;
  isActive: boolean;
  roleIds: string[];
};

type UserPayload = {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  dob?: string;
  image?: string;
  isActive: boolean;
  roleIds: string[];
};

type NoticeState = {
  type: "success" | "error";
  text: string;
} | null;

const DEFAULT_FORM_STATE: UserFormState = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  dob: "",
  image: "",
  isActive: true,
  roleIds: [],
};

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function getErrorMessage(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return "Không thể thực hiện thao tác.";
  }

  const response = error as { response?: { data?: { message?: string } | string } };
  const message = response.response?.data;

  if (typeof message === "string") return message;
  if (message && typeof message === "object" && "message" in message) {
    return message.message ?? "Không thể thực hiện thao tác.";
  }

  return "Không thể thực hiện thao tác.";
}

export function UserManagementClient({ currentUserId }: { currentUserId: string }) {
  const router = useRouter();

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<RowsPerPage>(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [form, setForm] = useState<UserFormState>(DEFAULT_FORM_STATE);

  const loadUsers = async () => {
    setLoading(true);

    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        axiosClient.get("/user"),
        axiosClient.get("/role"),
      ]);

      const userData = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : usersResponse.data?.data ?? [];
      const roleData = Array.isArray(rolesResponse.data)
        ? rolesResponse.data
        : rolesResponse.data?.data ?? [];

      setUsers(userData);
      setRoles(roleData);
      setNotice(null);
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return users;

    return users.filter((user) => {
      const roleText = user.roles.map((role) => role.name).join(" ").toLowerCase();

      return [user.name, user.email, user.phone ?? "", user.address ?? "", roleText].some(
        (value) => value.toLowerCase().includes(keyword),
      );
    });
  }, [search, users]);

  const total = filteredUsers.length;
  const pageSize = rowsPerPage === "all" ? total : Number(rowsPerPage);
  const totalPages = rowsPerPage === "all" ? 1 : Math.max(1, Math.ceil(total / pageSize));
  const startIndex = rowsPerPage === "all" ? 0 : (page - 1) * pageSize;
  const endIndex = rowsPerPage === "all" ? total : startIndex + pageSize;
  const visibleUsers = useMemo(
    () => filteredUsers.slice(startIndex, endIndex),
    [filteredUsers, startIndex, endIndex],
  );

  useEffect(() => {
    setPage(1);
  }, [search, rowsPerPage]);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(DEFAULT_FORM_STATE);
    setModalOpen(true);
    setNotice(null);
  };

  const openEditModal = (user: ApiUser) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      phone: user.phone ?? "",
      address: user.address ?? "",
      dob: toDateInputValue(user.dob),
      image: user.image ?? "",
      isActive: user.isActive !== false,
      roleIds: user.roles.map((role) => role.id),
    });
    setModalOpen(true);
    setNotice(null);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingUser(null);
    setForm(DEFAULT_FORM_STATE);
  };

  const toggleRole = (roleId: string) => {
    setForm((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id) => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      setNotice({ type: "error", text: "Vui lòng nhập tên và email." });
      return;
    }

    if (form.roleIds.length === 0) {
      setNotice({ type: "error", text: "Vui lòng chọn ít nhất một vai trò." });
      return;
    }

    if (!editingUser && !form.password.trim()) {
      setNotice({ type: "error", text: "Vui lòng nhập mật khẩu cho tài khoản mới." });
      return;
    }

    const payload: UserPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      dob: form.dob || undefined,
      image: form.image.trim(),
      isActive: form.isActive,
      roleIds: form.roleIds,
      ...(form.password.trim() ? { password: form.password.trim() } : {}),
    };

    setSaving(true);

    try {
      if (editingUser) {
        await axiosClient.put(`/user/${editingUser.id}`, payload);
        setNotice({ type: "success", text: "Đã cập nhật người dùng." });
      } else {
        await axiosClient.post("/user", payload);
        setNotice({ type: "success", text: "Đã tạo người dùng mới." });
      }

      setModalOpen(false);
      setEditingUser(null);
      setForm(DEFAULT_FORM_STATE);
      await loadUsers();
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: ApiUser) => {
    if (user.id === currentUserId) {
      setNotice({ type: "error", text: "Bạn không thể xóa chính tài khoản đang đăng nhập." });
      return;
    }

    const confirmed = window.confirm(`Xóa người dùng ${user.name}?`);
    if (!confirmed) return;

    try {
      await axiosClient.delete(`/user/${user.id}`);
      setNotice({ type: "success", text: "Đã xóa người dùng." });
      await loadUsers();
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    }
  };

  const activeCount = users.filter((user) => user.isActive !== false).length;
  const teacherRoleCount = users.filter((user) =>
    user.roles.some((role) => role.name === "TEACHER"),
  ).length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,75,169,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(255,153,51,0.18),_transparent_24%),linear-gradient(180deg,_#f8fbff_0%,_#eef6ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="rounded-[32px] border border-white/70 bg-white/92 p-5 shadow-[0_22px_70px_rgba(14,75,169,0.12)] backdrop-blur">
          <div className="flex flex-col gap-5 border-b border-blue-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <BackButton label="Quay lại bảng điều khiển" onClick={() => router.push(Routes.HOME)} />
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-[#0E4BA9]">
                  <Users className="h-4 w-4" />
                  Quản lý người dùng
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  CRUD người dùng cho giáo viên
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                  Tạo, cập nhật và xóa tài khoản người dùng trực tiếp từ giao diện này. Quyền truy cập được giữ ở nhóm giáo viên, không cần thêm role admin.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Tổng người dùng</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{users.length}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Đang hoạt động</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{activeCount}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Tài khoản giáo viên</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{teacherRoleCount}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 shadow-sm lg:max-w-xl">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tên, email, vai trò hoặc số điện thoại"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </label>

            <Button
              onClick={openCreateModal}
              leftIcon={<Plus />}
              variant="gradient"
              className="h-12 px-5 text-sm shadow-lg"
            >
              Thêm người dùng
            </Button>
          </div>

          {notice && (
            <div
              className={`mt-4 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                notice.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {notice.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>{notice.text}</span>
            </div>
          )}
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/90 p-4 shadow-[0_22px_70px_rgba(14,75,169,0.10)] sm:p-6">
          {loading ? (
            <div className="space-y-4">
              <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-80 animate-pulse rounded-[24px] bg-slate-100" />
            </div>
          ) : (
            <ReusableTable<ApiUser>
              columns={["Mã", "Tên", "Email", "Vai trò", "Trạng thái"]}
              data={visibleUsers}
              getKey={(user) => user.id}
              emptyText="Chưa có người dùng nào."
              renderRow={(user) => (
                <>
                  <td className="px-5 py-4 align-top text-sm font-semibold text-[#0E4BA9]">{user.id.slice(0, 8)}</td>
                  <td className="px-5 py-4 align-top">
                    <div className="font-semibold text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.phone || "Chưa có số điện thoại"}</div>
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-slate-700">{user.email}</td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-wrap justify-center gap-2">
                      {user.roles.map((role) => (
                        <span
                          key={`${user.id}-${role.id}`}
                          className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0E4BA9]"
                        >
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-center justify-center">
                      <StatusBadge status={user.isActive !== false ? "Active" : "Inactive"} />
                    </div>
                  </td>
                </>
              )}
              renderMobileCard={(user) => (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#0E4BA9]">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <StatusBadge status={user.isActive !== false ? "Active" : "Inactive"} />
                  </div>

                  <div className="space-y-2 text-sm text-slate-700">
                    <p><span className="font-medium">Mã:</span> {user.id.slice(0, 8)}</p>
                    <p><span className="font-medium">Ngày sinh:</span> {formatDate(user.dob)}</p>
                    <p><span className="font-medium">Điện thoại:</span> {user.phone || "—"}</p>
                    <p><span className="font-medium">Địa chỉ:</span> {user.address || "—"}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {user.roles.map((role) => (
                        <span
                          key={`${user.id}-mobile-${role.id}`}
                          className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0E4BA9]"
                        >
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              actions={{
                onEdit: openEditModal,
                onDisable: handleDelete,
              }}
            />
          )}

          <Pagination
            text="người dùng"
            currentPage={page}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            total={total}
            selectedRows={rowsPerPage}
            onPrev={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
            onRowsChange={(rows) => {
              setRowsPerPage(rows);
              setPage(1);
            }}
          />
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/70 bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E4BA9]">
                    {editingUser ? "Chỉnh sửa" : "Tạo mới"}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                    {editingUser ? "Cập nhật người dùng" : "Thêm người dùng"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Đóng
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Tên" required>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white"
                  />
                </Field>

                <Field label="Email" required>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white"
                  />
                </Field>

                <Field label={editingUser ? "Mật khẩu mới" : "Mật khẩu"}>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder={editingUser ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white"
                  />
                </Field>

                <Field label="Điện thoại">
                  <input
                    value={form.phone}
                    onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white"
                  />
                </Field>

                <Field label="Ngày sinh">
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(event) => setForm((prev) => ({ ...prev, dob: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white"
                  />
                </Field>

                <Field label="Ảnh đại diện">
                  <input
                    value={form.image}
                    onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
                    placeholder="URL ảnh"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white"
                  />
                </Field>

                <Field label="Địa chỉ" className="md:col-span-2">
                  <textarea
                    value={form.address}
                    onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0E4BA9] focus:bg-white"
                  />
                </Field>
              </div>

              <div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Vai trò</p>
                    <p className="text-xs text-slate-500">Chọn ít nhất một vai trò cho tài khoản này.</p>
                  </div>
                  <span className="text-xs font-medium text-slate-500">{form.roleIds.length} đã chọn</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {roles.map((role) => {
                    const checked = form.roleIds.includes(role.id);

                    return (
                      <label
                        key={role.id}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition ${
                          checked
                            ? "border-[#0E4BA9] bg-blue-50 text-[#0E4BA9]"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span className="font-medium">{role.name}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRole(role.id)}
                          className="h-4 w-4 accent-[#0E4BA9]"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                    className="h-4 w-4 accent-[#0E4BA9]"
                  />
                  Kích hoạt tài khoản
                </label>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={closeModal}
                    variant="outline"
                    className="h-12 px-5 text-sm"
                    disabled={saving}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    leftIcon={<Pencil />}
                    variant="gradient"
                    className="h-12 px-5 text-sm"
                    disabled={saving}
                  >
                    {saving ? "Đang lưu..." : editingUser ? "Cập nhật" : "Tạo mới"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  required = false,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}