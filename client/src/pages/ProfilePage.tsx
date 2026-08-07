import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@apollo/client";
import { FormEvent, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  CHANGE_PASSWORD_MUTATION,
  UPDATE_PROFILE_MUTATION,
} from "../graphql/mutations";

function getGraphQLErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "graphQLErrors" in error &&
    Array.isArray(error.graphQLErrors) &&
    error.graphQLErrors[0]?.message
  ) {
    return String(error.graphQLErrors[0].message);
  }
  return fallback;
}

function ProfileDetailsForm({
  coach,
  onUpdated,
}: {
  coach: { firstName: string; lastName: string; club?: string | null };
  onUpdated: () => Promise<void>;
}) {
  const [profileForm, setProfileForm] = useState({
    firstName: coach.firstName,
    lastName: coach.lastName,
    club: coach.club ?? "",
  });
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [updateProfile, { loading: profileLoading }] =
    useMutation(UPDATE_PROFILE_MUTATION);

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setProfileMessage(null);
    setProfileError(null);

    try {
      await updateProfile({
        variables: {
          input: {
            firstName: profileForm.firstName,
            lastName: profileForm.lastName,
            club: profileForm.club || undefined,
          },
        },
      });
      await onUpdated();
      setProfileMessage("Profile updated.");
    } catch (error) {
      setProfileError(getGraphQLErrorMessage(error, "Could not update profile."));
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Personal details
      </Typography>
      <form onSubmit={handleProfileSubmit}>
        {profileMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {profileMessage}
          </Alert>
        )}
        {profileError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {profileError}
          </Alert>
        )}
        <TextField
          margin="normal"
          fullWidth
          required
          label="First name"
          value={profileForm.firstName}
          onChange={(event) =>
            setProfileForm((current) => ({
              ...current,
              firstName: event.target.value,
            }))
          }
        />
        <TextField
          margin="normal"
          fullWidth
          required
          label="Last name"
          value={profileForm.lastName}
          onChange={(event) =>
            setProfileForm((current) => ({
              ...current,
              lastName: event.target.value,
            }))
          }
        />
        <TextField
          margin="normal"
          fullWidth
          label="Club (optional)"
          value={profileForm.club}
          onChange={(event) =>
            setProfileForm((current) => ({ ...current, club: event.target.value }))
          }
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={profileLoading}
          sx={{ mt: 2 }}
        >
          {profileLoading ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </Paper>
  );
}

export function ProfilePage() {
  const { coach, refetchCoach } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [changePassword, { loading: passwordLoading }] =
    useMutation(CHANGE_PASSWORD_MUTATION);

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      const { data } = await changePassword({
        variables: {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
      });
      setPasswordMessage(data.changePassword.message);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordError(getGraphQLErrorMessage(error, "Could not change password."));
    }
  };

  if (!coach) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h4" color="secondary.main" gutterBottom>
        Profile
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {coach.email}
      </Typography>

      <ProfileDetailsForm
        key={`${coach.firstName}-${coach.lastName}-${coach.club ?? ""}`}
        coach={coach}
        onUpdated={refetchCoach}
      />

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Change password
        </Typography>
        <form onSubmit={handlePasswordSubmit}>
          {passwordMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {passwordMessage}
            </Alert>
          )}
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}
          <TextField
            margin="normal"
            fullWidth
            required
            type="password"
            label="Current password"
            autoComplete="current-password"
            value={passwordForm.currentPassword}
            onChange={(event) =>
              setPasswordForm((current) => ({
                ...current,
                currentPassword: event.target.value,
              }))
            }
          />
          <TextField
            margin="normal"
            fullWidth
            required
            type="password"
            label="New password"
            autoComplete="new-password"
            helperText="At least 8 characters"
            value={passwordForm.newPassword}
            onChange={(event) =>
              setPasswordForm((current) => ({
                ...current,
                newPassword: event.target.value,
              }))
            }
          />
          <TextField
            margin="normal"
            fullWidth
            required
            type="password"
            label="Confirm new password"
            autoComplete="new-password"
            value={passwordForm.confirmPassword}
            onChange={(event) =>
              setPasswordForm((current) => ({
                ...current,
                confirmPassword: event.target.value,
              }))
            }
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={passwordLoading}
            sx={{ mt: 2 }}
          >
            {passwordLoading ? "Updating…" : "Change password"}
          </Button>
        </form>
      </Paper>

      <Divider sx={{ my: 3, display: "none" }} />
    </Box>
  );
}
