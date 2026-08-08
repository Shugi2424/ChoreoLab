import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import type { Routine } from "../../types/routine";
import { TIMELINE_TYPE_COLORS } from "../../types/routine";
import { formatCopValue } from "../../utils/formatCopValue";

interface ScorePanelProps {
  routine: Routine;
}

export function ScorePanel({ routine }: ScorePanelProps) {
  const { validation, dbScore, daScore } = routine;
  const missing = validation.missingRequirements;

  return (
    <Paper sx={{ p: 2, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Scores
      </Typography>
      <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            DB
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            Difficulty of Body
          </Typography>
          <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700 }}>
            {formatCopValue(dbScore)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            DA
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            Difficulty of Apparatus
          </Typography>
          <Typography variant="h3" color="secondary.main" sx={{ fontWeight: 700 }}>
            {formatCopValue(daScore)}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Validation
      </Typography>
      <List dense disablePadding>
        <ListItem disableGutters>
          <ListItemIcon sx={{ minWidth: 36 }}>
            {validation.dbValid ? (
              <CheckCircleOutlinedIcon color="success" fontSize="small" />
            ) : (
              <ErrorOutlinedIcon color="error" fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText
            primary="Difficulty of Body (DB)"
            slotProps={{
              primary: { sx: { color: TIMELINE_TYPE_COLORS.body_element } },
            }}
          />
        </ListItem>
        <ListItem disableGutters>
          <ListItemIcon sx={{ minWidth: 36 }}>
            {validation.daValid ? (
              <CheckCircleOutlinedIcon color="success" fontSize="small" />
            ) : (
              <ErrorOutlinedIcon color="error" fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText
            primary="Difficulty of Apparatus (DA)"
            slotProps={{
              primary: { sx: { color: TIMELINE_TYPE_COLORS.mastery } },
            }}
          />
        </ListItem>
        <ListItem disableGutters>
          <ListItemIcon sx={{ minWidth: 36 }}>
            {validation.artistryValid ? (
              <CheckCircleOutlinedIcon color="success" fontSize="small" />
            ) : (
              <ErrorOutlinedIcon color="error" fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText
            primary="Artistry (A)"
            slotProps={{
              primary: { sx: { color: TIMELINE_TYPE_COLORS.artistry } },
            }}
          />
        </ListItem>
      </List>

      {missing.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="error.main" gutterBottom>
            Missing requirements
          </Typography>
          <List dense disablePadding>
            {missing.map((req) => (
              <ListItem key={req.id} disableGutters alignItems="flex-start">
                <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>
                  <ErrorOutlinedIcon color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={req.message}
                  secondary={req.domain}
                  slotProps={{
                    primary: { variant: "body2" },
                    secondary: { variant: "caption" },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {validation.isValid && (
        <Typography color="success.main" sx={{ mt: 2 }} variant="body2">
          Routine meets all CoP requirements.
        </Typography>
      )}
    </Paper>
  );
}
