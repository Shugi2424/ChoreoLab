import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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
import type { ReactNode } from "react";
import type { Routine, ValidationResult } from "../../types/routine";
import { TIMELINE_TYPE_COLORS } from "../../types/routine";
import { formatCopValue } from "../../utils/formatCopValue";

interface ScorePanelProps {
  routine: Routine;
}

type ValidationDomain = "db" | "da" | "a";

const DOMAIN_CONFIG: Array<{
  key: ValidationDomain;
  label: string;
  color: string;
  validKey: keyof Pick<ValidationResult, "dbValid" | "daValid" | "artistryValid">;
}> = [
  {
    key: "db",
    label: "Difficulty of Body (DB)",
    color: TIMELINE_TYPE_COLORS.body_element,
    validKey: "dbValid",
  },
  {
    key: "da",
    label: "Difficulty of Apparatus (DA)",
    color: TIMELINE_TYPE_COLORS.mastery,
    validKey: "daValid",
  },
  {
    key: "a",
    label: "Artistry (A)",
    color: TIMELINE_TYPE_COLORS.artistry,
    validKey: "artistryValid",
  },
];

const MESSAGE_ICON_COLUMN_WIDTH = 22;
const MESSAGE_INDENT = 4.5;

function ValidationMessageRow({
  icon,
  message,
  color,
}: {
  icon: ReactNode;
  message: string;
  color: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        pl: MESSAGE_INDENT,
        py: 0.375,
      }}
    >
      <Box
        sx={{
          width: MESSAGE_ICON_COLUMN_WIDTH,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 22,
          mt: "1px",
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" sx={{ color, flex: 1, lineHeight: 1.43 }}>
        {message}
      </Typography>
    </Box>
  );
}

function DomainValidationSection({
  label,
  color,
  isValid,
  issues,
  warnings,
}: {
  label: string;
  color: string;
  isValid: boolean;
  issues: ValidationResult["missingRequirements"];
  warnings: ValidationResult["warnings"];
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <ListItem disableGutters sx={{ py: 0, alignItems: "center" }}>
        <ListItemIcon sx={{ minWidth: 36, mt: 0 }}>
          {isValid ? (
            <CheckCircleOutlinedIcon color="success" fontSize="small" />
          ) : (
            <ErrorOutlinedIcon color="error" fontSize="small" />
          )}
        </ListItemIcon>
        <ListItemText
          primary={label}
          slotProps={{
            primary: { sx: { color, fontWeight: 600, lineHeight: 1.5 } },
          }}
        />
      </ListItem>
      {issues.map((req) => (
        <ValidationMessageRow
          key={req.id}
          icon={<ErrorOutlinedIcon color="error" sx={{ fontSize: 18 }} />}
          message={req.message}
          color="error.main"
        />
      ))}
      {warnings.map((notice) => (
        <ValidationMessageRow
          key={notice.id}
          icon={
            <InfoOutlinedIcon sx={{ fontSize: 18, color: "info.main", opacity: 0.55 }} />
          }
          message={notice.message}
          color="text.secondary"
        />
      ))}
    </Box>
  );
}

function groupByDomain<T extends { domain: string }>(
  items: T[],
): Record<ValidationDomain, T[]> {
  const grouped: Record<ValidationDomain, T[]> = {
    db: [],
    da: [],
    a: [],
  };
  for (const item of items) {
    const domain = item.domain as ValidationDomain;
    if (domain in grouped) {
      grouped[domain].push(item);
    }
  }
  return grouped;
}

export function ScorePanel({ routine }: ScorePanelProps) {
  const { validation, dbScore, daScore } = routine;
  const issuesByDomain = groupByDomain(validation.missingRequirements);
  const warningsByDomain = groupByDomain(validation.warnings ?? []);

  return (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ flexShrink: 0 }}>
        Scores
      </Typography>
      <Box sx={{ display: "flex", gap: 3, mb: 2, flexShrink: 0 }}>
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

      <Divider sx={{ my: 2, flexShrink: 0 }} />

      <Typography variant="h6" gutterBottom sx={{ flexShrink: 0 }}>
        Validation
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", pr: 0.5 }}>
        <List dense disablePadding>
          {DOMAIN_CONFIG.map((domain) => (
            <DomainValidationSection
              key={domain.key}
              label={domain.label}
              color={domain.color}
              isValid={validation[domain.validKey]}
              issues={issuesByDomain[domain.key]}
              warnings={warningsByDomain[domain.key]}
            />
          ))}
        </List>

        {validation.isValid && (
          <Typography color="success.main" sx={{ mt: 1 }} variant="body2">
            Routine meets all CoP requirements.
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
