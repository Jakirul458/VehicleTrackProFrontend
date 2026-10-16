import { useEffect, useState } from "react";
import { authApi } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function AgentProfile() {
  const { user, updateUser } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    void authApi
      .me()
      .then(updateUser)
      .catch(() => undefined);
  }, [updateUser]);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    const form = new FormData(event.currentTarget);
    try {
      const updated = await authApi.updateProfile({
        fullName: String(form.get("fullName") ?? "").trim(),
        businessName: String(form.get("businessName") ?? "").trim(),
        email: String(form.get("email") ?? "").trim(),
        mobile: String(form.get("mobile") ?? "").trim(),
        address: String(form.get("address") ?? "").trim(),
        city: String(form.get("city") ?? "").trim(),
        state: String(form.get("state") ?? "").trim(),
        pinCode: String(form.get("pinCode") ?? "").trim(),
      });
      updateUser(updated);
      toast.success("Profile updated successfully.");
    } catch {
      return;
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    if (newPassword.length < 12) {
      toast.error("New password must be at least 12 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    setChangingPassword(true);
    const passwordForm = event.currentTarget;
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      passwordForm.reset();
      toast.success("Password changed successfully.");
    } catch {
      return;
    } finally {
      setChangingPassword(false);
    }
  }

  const fields = [
    ["fullName", "Full name", user?.fullName],
    ["businessName", "Business name", user?.businessName],
    ["email", "Email", user?.email],
    ["mobile", "Mobile", user?.mobile],
    ["address", "Address", user?.address],
    ["city", "City", user?.city],
    ["state", "State", user?.state],
    ["pinCode", "PIN code", user?.pinCode],
  ] as const;

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Profile</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          key={user?.updatedAt ?? user?.fullName}
          onSubmit={(event) => void saveProfile(event)}
          className="space-y-5 rounded-lg border bg-card p-6"
        >
          <h2 className="text-xl font-semibold">Profile details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(([name, label, value]) => (
              <label key={name} className="space-y-1.5 text-sm font-medium">
                {label}
                <input
                  name={name}
                  type={name === "email" ? "email" : "text"}
                  required={["fullName", "businessName", "email", "mobile"].includes(name)}
                  defaultValue={value ?? ""}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal"
                />
              </label>
            ))}
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
          >
            {savingProfile ? "Saving..." : "Save profile"}
          </button>
        </form>

        <form
          onSubmit={(event) => void changePassword(event)}
          className="space-y-5 rounded-lg border bg-card p-6"
        >
          <h2 className="text-xl font-semibold">Change password</h2>
          {[
            ["currentPassword", "Current password"],
            ["newPassword", "New password"],
            ["confirmPassword", "Confirm new password"],
          ].map(([name, label]) => (
            <label key={name} className="block space-y-1.5 text-sm font-medium">
              {label}
              <input
                name={name}
                type="password"
                required
                minLength={name === "currentPassword" ? 1 : 12}
                autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
                className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal"
              />
            </label>
          ))}
          <button
            type="submit"
            disabled={changingPassword}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
          >
            {changingPassword ? "Updating..." : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
}
