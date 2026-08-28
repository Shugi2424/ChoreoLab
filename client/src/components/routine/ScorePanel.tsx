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
import { DOMAIN_COLORS } from "../../theme/domainColors";
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
    color: DOMAIN_COLORS.db,
    validKey: "dbValid",
  },
  {
    key: "da",
    label: "Difficulty of Apparatus (DA)",
    color: DOMAIN_COLORS.da,
    validKey: "daValid",
  },
  {
    key: "a",
    label: "Artistry (A)",
    color: DOMAIN_COLORS.a,
    validKey: "artistryValid",
  },
];

function ScoreMetricCard({
  code,
  title,
  value,
  color,
}: {
  code: string;
  title: string;
  value: number;
  color: string;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        p: 1.5,
        borderRadius: 2,
        bgcolor: "background.default",
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ minHeight: 52, mb: 1 }}>
        <Typography
          variant="overline"
          sx={{ lineHeight: 1.2, color, fontWeight: 800, display: "block" }}
        >
          {code}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            lineHeight: 1.35,
            minHeight: "2.7em",
          }}
        >
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1, color, mt: "auto" }}>
        {formatCopValue(value)}
      </Typography>
    </Box>
  );
}

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
            primary: { sx: { color, fontWeight: 700, lineHeight: 1.5 } },
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
      <Typography variant="h6" gutterBottom sx={{ flexShrink: 0, fontWeight: 800 }}>
        Scores
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mb: 2,
          flexShrink: 0,
          alignItems: "stretch",
        }}
      >
        <ScoreMetricCard
          code="DB"
          title="Difficulty of Body"
          value={dbScore}
          color={DOMAIN_COLORS.db}
        />
        <ScoreMetricCard
          code="DA"
          title="Difficulty of Apparatus"
          value={daScore}
          color={DOMAIN_COLORS.da}
        />
      </Box>

      <Divider sx={{ my: 2, flexShrink: 0 }} />

      <Typography variant="h6" gutterBottom sx={{ flexShrink: 0, fontWeight: 800 }}>
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
