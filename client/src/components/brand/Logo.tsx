import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { DOMAIN_COLORS } from "../../theme/domainColors";

const TAGLINE = "RG Routine Builder";

interface LogoProps {
  /** Light text/mark for dark app bars; dark for auth and marketing surfaces. */
  variant?: "light" | "dark";
  size?: "sm" | "md";
  sx?: SxProps<Theme>;
}

/** Gentle ribbon-trail stroke for each checklist row (open path, not a filled blob). */
function RibbonTrail({
  y,
  width,
  color,
}: {
  y: number;
  width: number;
  color: string;
}) {
  const x0 = 16;
  const x1 = x0 + width;
  return (
    <path
      d={`M${x0} ${y} Q ${x0 + width * 0.35} ${y - 1.4}, ${x0 + width * 0.55} ${y} T ${x1} ${y}`}
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  );
}

/** Timeline checklist — routine steps with ribbon-trail rows and a tiny stick hint. */
function LogoMark({ light }: { light: boolean }) {
  const surface = light ? "rgba(255,255,255,0.14)" : "#F3EEFF";
  const border = light ? "rgba(255,255,255,0.2)" : "rgba(139, 124, 246, 0.25)";
  const spine = light ? "rgba(255,255,255,0.55)" : "#8B7CF6";
  const stick = light ? "rgba(255,255,255,0.7)" : "#7C6AEF";

  return (
    <Box
      component="svg"
      viewBox="0 0 40 40"
      aria-hidden
      sx={{ width: "100%", height: "100%", display: "block" }}
    >
      <rect x="1" y="1" width="38" height="38" rx="10" fill={surface} stroke={border} />
      {/* RG stick — subtle handle on the timeline spine */}
      <line x1="11" y1="30" x2="11" y2="35" stroke={stick} strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="9" x2="11" y2="30" stroke={spine} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="11" cy="11" r="3.2" fill={DOMAIN_COLORS.db} />
      <RibbonTrail y={11} width={18} color={DOMAIN_COLORS.db} />
      <circle cx="11" cy="20" r="3.2" fill={DOMAIN_COLORS.da} />
      <RibbonTrail y={20} width={14} color={DOMAIN_COLORS.da} />
      <circle cx="11" cy="29" r="3.2" fill={DOMAIN_COLORS.a} />
      <RibbonTrail y={29} width={16} color={DOMAIN_COLORS.a} />
    </Box>
  );
}

export function Logo({ variant = "dark", size = "md", sx }: LogoProps) {
  const light = variant === "light";
  const markSize = size === "sm" ? 28 : 34;
  const wordSize = size === "sm" ? "1rem" : "1.125rem";
  const taglineSize = size === "sm" ? "0.5rem" : "0.5625rem";

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1.25,
        ...sx,
      }}
    >
      <Box sx={{ width: markSize, height: markSize, flexShrink: 0 }}>
        <LogoMark light={light} />
      </Box>
      <Box sx={{ lineHeight: 1.15, minWidth: 0 }}>
        <Typography
          component="span"
          sx={{
            display: "block",
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontWeight: 800,
            fontSize: wordSize,
            letterSpacing: "-0.03em",
            color: light ? "#FFFFFF" : "text.primary",
            whiteSpace: "nowrap",
          }}
        >
          Choreo
          <Box component="span" sx={{ color: light ? "#EDE9FE" : "primary.main" }}>
            Lab
          </Box>
        </Typography>
        <Typography
          component="span"
          sx={{
            display: "block",
            fontSize: taglineSize,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: light ? "rgba(255,255,255,0.78)" : "text.secondary",
            mt: 0.35,
            whiteSpace: "nowrap",
          }}
        >
          {TAGLINE}
        </Typography>
      </Box>
    </Box>
  );
}
